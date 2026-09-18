import {DragEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {toast} from 'react-toastify';
import screenSectionLayoutApi from '@/api/screenSectionLayoutApi';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import {useConfirm} from '@/hooks/useConfirm';
import useMediaQuery, {MOBILE_QUERY} from '@/hooks/useMediaQuery';
import {usePermission} from '@/hooks/usePermission';
import {AdminRole} from '@/types/admin';
import {ScreenType, SectionType} from '@/types/screenSectionLayout';
import {
  DEFAULT_SCREEN_TYPE,
  findScreenTypeMeta,
  findSectionTypeMeta,
  getConfigurableSectionTypes,
  SCREEN_TYPES
} from '@/constants/screenSectionLayout';
import {validateSectionLayouts} from '@/utils/validation/screenSectionLayoutValidation';
import useSectionLayoutDraft from './useSectionLayoutDraft';
import SectionLayoutRow, {sectionRowId} from './SectionLayoutRow';
import SectionLayoutCompare from './SectionLayoutCompare';
import SectionPreview from './SectionPreview';
import SectionAddPanel from './SectionAddPanel';
import {diffSectionLayouts} from './sectionLayoutDiff';

const ScreenSectionLayoutManagement = () => {
  const confirm = useConfirm();
  const {hasAccess} = usePermission();
  const canManage = hasAccess([AdminRole.OPERATOR]);

  const [screenType, setScreenType] = useState<ScreenType>(DEFAULT_SCREEN_TYPE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ index: number; position: 'before' | 'after' } | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  // 미리보기 블록과 편집 행을 서로 연결해 강조하기 위한 선택 상태
  const [activeKey, setActiveKey] = useState<string | null>(null);

  /*
   * 좁은 화면에서는 미리보기가 편집 목록 위로 쌓여 화면을 다 차지하므로 기본으로 접어둡니다.
   * 2단으로 나뉘는 넓은 화면에서는 항상 펼쳐둡니다.
   */
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [showPreviewOnMobile, setShowPreviewOnMobile] = useState(false);
  const isPreviewOpen = !isMobile || showPreviewOnMobile;

  const {
    sections,
    savedSections,
    isDirty,
    reset,
    markSaved,
    addSection,
    updateSection,
    removeSection,
    moveSection,
    moveSectionTo,
    toRequest
  } = useSectionLayoutDraft();

  const screenMeta = findScreenTypeMeta(screenType);
  const isScreenConfigurable = screenMeta?.isConfigurable ?? false;
  const editable = canManage && isScreenConfigurable && !isSaving;

  const configurableSectionTypes = useMemo(
    () => getConfigurableSectionTypes(screenType),
    [screenType]
  );

  // 이미 추가된 섹션 중 중복 등록이 불가능한 것은 추가 목록에서 제외합니다.
  const addableSectionTypes = useMemo(() => {
    const usedTypes = new Set(sections.map((section) => section.sectionType));
    return configurableSectionTypes.filter((meta) => meta.allowsMultiple || !usedTypes.has(meta.value));
  }, [configurableSectionTypes, sections]);

  const validation = useMemo(
    () => validateSectionLayouts(screenType, toRequest()),
    [screenType, toRequest]
  );

  /** 마지막 저장 상태와 현재 편집 상태의 차이 */
  const diff = useMemo(
    () => diffSectionLayouts(savedSections, sections),
    [savedSections, sections]
  );

  const visibleCount = useMemo(
    () => sections.filter((section) => section.isVisible).length,
    [sections]
  );

  const hiddenCount = sections.length - visibleCount;

  /**
   * 저장 버튼이 비활성화된 이유.
   *
   * 버튼만 회색으로 두면 왜 못 누르는지 알 수 없어, 사유를 헤더에 같이 노출합니다.
   */
  const saveBlockedReason = useMemo(() => {
    if (!canManage) return '레이아웃 수정은 운영자 이상만 가능합니다. 현재는 읽기 전용입니다.';
    if (!isScreenConfigurable) return '이 화면은 섹션 목록이 정의되어 있지 않아 저장할 수 없습니다.';
    if (isLoading || isSaving) return null;
    if (!isDirty) return '변경 사항이 없습니다.';
    if (!validation.isValid) return '입력값에 오류가 있어 저장할 수 없습니다. 아래 표시된 항목을 확인해주세요.';
    return null;
  }, [canManage, isScreenConfigurable, isLoading, isSaving, isDirty, validation.isValid]);

  const fetchSectionLayouts = useCallback(async (targetScreenType: ScreenType) => {
    setIsLoading(true);
    setIsLoaded(false);
    try {
      const response = await screenSectionLayoutApi.getSectionLayouts(targetScreenType);
      if (!response?.ok) {
        return;
      }

      reset(response.data?.contents ?? []);
      setIsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    void fetchSectionLayouts(screenType);
  }, [screenType, fetchSectionLayouts]);

  // 편집 중 이탈 시 저장되지 않은 변경이 사라지는 것을 브라우저 차원에서 한 번 더 알립니다.
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleScreenTypeChange = async (nextScreenType: ScreenType) => {
    if (nextScreenType === screenType) return;

    if (isDirty) {
      const confirmed = await confirm({
        title: '화면 변경',
        message: '저장하지 않은 변경 사항이 있습니다. 화면을 변경하면 변경 사항이 사라집니다. 계속하시겠습니까?',
        confirmLabel: '변경',
        variant: 'danger'
      });
      if (!confirmed) return;
    }

    setDragIndex(null);
    setDropTarget(null);
    setShowCompare(false);
    setActiveKey(null);
    setScreenType(nextScreenType);
  };

  const handleReload = async () => {
    if (isDirty) {
      const confirmed = await confirm({
        title: '다시 불러오기',
        message: '저장하지 않은 변경 사항이 사라집니다. 다시 불러오시겠습니까?',
        confirmLabel: '다시 불러오기',
        variant: 'danger'
      });
      if (!confirmed) return;
    }

    setActiveKey(null);
    await fetchSectionLayouts(screenType);
  };

  const handleAddSection = (sectionType: SectionType) => {
    if (!editable) return;
    addSection(sectionType);
  };

  const handleRemoveSection = async (index: number) => {
    const section = sections[index];
    const label = findSectionTypeMeta(screenType, section.sectionType)?.label ?? section.sectionType;

    const confirmed = await confirm({
      title: '섹션 제거',
      message: `${label} 섹션을 목록에서 제거하시겠습니까? 저장해야 실제로 반영됩니다.`,
      confirmLabel: '제거',
      variant: 'danger'
    });
    if (!confirmed) return;

    if (activeKey === section.key) {
      setActiveKey(null);
    }
    removeSection(index);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, index: number) => {
    if (dragIndex === null) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setDropTarget({
      index,
      position: event.clientY > rect.top + rect.height / 2 ? 'after' : 'before'
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (dragIndex === null) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const position = event.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
    moveSectionTo(dragIndex, index, position);
    setDragIndex(null);
    setDropTarget(null);
  };

  const handleSave = async () => {
    if (!editable || isSaving) return;

    if (!validation.isValid) {
      toast.error(validation.formErrors[0] ?? '입력값을 확인해주세요.');
      return;
    }

    const confirmed = await confirm({
      title: '섹션 레이아웃 전체 교체',
      message: `${screenMeta?.label ?? screenType} 화면의 섹션 구성을 현재 목록으로 통째로 교체합니다.\n`
        + '목록에 없는 섹션은 삭제되며, 다른 사람이 먼저 저장한 내용이 있다면 덮어씁니다.',
      details: [
        {label: '화면', value: `${screenMeta?.label ?? screenType} (${screenType})`},
        {label: '섹션 수', value: `총 ${sections.length}개 (노출 ${visibleCount}개)`},
        {label: '변경 요약', value: describeDiff(diff)}
      ],
      irreversible: true,
      confirmLabel: '전체 저장',
      variant: 'danger'
    });
    if (!confirmed) return;

    setIsSaving(true);
    try {
      const response = await screenSectionLayoutApi.replaceSectionLayouts(screenType, {
        sections: toRequest()
      });
      if (!response?.ok) {
        return;
      }

      markSaved(response.data?.contents ?? []);
      toast.success('섹션 레이아웃이 저장되었습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSectionList = () => {
    if (sections.length === 0) {
      return (
        <EmptyState
          icon="bi-layout-text-window"
          title="등록된 섹션이 없습니다"
          description={isLoaded
            ? '아직 한 번도 저장하지 않은 화면입니다. 유저 화면은 서버 기본 레이아웃으로 조립됩니다. 아래에서 섹션을 추가해주세요.'
            : '섹션 목록을 불러오지 못했습니다. 새로고침을 눌러 다시 시도해주세요.'}
        />
      );
    }

    return (
      <div className="section-list">
        {sections.map((section, index) => (
          <SectionLayoutRow
            key={section.key}
            section={section}
            index={index}
            meta={findSectionTypeMeta(screenType, section.sectionType)}
            error={validation.itemErrors[index]}
            editable={editable}
            isActive={activeKey === section.key}
            isDragging={dragIndex === index}
            dropPosition={dropTarget?.index === index ? dropTarget.position : undefined}
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => {
              setDragIndex(null);
              setDropTarget(null);
            }}
            onDragOver={(event) => handleDragOver(event, index)}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setDropTarget((prev) => (prev?.index === index ? null : prev));
              }
            }}
            onDrop={(event) => handleDrop(event, index)}
            onMoveUp={() => moveSection(index, index - 1)}
            onMoveDown={() => moveSection(index, index + 1)}
            onMoveToTop={() => moveSection(index, 0)}
            onMoveToBottom={() => moveSection(index, sections.length - 1)}
            canMoveUp={index > 0}
            canMoveDown={index < sections.length - 1}
            totalCount={sections.length}
            onChange={(changes) => updateSection(index, changes)}
            onRemove={() => void handleRemoveSection(index)}
            onSelect={() => setActiveKey(section.key)}
          />
        ))}
      </div>
    );
  };

  const renderEditor = () => {
    if (isLoading) {
      return (
        <div className="py-5">
          <Loading/>
        </div>
      );
    }

    if (!isScreenConfigurable) {
      return (
        <EmptyState
          icon="bi-slash-circle"
          title="섹션을 설정할 수 없는 화면입니다"
          description={`${screenMeta?.label ?? screenType} 화면은 아직 섹션 목록이 정의되지 않았습니다. 현재는 가게 상세 화면만 설정할 수 있습니다.`}
        />
      );
    }

    return (
      <>
        {validation.formErrors.length > 0 && sections.length > 0 && (
          <div className="alert alert-danger py-2" role="alert">
            <ul className="mb-0 ps-3 small">
              {validation.formErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {renderSectionList()}

        {canManage && (
          <SectionAddPanel
            addableSectionTypes={addableSectionTypes}
            totalConfigurableCount={configurableSectionTypes.length}
            disabled={!editable}
            onAdd={handleAddSection}
          />
        )}
      </>
    );
  };

  return (
    <div>
      <PageHeader
        description="유저 앱 화면의 섹션 노출 순서와 하단 여백, 노출 여부를 관리합니다. 왼쪽 미리보기로 결과를 확인하며 편집한 뒤 전체 저장을 눌러 한 번에 반영하세요."
        meta={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* 화면 선택은 페이지 전체의 대상을 고르는 조작이라 헤더에 둡니다. */}
            <label className="visually-hidden" htmlFor="screen-type">화면 선택</label>
            <select
              id="screen-type"
              className="form-select form-select-sm screen-select"
              value={screenType}
              disabled={isLoading || isSaving}
              onChange={(event) => void handleScreenTypeChange(event.target.value as ScreenType)}
            >
              {SCREEN_TYPES.map((screen) => (
                <option key={screen.value} value={screen.value}>
                  {screen.label}{screen.isConfigurable ? '' : ' (설정 불가)'}
                </option>
              ))}
            </select>

            {!isLoading && isScreenConfigurable && (
              <span className="page-count">
                노출 {visibleCount}개
                {hiddenCount > 0 && <> · <span className="text-danger">미노출 {hiddenCount}개</span></>}
              </span>
            )}

            {saveBlockedReason && (
              <span className="text-body-secondary small">
                <i className="bi bi-info-circle me-1"/>{saveBlockedReason}
              </span>
            )}
          </div>
        }
        actions={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => void handleReload()}
              disabled={isLoading || isSaving}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
              ) : (
                <i className="bi bi-arrow-clockwise me-1"/>
              )}
              새로고침
            </button>
            {canManage && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void handleSave()}
                disabled={!editable || !isDirty || !validation.isValid || isLoading}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
                    저장 중...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"/>전체 저장
                  </>
                )}
              </button>
            )}
          </div>
        }
      />

      {!canManage && (
        <div className="alert alert-secondary d-flex align-items-center gap-2 py-2" role="status">
          <i className="bi bi-eye"/>
          <span className="small mb-0">읽기 전용 모드입니다. 레이아웃 수정은 운영자 이상만 가능합니다.</span>
        </div>
      )}

      {isDirty && (
        <div className="alert alert-warning d-flex align-items-center gap-2 flex-wrap py-2" role="status">
          <i className="bi bi-exclamation-triangle-fill"/>
          <span className="small mb-0 flex-grow-1">
            저장하지 않은 변경 사항이 있습니다. ({describeDiff(diff)}) 전체 저장을 눌러야 반영됩니다.
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowCompare((prev) => !prev)}
            aria-expanded={showCompare}
          >
            <i className={`bi ${showCompare ? 'bi-chevron-up' : 'bi-layout-split'} me-1`}/>
            {showCompare ? '비교 닫기' : '전/후 비교'}
          </button>
        </div>
      )}

      {/* 전/후 비교는 좌우 두 목록이라 폭이 필요해, 2단 레이아웃 위에 전체 폭으로 펼칩니다. */}
      {showCompare && isDirty && (
        <div className="mb-3">
          <SectionLayoutCompare
            screenType={screenType}
            before={savedSections}
            after={sections}
            diff={diff}
          />
        </div>
      )}

      <div className="screen-layout">
        {/* 미리보기는 스크롤해도 따라오도록 sticky 처리합니다. */}
        <aside className="screen-layout__preview">
          <SectionCard
            title="미리보기"
            icon="bi-phone"
            aside={isMobile && (
              /* 모바일에서만 접기/펼치기를 제공합니다. 넓은 화면에서는 항상 보입니다. */
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowPreviewOnMobile((prev) => !prev)}
                aria-expanded={showPreviewOnMobile}
                aria-controls="screen-preview-body"
              >
                <i className={`bi ${showPreviewOnMobile ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}/>
                {showPreviewOnMobile ? '접기' : '펼치기'}
              </button>
            )}
          >
            <div id="screen-preview-body" hidden={!isPreviewOpen}>
              {isLoading ? (
                <Loading/>
              ) : (
                <SectionPreview
                  screenType={screenType}
                  sections={sections}
                  activeKey={activeKey}
                  onSelect={(key) => {
                    setActiveKey(key);
                    // 모바일에서는 미리보기와 해당 편집 행이 멀리 떨어져 있어 직접 스크롤해줍니다.
                    if (isMobile) {
                      scrollToSectionRow(key);
                    }
                  }}
                />
              )}
            </div>

            {/* 접혀 있을 때도 현재 구성을 가늠할 수 있게 요약만 남깁니다. */}
            {!isPreviewOpen && !isLoading && (
              <p className="screen-preview__collapsed mb-0">
                노출 {visibleCount}개 섹션이 순서대로 표시됩니다.
              </p>
            )}
          </SectionCard>
        </aside>

        <div className="screen-layout__editor">
          <SectionCard
            title="섹션 목록"
            icon="bi-list-ol"
            description="위에 있을수록 화면 위쪽에 노출됩니다. 핸들을 드래그하거나 방향키로 순서를 바꿀 수 있습니다."
            aside={!isLoading && isScreenConfigurable && (
              <span className="page-count">총 {sections.length}개</span>
            )}
          >
            {renderEditor()}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

/**
 * 미리보기에서 고른 섹션의 편집 행으로 스크롤합니다.
 *
 * 모바일에서는 미리보기와 편집 목록이 위아래로 멀리 떨어져 있어, 블록을 눌러도
 * 강조만 되고 어디가 바뀌었는지 보이지 않습니다.
 */
const scrollToSectionRow = (key: string) => {
  const row = document.getElementById(sectionRowId(key));
  row?.scrollIntoView({behavior: 'smooth', block: 'center'});
};

/** 확인 모달에 넣을 한 줄 변경 요약 */
const describeDiff = (diff: ReturnType<typeof diffSectionLayouts>): string => {
  const parts: string[] = [];
  if (diff.addedCount > 0) parts.push(`추가 ${diff.addedCount}개`);
  if (diff.removedCount > 0) parts.push(`삭제 ${diff.removedCount}개`);
  if (diff.movedCount > 0) parts.push(`순서 변경 ${diff.movedCount}개`);
  if (diff.updatedCount > 0) parts.push(`값 변경 ${diff.updatedCount}개`);
  return parts.length > 0 ? parts.join(' · ') : '변경 없음';
};

export default ScreenSectionLayoutManagement;
