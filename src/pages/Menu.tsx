import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  User, 
  CreditCard, 
  HelpCircle, 
  FileText, 
  Share2,
  Bell,
  Shield,
  ChevronRight
} from 'lucide-react';

const Menu = () => {
  const menuItems = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal information',
      icon: User,
      action: () => console.log('Profile')
    },
    {
      title: 'Account Settings',
      description: 'Security, privacy, and account preferences',
      icon: Settings,
      action: () => console.log('Settings')
    },
    {
      title: 'Social Accounts',
      description: 'Connect and manage your social media platforms',
      icon: Share2,
      action: () => console.log('Social Accounts')
    },
    {
      title: 'Notifications',
      description: 'Configure your notification preferences',
      icon: Bell,
      action: () => console.log('Notifications')
    },
    {
      title: 'Billing & Plans',
      description: 'Manage your subscription and payment methods',
      icon: CreditCard,
      action: () => console.log('Billing')
    },
    {
      title: 'Privacy & Security',
      description: 'Data protection and security settings',
      icon: Shield,
      action: () => console.log('Privacy')
    },
    {
      title: 'Content Library',
      description: 'Access your saved posts and templates',
      icon: FileText,
      action: () => console.log('Library')
    },
    {
      title: 'Help & Support',
      description: 'Get assistance and find answers',
      icon: HelpCircle,
      action: () => console.log('Help')
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-muted-foreground">
            Manage your account and app settings
          </p>
        </div>

        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-0 h-auto"
                    onClick={item.action}
                  >
                    <div className="flex items-center space-x-4 w-full">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Menu;