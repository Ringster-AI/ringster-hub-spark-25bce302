
import { VapiAssistantService, VapiToolsService, VapiPhoneService, VapiCallService } from './vapi/index';

export class VapiService {
  private assistantService: VapiAssistantService;
  private toolsService: VapiToolsService;
  private phoneService: VapiPhoneService;
  private callService: VapiCallService;
  
  constructor(apiKey: string, apiUrl: string) {
    this.assistantService = new VapiAssistantService(apiKey, apiUrl);
    this.toolsService = new VapiToolsService(apiKey, apiUrl);
    this.phoneService = new VapiPhoneService(apiKey, apiUrl);
    this.callService = new VapiCallService(apiKey, apiUrl);
  }

  // Assistant methods
  async createAssistant(config: any) {
    return this.assistantService.createAssistant(config);
  }

  async updateAssistantTools(assistantId: string, toolId: string, model: string, provider: string) {
    return this.assistantService.updateAssistantTools(assistantId, toolId, model, provider);
  }

  async getConversationAnalytics(assistantId: string, dateRange?: { startDate: string; endDate: string }) {
    return this.assistantService.getConversationAnalytics(assistantId, dateRange);
  }

  // Tools methods
  async createTransferTool(transferDirectory: Record<string, any>) {
    return this.toolsService.createTransferTool(transferDirectory);
  }

  // Phone methods
  async importTwilioNumber(assistantId: string, twilioNumber: string, twilioAccountSid: string, twilioAuthToken: string) {
    return this.phoneService.importTwilioNumber(assistantId, twilioNumber, twilioAccountSid, twilioAuthToken);
  }

  // Call methods
  async getCallTranscript(callId: string) {
    return this.callService.getCallTranscript(callId);
  }

  async getCallRecording(callId: string) {
    return this.callService.getCallRecording(callId);
  }
}
