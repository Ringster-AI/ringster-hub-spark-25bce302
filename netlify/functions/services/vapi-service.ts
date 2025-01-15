export class VapiService {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async createAssistant(config: any) {
    console.log('Creating Vapi assistant with config:', JSON.stringify(config, null, 2));
    
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create Vapi assistant:', errorText);
      throw new Error(`Failed to create Vapi assistant: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully created Vapi assistant:', data);
    return data;
  }

  async importTwilioNumber(assistantId: string, twilioNumber: string, twilioAccountSid: string, twilioAuthToken: string) {
    console.log('Importing Twilio number into Vapi:', twilioNumber);
    
    // Update: Use the base URL for importing Twilio numbers
    const importUrl = 'https://api.vapi.ai/phone/import-twilio';
    console.log('Using import URL:', importUrl);
    
    const response = await fetch(importUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: assistantId,
        twilioPhoneNumber: twilioNumber,
        twilioAccountSid: twilioAccountSid,
        twilioAuthToken: twilioAuthToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to import Twilio number:', errorText);
      throw new Error(`Failed to import Twilio number: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully imported Twilio number:', data);
    return data;
  }
}