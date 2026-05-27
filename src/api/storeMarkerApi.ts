import {ApiResponse, PaginatedResponse} from '../types/api';
import {StoreMarker, StoreMarkerFilter, StoreMarkerRequest} from '../types/storeMarker';
import {apiDelete, apiGetPaginated, apiPost, apiPut} from './apiHelpers';

const storeMarkerApi = {
  getAllStoreMarkers: async (
    cursor: string | null = null,
    size = 20,
    filter?: StoreMarkerFilter
  ): Promise<ApiResponse<PaginatedResponse<StoreMarker>>> => {
    return apiGetPaginated<StoreMarker>(
      '/v1/store-markers',
      {cursor, size},
      {
        ...(filter?.filterStartDateTime && {filterStartDateTime: filter.filterStartDateTime}),
        ...(filter?.filterEndDateTime && {filterEndDateTime: filter.filterEndDateTime}),
      }
    );
  },

  getStoreMarkers: async (
    storeId: string,
    cursor: string | null = null,
    size = 20,
    filter?: StoreMarkerFilter
  ): Promise<ApiResponse<PaginatedResponse<StoreMarker>>> => {
    return apiGetPaginated<StoreMarker>(
      `/v1/store/${storeId}/markers`,
      {cursor, size},
      {
        ...(filter?.filterStartDateTime && {filterStartDateTime: filter.filterStartDateTime}),
        ...(filter?.filterEndDateTime && {filterEndDateTime: filter.filterEndDateTime}),
      }
    );
  },

  createStoreMarker: async (
    storeId: string,
    data: StoreMarkerRequest
  ): Promise<ApiResponse<StoreMarker>> => {
    return apiPost<StoreMarker>(`/v1/store/${storeId}/marker`, data);
  },

  updateStoreMarker: async (
    storeId: string,
    markerId: string,
    data: StoreMarkerRequest
  ): Promise<ApiResponse<StoreMarker>> => {
    return apiPut<StoreMarker>(`/v1/store/${storeId}/marker/${markerId}`, data);
  },

  deleteStoreMarker: async (
    storeId: string,
    markerId: string
  ): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/v1/store/${storeId}/marker/${markerId}`);
  },
};

export default storeMarkerApi;
