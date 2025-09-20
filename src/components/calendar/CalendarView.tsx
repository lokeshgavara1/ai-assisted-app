import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Grid3X3, Calendar as CalendarIcon, Clock, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ScheduledPost {
  id: string;
  title?: string;
  caption?: string;
  platforms: string[];
  scheduled_at: string;
  status: string;
  image_url?: string;
}

interface CalendarViewProps {
  posts: ScheduledPost[];
  onPostsUpdate: () => void;
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: 'facebook' },
  { id: 'instagram', name: 'Instagram', color: 'instagram' },
  { id: 'linkedin', name: 'LinkedIn', color: 'linkedin' },
  { id: 'twitter', name: 'Twitter', color: 'twitter' },
];

const VIEW_MODES = [
  { value: 'month', label: 'Month', icon: Grid3X3 },
  { value: 'week', label: 'Week', icon: CalendarIcon },
];

export const CalendarView: React.FC<CalendarViewProps> = ({ posts, onPostsUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredPosts = posts.filter(post => {
    if (selectedPlatformFilter === 'all') return true;
    return post.platforms.includes(selectedPlatformFilter);
  });

  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter(post => 
      isSameDay(new Date(post.scheduled_at), date)
    );
  };

  const hasConflicts = (date: Date) => {
    const dayPosts = getPostsForDate(date);
    const timeSlots = dayPosts.map(post => 
      format(new Date(post.scheduled_at), 'HH:mm')
    );
    return timeSlots.length !== new Set(timeSlots).size;
  };

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  const renderCalendarDay = (date: Date) => {
    const dayPosts = getPostsForDate(date);
    const hasConflict = hasConflicts(date);
    
    if (dayPosts.length === 0) return null;

    return (
      <div className="space-y-1">
        {dayPosts.slice(0, 2).map((post, index) => (
          <div
            key={post.id}
            className="text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
            style={{ 
              backgroundColor: `hsl(var(--${PLATFORMS.find(p => p.id === post.platforms[0])?.color || 'primary'}))`,
              color: 'white'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDate(date);
            }}
          >
            {format(new Date(post.scheduled_at), 'HH:mm')} {post.title || 'Untitled'}
          </div>
        ))}
        {dayPosts.length > 2 && (
          <div className="text-xs text-muted-foreground">
            +{dayPosts.length - 2} more
          </div>
        )}
        {hasConflict && (
          <AlertTriangle className="w-3 h-3 text-warning" />
        )}
      </div>
    );
  };

  const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[200px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Select value={selectedPlatformFilter} onValueChange={setSelectedPlatformFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {PLATFORMS.map(platform => (
                <SelectItem key={platform.id} value={platform.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(var(--${platform.color}))` }}
                    />
                    {platform.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {VIEW_MODES.map(mode => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.value}
                variant={viewMode === mode.value ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode(mode.value)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {mode.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="w-full"
                components={{
                  Day: ({ date, ...props }) => (
                    <div className="relative w-full h-24 p-1 border border-border rounded-lg">
                      <div className="text-sm font-medium mb-1">
                        {format(date, 'd')}
                      </div>
                      {renderCalendarDay(date)}
                    </div>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a Date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDatePosts.length > 0 ? (
                <div className="space-y-3">
                  {selectedDatePosts.map(post => (
                    <div key={post.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {post.title || 'Untitled Post'}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(post.scheduled_at), 'HH:mm')}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeletePost(post.id, e)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {post.caption && (
                        <p className="text-xs text-muted-foreground truncate">
                          {post.caption}
                        </p>
                      )}
                      
                      <div className="flex gap-1">
                        {post.platforms.map(platformId => {
                          const platform = PLATFORMS.find(p => p.id === platformId);
                          return (
                            <Badge 
                              key={platformId} 
                              variant="secondary" 
                              className="text-xs"
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
                      
                      {post.status === 'scheduled' && hasConflicts(new Date(post.scheduled_at)) && (
                        <div className="flex items-center gap-1 text-xs text-warning">
                          <AlertTriangle className="w-3 h-3" />
                          Time conflict detected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No posts scheduled</p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigate('/create')}
                  >
                    Create Post
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};