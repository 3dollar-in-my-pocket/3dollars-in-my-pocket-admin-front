import React, {useEffect, useState} from 'react';
import storeApi from '@/api/storeApi';
import HistoryPanel from '@/components/common/HistoryPanel';
import {StorePreferenceSetting} from '@/types/store';

interface StoreSettingsProps {
  storeId: string;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({storeId}) => {
  const [settings, setSettings] = useState<StorePreferenceSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError('설정 정보를 불러오는데 실패했습니다.');
        return;
      }

      setSettings(response.data?.settings || []);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (value: unknown): string => {
    if (typeof value === 'boolean') {
      return value ? '활성화' : '비활성화';
    }
    return String(value);
  };

  const getValueBadgeClass = (value: unknown): string => {
    if (typeof value === 'boolean') {
      return value ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis';
    }
    return 'bg-primary-subtle text-primary-emphasis';
  };

  return (
    <HistoryPanel
      title="가게 설정"
      icon="bi-gear"
      count={settings.length}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchSettings}
      emptyTitle="설정 정보가 없습니다"
      emptyDescription="등록된 설정이 없어요."
    >
      <div className="row g-2">
        {settings.map((setting, index) => (
          <div key={setting.code || index} className="col-12">
            <div className="item-card">
              <div className="item-card__body">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="item-card__name font-monospace">{setting.code}</h4>
                  <span className={`badge ${getValueBadgeClass(setting.value)}`}>
                    {formatValue(setting.value)}
                  </span>
                </div>
                <p className="item-card__desc mb-0">{setting.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </HistoryPanel>
  );
};

export default StoreSettings;
