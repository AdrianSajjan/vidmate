export interface PromptMedia {
  source: string;
  duration: number;
  type: "video" | "image" | "audio";
}

export interface PromptVoice {
  text: string;
  source: string;
  duration: number;
}

export interface PromptSession {
  id: string;
  prompt: string;
  title: string;
  media: PromptMedia[];
  voice: PromptVoice[];
}
