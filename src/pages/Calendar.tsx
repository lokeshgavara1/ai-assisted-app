import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarView } from '@/components/calendar/CalendarView';
import { UpcomingPosts } from '@/components/calendar/UpcomingPosts';
import { CalendarDays, Plus, Grid3X3, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduledPost {
  id: string;
  title?: string;
  caption?: string;
  platforms: string[];
  scheduled_at: string;
  status: string;
  image_url?: string;
}

const Calendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('post_drafts')
        .select('*')
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Failed to Load Posts",
        description: "Could not load your scheduled posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Content Calendar</h1>
            <p className="text-muted-foreground">
              Schedule and manage your social media posts
            </p>
          </div>
          <Button onClick={() => navigate('/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              List View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarView posts={posts} onPostsUpdate={fetchPosts} />
          </TabsContent>

          <TabsContent value="list">
            <UpcomingPosts posts={posts} onPostsUpdate={fetchPosts} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Calendar;