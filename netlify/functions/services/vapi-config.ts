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
  endCallMessage: string;
  silenceTimeoutSeconds: number;
  maxDurationSeconds: number;
}

export const createVapiAssistantConfig = (
  agent: AgentConfig
): VapiAssistantConfig => {
  const advancedConfig = agent.advanced_config as any || {};
  const voiceConfig = advancedConfig.voice || {};
  const transcriberConfig = advancedConfig.transcriber || {};

  return {
    name: agent.name,
    firstMessage: agent.greeting || "Hello! How can I help you today?",
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: agent.description || "You are a helpful AI assistant."
        }
      ]
    },
    voice: {
      provider: voiceConfig.provider || "11labs",
      voiceId: voiceConfig.useCustomVoiceId ? voiceConfig.customVoiceId : (agent.config?.voice_id || "21m00Tcm4TlvDq8ikWAM"),
    },
    transcriber: {
      provider: transcriberConfig.provider || "deepgram",
      model: transcriberConfig.model || "nova-2",
      language: transcriberConfig.language || "en"
    },
    endCallMessage: agent.goodbye || "Thank you for calling. Goodbye!",
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600
  };
};