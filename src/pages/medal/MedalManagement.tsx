import {useEffect, useState} from 'react';
import medalApi from "@/api/medalApi";
import {getAcquisitionDescription, hasAcquisition, Medal} from "@/types/medal";
import MedalModal from "./MedalModal";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";

const MedalManagement = () => {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null);

  const fetchMedals = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await medalApi.getMedals();

      if (response.ok) {
        setMedals(response.data.contents);
      } else {
        setErrorMessage(response.message || '메달 목록 조회에 실패했습니다.');
      }
    } catch (error: any) {
      if (!error.response) {
        setErrorMessage('서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMessage(error.response.data?.message || '예상치 못한 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedals();
  }, []);

  const handleModalClose = () => {
    setSelectedMedal(null);
  };

  const handleMedalUpdate = () => {
    fetchMedals();
    setSelectedMedal(null);
  };

  const renderBody = () => {
    if (isLoading && medals.length === 0) {
      return (
        <div className="py-5">
          <Loading/>
        </div>
      );
    }

    if (errorMessage) {
      return <ErrorState message={errorMessage} onRetry={fetchMedals}/>;
    }

    if (medals.length === 0) {
      return (
        <EmptyState
          icon="bi-award"
          title="등록된 메달이 없습니다"
          description="획득 조건을 갖춘 메달이 아직 없습니다."
        />
      );
    }

    return (
      <div className="row g-3">
        {medals.map((medal) => (
          <div key={medal.medalId} className="col-6 col-md-4 col-xl-3">
            <div
              className="item-card item-card--clickable"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedMedal(medal)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedMedal(medal);
                }
              }}
            >
              <div className="item-card__body text-center">
                <img
                  src={medal.iconUrl}
                  alt=""
                  className="mx-auto mb-2"
                  style={{width: '72px', height: '72px', objectFit: 'contain'}}
                  onError={(e: any) => {
                    e.target.src = medal.disableIconUrl;
                  }}
                />

                <p className="item-card__name">{medal.name}</p>
                <p className="item-card__desc">{medal.introduction}</p>

                <div className="mt-auto pt-2">
                  {hasAcquisition(medal) ? (
                    <div className="page-note text-start">
                      <i className="bi bi-trophy-fill"/>
                      <span>{getAcquisitionDescription(medal)}</span>
                    </div>
                  ) : (
                    <div className="page-note text-start">
                      <i className="bi bi-info-circle"/>
                      <span>기본 메달</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        description="유저에게 지급되는 메달의 아이콘과 획득 조건을 관리합니다. 메달을 선택하면 상세 정보를 수정할 수 있습니다."
        actions={
          <button className="btn btn-outline-secondary" onClick={fetchMedals} disabled={isLoading}>
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
            ) : (
              <i className="bi bi-arrow-clockwise me-1"/>
            )}
            {isLoading ? '조회 중...' : '새로고침'}
          </button>
        }
      />

      <SectionCard
        title="메달 목록"
        icon="bi-award-fill"
        aside={!isLoading && medals.length > 0 && <span className="page-count">총 {medals.length}개</span>}
      >
        {renderBody()}
      </SectionCard>

      <MedalModal
        show={!!selectedMedal}
        onHide={handleModalClose}
        medal={selectedMedal}
        onUpdate={handleMedalUpdate}
      />
    </div>
  );
};

export default MedalManagement;
