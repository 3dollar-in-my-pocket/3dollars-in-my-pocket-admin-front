import { useEffect, useState } from 'react';
import storeCategoryApi from '../../api/storeCategoryApi';
import {
  StoreCategory,
  getCategoryClassificationBadgeClass,
  getCategoryClassificationIcon
} from '../../types/storeCategory';
import EmptyState from '../../components/common/EmptyState';

const StoreCategoryManagement = () => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await storeCategoryApi.getAllStoreCategories();
      if (!response?.ok) {
        return;
      }

      const { contents = [] } = response.data || { contents: [] };

      // displayOrder 순으로 정렬 (null은 가장 마지막)
      const sortedCategories = contents.sort((a, b) => {
        // classification.priority로 먼저 정렬
        if (a.classification.priority !== b.classification.priority) {
          return a.classification.priority - b.classification.priority;
        }

        // displayOrder로 정렬 (null은 가장 마지막)
        if (a.displayOrder === null && b.displayOrder === null) return 0;
        if (a.displayOrder === null) return 1;
        if (b.displayOrder === null) return -1;
        return a.displayOrder - b.displayOrder;
      });

      setCategories(sortedCategories);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category: StoreCategory) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const getCategoryClassificationBadge = (classification: any) => {
    return (
      <span
        className={`badge ${getCategoryClassificationBadgeClass(classification.type)} text-white rounded-pill px-3 py-1`}
        style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
      >
        <i className={`bi ${getCategoryClassificationIcon(classification.type)} me-1`}></i>
        {classification.description}
      </span>
    );
  };

  // 분류별로 카테고리 그룹화
  const groupedCategories = categories.reduce((acc, category) => {
    const type = category.classification.type;
    if (!acc[type]) {
      acc[type] = {
        classification: category.classification,
        items: []
      };
    }
    acc[type].items.push(category);
    return acc;
  }, {} as Record<string, { classification: any; items: StoreCategory[] }>);

  // priority 순으로 정렬된 분류 타입
  const sortedTypes = Object.keys(groupedCategories).sort((a, b) => {
    return groupedCategories[a].classification.priority - groupedCategories[b].classification.priority;
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-2 py-md-4">
      {/* 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)' }}>
          <i className="bi bi-grid-3x3-gap text-primary me-2"></i>
          <span className="d-none d-sm-inline">가게 카테고리 관리</span>
          <span className="d-inline d-sm-none">카테고리</span>
        </h2>
        <button
          className="btn btn-outline-primary btn-sm rounded-pill px-2 px-md-3"
          onClick={fetchCategories}
          disabled={isLoading}
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <i className="bi bi-arrow-clockwise me-0 me-md-1"></i>
          <span className="d-none d-md-inline">새로고침</span>
        </button>
      </div>

      {/* 정보 카드 */}
      <div className="card border-0 shadow-sm mb-3" style={{
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        borderLeft: '4px solid #667eea'
      }}>
        <div className="card-body p-2 p-md-3">
          <div className="d-flex align-items-start gap-2">
            <i className="bi bi-info-circle text-primary mt-1" style={{ fontSize: '1rem' }}></i>
            <div className="flex-grow-1">
              <small className="text-muted d-block"
                     style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', lineHeight: '1.5' }}>
                <span className="d-none d-md-inline">가게 카테고리 목록입니다.</span>
                <span className="d-inline d-md-none">카테고리 목록</span>
              </small>
              {categories.length > 0 && (
                <div className="mt-2">
                  <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-check-circle me-1"></i>
                    {categories.length}개
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && categories.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">카테고리를 불러오는 중...</p>
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon="bi-grid-3x3-gap"
          title="등록된 카테고리가 없습니다"
          description="필터에 노출되는 카테고리가 없습니다."
        />
      ) : (
        <div className="category-list">
          {sortedTypes.map((type) => {
            const group = groupedCategories[type];
            return (
              <div key={type} className="mb-4">
                {/* 분류 헤더 */}
                <div className="d-flex align-items-center mb-3">
                  {getCategoryClassificationBadge(group.classification)}
                  <span className="ms-2 text-muted small">
                    {group.items.length}개
                  </span>
                </div>

                {/* 카테고리 그리드 */}
                <div className="row g-2 g-md-3">
                  {group.items.map((category) => (
                    <div key={category.categoryId} className="col-6 col-md-4 col-lg-3 col-xl-2">
                      <div
                        className="card shadow-sm h-100"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          background: !category.displayOrder
                            ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                            : 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
                          border: !category.displayOrder
                            ? '2px solid #adb5bd'
                            : '2px solid #2196F3',
                          opacity: !category.displayOrder ? 0.65 : 1,
                        }}
                        onClick={() => handleCategoryClick(category)}
                        onMouseEnter={(e: any) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e: any) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}
                      >
                        <div className="card-body p-3 text-center">
                          {/* 카테고리 이미지 */}
                          <div className="mb-2 position-relative">
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              style={{
                                width: '64px',
                                height: '64px',
                                objectFit: 'contain'
                              }}
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            {category.isNew && (
                              <span
                                className="position-absolute top-0 end-0 badge bg-danger rounded-pill"
                                style={{ fontSize: '0.6rem', padding: '2px 6px' }}
                              >
                                NEW
                              </span>
                            )}
                          </div>

                          {/* 카테고리 이름 */}
                          <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                            {category.name}
                          </h6>

                          {/* displayOrder */}
                          <small className="d-block" style={{ fontSize: '0.7rem' }}>
                            {category.displayOrder === null ? (
                              <span className="badge bg-secondary">필터 미노출</span>
                            ) : (
                              <span className="text-muted">순서: {category.displayOrder}</span>
                            )}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 카테고리 상세 모달 */}
      {showModal && selectedCategory && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered mx-2 mx-md-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
              {/* 헤더 */}
              <div className="modal-header border-bottom" style={{
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                padding: '1rem 1.5rem'
              }}>
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                  <h5 className="modal-title fw-bold mb-0">
                    <i className="bi bi-grid-3x3-gap text-primary me-2"></i>
                    카테고리 상세
                  </h5>
                  {selectedCategory.isNew && (
                    <span className="badge bg-danger rounded-pill px-3 py-1">
                      <i className="bi bi-star-fill me-1"></i>
                      NEW
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* 카테고리 이미지 */}
                <div className="text-center mb-4">
                  <img
                    src={selectedCategory.imageUrl}
                    alt={selectedCategory.name}
                    style={{
                      width: '128px',
                      height: '128px',
                      objectFit: 'contain'
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div className="row g-3">
                  {/* 카테고리 ID */}
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">카테고리 ID</label>
                    <div className="p-2 bg-light rounded">
                      <code className="text-dark">{selectedCategory.categoryId}</code>
                    </div>
                  </div>

                  {/* 카테고리 이름 */}
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">카테고리 이름</label>
                    <div className="fw-bold">{selectedCategory.name}</div>
                  </div>

                  {/* 설명 */}
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">설명</label>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedCategory.description || '설명 없음'}
                    </div>
                  </div>

                  {/* 분류 */}
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">분류</label>
                    <div>
                      {getCategoryClassificationBadge(selectedCategory.classification)}
                    </div>
                  </div>

                  {/* 우선순위 & 표시 순서 */}
                  <div className="col-6">
                    <label className="form-label text-muted small mb-1">우선순위</label>
                    <div className="fw-bold">{selectedCategory.classification.priority}</div>
                  </div>

                  <div className="col-6">
                    <label className="form-label text-muted small mb-1">표시 순서</label>
                    <div className="fw-bold">
                      {selectedCategory.displayOrder === null ? (
                        <span className="badge bg-secondary">필터 미노출</span>
                      ) : (
                        selectedCategory.displayOrder
                      )}
                    </div>
                  </div>

                  {/* 이미지 URL */}
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">이미지 URL</label>
                    <div className="p-2 bg-light rounded" style={{ wordBreak: 'break-all' }}>
                      <small className="text-muted">{selectedCategory.imageUrl}</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setShowModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreCategoryManagement;
