import {useEffect, useState} from "react";
import advertisementApi from "../../api/advertisementApi";
import enumApi from "../../api/enumApi";
import AdvertisementModal from "./AdvertisementModal";
import AdvertisementRegisterModal from "./AdvertisementRegisterModal";
import {formatDateTime} from "../../utils/dateUtils";
import cacheToolApi from "../../api/cacheToolApi";
import {toast} from "react-toastify";
import Loading from "../../components/common/Loading";
import AdTimer from "../../components/common/AdTimer";
import AdPreview from "../../components/advertisement/AdPreview";

const Advertisement = () => {
    const [advertisementList, setAdvertisementList] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [positions, setPositions] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const osPlatforms = [
      {key: "", description: "전체 플랫폼"},
      {key: "AOS", description: "안드로이드"},
      {key: "IOS", description: "iOS"},
    ];

    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };

    useEffect(() => {
      const today = new Date();
      const weekLater = new Date();
      weekLater.setDate(today.getDate() + 7);

      setStartDate(formatDate(today));
      setEndDate(formatDate(weekLater));

      enumApi.getEnum().then(response => {
        setPositions([{key: "", description: "전체 포지션"}, ...response.data["AdvertisementPosition"]]);
      });
    }, []);

    useEffect(() => {
      if (startDate && endDate) {
        fetchAdvertisements();
      }
    }, [startDate, endDate, selectedPosition, selectedPlatform]);

    const fetchAdvertisements = () => {
      setIsLoading(true)
      advertisementApi.listAds({
        application: "USER_API",
        page: 1,
        size: 30,
        ...(selectedPosition && {position: selectedPosition}),
        ...(selectedPlatform && {platform: selectedPlatform}),
        ...(startDate && {startDateTime: `${startDate}T00:00:00`}),
        ...(endDate && {endDateTime: `${endDate}T23:59:59`}),
      }).then((response) => {
        if (!response.ok) {
          return;
        }
        setAdvertisementList(response.data.contents);
      }).finally(() => {
        setIsLoading(false)
      });
    };

    const getDescriptionFromKey = (key, type) => {
      if (type === "position") {
        return positions.find((p) => p.key === key)?.description || key;
      } else if (type === "platform") {
        return osPlatforms.find((p) => p.key === key)?.description || key;
      }
      return key;
    };

    const refreshAdCache = async () => {
      const response = await cacheToolApi.evictAll('ADVERTISEMENT');
      if (response.ok) {
        toast.info("✅ 광고 캐시가 성공적으로 갱신되었습니다.");
      }
    };

// 구좌별 미리보기 스케일 - 모든 구좌 동일하게 적용
    const getPreviewScale = (positionType) => {
      return 1; // imageWidth, imageHeight 비율 기반으로 이미 계산되므로 스케일 1로 통일
    };

    return (
      <div className="container-fluid py-4">
        <style>{`
        /* 광고 미리보기 컨테이너 */
        .ad-preview-container {
          min-height: 250px;
          max-height: 600px;
        }

        .ad-preview-wrapper {
          max-width: 100%;
          max-height: 100%;
        }

        /* 모바일 환경 */
        @media (max-width: 767px) {
          .ad-preview-container {
            min-height: 200px;
            max-height: 500px;
          }
        }

        /* 태블릿 이상 */
        @media (min-width: 768px) {
          .ad-preview-container {
            min-height: 280px;
            max-height: 580px;
          }
        }

        /* 데스크탑 */
        @media (min-width: 1200px) {
          .ad-preview-container {
            min-height: 300px;
            max-height: 600px;
          }
        }
      `}</style>
        {/* 데스크톱 헤더 */}
        <div className="d-none d-md-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h2 className="fw-bold">🎯 광고 관리</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={refreshAdCache}>
              ♻️ 전체 광고 캐시 갱신
            </button>
            <button className="btn btn-success" onClick={() => setShowRegisterModal(true)}>
              ➕ 신규 등록
            </button>
          </div>
        </div>

        {/* 모바일 헤더 */}
        <div className="d-md-none mb-4 border-bottom pb-3">
          <h2 className="fw-bold mb-3">🎯 광고 관리</h2>
          <div className="d-flex flex-column gap-2">
            <button className="btn btn-outline-secondary w-100" onClick={refreshAdCache}>
              ♻️ 전체 광고 캐시 갱신
            </button>
            <button className="btn btn-success w-100" onClick={() => setShowRegisterModal(true)}>
              ➕ 신규 등록
            </button>
          </div>
        </div>

        {/* 검색 필터 섹션 */}
        <div className="card shadow-sm mb-4 border-0"
             style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
          <div className="card-body text-white">
            <div className="row align-items-center mb-3">
              <div className="col">
                <h5 className="card-title mb-0 text-white">
                  <i className="bi bi-funnel me-2"></i>
                  검색 필터
                </h5>
                <small className="text-white-50">광고를 조건에 따라 검색하세요</small>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label text-white fw-semibold">
                  <i className="bi bi-geo-alt me-1"></i>
                  광고 구좌
                </label>
                <select
                  className="form-select bg-white"
                  value={selectedPosition || ""}
                  onChange={(e) => setSelectedPosition(e.target.value || null)}
                >
                  {positions.map((pos) => (
                    <option key={pos.key} value={pos.key}>
                      {pos.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label text-white fw-semibold">
                  <i className="bi bi-phone me-1"></i>
                  플랫폼
                </label>
                <select
                  className="form-select bg-white"
                  value={selectedPlatform || ""}
                  onChange={(e) => setSelectedPlatform(e.target.value || null)}
                >
                  {osPlatforms.map((pos) => (
                    <option key={pos.key} value={pos.key}>
                      {pos.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6 col-lg-2">
                <label className="form-label text-white fw-semibold">
                  <i className="bi bi-calendar-event me-1"></i>
                  시작일
                </label>
                <input
                  type="date"
                  className="form-control bg-white"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-2">
                <label className="form-label text-white fw-semibold">
                  <i className="bi bi-calendar-x me-1"></i>
                  종료일
                </label>
                <input
                  type="date"
                  className="form-control bg-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
              <div className="col-12 col-lg-2">
                <label className="form-label text-white fw-semibold d-none d-lg-block">&nbsp;</label>
                <button
                  className="btn btn-light w-100 fw-bold"
                  onClick={fetchAdvertisements}
                  style={{boxShadow: '0 4px 8px rgba(0,0,0,0.2)'}}
                >
                  <i className="bi bi-search me-2"></i>
                  조회하기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 카드 레이아웃 (모든 화면) */}
        <div>
          {isLoading ? (
            <div className="text-center py-5">
              <Loading/>
            </div>
          ) : advertisementList.length === 0 ? (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle mx-auto mb-3" style={{
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-megaphone fs-1 text-secondary"></i>
              </div>
              <h5 className="text-muted">등록된 광고가 없습니다</h5>
              <p className="text-muted small">새로운 광고를 등록해보세요.</p>
            </div>
          ) : (
            <>
              {/* 결과 요약 */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                  <h5 className="mb-0 text-primary fw-bold">
                    <i className="bi bi-card-list me-2"></i>
                    광고 목록
                  </h5>
                  <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                  총 {advertisementList.length}개
                </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    실시간 업데이트
                  </small>
                </div>
              </div>

              <div className="row g-3 g-md-4">
                {advertisementList.map((info) => (
                  <div key={info.advertisementId} className="col-12 col-md-6 col-xl-4">
                    <div className="card shadow-sm h-100 border-0"
                         style={{transition: 'all 0.3s ease', cursor: 'pointer'}}
                         onClick={() => setSelectedAd(info)}
                         onMouseEnter={(e: any) => {
                           e.currentTarget.style.transform = 'translateY(-4px)';
                           e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                         }}
                         onMouseLeave={(e: any) => {
                           e.currentTarget.style.transform = 'translateY(0)';
                           e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                         }}>
                      <div className="card-body p-3 p-md-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex flex-column gap-1">
                          <span className="badge bg-primary-subtle text-primary"
                                style={{fontSize: '0.7rem', width: 'fit-content'}}>
                            <i className="bi bi-hash me-1"></i>
                            {info.advertisementId}
                          </span>
                            <small className="text-muted">
                              캠페인: {info.groupId || '-'}
                            </small>
                          </div>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAd(info);
                            }}
                            style={{fontSize: '0.75rem', padding: '8px 16px', borderRadius: '20px'}}
                          >
                            <i className="bi bi-eye me-1"></i>
                            <span className="d-none d-sm-inline">상세보기</span>
                            <span className="d-inline d-sm-none">상세</span>
                          </button>
                        </div>

                        {/* 광고 미리보기 */}
                        <div
                          className="mb-2 mb-md-3 bg-light rounded border d-flex align-items-start justify-content-center position-relative ad-preview-container"
                          style={{
                            overflow: 'auto',
                            padding: '1rem'
                          }}
                        >
                          <div
                            className="ad-preview-wrapper"
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'center',
                              maxWidth: '100%',
                              width: '100%'
                            }}
                          >
                            <div style={{
                              transform: `scale(${getPreviewScale(info.positionType)})`,
                              transformOrigin: 'top center',
                              maxWidth: '100%'
                            }}>
                              <AdPreview
                                positionType={info.positionType}
                                imageUrl={info.imageUrl}
                                imageWidth={info.imageWidth}
                                imageHeight={info.imageHeight}
                                title={info.title}
                                subTitle={info.subTitle}
                                extraContent={info.extraContent}
                                titleFontColor={info.titleFontColor}
                                subTitleFontColor={info.subTitleFontColor}
                                extraContentFontColor={info.extraContentFontColor}
                                backgroundColor={info.backgroundColor}
                              />
                            </div>
                          </div>
                          {/* 구좌 타입 표시 */}
                          <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-secondary" style={{fontSize: '0.6rem', opacity: 0.7}}>
                          {getDescriptionFromKey(info.positionType, "position")}
                        </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h6 className="card-title mb-1 fw-bold"
                              style={{fontSize: '1.1rem', lineHeight: '1.3', color: '#2c3e50'}}>
                            {info.title}
                          </h6>
                          {info.subTitle && (
                            <p className="text-muted mb-0" style={{fontSize: '0.85rem'}}>
                              {info.subTitle}
                            </p>
                          )}
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-12">
                            <div className="bg-light rounded p-2 text-center">
                              <small className="text-muted d-block mb-2" style={{fontSize: '0.7rem'}}>
                                <i className="bi bi-geo-alt me-1"></i>구좌
                              </small>
                              <span className="badge bg-secondary-subtle text-secondary" style={{fontSize: '0.7rem'}}>
                              {getDescriptionFromKey(info.positionType, "position")}
                            </span>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="bg-light rounded p-2">
                              <small className="text-muted d-block mb-2 text-center" style={{fontSize: '0.7rem'}}>
                                <i className="bi bi-phone me-1"></i>노출 플랫폼
                              </small>
                              <div className="d-flex justify-content-center gap-2">
                                {(info.platformType === 'ALL' || info.platformType === 'AOS') && (
                                  <div className="d-flex align-items-center gap-1 px-2 py-1 rounded bg-success-subtle">
                                    <i className="bi bi-android2 text-success" style={{fontSize: '1rem'}}></i>
                                    <small className="fw-semibold text-success" style={{fontSize: '0.7rem'}}>
                                      Android
                                    </small>
                                  </div>
                                )}
                                {(info.platformType === 'ALL' || info.platformType === 'IOS') && (
                                  <div className="d-flex align-items-center gap-1 px-2 py-1 rounded bg-primary-subtle">
                                    <i className="bi bi-apple text-primary" style={{fontSize: '1rem'}}></i>
                                    <small className="fw-semibold text-primary" style={{fontSize: '0.7rem'}}>
                                      iOS
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {info.description && (
                          <div className="mb-3">
                            <div className="border-start border-primary border-3 ps-3">
                              <small className="text-muted d-block mb-1">
                                <i className="bi bi-file-text me-1"></i>설명
                              </small>
                              <p className="card-text text-dark mb-0" style={{fontSize: '0.85rem', lineHeight: '1.4'}}>
                                {info.description.length > 60 ? info.description.substring(0, 60) + '...' : info.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 타이머 및 상태 표시 */}
                        <div className="mb-3">
                          <AdTimer
                            startDateTime={info.startDateTime}
                            endDateTime={info.endDateTime}
                            className="text-center"
                          />
                        </div>

                        {/* 일정 정보 */}
                        <div className="bg-light rounded p-3">
                          <div className="row g-2 text-center">
                            <div className="col-6">
                              <div className="border-end border-2">
                                <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>
                                  <i className="bi bi-play-circle me-1"></i>시작일
                                </small>
                                <small className="fw-bold text-success" style={{fontSize: '0.75rem'}}>
                                  <span className="d-none d-lg-inline">{formatDateTime(info.startDateTime)}</span>
                                  <span
                                    className="d-inline d-lg-none">{formatDateTime(info.startDateTime).split(' ')[0]}</span>
                                </small>
                              </div>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>
                                <i className="bi bi-stop-circle me-1"></i>종료일
                              </small>
                              <small className="fw-bold text-danger" style={{fontSize: '0.75rem'}}>
                                <span className="d-none d-lg-inline">{formatDateTime(info.endDateTime)}</span>
                                <span
                                  className="d-inline d-lg-none">{formatDateTime(info.endDateTime).split(' ')[0]}</span>
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>


        <AdvertisementModal
          show={!!selectedAd}
          onHide={() => setSelectedAd(null)}
          ad={selectedAd}
          getDescriptionFromKey={getDescriptionFromKey}
          formatDateTime={formatDateTime}
          fetchAdvertisements={fetchAdvertisements}
          positions={positions}
        />

        <AdvertisementRegisterModal
          show={showRegisterModal}
          onHide={() => setShowRegisterModal(false)}
          positions={positions}
          fetchAdvertisements={fetchAdvertisements}
        />
      </div>
    );
  }
;

export default Advertisement;
