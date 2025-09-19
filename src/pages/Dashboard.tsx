import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { Plus, BarChart3, Calendar, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { title: 'Total Followers', value: '12.3K', change: '+12%', icon: Users },
    { title: 'Engagement Rate', value: '4.8%', change: '+0.3%', icon: TrendingUp },
    { title: 'Posts This Month', value: '24', change: '+8', icon: Calendar },
    { title: 'Analytics Score', value: '87', change: '+5', icon: BarChart3 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your social media today
            </p>
          </div>
          <Button onClick={() => navigate('/create')} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Post</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              loading={loading}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivityCard loading={loading} />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump into your most used features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/calendar')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Content
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/menu')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Accounts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Scheduled Posts</CardTitle>
            <CardDescription>
              Your content pipeline for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">No scheduled posts yet</p>
              <p className="text-sm">Create your first post to get started</p>
              <Button className="mt-4" onClick={() => navigate('/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;