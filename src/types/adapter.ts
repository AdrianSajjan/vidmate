export interface EditorProduct {
  id: number;
  business_id: number;
  name: string;
  currency: string;
  description: "Designed in London,Our Gemma bag means business. This faux leather style has an on-trend croc effect and structured shape.";
  tags: string[] | null;
  selling_price: number;
  site_url: string | null;
  images: EditorProductImage[];
}

export interface EditorProductImage {
  id: number;
  url: string;
}
