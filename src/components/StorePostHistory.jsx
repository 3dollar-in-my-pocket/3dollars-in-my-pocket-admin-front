import React, { useState, useEffect } from 'react';
import storeApi from '../api/storeApi';
import StorePostItem from './StorePostItem';

const StorePostHistory = ({ storeId }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storeId) {
      fetchPosts(true);
    }
  }, [storeId]);

  const fetchPosts = async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
      setPosts([]);
      setNextCursor(null);
      setHasMore(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await storeApi.getStorePosts(storeId, isInitial ? null : nextCursor, 20);

      if (!response.ok) {
        throw new Error('소식을 불러오는데 실패했습니다.');
      }

      const { contents, cursor } = response.data;

      if (isInitial) {
        setPosts(contents || []);
      } else {
        setPosts(prev => [...prev, ...(contents || [])]);
      }

      setHasMore(cursor?.hasMore || false);
      setNextCursor(cursor?.nextCursor || null);
    } catch (error) {
      console.error('가게 소식 조회 실패:', error);
      const errorMessage = error.response?.status
        ? `서버 오류가 발생했습니다. (${error.response.status})`
        : '소식을 불러오는데 실패했습니다. 인터넷 연결을 확인해주세요.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && nextCursor) {
      fetchPosts(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <h5 className="text-dark mb-1">소식을 불러오는 중...</h5>
        <p className="text-muted">잠시만 기다려주세요.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        <div className="mb-4">
          <div className="bg-danger bg-opacity-10 rounded-circle mx-auto" style={{
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
          </div>
        </div>
        <h5 className="text-dark mb-2">오류가 발생했습니다</h5>
        <p className="text-muted mb-3">{error}</p>
        <button
          className="btn btn-outline-primary rounded-pill px-4"
          onClick={() => fetchPosts(true)}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="bg-light rounded-circle mx-auto mb-3"
             style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-newspaper fs-1 text-secondary"></i>
        </div>
        <h5 className="text-dark mb-2">등록된 소식이 없습니다</h5>
        <p className="text-muted">아직 가게에서 올린 소식이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-info bg-opacity-10 rounded-circle p-2">
            <i className="bi bi-newspaper text-info"></i>
          </div>
          <h5 className="mb-0 fw-bold text-dark">가게 소식</h5>
          <span className="badge bg-info ms-2 px-3 py-2 rounded-pill">
            {posts.length}{hasMore ? '+' : ''}개
          </span>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm rounded-pill"
          onClick={() => fetchPosts(true)}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          새로고침
        </button>
      </div>

      <div className="posts-container">
        {posts.map((post, index) => (
          <StorePostItem key={post.postId || index} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <button
            className="btn btn-outline-primary rounded-pill px-4 py-2"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            style={{
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
          >
            {isLoadingMore ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                더 불러오는 중...
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2"></i>
                더보기
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center mt-4 py-3">
          <div className="bg-light rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2">
            <i className="bi bi-check-circle text-success"></i>
            <span className="text-muted">모든 소식을 불러왔습니다</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePostHistory;