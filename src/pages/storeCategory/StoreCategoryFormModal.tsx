import {FormEvent, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeCategoryApi from '@/api/storeCategoryApi';
import enumApi from '@/api/enumApi';
import useImageUpload from '@/hooks/useImageUpload';
import {
  CreateStoreCategoryRequest,
  STORE_CATEGORY_CLASSIFICATIONS,
  STORE_CATEGORY_MARKER_FIELDS,
  STORE_CATEGORY_MARKER_GROUPS,
  SAMPLE_CATEGORY_ID,
  StoreCategory,
  StoreCategoryClassificationType,
  StoreCategoryMarkerField,
  StoreCategoryMetaType,
  UpdateStoreCategoryRequest
} from '@/types/storeCategory';

const markerFields = STORE_CATEGORY_MARKER_FIELDS;

const FORM_ID = 'store-category-form';

type MarkerField = StoreCategoryMarkerField;
/** 파일 업로드가 가능한 이미지 URL 필드 */
type ImageField = MarkerField | 'imageUrl' | 'disableImageUrl';
type FormData = Record<MarkerField, string> & {
  categoryType: string;
  name: string;
  description: string;
  imageUrl: string;
  disableImageUrl: string;
  classificationType: StoreCategoryClassificationType;
  metaType: StoreCategoryMetaType;
  displayOrder: string;
};

const emptyForm = (): FormData => ({
  categoryType: '', name: '', description: '', imageUrl: '', disableImageUrl: '',
  defaultMarkerImageFocusedUrl: '', defaultMarkerImageUnfocusedUrl: '',
  recentlyActivityMarkerImageFocusedUrl: '', recentlyActivityMarkerImageUnfocusedUrl: '',
  hasIssuableCouponMarkerImageFocusedUrl: '', hasIssuableCouponMarkerImageUnfocusedUrl: '',
  verifiedStoreMarkerImageFocusedUrl: '', verifiedStoreMarkerImageUnfocusedUrl: '',
  classificationType: 'SNACKS', metaType: 'DEFAULT', displayOrder: '',
});

const fromCategory = (category: StoreCategory): FormData => ({
  ...emptyForm(),
  categoryType: category.categoryId,
  name: category.name,
  description: category.description,
  imageUrl: category.imageUrl,
  disableImageUrl: category.disableImageUrl,
  classificationType: category.classification.type,
  metaType: category.metaType,
  displayOrder: category.displayOrder?.toString() ?? '',
  ...Object.fromEntries(markerFields.map(([key]) => [key, category[key] ?? ''])),
});

interface Props {
  show: boolean;
  category: StoreCategory | null;
  onHide: () => void;
  onSuccess: () => void;
}

interface FoodTypeOption {
  key: string;
  description: string;
}

const StoreCategoryFormModal = ({show, category, onHide, onSuccess}: Props) => {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foodTypeOptions, setFoodTypeOptions] = useState<FoodTypeOption[]>([]);
  const [isFoodTypeLoading, setIsFoodTypeLoading] = useState(false);
  const [isCustomFoodType, setIsCustomFoodType] = useState(false);
  /** FoodType enum 자체를 불러왔는지 여부 (조회 실패와 '전부 등록됨'을 구분하기 위함) */
  const [hasFoodTypeOptions, setHasFoodTypeOptions] = useState(false);
  /** 이미 등록된 카테고리 타입 (직접 입력 시 중복 검증용) */
  const [registeredTypes, setRegisteredTypes] = useState<Set<string>>(() => new Set());
  const [sampleCategory, setSampleCategory] = useState<StoreCategory | null>(null);
  const isEdit = !!category;

  const {handleFileChange, uploadingField: uploadingFieldRaw} = useImageUpload({
    imageType: 'STORE_IMAGE',
    onUploaded: (url, field) => {
      setForm((current) => ({...current, [field as ImageField]: url}));
      setErrors((current) => ({...current, [field as ImageField]: ''}));
    },
    successMessage: '이미지가 업로드되었습니다.'
  });
  const uploadingField = uploadingFieldRaw as ImageField | null;
  const isUploading = uploadingField !== null;

  useEffect(() => {
    if (show) {
      setForm(category ? fromCategory(category) : emptyForm());
      setErrors({});
      setIsCustomFoodType(false);
      setHasFoodTypeOptions(false);
      setFoodTypeOptions([]);
      setRegisteredTypes(new Set());
      setSampleCategory(null);
    }
  }, [show, category]);

  // 등록 시 FoodType 목록과 기존 카테고리 목록을 함께 불러온다.
  // - 이미 카테고리로 등록된 FoodType은 선택지에서 제외한다.
  // - 기준 카테고리(붕어빵) 에셋은 각 이미지 필드의 참고용 썸네일로 사용한다.
  useEffect(() => {
    if (!show || category) return;
    let cancelled = false;
    setIsFoodTypeLoading(true);
    Promise.all([enumApi.getEnum(), storeCategoryApi.getAllStoreCategories()]).then(
      ([enumResponse, categoryResponse]) => {
        if (cancelled) return;

        const registeredCategories = categoryResponse?.ok ? (categoryResponse.data?.contents || []) : [];
        setSampleCategory(registeredCategories.find((item) => item.categoryId === SAMPLE_CATEGORY_ID) ?? null);

        const allOptions = enumResponse?.ok && Array.isArray(enumResponse.data?.FoodType)
          ? enumResponse.data.FoodType as FoodTypeOption[]
          : [];
        const registered = new Set(registeredCategories.map((item) => item.categoryId));
        const options = allOptions.filter((option) => !registered.has(option.key));
        setRegisteredTypes(registered);

        setFoodTypeOptions(options);
        setHasFoodTypeOptions(allOptions.length > 0);
        if (options.length === 0) {
          setIsCustomFoodType(true);
          return;
        }
        setForm((current) => ({
          ...current,
          categoryType: current.categoryType || options[0].key,
          name: current.name || options[0].description
        }));
      }
    ).finally(() => {
      if (!cancelled) setIsFoodTypeLoading(false);
    });
    return () => { cancelled = true; };
  }, [show, category]);

  const setField = (name: keyof FormData, value: string) => {
    setForm((current) => ({...current, [name]: value}));
    setErrors((current) => ({...current, [name]: ''}));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const categoryType = form.categoryType.trim().toUpperCase();
    if (!categoryType) {
      next.categoryType = 'FoodType enum 이름을 입력해주세요.';
    } else if (!isEdit && registeredTypes.has(categoryType)) {
      next.categoryType = '이미 등록된 카테고리입니다.';
    }
    if (!form.name.trim()) next.name = '카테고리명을 입력해주세요.';
    if (form.name.trim().length > 50) next.name = '카테고리명은 50자 이하여야 합니다.';
    if (!form.description.trim()) next.description = '노출 문구를 입력해주세요.';
    if (form.description.trim().length > 100) next.description = '노출 문구는 100자 이하여야 합니다.';

    const urlFields = [
      ['imageUrl', '활성 이미지'], ['disableImageUrl', '비활성 이미지'], ...markerFields
    ] as const;
    urlFields.forEach(([key, label]) => {
      const value = form[key].trim();
      if (!value) next[key] = `${label} URL을 입력해주세요.`;
      if (value.length > 300) next[key] = `${label} URL은 300자 이하여야 합니다.`;
      if (value) {
        try { new URL(value); } catch { next[key] = '올바른 URL을 입력해주세요.'; }
      }
    });
    if (form.displayOrder.trim() && !Number.isFinite(Number(form.displayOrder))) {
      next.displayOrder = '표시 순서는 숫자로 입력해주세요.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildValues = (): CreateStoreCategoryRequest => ({
    categoryType: form.categoryType.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim(),
    disableImageUrl: form.disableImageUrl.trim(),
    ...Object.fromEntries(markerFields.map(([key]) => [key, form[key].trim()])) as Record<MarkerField, string>,
    classificationType: form.classificationType,
    metaType: form.metaType,
    displayOrder: form.displayOrder.trim() === '' ? null : Number(form.displayOrder),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting || isUploading) return;
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const values = buildValues();
      if (category) {
        const original = buildComparable(category);
        const update = Object.fromEntries(
          Object.entries(values).filter(([key, value]) => key !== 'categoryType' && value !== original[key])
        ) as UpdateStoreCategoryRequest;
        if (Object.keys(update).length === 0) {
          toast.info('변경된 내용이 없습니다.');
          return;
        }
        const response = await storeCategoryApi.updateStoreCategory(category.categoryId, update);
        if (!response.ok) return;
        toast.success('가게 카테고리가 수정되었습니다.');
      } else {
        const response = await storeCategoryApi.createStoreCategory(values);
        if (!response.ok) return;
        toast.success('가게 카테고리가 등록되었습니다.');
      }
      onSuccess();
      onHide();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={() => !isSubmitting && !isUploading && onHide()} size="lg" centered scrollable
           className="app-modal" backdrop={isSubmitting || isUploading ? 'static' : true}>
      <Modal.Header closeButton>
        <div className="min-w-0">
          <Modal.Title>
            <i className="bi bi-grid-3x3-gap"/>
            카테고리 {isEdit ? '수정' : '등록'}
          </Modal.Title>
          {isEdit && <p className="app-modal__subtitle font-monospace">{category?.categoryId}</p>}
        </div>
      </Modal.Header>
      <Modal.Body>
        <form id={FORM_ID} onSubmit={handleSubmit}>
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-info-circle"/>
              기본 정보
            </h3>
            <div className="row g-3">
              <Field col="col-md-6" label="카테고리 타입" required error={errors.categoryType}>
                {isEdit ? (
                  <input className="form-control" value={form.categoryType} disabled/>
                ) : (
                  <>
                    <select
                      className="form-select"
                      value={isCustomFoodType ? '__CUSTOM__' : form.categoryType}
                      disabled={isSubmitting || isFoodTypeLoading}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsCustomFoodType(true);
                          setField('categoryType', '');
                          return;
                        }
                        const selected = foodTypeOptions.find((option) => option.key === e.target.value);
                        setIsCustomFoodType(false);
                        setForm((current) => ({
                          ...current,
                          categoryType: e.target.value,
                          name: selected?.description || current.name
                        }));
                        setErrors((current) => ({...current, categoryType: '', name: ''}));
                      }}
                    >
                      {isFoodTypeLoading && <option value="">불러오는 중...</option>}
                      {foodTypeOptions.map((option) => (
                        <option key={option.key} value={option.key}>{option.description}</option>
                      ))}
                      <option value="__CUSTOM__">직접 입력</option>
                    </select>
                    {isCustomFoodType && (
                      <input
                        className={`form-control mt-2 ${errors.categoryType ? 'is-invalid' : ''}`}
                        value={form.categoryType}
                        onChange={(e) => setField('categoryType', e.target.value)}
                        placeholder="FoodType enum 이름 (예: BUNGEOPPANG)"
                        disabled={isSubmitting}
                        autoFocus
                      />
                    )}
                    {!isFoodTypeLoading && foodTypeOptions.length === 0 && (
                      <div className="form-text text-warning">
                        {hasFoodTypeOptions
                          ? '등록 가능한 FoodType이 없습니다. 모든 FoodType이 이미 카테고리로 등록되어 있습니다.'
                          : 'FoodType 목록을 불러오지 못해 직접 입력으로 전환되었습니다.'}
                      </div>
                    )}
                    {!isFoodTypeLoading && !isCustomFoodType && foodTypeOptions.length > 0 && (
                      <div className="form-text">이미 등록된 카테고리는 선택지에서 제외됩니다.</div>
                    )}
                  </>
                )}
              </Field>
              <Field col="col-md-6" label="카테고리명" required error={errors.name}>
                <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} maxLength={50}
                       onChange={(e) => setField('name', e.target.value)} disabled={isSubmitting}/>
              </Field>
              <Field label="노출 문구" required error={errors.description}>
                <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} value={form.description} maxLength={100}
                          rows={2} placeholder="예: 붕어빵 만나기 30초 전"
                          onChange={(e) => setField('description', e.target.value)} disabled={isSubmitting}/>
                <div className="d-flex justify-content-between gap-2">
                  <span className="form-text">앱에서 사용자에게 보이는 문구입니다.</span>
                  <span className="form-text flex-shrink-0">{form.description.length}/100</span>
                </div>
              </Field>
              <Field col="col-md-6" label="분류" required>
                <select className="form-select" value={form.classificationType} onChange={(e) => setField('classificationType', e.target.value)} disabled={isSubmitting}>
                  {STORE_CATEGORY_CLASSIFICATIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
              <Field col="col-md-3" label="뱃지 설정" required>
                <select className="form-select" value={form.metaType} onChange={(e) => setField('metaType', e.target.value)} disabled={isSubmitting}>
                  <option value="DEFAULT">없음</option><option value="NEW">NEW</option>
                </select>
              </Field>
              <Field col="col-md-3" label="표시 순서" error={errors.displayOrder}>
                <input type="number" step="any" className={`form-control ${errors.displayOrder ? 'is-invalid' : ''}`} value={form.displayOrder}
                       onChange={(e) => setField('displayOrder', e.target.value)} placeholder="미노출" disabled={isSubmitting}/>
              </Field>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-image"/>
              카테고리 아이콘
            </h3>
            <p className="form-text mt-0 mb-3">앱 필터에 노출되는 아이콘입니다. 선택 상태에 따라 활성/비활성 이미지가 바뀝니다.</p>
            <div className="row g-3">
              <ImageUrlField
                field="imageUrl" label="활성 이미지" error={errors.imageUrl} value={form.imageUrl}
                onChange={setField} onFileChange={handleFileChange}
                uploadingField={uploadingField} isSubmitting={isSubmitting}
                sampleUrl={sampleCategory?.imageUrl}
              />
              <ImageUrlField
                field="disableImageUrl" label="비활성 이미지" error={errors.disableImageUrl} value={form.disableImageUrl}
                onChange={setField} onFileChange={handleFileChange}
                uploadingField={uploadingField} isSubmitting={isSubmitting}
                sampleUrl={sampleCategory?.disableImageUrl}
              />
            </div>
          </div>
          <div className="modal-section">
            <h3 className="modal-section__title">
              <i className="bi bi-geo-alt"/>
              상태별 마커 이미지
            </h3>
            <p className="form-text mt-0 mb-3">
              지도에 표시되는 마커입니다. 가게 상태별로 선택/미선택 이미지를 모두 등록해야 합니다.
              {sampleCategory && <> 흐린 썸네일은 <strong>{sampleCategory.name}</strong> 카테고리의 예시이며 제출값에는 영향을 주지 않습니다.</>}
            </p>

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
                  <ImageUrlField
                    field={group.focused} label="선택" error={errors[group.focused]} value={form[group.focused]}
                    onChange={setField} onFileChange={handleFileChange}
                    uploadingField={uploadingField} isSubmitting={isSubmitting}
                    sampleUrl={sampleCategory?.[group.focused]}
                  />
                  <ImageUrlField
                    field={group.unfocused} label="미선택" error={errors[group.unfocused]} value={form[group.unfocused]}
                    onChange={setField} onFileChange={handleFileChange}
                    uploadingField={uploadingField} isSubmitting={isSubmitting}
                    sampleUrl={sampleCategory?.[group.unfocused]}
                  />
                </div>
              </div>
            ))}
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-secondary" onClick={onHide} disabled={isSubmitting || isUploading}>취소</button>
        <button type="submit" form={FORM_ID} className="btn btn-primary" disabled={isSubmitting || isUploading}>
          {isSubmitting && <span className="spinner-border spinner-border-sm me-1"/>}
          {isUploading ? '업로드 중...' : isEdit ? '수정' : '등록'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

const buildComparable = (category: StoreCategory): Record<string, unknown> => ({
  name: category.name,
  description: category.description,
  imageUrl: category.imageUrl,
  disableImageUrl: category.disableImageUrl,
  ...Object.fromEntries(markerFields.map(([key]) => [key, category[key] ?? null])),
  classificationType: category.classification.type,
  metaType: category.metaType,
  displayOrder: category.displayOrder ?? null,
});

const Field = ({label, required, error, col = 'col-12', children}: {
  label: string; required?: boolean; error?: string; col?: string; children: React.ReactNode;
}) => <div className={col}><label className="form-label fw-semibold">{label}{required && <span className="text-danger ms-1">*</span>}</label>{children}{error && <div className="invalid-feedback d-block">{error}</div>}</div>;

const ImageUrlField = ({field, label, value, error, onChange, onFileChange, uploadingField, isSubmitting, sampleUrl}: {
  field: ImageField;
  label: string;
  value: string;
  error?: string;
  onChange: (name: ImageField, value: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, field?: string) => Promise<string | null>;
  uploadingField: ImageField | null;
  isSubmitting: boolean;
  sampleUrl?: string;
}) => {
  const isUploadingThis = uploadingField === field;
  const disabled = isSubmitting || uploadingField !== null;
  const currentValue = value.trim();

  return (
    <Field col="col-md-6" label={`${label} URL`} required error={error}>
      <div className="input-group">
        <input type="url" className={`form-control ${error ? 'is-invalid' : ''}`} value={value} maxLength={300}
               onChange={(e) => onChange(field, e.target.value)} disabled={disabled}/>
        <label className={`btn btn-outline-primary mb-0 ${disabled ? 'disabled' : ''}`}>
          {isUploadingThis
            ? <><span className="spinner-border spinner-border-sm me-1"/>업로드 중</>
            : <><i className="bi bi-upload me-1"/>파일 선택</>}
          <input type="file" accept="image/*" hidden disabled={disabled}
                 onChange={(e) => onFileChange(e, field)}/>
        </label>
      </div>
      {(currentValue || sampleUrl) && (
        <div className="asset-preview">
          {currentValue && <ImagePreview src={currentValue} label={label} caption="입력값"/>}
          {sampleUrl && <ImagePreview src={sampleUrl} label={`${label} 예시`} caption="예시" muted/>}
        </div>
      )}
    </Field>
  );
};

const ImagePreview = ({src, label, caption, muted}: {
  src: string;
  label: string;
  caption: string;
  muted?: boolean;
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => setHasError(false), [src]);

  if (hasError) {
    return (
      <div className="text-body-secondary small">
        <i className="bi bi-image me-1"/>이미지를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className={`asset-preview__item ${muted ? 'asset-preview__item--sample' : ''}`}>
      <img
        className="asset-preview__thumb"
        src={src}
        alt={`${label} 미리보기`}
        width={56}
        height={56}
        onError={() => setHasError(true)}
      />
      <div className="asset-preview__caption">{caption}</div>
    </div>
  );
};

export default StoreCategoryFormModal;
