import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Target, 
  GitBranch, 
  Calendar, 
  MessageSquare, 
  Phone,
  Plus,
  Edit3,
  Play,
  Pause,
  Settings
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { WizardData } from "../wizard/ConversationalWizard";

export interface FlowBlock {
  id: string;
  type: 'greeting' | 'goal' | 'branch' | 'action' | 'followup';
  title: string;
  content: string;
  tone?: 'friendly' | 'professional' | 'persuasive';
  conditions?: Array<{
    label: string;
    response: string;
    nextBlock?: string;
  }>;
}

interface CampaignFlowBuilderProps {
  wizardData: WizardData;
  onSave: (blocks: FlowBlock[]) => void;
  onPreview: (blocks: FlowBlock[]) => void;
}

const blockTypes = {
  greeting: {
    icon: MessageCircle,
    color: 'hsl(var(--flow-node-greeting))',
    label: 'Greeting',
    description: 'How your agent introduces itself'
  },
  goal: {
    icon: Target,
    color: 'hsl(var(--flow-node-goal))',
    label: 'Goal',
    description: 'Main objective of the call'
  },
  branch: {
    icon: GitBranch,
    color: 'hsl(var(--flow-node-branch))',
    label: 'Decision Point',
    description: 'Handle different responses'
  },
  action: {
    icon: Calendar,
    color: 'hsl(var(--flow-node-action))',
    label: 'Action',
    description: 'Book appointment, send SMS, etc.'
  },
  followup: {
    icon: MessageSquare,
    color: 'hsl(var(--flow-node-action))',
    label: 'Follow-up',
    description: 'Next steps and closing'
  }
};

export function CampaignFlowBuilder({ wizardData, onSave, onPreview }: CampaignFlowBuilderProps) {
  const [blocks, setBlocks] = useState<FlowBlock[]>([
    {
      id: '1',
      type: 'greeting',
      title: 'Opening Greeting',
      content: `Hi, this is Alex from ${wizardData.businessName}. How are you doing today?`,
      tone: wizardData.tone
    },
    {
      id: '2',
      type: 'goal',
      title: 'Main Pitch',
      content: wizardData.goalDescription,
      tone: wizardData.tone
    },
    {
      id: '3',
      type: 'branch',
      title: 'Handle Response',
      content: 'Based on their interest level',
      conditions: [
        { label: 'Interested', response: "That sounds interesting, tell me more", nextBlock: '4' },
        { label: 'Not Interested', response: "I'm not interested right now", nextBlock: '5' },
        { label: 'Maybe Later', response: "Maybe another time", nextBlock: '6' }
      ]
    },
    {
      id: '4',
      type: 'action',
      title: 'Book Appointment',
      content: 'Great! I\'d love to schedule a quick 15-minute call to discuss this further. What works better for you - this afternoon or tomorrow morning?'
    },
    {
      id: '5',
      type: 'followup',
      title: 'Polite Close',
      content: 'I completely understand. Thanks for your time, and have a great day!'
    },
    {
      id: '6',
      type: 'action',
      title: 'Schedule Follow-up',
      content: 'No problem at all. Would it be okay if I sent you a quick text with some information, and then maybe we could reconnect in a few weeks?'
    }
  ]);

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const addBlock = (type: FlowBlock['type'], afterId?: string) => {
    const newBlock: FlowBlock = {
      id: Date.now().toString(),
      type,
      title: `New ${blockTypes[type].label}`,
      content: 'Enter your message here...',
      tone: wizardData.tone
    };

    if (type === 'branch') {
      newBlock.conditions = [
        { label: 'Yes', response: 'Yes', nextBlock: undefined },
        { label: 'No', response: 'No', nextBlock: undefined }
      ];
    }

    setBlocks(prev => {
      if (afterId) {
        const index = prev.findIndex(b => b.id === afterId);
        return [...prev.slice(0, index + 1), newBlock, ...prev.slice(index + 1)];
      }
      return [...prev, newBlock];
    });
  };

  const updateBlock = (id: string, updates: Partial<FlowBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const convertFlowToSystemPrompt = useCallback((blocks: FlowBlock[]): string => {
    let prompt = `You are an AI sales agent conducting outbound calls. Follow this conversation flow:

`;

    blocks.forEach((block, index) => {
      prompt += `${index + 1}. ${block.title.toUpperCase()}:\n`;
      prompt += `   ${block.content}\n`;
      
      if (block.tone) {
        prompt += `   (Use a ${block.tone} tone)\n`;
      }
      
      if (block.conditions && block.conditions.length > 0) {
        prompt += `   Handle responses:\n`;
        block.conditions.forEach(condition => {
          prompt += `   - If they say "${condition.response}" or similar: ${condition.label}\n`;
        });
      }
      
      prompt += `\n`;
    });

    prompt += `IMPORTANT GUIDELINES:
- Stay on script but sound natural and conversational
- Listen for buying signals and adapt accordingly
- If asked to be removed from list, politely comply and end call
- Keep responses concise (under 30 seconds)
- Always be respectful of their time
- If scheduling, confirm date, time, and contact details`;

    return prompt;
  }, []);

  const renderBlock = (block: FlowBlock, index: number) => {
    const BlockIcon = blockTypes[block.type].icon;
    const isSelected = selectedBlock === block.id;

    return (
      <motion.div
        key={block.id}
        layout
        className={`relative ${isSelected ? 'z-10' : ''}`}
      >
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] ${
            isSelected ? 'ring-2 ring-primary shadow-[var(--shadow-flow-node)]' : ''
          }`}
          onClick={() => setSelectedBlock(isSelected ? null : block.id)}
          style={{
            borderLeft: `4px solid ${blockTypes[block.type].color}`
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    backgroundColor: `${blockTypes[block.type].color}15`,
                    color: blockTypes[block.type].color
                  }}
                >
                  <BlockIcon className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {blockTypes[block.type].description}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {blockTypes[block.type].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {block.content}
            </p>
            {block.conditions && (
              <div className="mt-3 space-y-1">
                {block.conditions.map((condition, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    <span className="text-muted-foreground">
                      {condition.label}: {condition.response}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {block.tone && (
              <div className="mt-3">
                <Badge variant="outline" className="text-xs capitalize">
                  {block.tone} tone
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Arrow */}
        {index < blocks.length - 1 && (
          <div className="flex justify-center py-2">
            <div className="w-px h-6 bg-border"></div>
            <div className="absolute w-2 h-2 bg-border rounded-full -translate-x-1 translate-y-2"></div>
          </div>
        )}

        {/* Add Block Button */}
        <div className="flex justify-center py-2">
          <Button
            variant="outline"
            size="sm"
            className="opacity-0 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              addBlock('branch', block.id);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Block
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Flow Builder */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Campaign Flow</h3>
            <p className="text-sm text-muted-foreground">
              Design your agent's conversation journey
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onPreview(blocks)}>
              <Play className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => onSave(blocks)}>
              Save Campaign
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-b from-background to-accent/5 rounded-lg p-6 min-h-[600px]">
          <Reorder.Group values={blocks} onReorder={setBlocks} className="space-y-4">
            {blocks.map((block, index) => (
              <Reorder.Item key={block.id} value={block}>
                {renderBlock(block, index)}
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Add First Block Button */}
          {blocks.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Building Your Flow</h3>
              <p className="text-muted-foreground mb-4">Add your first conversation block</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => addBlock('greeting')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Add Greeting
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbox & Settings */}
      <div className="space-y-4">
        {/* Block Toolbox */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Blocks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(blockTypes).map(([type, config]) => (
              <Button
                key={type}
                variant="outline"
                className="w-full justify-start"
                onClick={() => addBlock(type as FlowBlock['type'])}
              >
                <config.icon className="h-4 w-4 mr-2" style={{ color: config.color }} />
                {config.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Block Editor */}
        {selectedBlock && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Block
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select a block to edit its content and settings
              </p>
            </CardContent>
          </Card>
        )}

        {/* Campaign Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Campaign Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Campaign Name</label>
              <p className="text-sm text-muted-foreground">{wizardData.campaignName}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium">Target Audience</label>
              <p className="text-sm text-muted-foreground capitalize">
                {wizardData.targetAudience.replace('-', ' ')}
              </p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium">Goal</label>
              <p className="text-sm text-muted-foreground capitalize">
                {wizardData.goal.replace('-', ' ')}
              </p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium">Tone</label>
              <Badge variant="outline" className="capitalize">
                {wizardData.tone}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}