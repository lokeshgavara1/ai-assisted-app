import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar as CalendarIcon, Globe, RotateCcw, ArrowLeft, Save } from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostData {
  title?: string;
  caption?: string;
  hashtags?: string[];
  image_url?: string;
  platforms: string[];
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: 'facebook' },
  { id: 'instagram', name: 'Instagram', color: 'instagram' },
  { id: 'linkedin', name: 'LinkedIn', color: 'linkedin' },
  { id: 'twitter', name: 'Twitter', color: 'twitter' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const RECURRING_OPTIONS = [
  { value: 'none', label: 'No Repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const Scheduler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const postData = (location.state as { postData?: PostData })?.postData;
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(postData?.platforms || []);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState('weekly');
  const [recurringCount, setRecurringCount] = useState(1);
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isScheduling, setIsScheduling] = useState(false);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const generateScheduledDates = () => {
    if (!selectedDate || !isRecurring) {
      return selectedDate ? [selectedDate] : [];
    }

    const dates = [selectedDate];
    for (let i = 1; i < recurringCount; i++) {
      let nextDate;
      switch (recurringType) {
        case 'daily':
          nextDate = addDays(selectedDate, i);
          break;
        case 'weekly':
          nextDate = addWeeks(selectedDate, i);
          break;
        case 'monthly':
          nextDate = addMonths(selectedDate, i);
          break;
        default:
          nextDate = selectedDate;
      }
      dates.push(nextDate);
    }
    return dates;
  };

  const handleSchedule = async () => {
    if (!selectedDate || selectedPlatforms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a date and at least one platform.",
        variant: "destructive",
      });
      return;
    }

    if (!postData) {
      toast({
        title: "No Content",
        description: "No post content found. Please create content first.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      const scheduledDates = generateScheduledDates();
      
      for (const date of scheduledDates) {
        const [hours, minutes] = selectedTime.split(':');
        const scheduledAt = new Date(date);
        scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const { error } = await supabase
          .from('post_drafts')
          .insert({
            user_id: user?.id || '',
            title: postData.title,
            caption: postData.caption,
            hashtags: postData.hashtags,
            image_url: postData.image_url,
            platforms: selectedPlatforms,
            scheduled_at: scheduledAt.toISOString(),
            status: 'scheduled'
          });

        if (error) throw error;
      }

      toast({
        title: "Posts Scheduled",
        description: `Successfully scheduled ${scheduledDates.length} post(s)`,
      });

      navigate('/calendar');
    } catch (error) {
      console.error('Error scheduling posts:', error);
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const suggestedTimes = selectedPlatforms.map(platform => {
    const suggestions = {
      facebook: ['09:00', '13:00', '15:00'],
      instagram: ['08:00', '12:00', '17:00', '19:00'],
      linkedin: ['08:00', '12:00', '17:00'],
      twitter: ['09:00', '12:00', '15:00', '18:00']
    };
    return {
      platform,
      times: suggestions[platform as keyof typeof suggestions] || []
    };
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Schedule Post</h1>
            <p className="text-muted-foreground">
              Choose when and where to publish your content
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date & Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Date & Time
              </CardTitle>
              <CardDescription>
                Select when you want to publish
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>{timezone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Platforms</CardTitle>
              <CardDescription>
                Choose where to publish your post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(platform => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
                    />
                    <Label htmlFor={platform.id} className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full bg-${platform.color}`}
                        style={{ backgroundColor: `hsl(var(--${platform.color}))` }}
                      />
                      {platform.name}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Suggested Times */}
              {suggestedTimes.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Suggested Times</h4>
                    {suggestedTimes.map(({ platform, times }) => (
                      <div key={platform} className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">{PLATFORMS.find(p => p.id === platform)?.name}:</span>
                        <div className="flex gap-1 mt-1">
                          {times.map(time => (
                            <Badge 
                              key={time} 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-accent"
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recurring Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Recurring Posts
              </CardTitle>
              <CardDescription>
                Schedule recurring content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <Label htmlFor="recurring">Enable recurring posts</Label>
              </div>

              {isRecurring && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurring-type">Frequency</Label>
                    <Select value={recurringType} onValueChange={setRecurringType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RECURRING_OPTIONS.filter(opt => opt.value !== 'none').map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurring-count">Number of posts</Label>
                    <Input
                      id="recurring-count"
                      type="number"
                      min="1"
                      max="52"
                      value={recurringCount}
                      onChange={(e) => setRecurringCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Preview</CardTitle>
              <CardDescription>
                Review your scheduled posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  {generateScheduledDates().map((date, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(date, 'EEEE, MMMM d, yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedTime}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {selectedPlatforms.map(platformId => {
                          const platform = PLATFORMS.find(p => p.id === platformId);
                          return (
                            <div
                              key={platformId}
                              className={`w-2 h-2 rounded-full bg-${platform?.color}`}
                              style={{ backgroundColor: `hsl(var(--${platform?.color}))` }}
                              title={platform?.name}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Select a date to preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/calendar')}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={isScheduling}>
            <Save className="w-4 h-4 mr-2" />
            {isScheduling ? 'Scheduling...' : 'Schedule Post'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Scheduler;