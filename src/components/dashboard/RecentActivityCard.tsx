import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItem {
  id: number;
  title: string;
  platforms: string[];
  timeAgo: string;
  reactions: number;
  growth: string;
}

interface RecentActivityCardProps {
  loading?: boolean;
}

const mockActivities: ActivityItem[] = [
  {
    id: 1,
    title: "New product launch announcement",
    platforms: ["Facebook", "Instagram"],
    timeAgo: "2 hours ago",
    reactions: 124,
    growth: "+12"
  },
  {
    id: 2,
    title: "Behind the scenes content",
    platforms: ["Instagram"],
    timeAgo: "5 hours ago",
    reactions: 89,
    growth: "+8"
  },
  {
    id: 3,
    title: "Industry insights article",
    platforms: ["LinkedIn"],
    timeAgo: "1 day ago",
    reactions: 156,
    growth: "+24"
  }
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'Facebook':
      return Facebook;
    case 'Instagram':
      return Instagram;
    case 'LinkedIn':
      return Linkedin;
    case 'Twitter':
      return Twitter;
    default:
      return Calendar;
  }
};

export const RecentActivityCard = ({ loading = false }: RecentActivityCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest posts and engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                {activity.platforms.map((platform, index) => {
                  const Icon = getPlatformIcon(platform);
                  return (
                    <Icon 
                      key={platform} 
                      className={`w-4 h-4 text-muted-foreground ${index > 0 ? '-ml-2' : ''}`} 
                    />
                  );
                })}
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.platforms.join(', ')} • {activity.timeAgo}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{activity.reactions} reactions</p>
                <p className="text-xs text-muted-foreground">{activity.growth} from avg</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};