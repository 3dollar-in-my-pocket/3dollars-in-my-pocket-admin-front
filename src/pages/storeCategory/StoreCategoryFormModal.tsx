import {FormEvent, useEffect, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeCategoryApi from '@/api/storeCategoryApi';
import enumApi from '@/api/enumApi';
import {
  CreateStoreCategoryRequest,
  STORE_CATEGORY_CLASSIFICATIONS,
  StoreCategory,
  StoreCategoryClassificationType,
  StoreCategoryMetaType,
  UpdateStoreCategoryRequest
} from '@/types/storeCategory';

const markerFields = [
  ['defaultMarkerImageFocusedUrl', '기본 선택 마커'],
  ['defaultMarkerImageUnfocusedUrl', '기본 미선택 마커'],
  ['recentlyActivityMarkerImageFocusedUrl', '최근 활동 선택 마커'],
  ['recentlyActivityMarkerImageUnfocusedUrl', '최근 활동 미선택 마커'],
  ['hasIssuableCouponMarkerImageFocusedUrl', '쿠폰 선택 마커'],
  ['hasIssuableCouponMarkerImageUnfocusedUrl', '쿠폰 미선택 마커'],
  ['verifiedStoreMarkerImageFocusedUrl', '인증 가게 선택 마커'],
  ['verifiedStoreMarkerImageUnfocusedUrl', '인증 가게 미선택 마커'],
] as const;

type MarkerField = typeof markerFields[number][0];
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
  const isEdit = !!category;

  useEffect(() => {
    if (show) {
      setForm(category ? fromCategory(category) : emptyForm());
      setErrors({});
      setIsCustomFoodType(false);
    }
  }, [show, category]);

  useEffect(() => {
    if (!show || category) return;
    let cancelled = false;
    setIsFoodTypeLoading(true);
    enumApi.getEnum().then((response) => {
      if (cancelled) return;
      const options = response?.ok && Array.isArray(response.data?.FoodType)
        ? response.data.FoodType as FoodTypeOption[]
        : [];
      setFoodTypeOptions(options);
      if (options.length === 0) {
        setIsCustomFoodType(true);
        return;
      }
      setForm((current) => ({
        ...current,
        categoryType: current.categoryType || options[0].key,
        name: current.name || options[0].description
      }));
    }).finally(() => {
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
    if (!form.categoryType.trim()) next.categoryType = 'FoodType enum 이름을 입력해주세요.';
    if (!form.name.trim()) next.name = '카테고리명을 입력해주세요.';
    if (form.name.trim().length > 50) next.name = '카테고리명은 50자 이하여야 합니다.';
    if (!form.description.trim()) next.description = '설명을 입력해주세요.';
    if (form.description.trim().length > 100) next.description = '설명은 100자 이하여야 합니다.';

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
    if (!validate() || isSubmitting) return;
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
    <Modal show={show} onHide={() => !isSubmitting && onHide()} size="lg" centered scrollable>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton><Modal.Title className="fs-6 fw-bold">카테고리 {isEdit ? '수정' : '등록'}</Modal.Title></Modal.Header>
        <Modal.Body>
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
                      FoodType 목록을 불러오지 못해 직접 입력으로 전환되었습니다.
                    </div>
                  )}
                </>
              )}
            </Field>
            <Field col="col-md-6" label="카테고리명" required error={errors.name}>
              <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={form.name} maxLength={50}
                     onChange={(e) => setField('name', e.target.value)} disabled={isSubmitting}/>
            </Field>
            <Field label="설명" required error={errors.description}>
              <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} value={form.description} maxLength={100}
                        onChange={(e) => setField('description', e.target.value)} disabled={isSubmitting}/>
            </Field>
            <Field col="col-md-6" label="분류" required>
              <select className="form-select" value={form.classificationType} onChange={(e) => setField('classificationType', e.target.value)} disabled={isSubmitting}>
                {STORE_CATEGORY_CLASSIFICATIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field col="col-md-3" label="메타 타입" required>
              <select className="form-select" value={form.metaType} onChange={(e) => setField('metaType', e.target.value)} disabled={isSubmitting}>
                <option value="DEFAULT">기본</option><option value="NEW">최신 카테고리</option>
              </select>
            </Field>
            <Field col="col-md-3" label="표시 순서" error={errors.displayOrder}>
              <input type="number" step="any" className={`form-control ${errors.displayOrder ? 'is-invalid' : ''}`} value={form.displayOrder}
                     onChange={(e) => setField('displayOrder', e.target.value)} placeholder="미노출" disabled={isSubmitting}/>
            </Field>
            <Field col="col-md-6" label="활성 이미지 URL" required error={errors.imageUrl}>
              <input type="url" className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`} value={form.imageUrl} maxLength={300}
                     onChange={(e) => setField('imageUrl', e.target.value)} disabled={isSubmitting}/>
              {isEdit && form.imageUrl.trim() && (
                <ImagePreview src={form.imageUrl.trim()} label="활성 이미지"/>
              )}
            </Field>
            <Field col="col-md-6" label="비활성 이미지 URL" required error={errors.disableImageUrl}>
              <input type="url" className={`form-control ${errors.disableImageUrl ? 'is-invalid' : ''}`} value={form.disableImageUrl} maxLength={300}
                     onChange={(e) => setField('disableImageUrl', e.target.value)} disabled={isSubmitting}/>
              {isEdit && form.disableImageUrl.trim() && (
                <ImagePreview src={form.disableImageUrl.trim()} label="비활성 이미지"/>
              )}
            </Field>
            <div className="col-12"><hr/><h6 className="fw-bold mb-0">상태별 마커 이미지 <span className="text-danger">*</span></h6></div>
            {markerFields.map(([key, label]) => (
              <Field key={key} col="col-md-6" label={label} required error={errors[key]}>
                <input type="url" className={`form-control ${errors[key] ? 'is-invalid' : ''}`} value={form[key]} maxLength={300}
                       onChange={(e) => setField(key, e.target.value)} disabled={isSubmitting}/>
                {isEdit && form[key].trim() && (
                  <ImagePreview src={form[key].trim()} label={label}/>
                )}
              </Field>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={onHide} disabled={isSubmitting}>취소</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner-border spinner-border-sm me-1"/>}{isEdit ? '수정' : '등록'}
          </button>
        </Modal.Footer>
      </form>
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

const ImagePreview = ({src, label}: {src: string; label: string}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => setHasError(false), [src]);

  return (
    <div className="mt-2 p-2 border rounded bg-body-tertiary d-flex align-items-center gap-2">
      {hasError ? (
        <div className="text-body-secondary small">
          <i className="bi bi-image me-1"/>이미지를 불러올 수 없습니다.
        </div>
      ) : (
        <>
          <img
            src={src}
            alt={`${label} 미리보기`}
            width={56}
            height={56}
            style={{objectFit: 'contain'}}
            onError={() => setHasError(true)}
          />
          <span className="text-body-secondary small">미리보기</span>
        </>
      )}
    </div>
  );
};

export default StoreCategoryFormModal;
