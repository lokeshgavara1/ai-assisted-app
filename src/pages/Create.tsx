import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Image, Type, Hash, Save, Eye } from 'lucide-react';
import AIContentGenerator from '@/components/content/AIContentGenerator';
import PlatformPreview from '@/components/content/PlatformPreview';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Create = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    hashtags: '',
    platforms: [] as string[]
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="ai">AI Generator</TabsTrigger>
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
                        AI Content Generator
                      </CardTitle>
                      <CardDescription>
                        Generate captions and hashtags with AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate with AI
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Image Upload
                      </CardTitle>
                      <CardDescription>
                        Upload images for your post (Coming Soon)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline" disabled>
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <AIContentGenerator onContentGenerated={handleContentGenerated} />
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
                userName="Your Business"
              />

              <div className="flex gap-3 justify-center">
                <Button onClick={() => setActiveTab('create')} variant="outline">
                  Back to Edit
                </Button>
                <Button onClick={saveDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
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