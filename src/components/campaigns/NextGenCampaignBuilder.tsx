import { useState } from "react";
import { ConversationalWizard, WizardData } from "./wizard/ConversationalWizard";
import { CampaignFlowBuilder, FlowBlock } from "./builder/CampaignFlowBuilder";
import { SmartContactManager } from "./contact/SmartContactManager";
import { LiveCampaignDashboard } from "./dashboard/LiveCampaignDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowLeft, 
  Users, 
  Play, 
  Calendar,
  MessageCircle,
  Target,
  GitBranch
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type BuilderStep = 'wizard' | 'flow' | 'contacts' | 'schedule' | 'dashboard';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  tags: string[];
  status: 'pending' | 'validated' | 'invalid';
  metadata?: Record<string, any>;
}

interface NextGenCampaignBuilderProps {
  onClose: () => void;
}

export function NextGenCampaignBuilder({ onClose }: NextGenCampaignBuilderProps) {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('wizard');
  const [wizardData, setWizardData] = useState<WizardData | null>(null);
  const [flowBlocks, setFlowBlocks] = useState<FlowBlock[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<'scheduled' | 'running' | 'paused' | 'completed'>('scheduled');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const steps = {
    wizard: { title: 'Campaign Setup', icon: Sparkles, description: 'Tell us about your campaign' },
    flow: { title: 'Build Conversation', icon: GitBranch, description: 'Design your agent\'s flow' },
    contacts: { title: 'Add Contacts', icon: Users, description: 'Upload your contact list' },
    schedule: { title: 'Schedule & Launch', icon: Calendar, description: 'When to start calling' },
    dashboard: { title: 'Live Dashboard', icon: Target, description: 'Monitor performance' }
  };

  const handleWizardComplete = async (data: WizardData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to create campaigns.",
          variant: "destructive",
        });
        return;
      }

      // Create agent config first
      const { data: agent, error: agentError } = await supabase
        .from("agent_configs")
        .insert({
          name: `${data.campaignName} Agent`,
          description: data.goalDescription,
          greeting: `Hello! I'm calling from ${data.businessName} about ${data.campaignName}.`,
          goodbye: "Thank you for your time. Have a great day!",
          agent_type: "outbound",
          status: "draft",
          user_id: session.user.id,
        })
        .select()
        .single();

      if (agentError) throw agentError;

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          name: data.campaignName,
          description: data.goalDescription,
          agent_id: agent.id,
          status: "draft",
          user_id: session.user.id,
          config: {
            targetAudience: data.targetAudience,
            goal: data.goal,
            tone: data.tone,
            businessName: data.businessName,
          },
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      setCampaignId(campaign.id);
      setWizardData(data);
      setCurrentStep('flow');
      
      toast({
        title: "Campaign created!",
        description: "Now let's design your agent's conversation flow."
      });
    } catch (error: any) {
      toast({
        title: "Error creating campaign",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFlowSave = (blocks: FlowBlock[]) => {
    setFlowBlocks(blocks);
    setCurrentStep('contacts');
    toast({
      title: "Flow saved!",
      description: "Your conversation flow looks great. Now let's add contacts."
    });
  };

  const handleFlowPreview = (blocks: FlowBlock[]) => {
    // Mock preview functionality
    toast({
      title: "Preview ready!",
      description: "Here's how your agent will sound..."
    });
  };

  const handleContactsReady = (contactList: Contact[]) => {
    setContacts(contactList);
    setCurrentStep('schedule');
    toast({
      title: "Contacts added!",
      description: `${contactList.length} contacts ready to call.`
    });
  };

  const handleLaunchCampaign = async () => {
    if (!campaignId) return;
    
    try {
      // Update campaign status to running
      const { error } = await supabase
        .from("campaigns")
        .update({ status: 'running' })
        .eq('id', campaignId);

      if (error) throw error;

      setCampaignStatus('running');
      setCurrentStep('dashboard');
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      
      toast({
        title: "Campaign launched! 🚀",
        description: `Your agent is now calling ${contacts.length} contacts.`
      });
    } catch (error: any) {
      toast({
        title: "Error launching campaign",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (status: string) => {
    setCampaignStatus(status as any);
    toast({
      title: "Campaign status updated",
      description: `Campaign is now ${status}.`
    });
  };

  const handleBackToStep = (step: BuilderStep) => {
    setCurrentStep(step);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      {Object.entries(steps).map(([step, config], index) => {
        const isActive = currentStep === step;
        const isCompleted = Object.keys(steps).indexOf(currentStep) > index;
        const StepIcon = config.icon;

        return (
          <div key={step} className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
              size="sm"
              className={`flex items-center gap-2 transition-all ${
                isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''
              }`}
              onClick={() => isCompleted || isActive ? handleBackToStep(step as BuilderStep) : undefined}
              disabled={!isCompleted && !isActive}
            >
              <StepIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{config.title}</span>
              <span className="sm:hidden">{index + 1}</span>
            </Button>
            {index < Object.keys(steps).length - 1 && (
              <div className="w-4 h-px bg-border flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'wizard':
        return (
          <ConversationalWizard
            onComplete={handleWizardComplete}
            onClose={onClose}
          />
        );

      case 'flow':
        if (!wizardData) return null;
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Design Your Agent's Conversation</h2>
                <p className="text-muted-foreground">
                  Build the perfect flow for {wizardData.campaignName}
                </p>
              </div>
              <Button variant="outline" onClick={() => setCurrentStep('wizard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Setup
              </Button>
            </div>
            <CampaignFlowBuilder
              wizardData={wizardData}
              onSave={handleFlowSave}
              onPreview={handleFlowPreview}
            />
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Add Your Contacts</h2>
                <p className="text-muted-foreground">
                  Upload, paste, or manually add the people you want to call
                </p>
              </div>
              <Button variant="outline" onClick={() => setCurrentStep('flow')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Flow
              </Button>
            </div>
            <SmartContactManager onContactsReady={handleContactsReady} />
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Schedule & Launch</h2>
                <p className="text-muted-foreground">
                  When should your agent start calling?
                </p>
              </div>
              <Button variant="outline" onClick={() => setCurrentStep('contacts')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contacts
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Campaign Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Campaign Name</span>
                      <span className="font-medium">{wizardData?.campaignName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Target Audience</span>
                      <Badge variant="outline" className="capitalize">
                        {wizardData?.targetAudience.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Goal</span>
                      <Badge variant="outline" className="capitalize">
                        {wizardData?.goal.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contacts</span>
                      <span className="font-medium">{contacts.length} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Flow Blocks</span>
                      <span className="font-medium">{flowBlocks.length} blocks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Launch Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="launch" value="now" defaultChecked className="text-primary" />
                      <div>
                        <div className="font-medium">Start Now</div>
                        <div className="text-sm text-muted-foreground">Begin calling immediately</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="launch" value="scheduled" className="text-primary" />
                      <div>
                        <div className="font-medium">Schedule for Later</div>
                        <div className="text-sm text-muted-foreground">Pick a specific date and time</div>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Compliance Check</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="text-primary" />
                        <span className="text-sm">Include call recording notice</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="text-primary" />
                        <span className="text-sm">Respect Do Not Call list</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="text-primary" />
                        <span className="text-sm">Follow business hours</span>
                      </label>
                    </div>
                  </div>

                  <Button onClick={handleLaunchCampaign} className="w-full bg-gradient-to-r from-primary to-primary-glow">
                    <Play className="h-4 w-4 mr-2" />
                    Launch Campaign
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'dashboard':
        if (!campaignId || !wizardData) return null;
        return (
          <LiveCampaignDashboard
            campaignId={campaignId}
            campaignName={wizardData.campaignName}
            status={campaignStatus}
            onStatusChange={handleStatusChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto p-6">
        {currentStep !== 'wizard' && currentStep !== 'dashboard' && renderStepIndicator()}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[600px]"
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}