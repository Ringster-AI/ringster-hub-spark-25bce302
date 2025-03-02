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

  async createTransferTool(transferDirectory: Record<string, any>) {
    console.log('Creating Vapi transfer tool with directory:', transferDirectory);
    
    const destinations = Object.entries(transferDirectory).map(([name, entry]) => ({
      type: "number",
      number: entry.number,
      message: entry.transfer_message || `Transferring your call to ${name}.`
    }));

    const enumValues = Object.values(transferDirectory).map(entry => entry.number);

    const toolConfig = {
      type: "transferCall",
      destinations,
      function: {
        name: "transferCall",
        description: "Transfer the call to a specific department or person.",
        parameters: {
          type: "object",
          properties: {
            destination: {
              type: "string",
              enum: enumValues,
              description: "The phone number to transfer the call to."
            },
            reason: {
              type: "string",
              description: "Reason for the transfer"
            }
          },
          required: ["destination"]
        }
      },
      messages: destinations.map(dest => ({
        type: "request-start",
        content: dest.message,
        conditions: [{
          param: "destination",
          operator: "eq",
          value: dest.number
        }]
      }))
    };

    console.log('Transfer tool configuration:', JSON.stringify(toolConfig, null, 2));

    const response = await fetch('https://api.vapi.ai/tool', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toolConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create transfer tool:', errorText);
      throw new Error(`Failed to create transfer tool: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully created transfer tool:', data);
    return data;
  }

  async updateAssistantTools(assistantId: string, toolId: string, model: string, provider: string) {
    console.log(`Updating assistant ${assistantId} with tool ${toolId}`);
    
    const config = {
      model: {
        model,
        provider,
        toolIds: [toolId]
      }
    };

    console.log('Update configuration:', JSON.stringify(config, null, 2));

    const response = await fetch(`${this.apiUrl}/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update assistant:', errorText);
      throw new Error(`Failed to update assistant: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully updated assistant:', data);
    return data;
  }

  async importTwilioNumber(assistantId: string, twilioNumber: string, twilioAccountSid: string, twilioAuthToken: string) {
    console.log('Importing Twilio number into Vapi:', twilioNumber);
    
    const importUrl = 'https://api.vapi.ai/phone-number';
    console.log('Using import URL:', importUrl);
    
    const config = {
      provider: "twilio",
      number: twilioNumber,
      name: `Twilio Number ${twilioNumber}`,
      assistantId: assistantId,
      twilioAccountSid: twilioAccountSid,
      twilioAuthToken: twilioAuthToken,
      server: {
        timeoutSeconds: 20,
        url: "https://api.vapi.ai/webhook"
      }
    };

    console.log('Import configuration:', JSON.stringify(config, null, 2));
    
    const response = await fetch(importUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
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

  async getCallTranscript(callId: string) {
    console.log(`Retrieving transcript for call: ${callId}`);
    
    const response = await fetch(`https://api.vapi.ai/call/${callId}/transcript`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to retrieve call transcript:', errorText);
      throw new Error(`Failed to retrieve call transcript: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully retrieved call transcript');
    return data;
  }

  async getCallRecording(callId: string) {
    console.log(`Retrieving recording for call: ${callId}`);
    
    const response = await fetch(`https://api.vapi.ai/call/${callId}/recording`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to retrieve call recording:', errorText);
      throw new Error(`Failed to retrieve call recording: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully retrieved call recording URL');
    return data;
  }

  async getConversationAnalytics(assistantId: string, dateRange?: { startDate: string; endDate: string }) {
    console.log(`Retrieving conversation analytics for assistant: ${assistantId}`);
    
    let url = `https://api.vapi.ai/assistant/${assistantId}/analytics`;
    
    if (dateRange) {
      url += `?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to retrieve conversation analytics:', errorText);
      throw new Error(`Failed to retrieve conversation analytics: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully retrieved conversation analytics');
    return data;
  }
}
