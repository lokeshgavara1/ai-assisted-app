import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Image, Type, Hash, Save, Eye, X, Calendar, Send, Loader2 } from 'lucide-react';
import AIContentGenerator from '@/components/content/AIContentGenerator';
import AIImageGenerator from '@/components/content/AIImageGenerator';
import ImageUploadDropzone from '@/components/content/ImageUploadDropzone';
import PlatformPreview from '@/components/content/PlatformPreview';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [isPublishing, setIsPublishing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    hashtags: '',
    platforms: [] as string[],
    imageUrl: ''
  });
  const [previewPlatform, setPreviewPlatform] = useState<'facebook' | 'instagram' | 'linkedin' | 'twitter'>('facebook');

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleContentGenerated = (content: string, type: string) => {
    if (type === 'caption') {
      setFormData(prev => ({ ...prev, caption: content }));
    } else if (type === 'hashtags') {
      setFormData(prev => ({ ...prev, hashtags: content }));
    } else if (type === 'post') {
      // Parse complete post into caption and hashtags
      const lines = content.split('\n');
      const captionLines = [];
      const hashtagLines = [];
      let isHashtagSection = false;
      
      for (const line of lines) {
        if (line.trim().startsWith('#') || isHashtagSection) {
          isHashtagSection = true;
          hashtagLines.push(line);
        } else {
          captionLines.push(line);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        caption: captionLines.join('\n').trim(),
        hashtags: hashtagLines.join(' ').trim()
      }));
    }
    setActiveTab('create');
  };

  const handleImageUploaded = (imageUrl: string, imageId?: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
    setActiveTab('create');
    toast({
      title: "Image Added!",
      description: "Image has been added to your post.",
    });
  };

  const handleImageGenerated = (imageUrl: string, imageId?: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
    setActiveTab('create');
  };

  const saveDraft = async () => {
    if (!formData.caption && !formData.hashtags) {
      toast({
        title: "Nothing to Save",
        description: "Please add some content before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to save drafts');
      }

      const { error } = await supabase
        .from('post_drafts')
        .insert({
          user_id: user.id,
          title: formData.title || 'Untitled Draft',
          caption: formData.caption,
          hashtags: formData.hashtags.split(/\s+/).filter(tag => tag.startsWith('#')),
          platforms: formData.platforms,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Draft Saved!",
        description: "Your post has been saved as a draft.",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const publishNow = async () => {
    if (!formData.caption.trim()) {
      toast({
        title: "Caption required",
        description: "Please add a caption for your post",
        variant: "destructive",
      });
      return;
    }

    if (formData.platforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Please select at least one platform to publish to",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to publish posts",
          variant: "destructive",
        });
        return;
      }

      // First save the post to database
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: formData.title || null,
          caption: formData.caption,
          hashtags: formData.hashtags.split(/\s+/).filter(tag => tag.startsWith('#')),
          platforms: formData.platforms,
          image_url: formData.imageUrl || null,
          status: 'published'
        })
        .select()
        .single();

      if (postError) {
        console.error('Error saving post:', postError);
        toast({
          title: "Error saving post",
          description: "There was an error saving your post. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Then publish to social media platforms
      const { data, error } = await supabase.functions.invoke('publish-post', {
        body: {
          postId: post.id,
          platforms: formData.platforms
        }
      });

      if (error) {
        console.error('Error publishing post:', error);
        toast({
          title: "Error publishing",
          description: "There was an error publishing your post. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const results = data?.results || [];
      const successfulPosts = results.filter((r: any) => r.success);
      const failedPosts = results.filter((r: any) => !r.success);

      if (successfulPosts.length > 0) {
        toast({
          title: "Post published!",
          description: `Successfully published to ${successfulPosts.map((p: any) => p.platform).join(', ')}`,
        });
      }

      if (failedPosts.length > 0) {
        toast({
          title: "Some posts failed",
          description: `Failed to publish to ${failedPosts.map((p: any) => p.platform).join(', ')}`,
          variant: "destructive",
        });
      }

      // Navigate to analytics or dashboard
      navigate('/analytics');

    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create Content</h1>
          <p className="text-muted-foreground">
            Create engaging posts for your social media platforms
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="ai">AI Text</TabsTrigger>
            <TabsTrigger value="image">AI Images</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Post Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title (Optional)</Label>
                      <Input
                        id="title"
                        placeholder="Give your post a title..."
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caption">Caption</Label>
                      <Textarea
                        id="caption"
                        placeholder="Write your caption here..."
                        value={formData.caption}
                        onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hashtags">Hashtags</Label>
                      <Textarea
                        id="hashtags"
                        placeholder="#socialmedia #marketing #business"
                        value={formData.hashtags}
                        onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                        className="min-h-[60px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Select Platforms</CardTitle>
                    <CardDescription>Choose which platforms to post to</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        { id: 'facebook', name: 'Facebook', color: 'bg-blue-500' },
                        { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
                        { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
                        { id: 'twitter', name: 'Twitter', color: 'bg-black' }
                      ].map((platform) => (
                        <div key={platform.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform.id}
                            checked={formData.platforms.includes(platform.id)}
                            onCheckedChange={() => handlePlatformToggle(platform.id)}
                          />
                          <label
                            htmlFor={platform.id}
                            className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            <div className={`w-4 h-4 rounded ${platform.color}`} />
                            <span>{platform.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={saveDraft} variant="outline" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button onClick={() => setActiveTab('preview')} className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('ai')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        AI Text Generator
                      </CardTitle>
                      <CardDescription>
                        Generate captions and hashtags with AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Text
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('image')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        AI Image Generator
                      </CardTitle>
                      <CardDescription>
                        Generate custom images with DALL·E 3
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Image
                      </Button>
                    </CardContent>
                  </Card>

                  {formData.imageUrl && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          Current Image
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                          <img
                            src={formData.imageUrl}
                            alt="Selected image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Image
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <AIContentGenerator onContentGenerated={handleContentGenerated} />
          </TabsContent>

          <TabsContent value="image" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Images</h3>
                <ImageUploadDropzone onImageUploaded={handleImageUploaded} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Generate with AI</h3>
                <AIImageGenerator onImageGenerated={handleImageGenerated} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Platform Preview</h3>
                <Select value={previewPlatform} onValueChange={(value: any) => setPreviewPlatform(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <PlatformPreview
                platform={previewPlatform}
                caption={formData.caption}
                hashtags={formData.hashtags}
                imageUrl={formData.imageUrl}
                userName="Your Business"
              />

              <div className="flex gap-3 justify-center">
                <Button onClick={() => setActiveTab('create')} variant="outline">
                  Back to Edit
                </Button>
                <Button onClick={saveDraft} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/scheduler', { 
                    state: { 
                      postData: { 
                        title: formData.title, 
                        caption: formData.caption, 
                        hashtags: formData.hashtags, 
                        image_url: formData.imageUrl, 
                        platforms: formData.platforms 
                      } 
                    } 
                  })}
                  disabled={!formData.caption.trim()}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
                <Button onClick={publishNow} disabled={isPublishing || !formData.caption.trim() || formData.platforms.length === 0}>
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isPublishing ? "Publishing..." : "Publish Now"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Create;