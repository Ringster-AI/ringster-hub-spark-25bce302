import { SupabaseClient } from '@supabase/supabase-js';

export class DatabaseService {
  constructor(private supabase: SupabaseClient) {}

  async updateAgentWithPhoneNumber(agentId: string, phoneNumber: string, twilioSid: string) {
    console.log(`Updating agent ${agentId} with phone number ${phoneNumber}`);
    const { error } = await this.supabase
      .from('agent_configs')
      .update({
        phone_number: phoneNumber,
        twilio_sid: twilioSid
      })
      .eq('id', agentId);

    if (error) {
      console.error('Error updating agent config:', error);
      throw error;
    }

    console.log('Successfully updated agent with phone number');
  }
}