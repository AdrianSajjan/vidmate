import { api } from "@/config/api";
import { useMutation } from "@tanstack/react-query";

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

export const useGenerateHeadline = () => {
  const response = useMutation({
    mutationKey: ["generateHeadline"],
    mutationFn: generateHeadline,
  });
  return response;
};

export async function generateDescription(body: AdContentProps) {
  const res = await api.post<AdContentResponse>(`${baseQuery}/ad-contents`, body);
  return res.data.data;
}

export const useGenerateDescription = () => {
  const response = useMutation({
    mutationKey: ["generateDescription"],
    mutationFn: generateDescription,
  });
  return response;
};

export async function generateCTA(body: AdContentProps) {
  const res = await api.post<AdContentResponse>(`${baseQuery}/ad-cta`, body);
  return res.data.data;
}

export const useGenerateCTA = () => {
  const response = useMutation({
    mutationKey: ["generateCTA"],
    mutationFn: generateCTA,
  });
  return response;
};
