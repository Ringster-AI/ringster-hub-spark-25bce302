import { VapiAssistantConfig } from './vapi-config';

export class VapiService {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl = 'https://api.vapi.ai/assistant') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async createAssistant(config: VapiAssistantConfig) {
    console.log('Creating Vapi assistant with config:', JSON.stringify(config, null, 2));

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      const responseText = await response.text();
      console.log('Vapi API response:', responseText);

      if (!response.ok) {
        console.error('Vapi API error:', responseText);
        throw new Error(`Failed to create Vapi assistant: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Successfully created Vapi assistant:', data);
      return data;
    } catch (error) {
      console.error('Error in createAssistant:', error);
      throw error;
    }
  }
}