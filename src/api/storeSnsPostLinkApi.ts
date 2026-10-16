import {apiDelete, apiGet, apiPost} from './apiHelpers';
import {PaginatedResponse} from '@/types/api';
import {StoreSnsPostLink, StoreSnsPostLinkSort} from '@/types/storeSnsPostLink';
import {buildCursorParams} from '@/utils/apiUtils';

const basePath = (storeId: string) => `/v1/store/${encodeURIComponent(storeId)}/sns-post-links`;

const storeSnsPostLinkApi = {
  list: (storeId: string, cursor: string | null = null, sortBy: StoreSnsPostLinkSort = 'LATEST') =>
    apiGet<PaginatedResponse<StoreSnsPostLink>>(
      basePath(storeId), {...buildCursorParams(cursor, 20), sortBy}, {suppressToast: true}
    ),
  create: (storeId: string, url: string) =>
    apiPost<StoreSnsPostLink>(basePath(storeId), {url}, {suppressToast: true}),
  delete: (storeId: string, postId: string) =>
    apiDelete(`${basePath(storeId)}/${encodeURIComponent(postId)}`, undefined, {suppressToast: true}),
};

export default storeSnsPostLinkApi;
