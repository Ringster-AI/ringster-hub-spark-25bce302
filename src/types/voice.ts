export const VOICE_OPTIONS = [
  {
    id: "9BWtsMINqrJLrRacOk9x",
    name: "Aria",
    recommended_for: "Professional and clear communication"
  },
  {
    id: "CwhRBWXzGAHq8TQ4Fs17",
    name: "Roger",
    recommended_for: "Authoritative and trustworthy tone"
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    recommended_for: "Friendly and approachable service"
  }
] as const;

export type VoiceOption = typeof VOICE_OPTIONS[number];