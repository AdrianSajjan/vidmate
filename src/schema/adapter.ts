import { z } from "zod";

export const EditorProductImageSchema = z.object({
  id: z.number(),
  url: z.string(),
});

export const EditorProductSchema = z.object({
  id: z.number().nullish(),
  business_id: z.number().nullish(),
  name: z.string(),
  currency: z.string(),
  description: z.string(),
  tags: z.array(z.string()).nullish(),
  selling_price: z.number(),
  site_url: z.string().nullish(),
  images: z.array(EditorProductImageSchema),
});

export const EditorBrandSchema = z.object({
  brand_name: z.string(),
  brand_logo: z.string(),
  brand_description: z.string(),
  primary_colors: z.array(z.string()),
  secondary_colors: z.array(z.string()),
});

export type EditorProductImage = z.infer<typeof EditorProductImageSchema>;
export type EditorProduct = z.infer<typeof EditorProductSchema>;
export type EditorBrand = z.infer<typeof EditorBrandSchema>;
