import {DragEvent, MouseEvent as ReactMouseEvent, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeCategoryApi from '@/api/storeCategoryApi';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import DetailField from '@/components/common/DetailField';
import {
  STORE_CATEGORY_ICON_FIELDS,
  STORE_CATEGORY_MARKER_GROUPS,
  StoreCategory,
  StoreCategoryMetaType
} from '@/types/storeCategory';
import {getCategoryClassificationBadgeClass, getCategoryClassificationIcon} from '@/utils/display/storeCategoryDisplay';
import StoreCategoryFormModal from './StoreCategoryFormModal';
import {usePermission} from '@/hooks/usePermission';
import {AdminRole} from '@/types/admin';

/** 분류 배지 */
const ClassificationBadge = ({classification}: { classification: any }) => (
  <span className={`badge ${getCategoryClassificationBadgeClass(classification.type)} text-white rounded-pill`}>
    <i className={`bi ${getCategoryClassificationIcon(classification.type)} me-1`}/>
    {classification.description}
  </span>
);

const StoreCategoryManagement = () => {
  const {hasAccess} = usePermission();
  const canManage = hasAccess([AdminRole.OPERATOR]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<StoreCategory | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    categoryId: string;
    position: 'before' | 'after';
  } | null>(null);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    category: StoreCategory;
    x: number;
    y: number;
  } | null>(null);
  const [pendingVisibleMove, setPendingVisibleMove] = useState<{
    category: StoreCategory;
    targetClassificationType: StoreCategory['classification']['type'];
    targetIndex: number;
  } | null>(null);

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

      // classification.priority > displayOrder 순으로 정렬 (displayOrder가 없으면 가장 마지막)
      const sortedCategories = contents.sort((a, b) => {
        if (a.classification.priority !== b.classification.priority) {
          return a.classification.priority - b.classification.priority;
        }

        if (a.displayOrder == null && b.displayOrder == null) return 0;
        if (a.displayOrder == null) return 1;
        if (b.displayOrder == null) return -1;
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

  const updateOrder = async (
    category: StoreCategory,
    targetClassificationType: StoreCategory['classification']['type'],
    targetIndex: number
  ) => {
    if (updatingCategoryId) return;
    const groupItems = groupedCategories[targetClassificationType]?.items || [];
    const ordered = groupItems.filter((item) => item.categoryId !== category.categoryId && item.displayOrder != null);
    const boundedIndex = Math.max(0, Math.min(targetIndex, ordered.length));
    const previous = ordered[boundedIndex - 1]?.displayOrder ?? null;
    const next = ordered[boundedIndex]?.displayOrder ?? null;
    const occupied = new Set(categories.filter((item) => item.categoryId !== category.categoryId)
      .map((item) => item.displayOrder).filter((value): value is number => value != null));
    const displayOrder = findAvailableOrder(previous, next, occupied);

    setUpdatingCategoryId(category.categoryId);
    try {
      const response = await storeCategoryApi.updateStoreCategory(category.categoryId, {
        classificationType: targetClassificationType,
        displayOrder
      });
      if (!response.ok) return;
      toast.success('카테고리 순서가 변경되었습니다.');
      await fetchCategories();
    } finally {
      setUpdatingCategoryId(null);
      setDraggedCategory(null);
    }
  };

  const handleDrop = (event: DragEvent, target: StoreCategory, targetIndex: number) => {
    event.preventDefault();
    if (!draggedCategory) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const insertAfter = event.clientY > rect.top + rect.height / 2;
    const isSameSection = draggedCategory.classification.type === target.classification.type;
    const currentIndex = isSameSection
      ? groupedCategories[target.classification.type].items
        .filter((item) => item.displayOrder != null)
        .findIndex((item) => item.categoryId === draggedCategory.categoryId)
      : -1;
    let nextIndex = targetIndex + (insertAfter ? 1 : 0);
    if (currentIndex >= 0 && currentIndex < nextIndex) nextIndex -= 1;
    setDropIndicator(null);
    if (draggedCategory.displayOrder == null) {
      setPendingVisibleMove({
        category: draggedCategory,
        targetClassificationType: target.classification.type,
        targetIndex: nextIndex
      });
      return;
    }
    void updateOrder(draggedCategory, target.classification.type, nextIndex);
  };

  const handleContextMenu = (event: ReactMouseEvent, category: StoreCategory) => {
    if (!canManage) return;
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      category,
      x: Math.max(0, Math.min(event.clientX, window.innerWidth - 190)),
      y: Math.max(0, Math.min(event.clientY, window.innerHeight - 230))
    });
  };

  const updateMetaType = async (category: StoreCategory, metaType: StoreCategoryMetaType) => {
    setContextMenu(null);
    if (updatingCategoryId || category.metaType === metaType) return;
    setUpdatingCategoryId(category.categoryId);
    try {
      const response = await storeCategoryApi.updateStoreCategory(category.categoryId, {metaType});
      if (!response.ok) return;
      toast.success(metaType === 'NEW' ? 'NEW 뱃지가 설정되었습니다.' : 'NEW 뱃지가 해제되었습니다.');
      await fetchCategories();
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const hideCategory = async (category: StoreCategory) => {
    setContextMenu(null);
    if (updatingCategoryId || category.displayOrder == null) return;
    setUpdatingCategoryId(category.categoryId);
    try {
      const response = await storeCategoryApi.updateStoreCategory(category.categoryId, {displayOrder: null});
      if (!response.ok) return;
      toast.success('카테고리가 미노출 처리되었습니다.');
      await fetchCategories();
    } finally {
      setUpdatingCategoryId(null);
    }
  };

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
            {group.items.map((category, index) => {
              const isHidden = category.displayOrder == null;

              return (
                <div key={category.categoryId} className="col-6 col-md-4 col-lg-3 col-xl-2">
                  <div
                    className={[
                      'item-card', 'item-card--clickable', 'category-card',
                      isHidden ? 'item-card--muted' : '',
                      canManage && !updatingCategoryId ? 'category-card--draggable' : '',
                      draggedCategory?.categoryId === category.categoryId ? 'category-card--dragging' : '',
                      dropIndicator?.categoryId === category.categoryId
                        ? `category-card--drop-${dropIndicator.position}` : '',
                      updatingCategoryId === category.categoryId ? 'category-card--busy' : ''
                    ].filter(Boolean).join(' ')}
                    role="button"
                    tabIndex={0}
                    aria-label={`${category.name} 카테고리 상세 보기`}
                    draggable={canManage && !updatingCategoryId}
                    onDragStart={() => setDraggedCategory(category)}
                    onDragEnd={() => {
                      setDraggedCategory(null);
                      setDropIndicator(null);
                    }}
                    onDragOver={(event) => {
                      if (!draggedCategory) return;
                      event.preventDefault();
                      const rect = event.currentTarget.getBoundingClientRect();
                      setDropIndicator({
                        categoryId: category.categoryId,
                        position: event.clientY > rect.top + rect.height / 2 ? 'after' : 'before'
                      });
                    }}
                    onDragLeave={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropIndicator(null);
                    }}
                    onDrop={(event) => handleDrop(event, category, index)}
                    onContextMenu={(event) => handleContextMenu(event, category)}
                    onClick={() => setSelectedCategory(category)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedCategory(category);
                      }
                    }}
                  >
                    <div className="item-card__body text-center">
                      {canManage && (
                        <i className="bi bi-grip-vertical category-card__grip" aria-hidden="true"/>
                      )}
                      {updatingCategoryId === category.categoryId && (
                        <span className="spinner-border spinner-border-sm category-card__spinner" role="status">
                          <span className="visually-hidden">변경 중</span>
                        </span>
                      )}

                      <div className="position-relative mb-2">
                        <img
                          className="category-card__icon"
                          src={category.imageUrl}
                          alt=""
                          width={56}
                          height={56}
                          onError={(e: any) => {
                            e.target.style.visibility = 'hidden';
                          }}
                        />
                        {category.isNew && (
                          <span /* deslop-ignore 23 isNew는 서버가 내려주는 실제 상태 */ className="position-absolute top-0 end-0 badge text-bg-danger rounded-pill">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="item-card__name text-truncate" title={category.name}>{category.name}</p>

                      <div className="mt-1">
                        {isHidden ? (
                          <span className="badge text-bg-secondary">
                            <i className="bi bi-eye-slash me-1"/>미노출
                          </span>
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
          <div className="d-flex gap-2">
          {canManage && <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setShowForm(true); }}>
            <i className="bi bi-plus-lg me-1"/>카테고리 등록
          </button>}
          <button className="btn btn-outline-secondary" onClick={fetchCategories} disabled={isLoading}>
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
            ) : (
              <i className="bi bi-arrow-clockwise me-1"/>
            )}
            새로고침
          </button>
          </div>
        }
      />

      <SectionCard
        title="카테고리 목록"
        icon="bi-grid-3x3-gap"
        aside={!isLoading && categories.length > 0 && (
          <span className="page-count">
            노출 {categories.filter((category) => category.displayOrder != null).length}개 ·{' '}
            <span className="text-danger">
              미노출 {categories.filter((category) => category.displayOrder == null).length}개
            </span>{' '}
            · 총 {categories.length}개
          </span>
        )}
      >
        {renderBody()}
      </SectionCard>

      {/* 카테고리 상세 모달 */}
      <Modal show={!!selectedCategory} onHide={() => setSelectedCategory(null)} size="lg" centered scrollable
             className="app-modal">
        <Modal.Header closeButton>
          <div className="min-w-0">
            <Modal.Title>
              <i className="bi bi-grid-3x3-gap"/>
              {selectedCategory?.name ?? '카테고리 상세'}
            </Modal.Title>
            <p className="app-modal__subtitle font-monospace">{selectedCategory?.categoryId}</p>
          </div>
        </Modal.Header>

        {selectedCategory && (
          <Modal.Body>
            <div className="modal-section">
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  className="asset-preview__thumb flex-shrink-0"
                  src={selectedCategory.imageUrl}
                  alt=""
                  width={64}
                  height={64}
                  onError={(e: any) => {
                    e.target.style.visibility = 'hidden';
                  }}
                />
                <div className="min-w-0">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <ClassificationBadge classification={selectedCategory.classification}/>
                    {selectedCategory.isNew && (
                      <span /* deslop-ignore 23 isNew는 서버가 내려주는 실제 상태 */ className="badge text-bg-danger rounded-pill">NEW</span>
                    )}
                    {selectedCategory.displayOrder == null ? (
                      <span className="badge text-bg-secondary">
                        <i className="bi bi-eye-slash me-1"/>미노출
                      </span>
                    ) : (
                      <span className="badge text-bg-light">순서 {selectedCategory.displayOrder}</span>
                    )}
                  </div>
                  <p className="item-card__desc mt-1 mb-0">
                    {selectedCategory.description || '노출 문구 없음'}
                  </p>
                </div>
              </div>

              <div className="row g-3">
                <DetailField label="분류 우선순위" className="col-6 col-md-4">
                  {selectedCategory.classification.priority}
                </DetailField>
                <DetailField label="표시 순서" className="col-6 col-md-4" placeholder="미노출">
                  {selectedCategory.displayOrder ?? null}
                </DetailField>
                <DetailField label="뱃지 설정" className="col-6 col-md-4">
                  {selectedCategory.metaType === 'NEW' ? 'NEW' : '없음'}
                </DetailField>
              </div>
            </div>

            <div className="modal-section">
              <h3 className="modal-section__title">
                <i className="bi bi-image"/>
                카테고리 아이콘
              </h3>
              <div className="row g-3">
                {STORE_CATEGORY_ICON_FIELDS.map(([key, label]) => (
                  <AssetItem key={key} label={label} url={selectedCategory[key]}/>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h3 className="modal-section__title">
                <i className="bi bi-geo-alt"/>
                상태별 마커 이미지
              </h3>
              {STORE_CATEGORY_MARKER_GROUPS.map((group) => (
                <div key={group.title} className="marker-group">
                  <div className="marker-group__head">
                    <span className="marker-group__title">
                      <i className={`bi ${group.icon}`}/>
                      {group.title}
                    </span>
                    <span className="marker-group__desc">{group.description}</span>
                  </div>
                  <div className="row g-3">
                    <AssetItem label="선택" url={selectedCategory[group.focused]}/>
                    <AssetItem label="미선택" url={selectedCategory[group.unfocused]}/>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>
        )}

        <Modal.Footer>
          {canManage && <button className="btn btn-primary" onClick={() => {
            setEditingCategory(selectedCategory);
            setSelectedCategory(null);
            setShowForm(true);
          }}>
            수정
          </button>}
          <button className="btn btn-secondary" onClick={() => setSelectedCategory(null)}>
            닫기
          </button>
        </Modal.Footer>
      </Modal>

      <StoreCategoryFormModal
        show={showForm}
        category={editingCategory}
        onHide={() => setShowForm(false)}
        onSuccess={fetchCategories}
      />

      <Modal
        show={!!pendingVisibleMove}
        onHide={() => !updatingCategoryId && setPendingVisibleMove(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            <i className="bi bi-eye me-2"/>카테고리 노출 확인
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            <strong>{pendingVisibleMove?.category.name}</strong> 카테고리를 이 위치로 이동하면 사용자에게 노출됩니다.
          </p>
          <p className="text-body-secondary small mb-0">카테고리를 노출하고 순서를 변경하시겠습니까?</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!!updatingCategoryId}
            onClick={() => setPendingVisibleMove(null)}
          >
            취소
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!!updatingCategoryId}
            onClick={() => {
              if (!pendingVisibleMove) return;
              const move = pendingVisibleMove;
              setPendingVisibleMove(null);
              void updateOrder(move.category, move.targetClassificationType, move.targetIndex);
            }}
          >
            노출하고 이동
          </button>
        </Modal.Footer>
      </Modal>

      {contextMenu && (
        <CategoryContextMenu
          category={contextMenu.category}
          x={contextMenu.x}
          y={contextMenu.y}
          disabled={!!updatingCategoryId}
          onView={() => {
            setSelectedCategory(contextMenu.category);
            setContextMenu(null);
          }}
          onSelect={(metaType) => void updateMetaType(contextMenu.category, metaType)}
          onHideCategory={() => void hideCategory(contextMenu.category)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default StoreCategoryManagement;

/** 카테고리 상세의 에셋(아이콘/마커) 한 건. 미리보기와 URL을 함께 보여준다. */
const AssetItem = ({label, url}: { label: string; url?: string | null }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => setHasError(false), [url]);

  return (
    <div className="col-12 col-md-6">
      <span className="detail-field__label">{label}</span>
      {!url ? (
        <div className="text-body-tertiary small">미등록</div>
      ) : (
        <div className="asset-preview">
          {hasError ? (
            <div className="text-body-secondary small">
              <i className="bi bi-image me-1"/>불러올 수 없음
            </div>
          ) : (
            <img
              className="asset-preview__thumb flex-shrink-0"
              src={url}
              alt={`${label} 미리보기`}
              width={48}
              height={48}
              onError={() => setHasError(true)}
            />
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="small text-break align-self-center"
            style={{minWidth: 0}}
          >
            {url.split('/').pop()}
            <i className="bi bi-box-arrow-up-right ms-1"/>
          </a>
        </div>
      )}
    </div>
  );
};

const findAvailableOrder = (previous: number | null, next: number | null, occupied: Set<number>): number => {
  if (previous === null && next === null) return occupied.has(1) ? findEdgeOrder(0, -1, occupied) : 1;
  if (previous === null) return findEdgeOrder(next as number, -1, occupied);
  if (next === null) return findEdgeOrder(previous, 1, occupied);

  for (let divisor = 2; divisor <= 20; divisor += 1) {
    const candidate = previous + (next - previous) / divisor;
    if (!occupied.has(candidate)) return candidate;
  }
  return previous + (next - previous) / 2;
};

const findEdgeOrder = (base: number, direction: -1 | 1, occupied: Set<number>): number => {
  let distance = 1;
  while (occupied.has(base + distance * direction)) distance += 1;
  return base + distance * direction;
};

const CategoryContextMenu = ({category, x, y, disabled, onView, onSelect, onHideCategory, onClose}: {
  category: StoreCategory;
  x: number;
  y: number;
  disabled: boolean;
  onView: () => void;
  onSelect: (metaType: StoreCategoryMetaType) => void;
  onHideCategory: () => void;
  onClose: () => void;
}) => {
  useEffect(() => {
    const close = () => onClose();
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="dropdown-menu show shadow"
      style={{position: 'fixed', left: x, top: y, zIndex: 1080, minWidth: '180px'}}
      onClick={(event) => event.stopPropagation()}
      role="menu"
      aria-label={`${category.name} 뱃지 설정 변경`}
    >
      <button type="button" className="dropdown-item" onClick={onView} role="menuitem">
        <i className="bi bi-pencil-square me-2"/>
        상세 보기 (수정)
      </button>
      <div className="dropdown-divider"/>
      <h6 className="dropdown-header">뱃지 설정</h6>
      {([['DEFAULT', '없음'], ['NEW', 'NEW']] as const).map(([value, label]) => (
        <button
          key={value}
          type="button"
          className="dropdown-item d-flex align-items-center justify-content-between"
          disabled={disabled || category.metaType === value}
          onClick={() => onSelect(value)}
          role="menuitem"
        >
          {label}
          {category.metaType === value && <i className="bi bi-check-lg text-primary"/>}
        </button>
      ))}
      <div className="dropdown-divider"/>
      <button
        type="button"
        className="dropdown-item d-flex align-items-center justify-content-between text-danger"
        disabled={disabled || category.displayOrder == null}
        onClick={onHideCategory}
        role="menuitem"
      >
        <span><i className="bi bi-eye-slash me-2"/>카테고리 미노출</span>
        {category.displayOrder == null && <span className="badge text-bg-secondary">현재 미노출</span>}
      </button>
    </div>
  );
};
