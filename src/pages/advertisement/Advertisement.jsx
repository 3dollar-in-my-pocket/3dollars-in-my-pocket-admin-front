import {useEffect, useState} from "react";
import advertisementApi from "../../api/advertisementApi";
import enumApi from "../../api/enumApi";
import AdvertisementModal from "./AdvertisementModal";
import AdvertisementRegisterModal from "./AdvertisementRegisterModal";
import {formatDateTime} from "../../utils/dateUtils";
import cacheToolApi from "../../api/cacheToolApi";
import {toast} from "react-toastify";
import Loading from "../../components/common/Loading";

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
    try {
      const response = await cacheToolApi.evictAll('ADVERTISEMENT');
      if (response.ok) {
        toast.info("✅ 광고 캐시가 성공적으로 갱신되었습니다.");
      } else {
        toast.error("❌ 광고 캐시 갱신에 실패했습니다.");
      }
    } catch (error) {
      toast.error("❌ 알 수 없는 오류로 캐시 갱신에 실패했습니다.");
    }
  };

  return (
    <div className="container-fluid py-4">
      <style>{`
        @media (min-width: 768px) {
          .ad-image-responsive {
            height: 200px !important;
          }
          .ad-placeholder-responsive {
            height: 200px !important;
          }
        }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
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

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">광고 구좌</label>
              <select
                className="form-select"
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
            <div className="col-md-3">
              <label className="form-label">플랫폼</label>
              <select
                className="form-select"
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
            <div className="col-md-2">
              <label className="form-label">시작 범위</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">종료 범위</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
            <div className="col-md-2 text-end">
              <button className="btn btn-primary w-100" onClick={fetchAdvertisements}>
                🔍 조회하기
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
            <div className="bg-light rounded-circle mx-auto mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <i className="bi bi-megaphone fs-1 text-secondary"></i>
            </div>
            <h5 className="text-muted">등록된 광고가 없습니다</h5>
            <p className="text-muted small">새로운 광고를 등록해보세요.</p>
          </div>
        ) : (
          <div className="row g-2 g-md-3">
            {advertisementList.map((info) => (
              <div key={info.advertisementId} className="col-12 col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-start mb-2 mb-md-3">
                      <span className="badge bg-primary" style={{fontSize: '0.75rem'}}>
                        ID: {info.advertisementId}
                      </span>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setSelectedAd(info)}
                        style={{fontSize: '0.8rem', padding: '6px 12px'}}
                      >
                        <i className="bi bi-eye me-1"></i>
                        <span className="d-none d-sm-inline">상세 보기</span>
                        <span className="d-inline d-sm-none">상세</span>
                      </button>
                    </div>

                    {/* 광고 이미지 */}
                    {info.imageUrl && (
                      <div className="mb-2 mb-md-3 position-relative">
                        <img
                          src={info.imageUrl}
                          alt={info.title}
                          className="img-fluid rounded ad-image-responsive"
                          style={{
                            width: '100%',
                            height: '140px',
                            objectFit: 'contain',
                            border: '1px solid #e9ecef',
                            backgroundColor: '#f8f9fa',
                            ...(info.imageWidth && info.imageHeight && {
                              aspectRatio: `${info.imageWidth} / ${info.imageHeight}`
                            })
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          className="d-none position-absolute top-0 start-0 w-100 h-100 align-items-center justify-content-center bg-light rounded border ad-placeholder-responsive"
                        >
                          <div className="text-center text-muted">
                            <i className="bi bi-image fs-1 mb-2"></i>
                            <div style={{fontSize: '0.75rem'}}>이미지를 불러올 수 없습니다</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 이미지가 없는 경우 플레이스홀더 */}
                    {!info.imageUrl && (
                      <div className="mb-2 mb-md-3">
                        <div
                          className="d-flex align-items-center justify-content-center bg-light rounded border ad-placeholder-responsive"
                          style={{ height: '140px' }}
                        >
                          <div className="text-center text-muted">
                            <i className="bi bi-image fs-2 mb-2"></i>
                            <div style={{fontSize: '0.75rem'}}>이미지 없음</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <h6 className="card-title mb-2 mb-md-3 fw-bold" style={{fontSize: '1rem', lineHeight: '1.3'}}>
                      {info.title}
                    </h6>

                    <div className="row g-1 g-md-2 mb-2 mb-md-3">
                      <div className="col-6">
                        <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>구좌</small>
                        <span className="badge bg-secondary" style={{fontSize: '0.7rem'}}>
                          {getDescriptionFromKey(info.positionType, "position")}
                        </span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>플랫폼</small>
                        <span className="badge bg-info" style={{fontSize: '0.7rem'}}>
                          {getDescriptionFromKey(info.platformType, "platform")}
                        </span>
                      </div>
                    </div>

                    {info.description && (
                      <p className="card-text text-muted mb-2 mb-md-3" style={{fontSize: '0.85rem', lineHeight: '1.4'}}>
                        {info.description.length > 80 ? info.description.substring(0, 80) + '...' : info.description}
                      </p>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>시작일</small>
                        <small className="fw-semibold" style={{fontSize: '0.75rem'}}>
                          <span className="d-none d-md-inline">{formatDateTime(info.startDateTime)}</span>
                          <span className="d-inline d-md-none">{formatDateTime(info.startDateTime).split(' ')[0]}</span>
                        </small>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>종료일</small>
                        <small className="fw-semibold" style={{fontSize: '0.75rem'}}>
                          <span className="d-none d-md-inline">{formatDateTime(info.endDateTime)}</span>
                          <span className="d-inline d-md-none">{formatDateTime(info.endDateTime).split(' ')[0]}</span>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
};

export default Advertisement;
