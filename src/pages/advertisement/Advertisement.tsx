import {useEffect, useMemo, useState} from "react";
import type {Advertisement as AdvertisementItem, EnumOption} from '@/types/advertisement';
import advertisementApi from "@/api/advertisementApi";
import enumApi from "@/api/enumApi";
import AdvertisementModal from "./AdvertisementModal";
import AdvertisementRegisterModal from "./AdvertisementRegisterModal";
import {formatDateTime} from "@/utils/dateUtils";
import cacheToolApi from "@/api/cacheToolApi";
import {toast} from "react-toastify";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import FilterCard from "@/components/common/FilterCard";
import SectionCard from "@/components/common/SectionCard";
import AdTimer from "@/components/common/AdTimer";
import AdPreview from "@/components/advertisement/AdPreview";
import {getAdStatus} from "@/utils/timeUtils";

/** 광고 상태 필터 옵션 */
const STATUS_FILTERS = [
  {key: "ALL", label: "전체", icon: "bi-collection"},
  {key: "active", label: "진행중", icon: "bi-broadcast"},
  {key: "scheduled", label: "예정", icon: "bi-clock"},
  {key: "ended", label: "종료", icon: "bi-check2-circle"},
] as const;

type StatusFilter = typeof STATUS_FILTERS[number]["key"];

/** 상태 정렬 우선순위 - 진행중 > 예정 > 종료 */
const STATUS_ORDER: Record<string, number> = {active: 0, scheduled: 1, ended: 2};

const Advertisement = () => {
    const [advertisementList, setAdvertisementList] = useState<AdvertisementItem[]>([]);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [positions, setPositions] = useState<EnumOption[]>([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

    const osPlatforms = [
      {key: "", description: "전체 플랫폼"},
      {key: "AOS", description: "안드로이드"},
      {key: "IOS", description: "iOS"},
    ];

    const formatDate = (date: Date) => {
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
        application: "USER",
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
      }).catch(() => {
        setAdvertisementList([]);
      }).finally(() => {
        setIsLoading(false)
      });
    };

    const getDescriptionFromKey = (key: string, type: "position" | "platform") => {
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
        }
      } catch (error) {
        toast.error("광고 캐시 갱신에 실패했습니다.");
      }
    };

    /**
     * 광고에 상태를 부여하고 진행중 > 예정 > 종료 순으로 정렬한다.
     * 같은 상태 안에서는 시작일이 빠른 광고를 먼저 노출한다.
     */
    const decoratedAds = useMemo(() => {
      return advertisementList
        .map((info) => ({info, status: getAdStatus(info.startDateTime, info.endDateTime)}))
        .sort((a, b) => {
          const orderDiff = STATUS_ORDER[a.status.status] - STATUS_ORDER[b.status.status];
          if (orderDiff !== 0) {
            return orderDiff;
          }
          return a.info.startDateTime.localeCompare(b.info.startDateTime);
        });
    }, [advertisementList]);

    /** 상태별 건수 */
    const statusCounts = useMemo(() => {
      return decoratedAds.reduce((acc, {status}) => {
        acc[status.status] = (acc[status.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }, [decoratedAds]);

    const visibleAds = statusFilter === "ALL"
      ? decoratedAds
      : decoratedAds.filter(({status}) => status.status === statusFilter);

    return (
      <div>
        <PageHeader
          description="구좌·플랫폼·기간별로 광고를 조회하고 등록합니다. 카드를 선택하면 상세 정보를 수정할 수 있습니다."
          actions={
            <>
              <button className="btn btn-outline-secondary" onClick={refreshAdCache}>
                <i className="bi bi-arrow-repeat me-1"/>
                광고 캐시 갱신
              </button>
              <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
                <i className="bi bi-plus-lg me-1"/>
                신규 등록
              </button>
            </>
          }
        />

        <FilterCard>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label" htmlFor="ad-position">광고 구좌</label>
              <select
                id="ad-position"
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
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label" htmlFor="ad-platform">플랫폼</label>
              <select
                id="ad-platform"
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
            <div className="col-6 col-lg-2">
              <label className="form-label" htmlFor="ad-start-date">시작일</label>
              <input
                id="ad-start-date"
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
            <div className="col-6 col-lg-2">
              <label className="form-label" htmlFor="ad-end-date">종료일</label>
              <input
                id="ad-end-date"
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
            <div className="col-12 col-lg-2 d-flex align-items-end">
              <button
                className="btn btn-outline-primary w-100"
                onClick={fetchAdvertisements}
                disabled={isLoading}
              >
                <i className="bi bi-search me-1"/>
                조회
              </button>
            </div>
          </div>
        </FilterCard>

        <SectionCard
          title="광고 목록"
          icon="bi-bullseye"
          aside={!isLoading && advertisementList.length > 0 && (
            <span className="page-count">총 {advertisementList.length}개</span>
          )}
        >
          {isLoading ? (
            <div className="py-5">
              <Loading/>
            </div>
          ) : advertisementList.length === 0 ? (
            <EmptyState
              icon="bi-megaphone"
              title="등록된 광고가 없습니다"
              description="선택한 조건에 해당하는 광고가 없습니다. 조회 기간이나 구좌를 변경해보세요."
            />
          ) : (
            <>
              {/* 상태별 필터 */}
              <div className="filter-chips mb-3">
                {STATUS_FILTERS.map((filter) => {
                  const count = filter.key === "ALL"
                    ? decoratedAds.length
                    : statusCounts[filter.key] || 0;

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      className={`filter-chip ${statusFilter === filter.key ? "filter-chip--active" : ""}`}
                      onClick={() => setStatusFilter(filter.key)}
                    >
                      <i className={`bi ${filter.icon} me-1`}/>
                      {filter.label} {count}
                    </button>
                  );
                })}
              </div>

              {visibleAds.length === 0 ? (
                <EmptyState
                  icon="bi-funnel"
                  title="해당 상태의 광고가 없습니다"
                  description="다른 상태를 선택해보세요."
                />
              ) : (
              <div className="row g-3">
                {visibleAds.map(({info, status}) => (
                  <div key={info.advertisementId} className="col-12 col-md-6 col-xl-4">
                    <div
                      className={`item-card item-card--clickable ad-card ad-card--${status.status}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedAd(info)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedAd(info);
                        }
                      }}
                    >
                      <div className="item-card__body">
                        {/* 상태 및 식별 정보 */}
                        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                          <span className={`ad-status ad-status--${status.status}`}>
                            <span className="ad-status__dot"/>
                            {status.label}
                          </span>
                          <span className="badge text-bg-light">
                            {getDescriptionFromKey(info.positionType, "position")}
                          </span>
                        </div>

                        <span className="item-card__label font-monospace mb-1">#{info.advertisementId}</span>

                        {/* 광고 미리보기 */}
                        <div className="ad-preview-container">
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
                            extraContentFontColor={info.extraFontColor}
                            backgroundColor={info.backgroundColor}
                          />
                        </div>

                        {/* 제목 / 부제목 */}
                        <p className="item-card__name mt-3">{info.title}</p>
                        {info.subTitle && <p className="item-card__desc">{info.subTitle}</p>}

                        {/* 노출 플랫폼 · 노출 인덱스 */}
                        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                          {(info.platformType === 'ALL' || info.platformType === 'AOS') && (
                            <span className="badge text-bg-light">
                              <i className="bi bi-android2 text-success me-1"/>
                              Android
                            </span>
                          )}
                          {(info.platformType === 'ALL' || info.platformType === 'IOS') && (
                            <span className="badge text-bg-light">
                              <i className="bi bi-apple me-1"/>
                              iOS
                            </span>
                          )}
                          {(info.positionType === 'MENU_CATEGORY_ICON' || info.positionType === 'POLL_CARD') && (
                            <span className="badge text-bg-light">
                              <i className="bi bi-sort-numeric-down me-1"/>
                              {info.exposureIndex !== null && info.exposureIndex !== undefined
                                ? `인덱스 ${info.exposureIndex}`
                                : '인덱스 미지정'}
                            </span>
                          )}
                        </div>

                        {info.description && (
                          <p className="item-card__desc mt-2">{info.description}</p>
                        )}

                        {/* 노출 기간 및 상태 */}
                        <div className="mt-auto pt-3">
                          <AdTimer
                            startDateTime={info.startDateTime}
                            endDateTime={info.endDateTime}
                            className="mb-2"
                            showStatusBadge={false}
                          />
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <div>
                              <span className="item-card__label">시작</span>
                              <span className="item-card__value num">{formatDateTime(info.startDateTime)}</span>
                            </div>
                            <i className="bi bi-arrow-right text-body-tertiary"/>
                            <div className="text-end">
                              <span className="item-card__label">종료</span>
                              <span className="item-card__value num">{formatDateTime(info.endDateTime)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </>
          )}
        </SectionCard>


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
