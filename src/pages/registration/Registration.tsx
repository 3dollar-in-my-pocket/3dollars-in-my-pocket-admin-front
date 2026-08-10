import {useEffect, useState} from "react";
import registrationApi from "@/api/registrationApi";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import {getOsPlatformBadgeClass, getOsPlatformDisplayName, getOsPlatformIcon} from '@/utils/display/deviceDisplay';
import RegistrationModal from "./RegistrationModal";
import {BossRegistration} from "@/types/registration";

/** 카드에 한 번에 노출하는 카테고리 개수 */
const VISIBLE_CATEGORIES = 3;

const RegistrationManagement = () => {
  const [registrationList, setRegistrationList] = useState<BossRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<BossRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await registrationApi.listRegistrations({size: 30});
      if (!response.ok) {
        return;
      }
      setRegistrationList(response.data.contents);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationUpdate = () => {
    fetchRegistrations();
    setSelectedRegistration(null);
  };

  return (
    <div>
      <PageHeader
        description="사장님 가입 신청 목록입니다. 카드를 눌러 인증 사진과 사업자 정보를 확인하고 승인·거부를 처리합니다."
        actions={
          <button className="btn btn-outline-primary" onClick={fetchRegistrations} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-1"/>
            새로고침
          </button>
        }
        meta={!isLoading && <span className="page-count">대기 {registrationList.length}건</span>}
      />

      <SectionCard title="가입 신청 목록" icon="bi-person-plus-fill">
        {isLoading ? (
          <Loading/>
        ) : registrationList.length === 0 ? (
          <EmptyState
            icon="bi-person-plus"
            title="등록된 가입 신청이 없습니다"
            description="새로운 가입 신청이 접수되면 이곳에 표시됩니다."
          />
        ) : (
          <div className="row g-3">
            {registrationList.map((reg) => (
              <div key={reg.registrationId} className="col-12 col-md-6 col-xl-4">
                <div className="item-card item-card--clickable h-100"
                     onClick={() => setSelectedRegistration(reg)}
                     role="button"
                     tabIndex={0}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         setSelectedRegistration(reg);
                       }
                     }}>
                  {reg.store.certificationPhotoUrl ? (
                    <img
                      src={reg.store.certificationPhotoUrl}
                      alt={`${reg.store.name} 인증 사진`}
                      className="registration-card__photo"
                    />
                  ) : (
                    <div className="registration-card__photo registration-card__photo--empty">
                      <i className="bi bi-shield-check"/>
                      <span>인증 사진 없음</span>
                    </div>
                  )}

                  <div className="item-card__body">
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div className="min-w-0">
                        <h3 className="item-card__name text-truncate">{reg.store.name}</h3>
                        <p className="item-card__desc mb-0">
                          {reg.boss.name} · {reg.boss.socialType}
                        </p>
                      </div>
                      <span className="badge text-warning-emphasis bg-warning-subtle flex-shrink-0">
                        <i className="bi bi-clock-history me-1"/>대기중
                      </span>
                    </div>

                    <div className="form-summary mt-3">
                      <div className="form-summary__row">
                        <span className="form-summary__label">사업자번호</span>
                        <span className="form-summary__value font-monospace">{reg.boss.businessNumber}</span>
                      </div>
                      <div className="form-summary__row">
                        <span className="form-summary__label">신청일</span>
                        <span className="form-summary__value">
                          {new Date(reg.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>

                    <div className="form-chips">
                      {reg.store.categories.slice(0, VISIBLE_CATEGORIES).map((category, idx) => (
                        <span key={idx} className="form-chip">{category}</span>
                      ))}
                      {reg.store.categories.length > VISIBLE_CATEGORIES && (
                        <span className="form-chip">
                          +{reg.store.categories.length - VISIBLE_CATEGORIES}
                        </span>
                      )}
                      {reg.context && (
                        <span className={`badge ${getOsPlatformBadgeClass(reg.context.osPlatform)}`}>
                          <i className={`bi ${getOsPlatformIcon(reg.context.osPlatform)} me-1`}/>
                          {getOsPlatformDisplayName(reg.context.osPlatform)}
                          {reg.context.appVersion && ` v${reg.context.appVersion}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <RegistrationModal
        show={!!selectedRegistration}
        onHide={handleRegistrationUpdate}
        registration={selectedRegistration}
      />
    </div>
  );
};

export default RegistrationManagement;
