import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Zap,
      title: "AI Content Generation",
      description: "Create engaging captions, hashtags, and posts using advanced AI technology"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Schedule and publish content across multiple platforms automatically"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track performance and get insights to improve your social media strategy"
    },
    {
      icon: Users,
      title: "Multi-Platform Management",
      description: "Manage Facebook, Instagram, LinkedIn, and Twitter from one dashboard"
    }
  ];

  const benefits = [
    "Save 10+ hours per week on content creation",
    "Increase engagement by up to 40%",
    "Never miss a posting opportunity",
    "Data-driven insights for growth"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">BizBoost</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Boost Your Social Media
            <br />
            with AI Power
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Streamline your social media management with intelligent content generation, 
            automated scheduling, and comprehensive analytics. Perfect for businesses, 
            startups, and content creators.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/signup" className="flex items-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you create, schedule, and analyze 
              your social media content like never before.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose BizBoost?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of businesses already using BizBoost to transform 
                their social media presence and drive real results.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-2xl">
              <div className="bg-card p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6">
                  Join BizBoost today and start creating amazing content that 
                  engages your audience and drives results.
                </p>
                <Button size="lg" className="w-full" asChild>
                  <Link to="/signup" className="flex items-center justify-center space-x-2">
                    <span>Start Your Free Trial</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  No credit card required • 14-day free trial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-primary">BizBoost</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            AI-powered social media management for modern businesses
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
