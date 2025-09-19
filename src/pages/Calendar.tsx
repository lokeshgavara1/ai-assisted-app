import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';

const Calendar = () => {
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Upcoming Posts
            </CardTitle>
            <CardDescription>
              Your scheduled content for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No scheduled posts</p>
              <p className="text-sm">Start scheduling content to see it here</p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Calendar;