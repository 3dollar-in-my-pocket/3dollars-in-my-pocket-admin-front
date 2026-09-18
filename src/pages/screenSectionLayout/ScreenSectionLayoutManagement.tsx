import {DragEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {toast} from 'react-toastify';
import screenSectionLayoutApi from '@/api/screenSectionLayoutApi';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import {useConfirm} from '@/hooks/useConfirm';
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
import SectionLayoutRow from './SectionLayoutRow';
import SectionGap from './SectionGap';
import SectionLayoutCompare from './SectionLayoutCompare';
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
  const [sectionTypeToAdd, setSectionTypeToAdd] = useState<SectionType | ''>('');
  const [showCompare, setShowCompare] = useState(false);

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

  /**
   * 저장 버튼이 비활성화된 이유.
   *
   * 버튼만 회색으로 두면 왜 못 누르는지 알 수 없어, 사유를 헤더에 같이 노출합니다.
   */
  /** 마지막 저장 상태와 현재 편집 상태의 차이 */
  const diff = useMemo(
    () => diffSectionLayouts(savedSections, sections),
    [savedSections, sections]
  );

  const visibleCount = useMemo(
    () => sections.filter((section) => section.isVisible).length,
    [sections]
  );

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
    setSectionTypeToAdd('');
    setShowCompare(false);
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

    await fetchSectionLayouts(screenType);
  };

  const handleAddSection = () => {
    if (!sectionTypeToAdd) return;
    addSection(sectionTypeToAdd);
    setSectionTypeToAdd('');
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

  const renderBody = () => {
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
      <div>
        {sections.map((section, index) => (
          <div key={section.key}>
            <SectionLayoutRow
              section={section}
              index={index}
              meta={findSectionTypeMeta(screenType, section.sectionType)}
              error={validation.itemErrors[index]}
              editable={editable}
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
              canMoveUp={index > 0}
              canMoveDown={index < sections.length - 1}
              onChange={(changes) => updateSection(index, changes)}
              onRemove={() => void handleRemoveSection(index)}
            />
            {/* 마지막 섹션의 하단 여백은 아래에 이어지는 섹션이 없어 화면에서 의미가 없습니다. */}
            {index < sections.length - 1 && (
              <SectionGap marginBottom={section.marginBottom} isVisible={section.isVisible}/>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        description="유저 앱 화면의 섹션 노출 순서와 하단 여백, 노출 여부를 관리합니다. 드래그로 순서를 바꾼 뒤 전체 저장을 눌러 한 번에 반영하세요."
        meta={saveBlockedReason && (
          <span className="text-body-secondary small">
            <i className="bi bi-info-circle me-1"/>{saveBlockedReason}
          </span>
        )}
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

      <SectionCard
        title="섹션 목록"
        icon="bi-list-ol"
        description="위에 있을수록 화면 위쪽에 노출됩니다. 섹션 사이의 빗금은 하단 여백 크기를 나타냅니다."
        aside={!isLoading && isScreenConfigurable && (
          <span className="page-count">
            노출 {visibleCount}개 ·{' '}
            <span className="text-danger">미노출 {sections.length - visibleCount}개</span>{' '}
            · 총 {sections.length}개
          </span>
        )}
      >
        {/* 화면 선택은 목록의 대상을 고르는 조작이라 목록과 같은 카드에 둡니다. */}
        <div className="row g-2 align-items-end mb-3 pb-3 border-bottom">
          <div className="col-12 col-sm-6 col-md-4">
            <label className="item-card__label" htmlFor="screen-type">화면 (screenType)</label>
            <select
              id="screen-type"
              className="form-select form-select-sm"
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
          </div>
        </div>

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

        {/* 전/후 비교는 편집 중 실시간으로 갱신되므로 목록 위에 펼쳐서 보여줍니다. */}
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

        {validation.formErrors.length > 0 && sections.length > 0 && (
          <div className="alert alert-danger py-2" role="alert">
            <ul className="mb-0 ps-3 small">
              {validation.formErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {renderBody()}

        {canManage && isScreenConfigurable && !isLoading && (
          <div className="row g-2 align-items-end mt-3 pt-3 border-top">
            <div className="col-12 col-sm-6 col-md-4">
              <label className="item-card__label" htmlFor="section-type-to-add">섹션 추가</label>
              <select
                id="section-type-to-add"
                className="form-select form-select-sm"
                value={sectionTypeToAdd}
                disabled={!editable || addableSectionTypes.length === 0}
                onChange={(event) => setSectionTypeToAdd(event.target.value as SectionType | '')}
              >
                <option value="">섹션을 선택해주세요</option>
                {addableSectionTypes.map((meta) => (
                  <option key={meta.value} value={meta.value}>
                    {meta.label} ({meta.value}){meta.allowsMultiple ? ' · 중복 등록 가능' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-sm-auto">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleAddSection}
                disabled={!editable || !sectionTypeToAdd}
              >
                <i className="bi bi-plus-lg me-1"/>추가
              </button>
            </div>
            {addableSectionTypes.length === 0 && (
              <div className="col-12">
                <p className="text-body-secondary small mb-0">추가할 수 있는 섹션이 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </SectionCard>

    </div>
  );
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
