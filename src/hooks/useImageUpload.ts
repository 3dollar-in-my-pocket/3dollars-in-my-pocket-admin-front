import {useCallback, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import uploadApi from '@/api/uploadApi';

/** 서버에서 허용하는 이미지 타입 */
export type ImageUploadType =
  | 'ADVERTISEMENT_IMAGE'
  | 'MEDAL_IMAGE'
  | 'PUSH_IMAGE'
  | 'STORE_IMAGE';

/** 업로드 기본 최대 크기 (MB) */
const DEFAULT_MAX_SIZE_MB = 10;

export interface UseImageUploadConfig {
  /** 업로드할 이미지 종류 */
  imageType: ImageUploadType;
  /** 최대 허용 크기 (MB). 기본 10MB */
  maxSizeMB?: number;
  /**
   * 업로드 성공 시 호출됩니다. 업로드된 이미지 URL이 전달됩니다.
   * 필드가 여러 개인 화면은 `upload(file, field)`의 field로 구분하세요.
   */
  onUploaded?: (url: string, field?: string) => void;
  /**
   * 검증/업로드 실패 시 호출됩니다. 지정하지 않으면 toast.error로 알립니다.
   * 폼 내부에 에러를 표시하는 화면(예: setErrorMessage)에서 사용하세요.
   */
  onError?: (message: string) => void;
  /** 성공 토스트 메시지. null이면 토스트를 띄우지 않습니다. */
  successMessage?: string | null;
}

export interface UseImageUploadResult {
  /**
   * 파일을 검증한 뒤 업로드합니다.
   * @param field 업로드 대상 필드명 (이미지 입력이 여러 개인 화면에서 사용)
   * @returns 업로드된 URL, 실패 시 null
   */
  upload: (file: File, field?: string) => Promise<string | null>;
  /** input[type=file]의 onChange에 바로 연결할 수 있는 핸들러 */
  handleFileChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    field?: string
  ) => Promise<string | null>;
  /** 업로드 중 여부 */
  isUploading: boolean;
  /** 업로드 중인 필드명 (field를 넘긴 경우). 그 외에는 null */
  uploadingField: string | null;
}

/**
 * 이미지 업로드 공통 훅
 *
 * 파일 타입/크기 검증, 업로드 요청, 로딩 상태, input 초기화를 한곳에서 처리합니다.
 * 화면마다 검증이 누락되거나 규칙이 어긋나는 것을 막기 위해 업로드는 이 훅을 사용하세요.
 */
export const useImageUpload = ({
                                 imageType,
                                 maxSizeMB = DEFAULT_MAX_SIZE_MB,
                                 onUploaded,
                                 onError,
                                 successMessage = '이미지가 업로드되었습니다.'
                               }: UseImageUploadConfig): UseImageUploadResult => {
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 동시 업로드로 상태가 어긋나는 것을 방지
  const isUploadingRef = useRef(false);

  const notifyError = useCallback((message: string) => {
    if (onError) {
      onError(message);
    } else {
      toast.error(message);
    }
  }, [onError]);

  const upload = useCallback(async (file: File, field?: string): Promise<string | null> => {
    if (isUploadingRef.current) return null;

    if (!file.type.startsWith('image/')) {
      notifyError('이미지 파일만 업로드 가능합니다.');
      return null;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      notifyError(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
      return null;
    }

    isUploadingRef.current = true;
    setIsUploading(true);
    setUploadingField(field ?? null);

    try {
      const response = await uploadApi.uploadImage(imageType, file);

      if (!response?.ok || !response.data) {
        notifyError(response?.message || '이미지 업로드에 실패했습니다.');
        return null;
      }

      onUploaded?.(response.data, field);
      if (successMessage) {
        toast.success(successMessage);
      }
      return response.data;
    } catch (error) {
      notifyError('이미지 업로드 중 오류가 발생했습니다.');
      return null;
    } finally {
      isUploadingRef.current = false;
      setIsUploading(false);
      setUploadingField(null);
    }
  }, [imageType, maxSizeMB, notifyError, onUploaded, successMessage]);

  const handleFileChange = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    field?: string
  ): Promise<string | null> => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return null;

    try {
      return await upload(file, field);
    } finally {
      // 같은 파일을 다시 선택해도 onChange가 발생하도록 초기화
      input.value = '';
    }
  }, [upload]);

  return {
    upload,
    handleFileChange,
    isUploading,
    uploadingField
  };
};

export default useImageUpload;
