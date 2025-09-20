import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { format, isToday, isTomorrow, addDays, startOfDay } from 'date-fns';
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

interface UpcomingPostsProps {
  posts: ScheduledPost[];
  onPostsUpdate: () => void;
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: 'facebook' },
  { id: 'instagram', name: 'Instagram', color: 'instagram' },
  { id: 'linkedin', name: 'LinkedIn', color: 'linkedin' },
  { id: 'twitter', name: 'Twitter', color: 'twitter' },
];

export const UpcomingPosts: React.FC<UpcomingPostsProps> = ({ posts, onPostsUpdate }) => {
  const { toast } = useToast();

  const upcomingPosts = posts
    .filter(post => new Date(post.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 5);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (date < addDays(new Date(), 7)) return format(date, 'EEEE');
    return format(date, 'MMM d');
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('post_drafts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post Deleted",
        description: "Scheduled post has been deleted successfully.",
      });
      
      onPostsUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const hasTimeConflicts = (targetDate: Date) => {
    const sameDayPosts = posts.filter(post => {
      const postDate = new Date(post.scheduled_at);
      return startOfDay(postDate).getTime() === startOfDay(targetDate).getTime();
    });

    const timeSlots = sameDayPosts.map(post => 
      format(new Date(post.scheduled_at), 'HH:mm')
    );
    
    return timeSlots.length !== new Set(timeSlots).size;
  };

  if (upcomingPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Posts
          </CardTitle>
          <CardDescription>
            Your scheduled content for the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No scheduled posts</p>
            <p className="text-sm">Start scheduling content to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Posts
        </CardTitle>
        <CardDescription>
          Your scheduled content for the next 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingPosts.map(post => {
            const scheduledDate = new Date(post.scheduled_at);
            const hasConflict = hasTimeConflicts(scheduledDate);
            
            return (
              <div key={post.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="w-2 h-2 rounded-full mt-2 bg-primary" />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">
                        {post.title || 'Untitled Post'}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {getDateLabel(scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(scheduledDate, 'HH:mm')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {post.caption && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {post.caption}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {post.platforms.map(platformId => {
                        const platform = PLATFORMS.find(p => p.id === platformId);
                        return (
                          <Badge 
                            key={platformId} 
                            variant="secondary" 
                            className="text-xs h-5"
                            style={{ 
                              backgroundColor: `hsl(var(--${platform?.color}))`,
                              color: 'white'
                            }}
                          >
                            {platform?.name}
                          </Badge>
                        );
                      })}
                    </div>
                    
                    {hasConflict && (
                      <div className="flex items-center gap-1 text-xs text-warning">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Conflict</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};