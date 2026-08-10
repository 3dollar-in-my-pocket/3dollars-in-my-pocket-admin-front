import React, {useEffect, useState} from 'react';
import enumApi from "@/api/enumApi";
import cacheToolApi from "@/api/cacheToolApi";
import {toast} from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";

const CacheTools = () => {
  const [cacheTypes, setCacheTypes] = useState([]);
  const [selectedCacheType, setSelectedCacheType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const evictCaches = async () => {
    if (!selectedCacheType) {
      setErrorMessage('캐시 타입을 선택해주세요.');
      return;
    }

    if (!window.confirm('정말로 캐시를 제거하겠습니까?')) return;

    try {
      setIsLoading(true);
      const response = await cacheToolApi.evictAll(selectedCacheType);
      if (response.ok) {
        toast.success('캐시가 성공적으로 제거되었습니다.');
        setSelectedCacheType('');
        setErrorMessage('');
      }
    } catch (error: any) {
      if (error.response) {
        // HTTP 에러 (인터셉터가 toast까지 처리)
        setErrorMessage(error.response.data?.message || '예상치 못한 오류가 발생했습니다.');
      } else if (error.request) {
        setErrorMessage('서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMessage(error.message || '예상치 못한 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectedCache = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCacheType(e.target.value);
    setErrorMessage('');
  };

  useEffect(() => {
    enumApi.getEnum().then((response) => {
      if (response.ok) {
        setCacheTypes(response.data['CacheType']);
      }
    });
  }, []);

  const selectedDescription = cacheTypes.find((type) => type.key === selectedCacheType)?.description;

  return (
    <div>
      <PageHeader description="선택한 캐시 타입의 모든 항목을 즉시 만료 처리합니다. 트래픽이 많은 시간대에는 주의해서 사용하세요."/>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-7">
          <SectionCard title="캐시 만료" icon="bi-eraser-fill">
            {errorMessage && (
              <div className="alert alert-danger py-2" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="form-field">
              <label className="form-field__label" htmlFor="cache-type">
                <i className="bi bi-box-seam"/>
                캐시 타입
                <span className="form-required">*</span>
              </label>
              <select
                id="cache-type"
                className="form-select"
                value={selectedCacheType}
                onChange={handleSelectedCache}
              >
                <option value="">캐시 타입을 선택하세요</option>
                {cacheTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.description}
                  </option>
                ))}
              </select>
              <p className="form-field__hint">
                {selectedCacheType
                  ? `"${selectedDescription}" 캐시의 모든 항목이 삭제됩니다.`
                  : '만료시킬 캐시 타입을 먼저 선택하세요.'}
              </p>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-danger"
                onClick={evictCaches}
                disabled={!selectedCacheType || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                    처리 중...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3 me-1"/>
                    캐시 만료
                  </>
                )}
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default CacheTools;
