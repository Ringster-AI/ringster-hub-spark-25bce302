
import * as z from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  scheduledStart: z.date().optional(),
  agent: z.object({
    name: z.string().min(1, "Agent name is required"),
    description: z.string().optional(),
    greeting: z.string().optional(),
    goodbye: z.string().optional(),
    voice_id: z.string().optional(),
  }),
});

export type FormData = z.infer<typeof formSchema>;
