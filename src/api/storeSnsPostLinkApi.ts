import {apiDelete, apiGet, apiPost} from './apiHelpers';
import {PaginatedResponse} from '@/types/api';
import {StorePost} from '@/types/storePost';
import {SnsPlatform, StoreSnsPostLinkSort} from '@/types/storeSnsPostLink';
import {buildCursorParams} from '@/utils/apiUtils';

const storePath = (storeId: string) => `/v1/store/${encodeURIComponent(storeId)}`;

/** 비어 있으면 파라미터를 생략해 전체 플랫폼을 조회한다. */
const platformParams = (platforms: SnsPlatform[]) => platforms.length ? {platforms: platforms.join(',')} : {};

const storeSnsPostLinkApi = {
  list: (
    storeId: string,
    cursor: string | null = null,
    sortBy: StoreSnsPostLinkSort = 'LATEST',
    platforms: SnsPlatform[] = [],
  ) =>
    apiGet<PaginatedResponse<StorePost>>(
      `${storePath(storeId)}/sns-posts`, {...buildCursorParams(cursor, 20), sortBy, ...platformParams(platforms)},
      {suppressToast: true}
    ),
  /** 전체 가게 SNS 포스트 조회 (응답의 store에 가게 정보 포함) */
  listAll: (cursor: string | null = null, sortBy: StoreSnsPostLinkSort = 'LATEST', platforms: SnsPlatform[] = []) =>
    apiGet<PaginatedResponse<StorePost>>(
      '/v1/store-sns-posts', {...buildCursorParams(cursor, 20), sortBy, ...platformParams(platforms)}
    ),
  create: (storeId: string, url: string) =>
    apiPost<StorePost>(`${storePath(storeId)}/sns-post`, {url}, {suppressToast: true}),
  delete: (storeId: string, postId: string) =>
    apiDelete(`${storePath(storeId)}/sns-post/${encodeURIComponent(postId)}`, undefined, {suppressToast: true}),
};

export default storeSnsPostLinkApi;
