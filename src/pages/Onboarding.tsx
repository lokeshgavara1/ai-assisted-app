import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [fullName, setFullName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    // Pre-fill full name if available
    const userMetaData = user.user_metadata;
    if (userMetaData?.full_name) {
      setFullName(userMetaData.full_name);
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setConnectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          business_type: businessType,
          onboarded: true,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome to BizBoost!",
        description: "Your account has been set up successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Welcome to BizBoost!</h2>
              <p className="text-muted-foreground">Let's set up your profile to get started</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small-business">Small Business</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="content-creator">Content Creator</SelectItem>
                    <SelectItem value="agency">Marketing Agency</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Connect Your Social Media</h2>
              <p className="text-muted-foreground">Choose the platforms you'd like to manage with BizBoost</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Facebook', icon: '📘', color: 'bg-blue-500' },
                { name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
                { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
                { name: 'Twitter', icon: '🐦', color: 'bg-sky-500' },
              ].map((platform) => (
                <Card 
                  key={platform.name}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    connectedPlatforms.includes(platform.name) 
                      ? 'ring-2 ring-primary' 
                      : ''
                  }`}
                  onClick={() => handlePlatformToggle(platform.name)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{platform.icon}</div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    {connectedPlatforms.includes(platform.name) && (
                      <CheckCircle className="w-5 h-5 text-primary mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Don't worry, you can connect these platforms later in your settings
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">You're All Set!</h2>
              <p className="text-muted-foreground">Ready to boost your social media presence?</p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Profile information completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Business type: {businessType || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Platforms selected: {connectedPlatforms.length || 'None (can be added later)'}</span>
              </div>
            </div>
            
            <div className="bg-accent/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What's next?</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Connect your social media accounts</li>
                <li>• Create your first AI-powered post</li>
                <li>• Schedule content across platforms</li>
                <li>• Track your performance with analytics</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!fullName || !businessType)) ||
                  loading
                }
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <span>{loading ? 'Completing...' : 'Complete Setup'}</span>
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;