import {useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import storeCategoryApi from '@/api/storeCategoryApi';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import {StoreCategory} from '@/types/storeCategory';
import {getCategoryClassificationBadgeClass, getCategoryClassificationIcon} from '@/utils/display/storeCategoryDisplay';

/** 분류 배지 */
const ClassificationBadge = ({classification}: { classification: any }) => (
  <span className={`badge ${getCategoryClassificationBadgeClass(classification.type)} text-white rounded-pill`}>
    <i className={`bi ${getCategoryClassificationIcon(classification.type)} me-1`}/>
    {classification.description}
  </span>
);

const StoreCategoryManagement = () => {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | null>(null);

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

      const {contents = []} = response.data || {contents: []};

      // classification.priority > displayOrder 순으로 정렬 (displayOrder가 null이면 가장 마지막)
      const sortedCategories = contents.sort((a, b) => {
        if (a.classification.priority !== b.classification.priority) {
          return a.classification.priority - b.classification.priority;
        }

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

  const renderBody = () => {
    if (isLoading && categories.length === 0) {
      return (
        <div className="py-5">
          <Loading/>
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <EmptyState
          icon="bi-grid-3x3-gap"
          title="등록된 카테고리가 없습니다"
          description="필터에 노출되는 카테고리가 없습니다."
        />
      );
    }

    return sortedTypes.map((type) => {
      const group = groupedCategories[type];

      return (
        <div key={type} className="mb-4">
          <div className="group-heading">
            <ClassificationBadge classification={group.classification}/>
            <span className="group-heading__label">{group.items.length}개</span>
          </div>

          <div className="row g-2 g-md-3">
            {group.items.map((category) => {
              const isHidden = category.displayOrder === null;

              return (
                <div key={category.categoryId} className="col-6 col-md-4 col-lg-3 col-xl-2">
                  <div
                    className={`item-card item-card--clickable ${isHidden ? 'item-card--muted' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedCategory(category)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedCategory(category);
                      }
                    }}
                  >
                    <div className="item-card__body text-center">
                      <div className="position-relative mb-2">
                        <img
                          src={category.imageUrl}
                          alt=""
                          style={{width: '56px', height: '56px', objectFit: 'contain'}}
                          onError={(e: any) => {
                            e.target.style.visibility = 'hidden';
                          }}
                        />
                        {category.isNew && (
                          <span className="position-absolute top-0 end-0 badge text-bg-danger rounded-pill">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="item-card__name">{category.name}</p>

                      <div className="mt-1">
                        {isHidden ? (
                          <span className="badge text-bg-secondary">비활성화</span>
                        ) : (
                          <span className="item-card__desc">순서 {category.displayOrder}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <PageHeader
        description="앱 필터에 노출되는 가게 카테고리를 분류별로 확인합니다. 표시 순서가 없는 카테고리는 필터에 노출되지 않습니다."
        actions={
          <button className="btn btn-outline-secondary" onClick={fetchCategories} disabled={isLoading}>
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
            ) : (
              <i className="bi bi-arrow-clockwise me-1"/>
            )}
            새로고침
          </button>
        }
      />

      <SectionCard
        title="카테고리 목록"
        icon="bi-grid-3x3-gap"
        aside={!isLoading && categories.length > 0 && (
          <span className="page-count">총 {categories.length}개</span>
        )}
      >
        {renderBody()}
      </SectionCard>

      {/* 카테고리 상세 모달 */}
      <Modal show={!!selectedCategory} onHide={() => setSelectedCategory(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            <i className="bi bi-grid-3x3-gap me-2"/>
            카테고리 상세
          </Modal.Title>
        </Modal.Header>

        {selectedCategory && (
          <Modal.Body>
            <div className="text-center mb-4">
              <img
                src={selectedCategory.imageUrl}
                alt=""
                style={{width: '96px', height: '96px', objectFit: 'contain'}}
                onError={(e: any) => {
                  e.target.style.visibility = 'hidden';
                }}
              />
            </div>

            <div className="row g-3">
              <div className="col-12">
                <span className="item-card__label">카테고리 ID</span>
                <div className="font-monospace small">{selectedCategory.categoryId}</div>
              </div>

              <div className="col-12">
                <span className="item-card__label">카테고리 이름</span>
                <div className="fw-semibold">
                  {selectedCategory.name}
                  {selectedCategory.isNew && (
                    <span className="badge text-bg-danger rounded-pill ms-2">NEW</span>
                  )}
                </div>
              </div>

              <div className="col-12">
                <span className="item-card__label">설명</span>
                <div className="item-card__value" style={{whiteSpace: 'pre-wrap'}}>
                  {selectedCategory.description || '설명 없음'}
                </div>
              </div>

              <div className="col-12">
                <span className="item-card__label">분류</span>
                <div>
                  <ClassificationBadge classification={selectedCategory.classification}/>
                </div>
              </div>

              <div className="col-6">
                <span className="item-card__label">우선순위</span>
                <div className="fw-semibold">{selectedCategory.classification.priority}</div>
              </div>

              <div className="col-6">
                <span className="item-card__label">표시 순서</span>
                <div className="fw-semibold">
                  {selectedCategory.displayOrder === null ? (
                    <span className="badge text-bg-secondary">비활성화 (필터 미노출)</span>
                  ) : (
                    selectedCategory.displayOrder
                  )}
                </div>
              </div>

              <div className="col-12">
                <span className="item-card__label">이미지 URL</span>
                <div className="small text-body-secondary" style={{wordBreak: 'break-all'}}>
                  {selectedCategory.imageUrl}
                </div>
              </div>
            </div>
          </Modal.Body>
        )}

        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setSelectedCategory(null)}>
            닫기
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StoreCategoryManagement;
