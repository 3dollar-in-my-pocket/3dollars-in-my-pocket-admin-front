import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * Modal Form Hook
 * 모달 폼의 상태 관리, validation, submission을 처리하는 훅
 *
 * @template T - 폼 데이터 타입
 */
interface UseModalFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<any>;
  onSuccess?: () => void;
  validate?: (values: T) => Record<string, string>;
  resetOnSuccess?: boolean;
}

interface UseModalFormReturn<T> {
  formData: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  clearErrors: () => void;
}

/**
 * useModalForm Hook
 *
 * @example
 * const { formData, errors, isSubmitting, handleChange, handleSubmit } = useModalForm({
 *   initialValues: { email: '', name: '' },
 *   validate: (values) => {
 *     const errors: any = {};
 *     if (!values.email) errors.email = '이메일은 필수입니다.';
 *     return errors;
 *   },
 *   onSubmit: async (values) => await api.create(values),
 *   onSuccess: () => { toast.success('등록 완료'); onHide(); }
 * });
 */
export const useModalForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  onSuccess,
  validate,
  resetOnSuccess = true
}: UseModalFormOptions<T>): UseModalFormReturn<T> => {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 폼 필드 변경 핸들러
   */
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * 특정 필드 값 설정
   */
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 해당 필드의 에러 제거
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * 특정 필드 에러 설정
   */
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  /**
   * 모든 에러 제거
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation 수행
    if (validate) {
      const validationErrors = validate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await onSubmit(formData);

      // API 응답 체크 (ok 속성이 있는 경우)
      if (response && 'ok' in response && !response.ok) {
        if (response.message) {
          toast.error(response.message);
        }
        return;
      }

      // 성공 콜백 실행
      if (onSuccess) {
        onSuccess();
      }

      // 성공 시 폼 리셋
      if (resetOnSuccess) {
        setFormData(initialValues);
        setErrors({});
      }
    } catch (error: any) {
      // 에러 처리
      const errorMessage = error?.response?.data?.message || error?.message || '오류가 발생했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate, onSubmit, onSuccess, resetOnSuccess, initialValues]);

  /**
   * 폼 리셋
   */
  const resetForm = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    setFieldValue,
    setFieldError,
    clearErrors
  };
};

export default useModalForm;
