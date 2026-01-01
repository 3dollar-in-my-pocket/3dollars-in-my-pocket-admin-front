import {useEffect, useState} from "react";
import RegistrationModal from "./RegistrationModal";
import registrationApi from "../../api/registrationApi";
import Loading from "../../components/common/Loading";
import {getOsPlatformDisplayName, getOsPlatformBadgeClass, getOsPlatformIcon} from "../../types/registration";

const RegistrationManagement = () => {
  const [registrationList, setRegistrationList] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = () => {
    setIsLoading(true);
    registrationApi.listRegistrations({size: 30})
      .then((response) => {
        if (!response.ok) {
          return
        }
        setRegistrationList(response.data.contents);
      }).finally(() => {
      setIsLoading(false);
    });
  };

  const handleRegistrationUpdate = () => {
    fetchRegistrations();
    setSelectedRegistration(null);
  };

  return (
    <div className="container-fluid py-4">
      <style>{`
        .cert-image-responsive {
          height: 80px !important;
        }
        .cert-placeholder-responsive {
          height: 80px !important;
        }
        @media (min-width: 768px) {
          .cert-image-responsive {
            height: 120px !important;
          }
          .cert-placeholder-responsive {
            height: 120px !important;
          }
        }
        @media (min-width: 992px) {
          .cert-image-responsive {
            height: 140px !important;
          }
          .cert-placeholder-responsive {
            height: 140px !important;
          }
        }
        .cert-image-responsive {
          transition: transform 0.2s ease;
          cursor: pointer;
        }
        .cert-image-responsive:hover {
          transform: scale(1.02);
        }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h2 className="fw-bold">📝 가입 신청 관리</h2>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <button className="btn btn-primary" onClick={fetchRegistrations}>
            🔍 새로고침
          </button>
        </div>
      </div>

      {/* 카드 레이아웃 (모든 화면) */}
      <div>
        {isLoading ? (
          <div className="text-center py-5">
            <Loading/>
          </div>
        ) : registrationList.length === 0 ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-circle mx-auto mb-3" style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-person-plus fs-1 text-secondary"></i>
            </div>
            <h5 className="text-muted">등록된 가입 신청이 없습니다</h5>
            <p className="text-muted small">새로운 가입 신청을 기다리고 있습니다.</p>
          </div>
        ) : (
          <div className="row g-2 g-md-3">
            {registrationList.map((reg) => (
              <div key={reg.registrationId} className="col-12 col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-start mb-2 mb-md-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2 me-md-3">
                          <i className="bi bi-person-fill text-primary" style={{fontSize: '1rem'}}></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold" style={{fontSize: '1rem'}}>
                            {reg.boss.name}
                          </h6>
                          <small className="text-muted" style={{fontSize: '0.75rem'}}>
                            {reg.boss.socialType}
                          </small>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setSelectedRegistration(reg)}
                        style={{fontSize: '0.8rem', padding: '6px 12px'}}
                      >
                        <i className="bi bi-eye me-1"></i>
                        <span className="d-none d-sm-inline">상세 보기</span>
                        <span className="d-inline d-sm-none">상세</span>
                      </button>
                    </div>

                    {/* 인증 사진 */}
                    {reg.store.certificationPhotoUrl && (
                      <div className="mb-2 mb-md-3 position-relative">
                        <img
                          src={reg.store.certificationPhotoUrl}
                          alt={`${reg.store.name} 인증 사진`}
                          className="img-fluid rounded cert-image-responsive"
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'contain',
                            border: '1px solid #e9ecef',
                            backgroundColor: '#f8f9fa'
                          }}
                          onClick={() => setSelectedRegistration(reg)}
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          className="d-none position-absolute top-0 start-0 w-100 h-100 align-items-center justify-content-center bg-light rounded border cert-placeholder-responsive"
                        >
                          <div className="text-center text-muted">
                            <i className="bi bi-image fs-3 mb-1"></i>
                            <div style={{fontSize: '0.7rem'}}>이미지 로드 실패</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 인증 사진이 없는 경우 플레이스홀더 */}
                    {!reg.store.certificationPhotoUrl && (
                      <div className="mb-2 mb-md-3">
                        <div
                          className="d-flex align-items-center justify-content-center bg-light rounded border cert-placeholder-responsive"
                          style={{height: '80px'}}
                        >
                          <div className="text-center text-muted">
                            <i className="bi bi-shield-check fs-4 mb-1"></i>
                            <div style={{fontSize: '0.7rem'}}>인증 사진 없음</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-2 mb-md-3">
                      <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>가게명</small>
                      <h6 className="mb-1 fw-semibold" style={{fontSize: '0.95rem', lineHeight: '1.3'}}>
                        {reg.store.name}
                      </h6>
                    </div>

                    <div className="mb-2 mb-md-3">
                      <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>사업자번호</small>
                      <span className="badge bg-secondary" style={{fontSize: '0.7rem', fontFamily: 'monospace'}}>
                        {reg.boss.businessNumber}
                      </span>
                    </div>

                    <div className="mb-2 mb-md-3">
                      <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>카테고리</small>
                      <div className="d-flex flex-wrap gap-1">
                        {reg.store.categories.slice(0, window.innerWidth >= 768 ? 3 : 2).map((category, idx) => (
                          <span key={idx} className="badge bg-info bg-opacity-10 text-info border border-info"
                                style={{fontSize: '0.65rem'}}>
                            {category}
                          </span>
                        ))}
                        {reg.store.categories.length > (window.innerWidth >= 768 ? 3 : 2) && (
                          <span className="badge bg-light text-muted border" style={{fontSize: '0.65rem'}}>
                            +{reg.store.categories.length - (window.innerWidth >= 768 ? 3 : 2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {reg.context && (
                      <div className="mb-2 mb-md-3">
                        <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>신청 환경</small>
                        <div className="d-flex flex-wrap gap-1">
                          <span className={`badge ${getOsPlatformBadgeClass(reg.context.osPlatform)}`}
                                style={{fontSize: '0.65rem'}}>
                            <i className={`bi ${getOsPlatformIcon(reg.context.osPlatform)} me-1`}></i>
                            {getOsPlatformDisplayName(reg.context.osPlatform)}
                          </span>
                          {reg.context.appVersion && (
                            <span className="badge bg-dark" style={{fontSize: '0.65rem', fontFamily: 'monospace'}}>
                              v{reg.context.appVersion}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>신청일</small>
                        <small className="fw-semibold" style={{fontSize: '0.75rem'}}>
                          {new Date(reg.createdAt).toLocaleDateString('ko-KR')}
                        </small>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning"
                              style={{fontSize: '0.7rem'}}>
                          <i className="bi bi-clock-history me-1"></i>대기중
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      <RegistrationModal
        show={!!selectedRegistration}
        onHide={handleRegistrationUpdate}
        registration={selectedRegistration}
      />
    </div>
  );
};

export default RegistrationManagement;
