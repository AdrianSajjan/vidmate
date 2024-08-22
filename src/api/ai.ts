import { api } from "@/config/api";
import { EditorProduct } from "@/types/adapter";

const baseQuery = "/customer/ads/api/v1";

interface GenerateCTAParams {
  description: string;
  name: string;
  limit: number;
  currency: string;
  objective: string;
  selling_price: number;
}

interface GenerateContentParams {
  description: string;
  product_name: string;
}

interface GenerateContentResponse {
  data: string[];
}

async function generateHeadline(product: EditorProduct, _objective: string) {
  const body: GenerateContentParams = { description: product.description, product_name: product.name };
  const res = await api.post<GenerateContentResponse>(`${baseQuery}/generate-headlines`, body);
  return res.data.data;
}

async function generateDescription(product: EditorProduct, _objective: string) {
  const body: GenerateContentParams = { description: product.description, product_name: product.name };
  const res = await api.post<GenerateContentResponse>(`${baseQuery}/generate-subheadlines`, body);
  return res.data.data;
}

async function generateCTA(product: EditorProduct, objective: string) {
  const body: GenerateCTAParams = { name: product.name, description: product.description, currency: product.currency, selling_price: product.selling_price, objective, limit: 5 };
  const res = await api.post<GenerateContentResponse>(`${baseQuery}/ad-cta`, body);
  return res.data.data;
}

generateHeadline.queryKey = "generate-headline";
generateDescription.queryKey = "generate-description";
generateCTA.queryKey = "generate-cta";

export { generateHeadline, generateDescription, generateCTA };
