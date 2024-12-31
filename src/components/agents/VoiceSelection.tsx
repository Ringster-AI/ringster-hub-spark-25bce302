import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlayCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VOICE_OPTIONS } from "@/types/voice";
import { supabase } from "@/integrations/supabase/client";

interface VoiceSelectionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export const VoiceSelection = ({ 
  value, 
  onChange, 
  disabled = false,
  disabledMessage = "This feature is not available"
}: VoiceSelectionProps) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const { toast } = useToast();

  const playVoiceSample = async (voiceId: string) => {
    if (playing || disabled) return;
    
    setPlaying(voiceId);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: "Hello, this is a sample of my voice.",
          voiceId: voiceId
        }
      });

      if (error) throw error;

      // Convert base64 to blob
      const audioData = atob(data.audioContent);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const uintArray = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        uintArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      await audio.play();
      
      // Clean up the URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setPlaying(null);
      };
      
    } catch (error) {
      console.error('Error playing voice sample:', error);
      toast({
        title: "Error playing voice sample",
        description: "Failed to play the voice sample.",
        variant: "destructive",
      });
      setPlaying(null);
    }
  };

  // Only show first three voices for free tier
  const availableVoices = disabled ? VOICE_OPTIONS.slice(0, 3) : VOICE_OPTIONS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Select a Voice</Label>
        {disabled && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Lock className="w-4 h-4 mr-1" />
            {disabledMessage}
          </div>
        )}
      </div>
      <RadioGroup 
        value={value} 
        onValueChange={onChange} 
      >
        {availableVoices.map((voice) => (
          <div
            key={voice.id}
            className="flex items-center justify-between mb-4 p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={voice.id} id={voice.id} />
              <Label htmlFor={voice.id} className="cursor-pointer">
                <div>
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {voice.recommended_for}
                  </div>
                </div>
              </Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => playVoiceSample(voice.id)}
              disabled={playing !== null}
            >
              <PlayCircle
                className={`h-5 w-5 ${
                  playing === voice.id ? "text-primary animate-pulse" : ""
                }`}
              />
            </Button>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};