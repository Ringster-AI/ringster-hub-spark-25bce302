import { AgentConfig } from '../../../src/types/database/agents';

export interface VapiAssistantConfig {
  name: string;
  firstMessage: string;
  model: {
    provider: string;
    model: string;
    temperature: number;
    messages: Array<{
      role: string;
      content: string;
    }>;
  };
  voice: {
    provider: string;
    voiceId: string;
  };
  transcriber: {
    provider: string;
    model: string;
    language: string;
  };
  transportConfigurations: Array<{
    provider: string;
    phoneNumber: string; // Changed back to phoneNumber as per Vapi API requirements
    timeout: number;
    record: boolean;
  }>;
  endCallMessage: string;
  silenceTimeoutSeconds: number;
  maxDurationSeconds: number;
}

export const createVapiAssistantConfig = (
  agent: AgentConfig,
  phoneNumber?: string
): VapiAssistantConfig => {
  // Clean phone number to E.164 format (remove all non-digit characters except +)
  const cleanPhoneNumber = phoneNumber ? phoneNumber.replace(/[^\d+]/g, '') : '';
  
  return {
    name: agent.name,
    firstMessage: agent.greeting || "Hello! How can I help you today?",
    model: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: agent.description || "You are a helpful AI assistant."
        }
      ]
    },
    voice: {
      provider: "11labs",
      voiceId: agent.config?.voice_id || "21m00Tcm4TlvDq8ikWAM",
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en"
    },
    transportConfigurations: cleanPhoneNumber ? [
      {
        provider: "twilio",
        phoneNumber: cleanPhoneNumber, // Changed back to phoneNumber
        timeout: 60,
        record: false
      }
    ] : [],
    endCallMessage: agent.goodbye || "Thank you for calling. Goodbye!",
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600
  };
};