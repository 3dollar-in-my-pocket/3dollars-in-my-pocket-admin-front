import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import enumApi from '../../api/enumApi';
import promptApi from '../../api/promptApi';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { formatDateTime } from '../../utils/dateUtils';
import { EnumOption, PromptFormRequest, PromptResponse, PromptStatus } from '../../types/prompt';
import './PromptManagement.css';

const PAGE_SIZE = 10;
const PROMPT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
} as const;

const getEnumValue = (option: EnumOption): string => {
  return option.type || option.key || option.value || option.name || '';
};

const getEnumLabel = (option: EnumOption): string => {
  const value = getEnumValue(option);
  return option.description || option.displayName || value;
};

const getStatusLabel = (status: PromptStatus, promptStatuses: EnumOption[]): string => {
  const option = promptStatuses.find((item) => getEnumValue(item) === status);
  return option ? getEnumLabel(option) : status;
};

const getStatusDescription = (status: PromptStatus): string => {
  if (status === PROMPT_STATUS.ACTIVE) return '실제 서비스 적용 후보';
  if (status === PROMPT_STATUS.DRAFT) return '서비스 미적용 초안';
  return '상태 정보';
};

const PromptManagement = () => {
  const [promptTypes, setPromptTypes] = useState<EnumOption[]>([]);
  const [promptStatuses, setPromptStatuses] = useState<EnumOption[]>([]);
  const [selectedPromptType, setSelectedPromptType] = useState('');
  const [prompts, setPrompts] = useState<PromptResponse[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEnumLoading, setIsEnumLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const selectedPromptTypeRef = useRef('');

  useEffect(() => {
    selectedPromptTypeRef.current = selectedPromptType;
  }, [selectedPromptType]);

  useEffect(() => {
    const fetchPromptTypes = async () => {
      setIsEnumLoading(true);
      try {
        const response = await enumApi.getEnum();
        const types = response?.data?.PromptType || [];
        const statuses = response?.data?.PromptStatus || [];
        setPromptTypes(types);
        setPromptStatuses(statuses);

        const firstType = types[0] ? getEnumValue(types[0]) : '';
        if (firstType) {
          setSelectedPromptType(firstType);
        }
      } finally {
        setIsEnumLoading(false);
      }
    };

    fetchPromptTypes();
  }, []);

  const selectedPromptTypeLabel = useMemo(() => {
    const option = promptTypes.find((type) => getEnumValue(type) === selectedPromptType);
    return option ? getEnumLabel(option) : selectedPromptType;
  }, [promptTypes, selectedPromptType]);

  const activePrompt = useMemo(() => {
    const activePrompts = prompts.filter((prompt) => prompt.status === PROMPT_STATUS.ACTIVE);
    if (activePrompts.length === 0) return null;

    return activePrompts.reduce((latest, prompt) => {
      return prompt.version > latest.version ? prompt : latest;
    }, activePrompts[0]);
  }, [prompts]);

  const statusCounts = useMemo(() => {
    return prompts.reduce(
      (counts, prompt) => ({
        active: counts.active + (prompt.status === PROMPT_STATUS.ACTIVE ? 1 : 0),
        draft: counts.draft + (prompt.status === PROMPT_STATUS.DRAFT ? 1 : 0),
      }),
      { active: 0, draft: 0 }
    );
  }, [prompts]);

  const fetchPrompts = useCallback(async (reset = false) => {
    const promptType = selectedPromptTypeRef.current;
    if (!promptType || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const response = await promptApi.listPrompts(promptType, {
        cursor: reset ? null : cursorRef.current,
        size: PAGE_SIZE,
      });

      if (!response?.ok) return;

      const { contents = [], cursor } = response.data || {
        contents: [],
        cursor: { hasMore: false, nextCursor: null },
      };

      if (reset) {
        setPrompts(contents);
      } else {
        setPrompts((prev) => [...prev, ...contents]);
      }

      cursorRef.current = cursor?.nextCursor || null;
      setHasMore(Boolean(cursor?.hasMore && cursor?.nextCursor));
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cursorRef.current = null;
    setPrompts([]);
    setHasMore(false);
    fetchPrompts(true);
  }, [selectedPromptType, fetchPrompts]);

  const { scrollContainerRef, loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => fetchPrompts(false),
    threshold: 0.1,
  });

  const handleShowModal = (prompt: PromptResponse | null = null) => {
    setSelectedPrompt(prompt);
    setShowModal(true);
  };

  const handleCloseModal = (shouldRefresh = false) => {
    setShowModal(false);
    setSelectedPrompt(null);

    if (shouldRefresh) {
      cursorRef.current = null;
      fetchPrompts(true);
    }
  };

  const handlePromptTypeChange = (value: string) => {
    setSelectedPromptType(value);
  };

  const handleStatusChange = async (prompt: PromptResponse, nextStatus: PromptStatus) => {
    if (prompt.status === nextStatus) return;

    const message = nextStatus === PROMPT_STATUS.ACTIVE
      ? `v${prompt.version} 프롬프트를 활성화하시겠습니까?`
      : `v${prompt.version} 프롬프트를 초안으로 전환하시겠습니까?`;

    if (!window.confirm(message)) return;

    try {
      const response = await promptApi.updatePrompt(selectedPromptType, prompt.promptId, { status: nextStatus });
      if (response?.ok) {
        toast.success(nextStatus === PROMPT_STATUS.ACTIVE ? '활성화되었습니다' : '초안으로 전환되었습니다');
        cursorRef.current = null;
        fetchPrompts(true);
      }
    } catch (error: any) {
      toast.error(error.message || '상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container-fluid py-4 prompt-management">
      <div className="prompt-page-header mb-4">
        <div>
          <div className="prompt-page-kicker">
            <i className="bi bi-stars"></i>
            운영 툴
          </div>
          <h2 className="prompt-page-title mb-1">AI 프롬프트 관리</h2>
          <p className="prompt-page-description mb-0">
            AI 기능별 프롬프트 버전을 조회하고 생성, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <button
          className="btn btn-primary prompt-primary-action"
          onClick={() => handleShowModal()}
          disabled={!selectedPromptType || isEnumLoading}
        >
          <i className="bi bi-plus-circle me-2"></i>
          신규 등록
        </button>
      </div>

      <div className="prompt-toolbar mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-lg-5">
            <label className="form-label prompt-label">프롬프트 타입</label>
            <div className="input-group">
              <span className="input-group-text prompt-input-icon">
                <i className="bi bi-diagram-3"></i>
              </span>
              <select
                className="form-select prompt-select"
                value={selectedPromptType}
                onChange={(event) => handlePromptTypeChange(event.target.value)}
                disabled={isEnumLoading || isLoading}
              >
                <option value="">선택하세요</option>
                {promptTypes.map((type) => {
                  const value = getEnumValue(type);
                  return (
                    <option key={value} value={value}>
                      {getEnumLabel(type)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="col-12 col-md-auto">
            <button
              className="btn btn-outline-secondary prompt-icon-button"
              onClick={() => fetchPrompts(true)}
              disabled={!selectedPromptType || isLoading}
              title="새로고침"
            >
              <i className={`bi ${isLoading ? 'bi-arrow-clockwise prompt-spin' : 'bi-arrow-clockwise'}`}></i>
              <span>새로고침</span>
            </button>
          </div>
          <div className="col-12 col-md">
            <div className="prompt-summary justify-content-md-end">
              <div className="prompt-summary-item">
                <span className="prompt-summary-label">선택 타입</span>
                <strong>{selectedPromptTypeLabel || '-'}</strong>
              </div>
              <div className="prompt-summary-item">
                <span className="prompt-summary-label">조회 결과</span>
                <strong>{prompts.length}{hasMore ? '+' : ''}개</strong>
              </div>
              <div className="prompt-summary-item">
                <span className="prompt-summary-label">ACTIVE</span>
                <strong>{statusCounts.active}개</strong>
              </div>
              <div className="prompt-summary-item">
                <span className="prompt-summary-label">DRAFT</span>
                <strong>{statusCounts.draft}개</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEnumLoading ? (
        <div className="py-5 text-center">
          <Loading/>
        </div>
      ) : !selectedPromptType ? (
        <EmptyState
          icon="bi-robot"
          title="프롬프트 타입이 없습니다"
          description="Enum API에서 PromptType을 조회하지 못했습니다."
        />
      ) : (
        <div ref={scrollContainerRef} className="prompt-list-scroll">
          {isLoading && prompts.length === 0 ? (
            <div className="py-5 text-center">
              <Loading/>
              <p className="text-muted mt-3 mb-0">프롬프트를 불러오는 중...</p>
            </div>
          ) : prompts.length === 0 ? (
            <EmptyState
              icon="bi-chat-square-text"
              title="등록된 프롬프트가 없습니다"
              description={`${selectedPromptTypeLabel} 타입에 등록된 프롬프트가 없습니다.`}
              actionButton={{
                label: '신규 등록',
                onClick: () => handleShowModal(),
                variant: 'success',
              }}
            />
          ) : (
            <div className="prompt-list">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.promptId}
                  prompt={prompt}
                  promptTypeLabel={selectedPromptTypeLabel}
                  statusLabel={getStatusLabel(prompt.status, promptStatuses)}
                  isApplied={activePrompt?.promptId === prompt.promptId}
                  onStatusChange={(nextStatus) => handleStatusChange(prompt, nextStatus)}
                  onEdit={() => handleShowModal(prompt)}
                />
              ))}
            </div>
          )}

          {hasMore && prompts.length > 0 && (
            <div ref={loadMoreRef} className="py-3 text-center">
              {isLoading && <div className="spinner-border text-primary" role="status"/>}
            </div>
          )}
        </div>
      )}

      <PromptEditModal
        show={showModal}
        promptType={selectedPromptType}
        promptTypeLabel={selectedPromptTypeLabel}
        selectedPrompt={selectedPrompt}
        onHide={() => handleCloseModal(false)}
        onSuccess={() => handleCloseModal(true)}
      />
    </div>
  );
};

const PromptCard = ({
  prompt,
  promptTypeLabel,
  statusLabel,
  isApplied,
  onStatusChange,
  onEdit,
}: {
  prompt: PromptResponse;
  promptTypeLabel: string;
  statusLabel: string;
  isApplied: boolean;
  onStatusChange: (nextStatus: PromptStatus) => void;
  onEdit: () => void;
}) => {
  const isActive = prompt.status === PROMPT_STATUS.ACTIVE;
  const nextStatus = isActive ? PROMPT_STATUS.DRAFT : PROMPT_STATUS.ACTIVE;

  return (
    <article className={`prompt-card ${isActive ? 'is-active' : 'is-draft'} ${isApplied ? 'is-applied' : ''}`}>
      {isApplied && (
        <div className="prompt-applied-ribbon">
          <i className="bi bi-check2-circle"></i>
          서비스 적용 중
        </div>
      )}
      <div className="prompt-card-head">
        <div className="prompt-card-title-area">
          <div className="prompt-badges">
            <span className="prompt-version">v{prompt.version}</span>
            {isApplied && (
              <span className="prompt-applied-badge">
                <i className="bi bi-check-circle-fill"></i>
                적용 버전
              </span>
            )}
            <span className={`prompt-status-badge ${isActive ? 'is-active' : 'is-draft'}`}>
              <i className={`bi ${isActive ? 'bi-lightning-charge-fill' : 'bi-pencil'}`}></i>
              {statusLabel}
            </span>
            <span className="prompt-type-badge">{promptTypeLabel}</span>
            <span className="prompt-id">ID {prompt.promptId}</span>
          </div>
          <h5 className="prompt-card-title">{prompt.description}</h5>
          <p className="prompt-card-status-note">
            {isApplied ? '현재 서비스에 적용되는 프롬프트입니다.' : getStatusDescription(prompt.status)}
          </p>
        </div>
        <div className="prompt-card-actions">
          <button
            className={`btn ${isActive ? 'btn-outline-secondary' : 'btn-outline-success'} prompt-status-button`}
            onClick={() => onStatusChange(nextStatus)}
            title={isActive ? '초안으로 전환' : '활성화'}
          >
            <i className={`bi ${isActive ? 'bi-file-earmark' : 'bi-broadcast-pin'}`}></i>
            <span>{isActive ? '초안 전환' : '활성화'}</span>
          </button>
          <button className="btn btn-outline-primary prompt-edit-button" onClick={onEdit} title="프롬프트 수정">
            <i className="bi bi-pencil-square"></i>
            <span>수정</span>
          </button>
        </div>
      </div>

      <div className="prompt-content-preview">
        {prompt.content}
      </div>

      <div className="prompt-meta-row">
        <div className="prompt-meta-item">
          <span>생성</span>
          <strong>{formatDateTime(prompt.createdAt)}</strong>
        </div>
        <div className="prompt-meta-item">
          <span>수정</span>
          <strong>{formatDateTime(prompt.updatedAt)}</strong>
        </div>
      </div>
    </article>
  );
};

const PromptEditModal = ({
  show,
  promptType,
  promptTypeLabel,
  selectedPrompt,
  onHide,
  onSuccess,
}: {
  show: boolean;
  promptType: string;
  promptTypeLabel: string;
  selectedPrompt: PromptResponse | null;
  onHide: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState<PromptFormRequest>({
    description: '',
    content: '',
  });
  const [errors, setErrors] = useState<Partial<PromptFormRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(selectedPrompt);

  useEffect(() => {
    if (!show) return;

    setFormData({
      description: selectedPrompt?.description || '',
      content: selectedPrompt?.content || '',
    });
    setErrors({});
    setIsSubmitting(false);
  }, [show, selectedPrompt]);

  const validate = () => {
    const nextErrors: Partial<PromptFormRequest> = {};

    if (!formData.description.trim()) {
      nextErrors.description = '설명을 입력해주세요.';
    } else if (formData.description.trim().length > 100) {
      nextErrors.description = '설명은 최대 100자까지 입력할 수 있습니다.';
    }

    if (!formData.content.trim()) {
      nextErrors.content = '프롬프트 본문을 입력해주세요.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const savePrompt = async (
    statusOnCreate: PromptStatus = PROMPT_STATUS.ACTIVE
  ) => {
    if (!promptType || !validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        description: formData.description.trim(),
        content: formData.content.trim(),
      };

      const response = selectedPrompt
        ? await promptApi.updatePrompt(promptType, selectedPrompt.promptId, payload)
        : await promptApi.createPrompt(promptType, {
            ...payload,
            status: statusOnCreate,
          });

      if (response?.ok) {
        toast.success(selectedPrompt ? '수정되었습니다' : '등록되었습니다');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await savePrompt(PROMPT_STATUS.ACTIVE);
  };

  const handleDelete = async () => {
    if (!selectedPrompt || isSubmitting) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    setIsSubmitting(true);
    try {
      const response = await promptApi.deletePrompt(promptType, selectedPrompt.promptId);
      if (response?.ok) {
        toast.info('삭제되었습니다');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered fullscreen="md-down" dialogClassName="prompt-modal">
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="prompt-modal-header">
          <div>
            <div className="prompt-page-kicker mb-1">
              <i className="bi bi-robot"></i>
              {isEdit ? '프롬프트 편집' : '새 프롬프트'}
            </div>
            <Modal.Title className="prompt-modal-title">
              {isEdit ? selectedPrompt?.description : 'AI 프롬프트 신규 등록'}
            </Modal.Title>
          </div>
        </Modal.Header>

        <Modal.Body className="prompt-modal-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label prompt-label">프롬프트 타입</label>
              <input className="form-control prompt-readonly-input" value={promptTypeLabel} disabled />
            </div>
            {selectedPrompt && (
              <div className="col-12 col-md-6">
                <label className="form-label prompt-label">버전</label>
                <input className="form-control prompt-readonly-input" value={`v${selectedPrompt.version}`} disabled />
              </div>
            )}

            <div className="col-12">
              <label className="form-label prompt-label">설명</label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={100}
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                placeholder="프롬프트 설명을 입력해주세요."
              />
              <div className="d-flex justify-content-between mt-1">
                {errors.description ? (
                  <div className="invalid-feedback d-block">{errors.description}</div>
                ) : (
                  <small className="text-muted">목록에서 구분할 수 있는 설명을 입력해주세요.</small>
                )}
                <small className="text-muted ms-2">{formData.description.length}/100</small>
              </div>
            </div>

            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center gap-2">
                <label className="form-label prompt-label">본문</label>
                <small className="text-muted">{formData.content.length.toLocaleString()}자</small>
              </div>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className={`form-control prompt-editor ${errors.content ? 'is-invalid' : ''}`}
                rows={14}
                placeholder="AI에 전달할 프롬프트 본문을 입력해주세요."
              />
              {errors.content && <div className="invalid-feedback d-block">{errors.content}</div>}
            </div>

            {selectedPrompt && (
              <>
                <div className="col-12 col-md-6">
                  <label className="form-label prompt-label">생성일자</label>
                  <input className="form-control prompt-readonly-input" value={formatDateTime(selectedPrompt.createdAt)} disabled />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label prompt-label">수정일자</label>
                  <input className="form-control prompt-readonly-input" value={formatDateTime(selectedPrompt.updatedAt)} disabled />
                </div>
              </>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer className="prompt-modal-footer">
          <div className="w-100 d-flex flex-column flex-sm-row gap-2">
            {selectedPrompt && (
              <button
                type="button"
                className="btn btn-outline-danger prompt-footer-button"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <i className="bi bi-trash me-1"></i>
                삭제
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline-secondary prompt-footer-button ms-sm-auto"
              onClick={onHide}
              disabled={isSubmitting}
            >
              취소
            </button>
            {!selectedPrompt && (
              <button
                type="button"
                className="btn btn-outline-primary prompt-footer-button"
                onClick={() => savePrompt(PROMPT_STATUS.DRAFT)}
                disabled={isSubmitting || !promptType}
              >
                <i className="bi bi-file-earmark-text me-1"></i>
                Draft 저장
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary prompt-footer-button"
              disabled={isSubmitting || !promptType}
            >
              {isSubmitting ? '처리 중...' : selectedPrompt ? '저장' : 'ACTIVE 저장'}
            </button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default PromptManagement;
