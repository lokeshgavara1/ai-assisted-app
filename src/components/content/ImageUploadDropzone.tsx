import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadDropzoneProps {
  onImageUploaded: (imageUrl: string, imageId?: string) => void;
  maxFiles?: number;
}

const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({ 
  onImageUploaded, 
  maxFiles = 1 
}) => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to upload images');
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(95);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // Save to database
      const { data: savedImage, error: dbError } = await supabase
        .from('generated_images')
        .insert({
          user_id: user.id,
          prompt: `Uploaded: ${file.name}`,
          image_url: publicUrl,
          storage_path: fileName,
          generation_provider: 'upload'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Still proceed with the image URL
      }

      setUploadProgress(100);
      onImageUploaded(publicUrl, savedImage?.id);

      toast({
        title: "Upload Successful!",
        description: `${file.name} has been uploaded successfully.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      uploadImage(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles,
    multiple: maxFiles > 1
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Uploading image...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                {isDragActive ? (
                  <p className="text-lg font-medium">Drop your images here</p>
                ) : (
                  <>
                    <p className="text-lg font-medium">Drag & drop images here</p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse files
                    </p>
                  </>
                )}
                <p className="text-xs text-muted-foreground">
                  Supports: JPG, PNG, WebP, GIF (Max {maxFiles} file{maxFiles > 1 ? 's' : ''})
                </p>
              </div>
              <Button variant="outline" type="button">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadDropzone;