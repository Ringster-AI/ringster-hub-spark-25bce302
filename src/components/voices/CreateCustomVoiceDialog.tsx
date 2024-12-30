import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateCustomVoiceDialogProps {
  trigger: React.ReactNode;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  voice_id: string;
}

export const CreateCustomVoiceDialog = ({ trigger, onSuccess }: CreateCustomVoiceDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      voice_id: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from("custom_voices")
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Custom voice created",
        description: "Your custom voice has been created successfully.",
      });

      onSuccess();
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error creating custom voice",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Custom Voice</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter voice name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="voice_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ElevenLabs voice ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit">Create Voice</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};