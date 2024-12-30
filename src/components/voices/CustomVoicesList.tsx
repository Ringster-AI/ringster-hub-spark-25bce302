import { useQuery } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateCustomVoiceDialog } from "./CreateCustomVoiceDialog";

interface CustomVoice {
  id: string;
  name: string;
  voice_id: string;
  created_at?: string;
}

export const CustomVoicesList = () => {
  const { toast } = useToast();

  const { data: customVoices = [], isLoading, error, refetch } = useQuery({
    queryKey: ["custom-voices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_voices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching custom voices:", error);
        toast({
          title: "Error loading custom voices",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    },
  });

  const deleteVoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_voices")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Voice deleted",
        description: "Custom voice has been deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error deleting voice",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">Loading custom voices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Error loading custom voices. Please try again.</div>
      </div>
    );
  }

  const createButton = (
    <Button>
      <Plus className="mr-2" />
      Create Custom Voice
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Voices</h2>
          <p className="text-muted-foreground">
            Manage your organization's custom voices
          </p>
        </div>
        <CreateCustomVoiceDialog trigger={createButton} onSuccess={refetch} />
      </div>

      {customVoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4 border-2 border-dashed rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No custom voices yet</h3>
            <p className="text-muted-foreground">
              Create your first custom voice to get started
            </p>
          </div>
          <CreateCustomVoiceDialog trigger={createButton} onSuccess={refetch} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {customVoices.map((voice: CustomVoice) => (
            <div
              key={voice.id}
              className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{voice.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteVoice(voice.id)}
                  title="Delete voice"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Voice ID: {voice.voice_id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};