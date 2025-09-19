import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Copy, Heart, RefreshCw, Download } from 'lucide-react';

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string, imageId?: string) => void;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ onImageGenerated }) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('vivid');
  const [quality, setQuality] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{url: string, prompt: string} | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const promptSuggestions = [
    'A modern office space with natural lighting',
    'Professional business meeting with diverse team',
    'Minimalist workspace with laptop and coffee',
    'Creative brainstorming session with colorful sticky notes',
    'Digital marketing dashboard on computer screen',
    'Team collaboration in a bright conference room',
    'Entrepreneur working on startup idea',
    'Social media icons floating around smartphone'
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          size,
          quality,
          style
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const imageData = {
        url: data.imageUrl,
        prompt: data.revisedPrompt || prompt
      };

      setGeneratedImage(imageData);
      onImageGenerated(data.imageUrl, data.imageId);
      
      toast({
        title: "Image Generated!",
        description: "AI image generated successfully using DALL·E 3.",
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPromptToClipboard = async () => {
    if (generatedImage?.prompt) {
      await navigator.clipboard.writeText(generatedImage.prompt);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard.",
      });
    }
  };

  const downloadImage = async () => {
    if (generatedImage?.url) {
      try {
        const response = await fetch(generatedImage.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Downloaded!",
          description: "Image downloaded successfully.",
        });
      } catch (error) {
        toast({
          title: "Download Failed",
          description: "Failed to download image.",
          variant: "destructive",
        });
      }
    }
  };

  const useSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Image Generator
        </CardTitle>
        <CardDescription>
          Generate custom images using DALL·E 3 AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-prompt">Image Prompt</Label>
            <Textarea
              id="image-prompt"
              placeholder="Describe the image you want to create... (e.g., 'A modern office space with natural lighting and minimalist design')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Prompt Suggestions</Label>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                  onClick={() => useSuggestion(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="image-size">Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                  <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                  <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-style">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vivid">Vivid (More dramatic)</SelectItem>
                  <SelectItem value="natural">Natural (More realistic)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-quality">Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="hd">HD (Higher cost)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateImage} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating with DALL·E 3...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image with AI
              </>
            )}
          </Button>
        </div>

        {isGenerating && (
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        )}

        {generatedImage && !isGenerating && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Generated Image</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPromptToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadImage}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={generatedImage.url}
                  alt={generatedImage.prompt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Generated Prompt:
                </Label>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {generatedImage.prompt}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default AIImageGenerator;