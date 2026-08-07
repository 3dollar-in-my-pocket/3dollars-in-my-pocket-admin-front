export type FoodType = string;

/** StoreMenuExtractionResponse */
export interface StoreMenuExtractResponse {
  name: string;
  count: number | null;
  price: number | null;
  category: FoodType;
  imageUrl: string | null;
}
