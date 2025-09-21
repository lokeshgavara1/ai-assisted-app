-- Create posts table to store post content and metadata
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  caption TEXT NOT NULL,
  hashtags TEXT[],
  image_url TEXT,
  platforms TEXT[] NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_analytics table to track posting results
CREATE TABLE public.post_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Users can view their own posts" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on post_analytics table
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for post_analytics (users can view analytics for their posts)
CREATE POLICY "Users can view analytics for their own posts" 
ON public.post_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.posts 
  WHERE posts.id = post_analytics.post_id 
  AND posts.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates on posts
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at);
CREATE INDEX idx_post_analytics_post_id ON public.post_analytics(post_id);
CREATE INDEX idx_post_analytics_platform ON public.post_analytics(platform);