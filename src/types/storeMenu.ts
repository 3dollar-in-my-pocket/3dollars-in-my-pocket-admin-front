export type FoodType = string;

export interface StoreMenuExtractResponse {
  name: string;
  count: number | null;
  price: number | null;
  category: FoodType;
  imageUrl: string | null;
}
