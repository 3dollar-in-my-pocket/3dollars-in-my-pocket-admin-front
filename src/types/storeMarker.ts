export interface StoreMarkerImage {
  url?: string;
  imageUrl?: string;
  width: number;
  height: number;
}

export interface StoreMarker {
  markerId: string | number;
  groupId: string;
  storeId?: string | number;
  selectedMarkerImage: StoreMarkerImage;
  unselectedMarkerImage: StoreMarkerImage;
  period?: {
    startDateTime: string;
    endDateTime: string;
  };
  startDateTime: string;
  endDateTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreMarkerRequest {
  groupId: string;
  selectedMarkerImage: StoreMarkerImage;
  unselectedMarkerImage: StoreMarkerImage;
  startDateTime: string;
  endDateTime: string;
}

export interface StoreMarkerFilter {
  filterStartDateTime?: string;
  filterEndDateTime?: string;
}
