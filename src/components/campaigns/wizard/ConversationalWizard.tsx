import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Sparkles, MessageCircle, Target, Users, Calendar, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface WizardData {
  campaignName: string;
  targetAudience: 'new-prospects' | 'existing-customers' | 'custom-list';
  goal: 'book-appointments' | 'follow-up' | 'share-offer' | 'survey';
  tone: 'friendly' | 'professional' | 'persuasive';
  businessName: string;
  goalDescription: string;
}

interface ConversationalWizardProps {
  onComplete: (data: WizardData) => void;
  onClose: () => void;
}

const steps = [
  {
    id: 'campaign-name',
    title: "Let's start with the basics",
    subtitle: "What would you like to call this campaign?",
    icon: MessageCircle
  },
  {
    id: 'target-audience',
    title: "Who are we calling?",
    subtitle: "Tell us about your target audience",
    icon: Users
  },
  {
    id: 'goal',
    title: "What's the main goal?",
    subtitle: "What do you want to achieve with these calls?",
    icon: Target
  },
  {
    id: 'tone',
    title: "How should your agent sound?",
    subtitle: "Choose the personality that fits your brand",
    icon: Phone
  },
  {
    id: 'details',
    title: "Tell us about your business",
    subtitle: "Help us craft the perfect message",
    icon: Sparkles
  }
];

export function ConversationalWizard({ onComplete, onClose }: ConversationalWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({});

  const currentStepData = steps[currentStep];

  const updateData = (field: keyof WizardData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.campaignName?.trim();
      case 1: return data.targetAudience;
      case 2: return data.goal;
      case 3: return data.tone;
      case 4: return data.businessName?.trim() && data.goalDescription?.trim();
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(data as WizardData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Input
              placeholder="e.g., Q1 Lead Generation, Holiday Promotion..."
              value={data.campaignName || ''}
              onChange={(e) => updateData('campaignName', e.target.value)}
              className="text-lg"
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              Choose a name that helps you identify this campaign later
            </p>
          </div>
        );

      case 1:
        return (
          <RadioGroup
            value={data.targetAudience}
            onValueChange={(value) => updateData('targetAudience', value)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="new-prospects" id="new-prospects" />
              <Label htmlFor="new-prospects" className="flex-1 cursor-pointer">
                <div className="font-medium">New Prospects</div>
                <div className="text-sm text-muted-foreground">Cold leads, potential customers who haven't been contacted</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="existing-customers" id="existing-customers" />
              <Label htmlFor="existing-customers" className="flex-1 cursor-pointer">
                <div className="font-medium">Existing Customers</div>
                <div className="text-sm text-muted-foreground">Previous customers, current clients, or warm leads</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="custom-list" id="custom-list" />
              <Label htmlFor="custom-list" className="flex-1 cursor-pointer">
                <div className="font-medium">Custom List</div>
                <div className="text-sm text-muted-foreground">I'll upload my own contact list</div>
              </Label>
            </div>
          </RadioGroup>
        );

      case 2:
        return (
          <RadioGroup
            value={data.goal}
            onValueChange={(value) => updateData('goal', value)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="book-appointments" id="book-appointments" />
              <Label htmlFor="book-appointments" className="flex-1 cursor-pointer">
                <div className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Book Appointments
                </div>
                <div className="text-sm text-muted-foreground">Schedule meetings, consultations, or demos</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="follow-up" id="follow-up" />
              <Label htmlFor="follow-up" className="flex-1 cursor-pointer">
                <div className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Follow Up
                </div>
                <div className="text-sm text-muted-foreground">Check in with leads, gather feedback, nurture relationships</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="share-offer" id="share-offer" />
              <Label htmlFor="share-offer" className="flex-1 cursor-pointer">
                <div className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Share an Offer
                </div>
                <div className="text-sm text-muted-foreground">Promote a product, service, or special deal</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="survey" id="survey" />
              <Label htmlFor="survey" className="flex-1 cursor-pointer">
                <div className="font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Survey & Research
                </div>
                <div className="text-sm text-muted-foreground">Collect feedback, conduct market research</div>
              </Label>
            </div>
          </RadioGroup>
        );

      case 3:
        return (
          <RadioGroup
            value={data.tone}
            onValueChange={(value) => updateData('tone', value)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="friendly" id="friendly" />
              <Label htmlFor="friendly" className="flex-1 cursor-pointer">
                <div className="font-medium">Friendly & Casual</div>
                <div className="text-sm text-muted-foreground">
                  "Hi there! I'm calling from [Business]. How's your day going?"
                </div>
                <Badge variant="secondary" className="mt-2">Warm & Approachable</Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="professional" id="professional" />
              <Label htmlFor="professional" className="flex-1 cursor-pointer">
                <div className="font-medium">Professional & Direct</div>
                <div className="text-sm text-muted-foreground">
                  "Good morning, this is [Name] from [Business]. I'm calling regarding..."
                </div>
                <Badge variant="secondary" className="mt-2">Business Focused</Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="persuasive" id="persuasive" />
              <Label htmlFor="persuasive" className="flex-1 cursor-pointer">
                <div className="font-medium">Persuasive & Confident</div>
                <div className="text-sm text-muted-foreground">
                  "I've got some exciting news that could really benefit your business..."
                </div>
                <Badge variant="secondary" className="mt-2">Sales Driven</Badge>
              </Label>
            </div>
          </RadioGroup>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business-name">Your Business Name</Label>
              <Input
                id="business-name"
                placeholder="e.g., Acme Consulting, Smith's Auto Repair..."
                value={data.businessName || ''}
                onChange={(e) => updateData('businessName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description">Describe your goal in detail</Label>
              <Textarea
                id="goal-description"
                placeholder="e.g., We help small businesses improve their online presence. I want to schedule 15-minute discovery calls to understand their current challenges and see if we're a good fit..."
                value={data.goalDescription || ''}
                onChange={(e) => updateData('goalDescription', e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                This helps our AI generate a perfect script for your agent
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-[var(--shadow-wizard)]">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Step Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <currentStepData.icon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.subtitle}</p>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={currentStep === 0 ? onClose : handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Create Campaign
                    <Sparkles className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}