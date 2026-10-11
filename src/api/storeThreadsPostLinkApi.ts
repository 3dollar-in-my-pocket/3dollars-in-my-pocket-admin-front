import {apiDelete, apiGet, apiPost} from './apiHelpers';
import {PaginatedResponse} from '@/types/api';
import {StoreThreadsPostLink, StoreThreadsPostLinkSort} from '@/types/storeThreadsPostLink';
import {buildCursorParams} from '@/utils/apiUtils';

const basePath = (storeId: string) => `/v1/store/${encodeURIComponent(storeId)}/threads-post-links`;

const storeThreadsPostLinkApi = {
  list: (storeId: string, cursor: string | null = null, sortBy: StoreThreadsPostLinkSort = 'LATEST') =>
    apiGet<PaginatedResponse<StoreThreadsPostLink>>(
      basePath(storeId), {...buildCursorParams(cursor, 20), sortBy}, {suppressToast: true}
    ),
  create: (storeId: string, url: string) =>
    apiPost<StoreThreadsPostLink>(basePath(storeId), {url}, {suppressToast: true}),
  delete: (storeId: string, postId: string) =>
    apiDelete(`${basePath(storeId)}/${encodeURIComponent(postId)}`, undefined, {suppressToast: true}),
};

export default storeThreadsPostLinkApi;
