import { useState, useEffect } from 'react';
import storeApi from '../api/storeApi';

const StoreSettings = ({ storeId }) => {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storeId) {
      fetchSettings();
    }
  }, [storeId]);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await storeApi.getStorePreference(storeId);

      if (!response.ok) {
        throw new Error('설정 정보를 불러오는데 실패했습니다.');
      }

      setSettings(response.data.settings || []);
    } catch (error) {
      console.error('가게 설정 조회 실패:', error);
      const errorMessage = error.response?.status
        ? `서버 오류가 발생했습니다. (${error.response.status})`
        : '설정 정보를 불러오는데 실패했습니다. 인터넷 연결을 확인해주세요.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? '활성화' : '비활성화';
    }
    return String(value);
  };

  const getValueBadgeClass = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'bg-success' : 'bg-secondary';
    }
    return 'bg-primary';
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <div className="mb-3">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <h5 className="text-dark mb-1">설정 정보를 불러오는 중...</h5>
          <p className="text-muted">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-5 text-danger">
          <div className="mb-4">
            <div className="bg-danger bg-opacity-10 rounded-circle mx-auto" style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
            </div>
          </div>
          <h5 className="text-dark mb-2">오류가 발생했습니다</h5>
          <p className="text-muted mb-3">{error}</p>
          <button
            className="btn btn-outline-primary rounded-pill px-4"
            onClick={() => fetchSettings()}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <div className="bg-light rounded-circle mx-auto mb-3"
               style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-gear fs-1 text-secondary"></i>
          </div>
          <h5 className="text-dark mb-2">설정 정보가 없습니다</h5>
          <p className="text-muted">등록된 설정이 없어요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-warning bg-opacity-10 rounded-circle p-2">
            <i className="bi bi-gear text-warning"></i>
          </div>
          <h5 className="mb-0 fw-bold text-dark">가게 설정</h5>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm rounded-pill"
          onClick={() => fetchSettings()}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          새로고침
        </button>
      </div>

      <div className="row g-3">
        {settings.map((setting, index) => (
          <div key={setting.code || index} className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-start justify-content-between">
                  <div className="flex-grow-1 me-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h6 className="mb-0 fw-bold text-dark">{setting.code}</h6>
                      <span className={`badge ${getValueBadgeClass(setting.value)} rounded-pill px-3 py-1`}>
                        {formatValue(setting.value)}
                      </span>
                    </div>
                    <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                      {setting.description}
                    </p>
                  </div>
                  <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                    <i className="bi bi-gear text-warning"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreSettings;