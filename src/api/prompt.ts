import { api } from "@/config/api";
import { PromptSession } from "@/types/prompt";
import { nanoid } from "nanoid";

export async function createAdsFromPrompt(prompt: string, format: string) {
  const response = await api.post<PromptSession>("/ads/prompt", { prompt, format });
  return Object.assign({ id: nanoid() }, response.data) as PromptSession;
}
