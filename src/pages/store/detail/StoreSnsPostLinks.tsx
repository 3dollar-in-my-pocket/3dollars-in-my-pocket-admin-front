import {FormEvent, useEffect, useRef, useState} from 'react';
import {Alert, Badge, Button, Form} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeSnsPostLinkApi from '@/api/storeSnsPostLinkApi';
import {SNS_PLATFORM_LABELS} from '@/constants/snsPost';
import HistoryPanel from '@/components/common/HistoryPanel';
import SnsPostEmbed from '@/components/SnsPostEmbed';
import useConfirm from '@/hooks/useConfirm';
import {usePermission} from '@/hooks/usePermission';
import useStoreSnsPostLinks, {SNS_URL_ERROR_CODES, snsErrorMessage} from '@/hooks/useStoreSnsPostLinks';
import {StoreSnsPostLinkSort} from '@/types/storeSnsPostLink';
import {getSnsPlatformByHost, getSnsPostPlatform} from '@/utils/validation/snsPostLinkValidation';
import './StoreSnsPostLinks.css';

interface Props {
  storeId: string;
}

/** 서버 오류 코드(BR111/BR115/BR116)와 같은 기준으로 입력값 오류 메시지를 만든다. */
const getUrlInputError = (value: string): string | null => {
  if (!value) return 'SNS 포스트 링크를 입력해주세요.';
  if (getSnsPostPlatform(value)) return null;
  const platform = getSnsPlatformByHost(value);
  return platform
    ? `올바른 ${SNS_PLATFORM_LABELS[platform]} 포스트 URL을 입력해주세요.`
    : 'Threads 또는 Instagram 포스트 URL만 등록할 수 있습니다.';
};

const StoreSnsPostLinks = ({storeId}: Props) => {
  const [sortBy, setSortBy] = useState<StoreSnsPostLinkSort>('LATEST');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const actionRef = useRef(false);
  const mountedRef = useRef(false);
  const confirm = useConfirm();
  const {isOwner, isOperator} = usePermission();
  const canWrite = (isOwner() || isOperator()) && !accessDenied;
  const {items, isLoading, isLoadingMore, hasMore, error, refresh, loadMore} =
    useStoreSnsPostLinks(storeId, sortBy);
  const busy = isLoading || isSubmitting || deletingId !== null;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refreshList = async () => {
    if (await refresh() && mountedRef.current) setNeedsReview(false);
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!canWrite || busy || actionRef.current || needsReview) return;
    const value = url.trim();
    const inputError = getUrlInputError(value);
    if (inputError) {
      setUrlError(inputError);
      return;
    }
    actionRef.current = true;
    setIsSubmitting(true);
    setUrlError(null);
    setActionError(null);
    try {
      const response = await storeSnsPostLinkApi.create(storeId, value);
      if (!mountedRef.current) return;
      if (response.ok) {
        setUrl('');
        toast.success('SNS 링크가 등록되었습니다.');
        await refreshList();
      } else {
        if (response.error === 'forbidden_access_denied') setAccessDenied(true);
        const fieldError = response.errorDetails?.find(detail => detail.field === 'url');
        if (fieldError || SNS_URL_ERROR_CODES.includes(response.error)) {
          setUrlError(fieldError?.reason || snsErrorMessage(response, '입력한 URL을 확인해주세요.'));
        } else {
          setActionError(snsErrorMessage(response, '등록 결과를 확인할 수 없습니다.'));
        }
        // 응답 유실 시 등록이 완료됐을 수 있으므로 목록 확인 전 재전송을 차단한다.
        if (!response.error) setNeedsReview(true);
      }
    } finally {
      actionRef.current = false;
      if (mountedRef.current) setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!canWrite || busy || actionRef.current) return;
    actionRef.current = true;
    setDeletingId(postId);
    setActionError(null);
    try {
      const confirmed = await confirm({
        title: 'SNS 링크 삭제', message: '이 가게에서 SNS 포스트 링크를 삭제하시겠습니까?',
        confirmLabel: '삭제', variant: 'danger',
      });
      if (!confirmed || !mountedRef.current) return;
      const response = await storeSnsPostLinkApi.delete(storeId, postId);
      if (!mountedRef.current) return;
      if (response.ok) {
        toast.success('SNS 링크가 삭제되었습니다.');
        await refreshList();
      } else {
        if (response.error === 'forbidden_access_denied') setAccessDenied(true);
        setActionError(snsErrorMessage(response, 'SNS 링크 삭제에 실패했습니다.'));
        if (response.error === 'not_exists_post') await refreshList();
      }
    } finally {
      actionRef.current = false;
      if (mountedRef.current) setDeletingId(null);
    }
  };

  return (
    <div className="store-sns">
      <Form onSubmit={handleCreate} className="store-sns__form">
        <Form.Group controlId="store-sns-url">
          <Form.Label>SNS 포스트 링크</Form.Label>
          <div className="store-sns__input-row">
            <div className="min-w-0">
              <Form.Control
                type="text" inputMode="url" placeholder="https://www.instagram.com/p/포스트코드"
                value={url} disabled={!canWrite || isSubmitting} isInvalid={Boolean(urlError)}
                aria-describedby={urlError ? 'store-sns-url-error' : 'store-sns-url-help'}
                onChange={event => { setUrl(event.target.value); setUrlError(null); }}
              />
              <Form.Control.Feedback type="invalid" id="store-sns-url-error">{urlError}</Form.Control.Feedback>
            </div>
            <Button type="submit" disabled={!canWrite || busy || needsReview || !url.trim()}>
              {isSubmitting ? '등록 중...' : '링크 등록'}
            </Button>
          </div>
          <Form.Text id="store-sns-url-help">
            Threads(threads.com·threads.net) 또는 Instagram(instagram.com)의 포스트 링크를 입력해주세요.
          </Form.Text>
        </Form.Group>
      </Form>
      {!canWrite && <Alert variant="secondary">SNS 링크 등록·삭제는 운영자 이상 권한이 필요합니다.</Alert>}
      {actionError && <Alert variant="danger">{actionError}</Alert>}
      {needsReview && (
        <Alert variant="warning">중복 등록을 피하려면 새로고침으로 목록을 확인한 후 다시 등록해주세요.</Alert>
      )}
      <HistoryPanel
        title="SNS 포스트" icon="bi-link-45deg" count={items.length}
        hasMore={hasMore} isLoading={busy} isLoadingMore={isLoadingMore}
        error={error} onRefresh={() => { if (!busy) void refreshList(); }}
        onLoadMore={() => { if (!busy) void loadMore(); }}
        emptyTitle="등록된 SNS 링크가 없습니다" emptyDescription="가게와 관련된 Threads·Instagram 포스트를 연결해보세요."
        aside={(
          <Form.Select size="sm" aria-label="SNS 포스트 정렬" value={sortBy} disabled={busy}
            onChange={event => setSortBy(event.target.value as StoreSnsPostLinkSort)}>
            <option value="LATEST">최신순</option>
            <option value="OLDEST">오래된순</option>
          </Form.Select>
        )}
      >
        <ul className="list-group list-group-flush">
          {items.map(post => {
            const postUrl = post.url && getSnsPostPlatform(post.url) ? post.url : null;
            const label = SNS_PLATFORM_LABELS[post.platform] ?? 'SNS';
            return (
              <li key={post.postId} className="list-group-item px-0 store-sns__post">
                <div className="store-sns__post-heading">
                  <div className="flex-grow-1 min-w-0">
                    <Badge bg="light" text="dark" className="border mb-1 me-1">{label}</Badge>
                    {postUrl ? (
                      <a href={postUrl} target="_blank" rel="noopener noreferrer" className="d-block text-break">
                        {postUrl}<i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true"/>
                      </a>
                    ) : <span className="text-muted">링크 정보 없음</span>}
                    <div className="small text-muted mt-1">
                      등록 시각: <time dateTime={post.createdAt}>{post.createdAt.replace('T', ' ')}</time>
                    </div>
                  </div>
                  <div className="store-sns__post-actions">
                    <Button variant="outline-danger" size="sm"
                      disabled={!canWrite || busy} aria-label={`${label} 포스트 ${post.postId} 삭제`}
                      onClick={() => handleDelete(post.postId)}>
                      {deletingId === post.postId ? '삭제 중...' : '삭제'}
                    </Button>
                  </div>
                </div>
                {postUrl && <SnsPostEmbed url={postUrl}/>}
              </li>
            );
          })}
        </ul>
      </HistoryPanel>
    </div>
  );
};

export default StoreSnsPostLinks;
