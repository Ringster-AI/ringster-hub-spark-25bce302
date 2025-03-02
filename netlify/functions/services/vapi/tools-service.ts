
import { VapiBaseService } from './base-service';

export class VapiToolsService extends VapiBaseService {
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

    const data = await this.makeRequest('https://api.vapi.ai/tool', 'POST', toolConfig);
    console.log('Successfully created transfer tool:', data);
    return data;
  }
}
