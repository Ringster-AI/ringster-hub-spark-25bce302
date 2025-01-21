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
    console.log('Creating Vapi transfer tool');
    
    const destinations = Object.entries(transferDirectory).map(([name, entry]) => ({
      type: "number",
      number: entry.number,
      message: `I am forwarding your call to our ${name}. Please stay on the line.`
    }));

    const enumValues = Object.values(transferDirectory).map(entry => entry.number);

    const toolConfig = {
      type: "transferCall",
      destinations,
      function: {
        name: "transferCall",
        description: "Use this function to transfer the call. Only use it when following instructions that explicitly ask you to use the transferCall function.",
        parameters: {
          type: "object",
          properties: {
            destination: {
              type: "string",
              enum: enumValues,
              description: "The destination to transfer the call to."
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
}