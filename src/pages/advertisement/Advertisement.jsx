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

      <div className="table-responsive">
        <table className="table table-bordered align-middle text-center">
          <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>구좌</th>
            <th>플랫폼</th>
            <th>설명</th>
            <th>시작일</th>
            <th>종료일</th>
            <th>제목</th>
            <th>상세</th>
          </tr>
          </thead>
          <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="8" className="py-5">
                <Loading/>
              </td>
            </tr>
          ) : advertisementList.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-5 text-muted fs-5">
                📭 등록된 광고가 없습니다.
              </td>
            </tr>
          ) : (
            advertisementList.map((info) => (
              <tr key={info.advertisementId}>
                <td>{info.advertisementId}</td>
                <td>{getDescriptionFromKey(info.positionType, "position")}</td>
                <td>{getDescriptionFromKey(info.platformType, "platform")}</td>
                <td>{info.description || '-'}</td>
                <td>{formatDateTime(info.startDateTime)}</td>
                <td>{formatDateTime(info.endDateTime)}</td>
                <td className="text-start">{info.title}</td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setSelectedAd(info)}
                  >
                    상세 보기
                  </button>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
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
