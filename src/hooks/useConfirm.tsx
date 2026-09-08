import React, {createContext, useCallback, useContext, useRef, useState} from 'react';
import ConfirmModal, {ConfirmOptions} from '@/components/common/ConfirmModal';

/**
 * 확인 요청 함수.
 * @returns 사용자가 확인을 누르면 true, 취소/닫기면 false
 */
type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * 확인 모달 Provider
 *
 * 앱 최상단에 한 번만 배치하면 하위 어디서든 `useConfirm()`으로 확인 모달을 띄울 수 있습니다.
 * `window.confirm` 대신 이 Provider를 사용하세요.
 */
export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((result: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((nextOptions) => {
    // 이전 요청이 남아 있으면 취소로 정리하고 새 요청을 받습니다.
    resolverRef.current?.(false);

    setOptions(nextOptions);
    return new Promise<boolean>(resolve => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmModal
          show
          {...options}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
};

/**
 * 확인 모달 훅
 *
 * ```tsx
 * const confirm = useConfirm();
 *
 * const handleDelete = async () => {
 *   if (!await confirm({message: '삭제하시겠습니까?', variant: 'danger', irreversible: true})) return;
 *   // 삭제 진행
 * };
 * ```
 */
export const useConfirm = (): ConfirmFn => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error('useConfirm은 ConfirmProvider 내부에서만 사용할 수 있습니다.');
  }
  return confirm;
};

export default useConfirm;
