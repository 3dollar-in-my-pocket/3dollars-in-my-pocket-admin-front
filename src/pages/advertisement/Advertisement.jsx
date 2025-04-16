import {useEffect, useState} from "react";
import advertisementApi from "../../api/advertisementApi";
import enumApi from "../../api/enumApi";
import AdvertisementModal from "./AdvertisementModal";
import {formatDateTime} from "../../utils/dateUtils";

const Advertisement = () => {
    const [advertisementList, setAdvertisementList] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [positions, setPositions] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);

    const osPlatforms = [
        {key: "", description: "전체 플랫폼"},
        {key: "AOS", description: "안드로이드"},
        {key: "IOS", description: "iOS"},
    ];

    useEffect(() => {
        enumApi.getEnum().then(response => {
            setPositions([{key: "", description: "전체 포지션"}, ...response.data["AdvertisementPosition"]]);
        });
    }, []);

    const fetchAdvertisements = () => {
        advertisementApi.listAds({
            application: "USER_API",
            page: 1,
            size: 30,
            ...(selectedPosition && {position: selectedPosition}),
            ...(selectedPlatform && {platform: selectedPlatform}),
        }).then((response) => {
            if (!response.ok) {
                return
            }
            setAdvertisementList(response.data.contents);
        })
    };

    const getDescriptionFromKey = (key, type) => {
        if (type === "position") {
            return positions.find((p) => p.key === key)?.description || key;
        } else if (type === "platform") {
            return osPlatforms.find((p) => p.key === key)?.description || key;
        }
        return key;
    };


    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <h2 className="fw-bold">🎯 광고 관리</h2>
            </div>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
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
                        <div className="col-md-4">
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
                        <div className="col-md-4 text-end">
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
                    {advertisementList.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="py-5 text-muted fs-5">
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
            />
        </div>
    );
};

export default Advertisement;
