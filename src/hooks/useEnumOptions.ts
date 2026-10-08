import {useEffect, useState} from 'react';
import enumApi from '@/api/enumApi';
import {EnumLabels} from '@/utils/sectionConfigUtils';

export interface EnumSelectOption {
  value: string;
  label: string;
}

type RawEnumOption = Record<string, any>;

/** 전체 enum 응답은 화면 안에서 여러 컴포넌트가 함께 쓰므로 한 번만 조회합니다. 실패하면 다음 호출에서 다시 조회합니다. */
let enumCache: Promise<Record<string, RawEnumOption[]>> | null = null;

const loadEnums = (): Promise<Record<string, RawEnumOption[]>> => {
  if (!enumCache) {
    enumCache = enumApi.getEnum()
      .then((response) => {
        if (!response?.ok || !response.data) throw new Error('enum 조회 실패');
        return response.data;
      })
      .catch((error) => {
        enumCache = null;
        throw error;
      });
  }
  return enumCache;
};

const toSelectOption = (option: RawEnumOption): EnumSelectOption => {
  const value = option.key ?? option.name ?? option.value ?? option.type ?? '';
  return {value, label: option.description || option.displayName || value};
};

/** enumApi 응답에서 enumName에 해당하는 선택지를 조회합니다. */
const useEnumOptions = (enumName?: string) => {
  const [options, setOptions] = useState<EnumSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!enumName) return;
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    loadEnums()
      .then((enums) => {
        if (!cancelled) setOptions((enums[enumName] ?? []).map(toSelectOption));
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enumName]);

  return {options, isLoading, isError};
};

/** 여러 enum의 값 → 표시명 맵을 조회합니다. 조회 전이나 실패 시에는 빈 맵입니다. */
export const useEnumLabels = (enumNames: string[]): EnumLabels => {
  const [labels, setLabels] = useState<EnumLabels>({});
  const namesKey = enumNames.join(',');

  useEffect(() => {
    if (!namesKey) return;
    let cancelled = false;
    loadEnums()
      .then((enums) => {
        if (cancelled) return;
        const next: EnumLabels = {};
        namesKey.split(',').forEach((enumName) => {
          next[enumName] = Object.fromEntries(
            (enums[enumName] ?? []).map(toSelectOption).map((option) => [option.value, option.label])
          );
        });
        setLabels(next);
      })
      .catch(() => {
        // 표시명은 보조 정보라 실패해도 원래 값으로 보여줍니다. 오류 안내는 설정 입력란에서 합니다.
      });
    return () => {
      cancelled = true;
    };
  }, [namesKey]);

  return labels;
};

export default useEnumOptions;
