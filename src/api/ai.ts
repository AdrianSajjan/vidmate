import { api } from "@/config/api";

const baseQuery = "/customer/ads/api/v1";

interface AdContentProps {
  description?: string;
  limit: number;
  name?: string;
  currency?: string;
  objective?: string;
  selling_price?: number;
}

interface AdContentResponse {
  data: string[];
}

export async function generateHeadline(body: AdContentProps) {
  const res = await api.post<AdContentResponse>(`${baseQuery}/ad-headlines`, body);
  return res.data.data;
}

export async function generateDescription(body: AdContentProps) {
  const res = await api.post<AdContentResponse>(`${baseQuery}/ad-contents`, body);
  return res.data.data;
}

export async function generateCTA(body: AdContentProps) {
  const res = await api.post<AdContentResponse>(`${baseQuery}/ad-cta`, body);
  return res.data.data;
}
