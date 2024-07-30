import { api } from "@/config/api";
import { extractAudioDurationFromSource } from "@/lib/media";
import { PromptVoice } from "@/types/prompt";

type VoiceContentPromptResponse = Omit<PromptVoice, "duration">;

export async function createVoiceContentFromPrompt(prompt: string) {
  const response = await api.post<VoiceContentPromptResponse[]>("/speech/prompt", { prompt });
  return Promise.all(response.data.map((voice) => extractAudioDurationFromSource(voice.source).then((duration) => ({ ...voice, duration }) as PromptVoice)));
}
