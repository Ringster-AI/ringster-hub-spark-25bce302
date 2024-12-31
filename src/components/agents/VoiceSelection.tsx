import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlayCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VOICE_OPTIONS } from "@/types/voice";

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
    
    if (disabled) {
      toast({
        title: "Feature not available",
        description: disabledMessage,
        variant: "destructive",
      });
      return;
    }

    setPlaying(voiceId);
    try {
      const response = await fetch('/.netlify/functions/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: "Hello, this is a sample of my voice.",
          voiceId: voiceId
        })
      });

      if (!response.ok) throw new Error('Failed to fetch audio');

      const arrayBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
      
    } catch (error) {
      toast({
        title: "Error playing voice sample",
        description: "Failed to play the voice sample.",
        variant: "destructive",
      });
    } finally {
      setPlaying(null);
      // Clean up the audio URL if needed
    }
  };

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
      <RadioGroup value={disabled ? "9BWtsMINqrJLrRacOk9x" : value} onValueChange={onChange} disabled={disabled}>
        {VOICE_OPTIONS.map((voice) => (
          <div
            key={voice.id}
            className={`flex items-center justify-between mb-4 p-4 border rounded-lg ${
              disabled ? "opacity-50" : ""
            }`}
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
              disabled={playing !== null || disabled}
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