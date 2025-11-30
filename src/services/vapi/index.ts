
import { callService } from './call-service';
import { analyticsService } from './analytics-service';
import { transcriptService } from './transcript-service';
import { VapiAssistantUpdateService } from './assistant-update-service';

// Re-export all services as a unified API
export const vapiService = {
  ...callService,
  ...transcriptService,
  ...analyticsService,
  // Add assistant update functionality
  syncAgentWithVapi: VapiAssistantUpdateService.syncAgentWithVapi,
};
