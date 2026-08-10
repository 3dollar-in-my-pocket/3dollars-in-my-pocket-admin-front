import {useCallback, useEffect, useMemo, useState} from "react";
import {useAuthStore} from "@/state/authStore";
import {AdminRole} from "@/types/admin";
import enumApi from "@/api/enumApi";
import RecentActivityStatistics from "./RecentActivityStatistics";
import DefaultStatistics from "./DefaultStatistics";
import StoreByCategoryStatistics from "./StoreByCategoryStatistics";
import FilterCard from "@/components/common/FilterCard";
import EmptyState from "@/components/common/EmptyState";

/** VIEWER 권한으로 조회 가능한 통계 타입 */
const VIEWER_ALLOWED_STATISTICS_TYPES = [
  'USER',
  'BOSS',
  'WITHDRAWAL_USER',
  'WITHDRAWAL_BOSS',
  'IOS_DEVICE',
  'ANDROID_DEVICE',
  'USER_STORE',
  'BOSS_STORE',
  'STORE_FAVORITE',
  'STORE_REVIEW',
  'STORE_VISIT',
  'STORE_IMAGE'
];

/** 빠른 기간 선택 옵션 */
const QUICK_RANGES = [
  {days: 7, label: "최근 7일"},
  {days: 30, label: "최근 30일"},
  {days: 90, label: "최근 90일"},
  {days: 365, label: "최근 1년"},
];

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ServerStatistics = () => {
  const adminAuth = useAuthStore((state) => state.admin);
  const [statisticsTypes, setStatisticsTypes] = useState<{ key: string; description: string }[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateRangeError, setDateRangeError] = useState<string>("");
  const [activeQuickRange, setActiveQuickRange] = useState<number | null>(30);

  useEffect(() => {
    fetchStatisticsTypes();
    setQuickDateRange(30); // 기본값: 최근 30일
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatisticsTypes = async () => {
    try {
      const response = await enumApi.getEnum();
      if (response?.data?.StatisticsType) {
        let types = response.data.StatisticsType || [];

        // VIEWER 권한인 경우 허용된 타입만 필터링
        if (adminAuth?.role === AdminRole.VIEWER) {
          types = types.filter((type: { key: string }) =>
            VIEWER_ALLOWED_STATISTICS_TYPES.includes(type.key)
          );
        }

        setStatisticsTypes(types);
        if (types.length > 0) {
          setSelectedType(types[0].key);
        }
      }
    } catch (error) {
      console.error("통계 타입 조회 실패:", error);
    }
  };

  const setQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setEndDate(formatDate(end));
    setStartDate(formatDate(start));
    setDateRangeError("");
    setActiveQuickRange(days);
  };

  useEffect(() => {
    // 날짜 변경 시 유효성 검사
    if (!startDate || !endDate) {
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setDateRangeError("시작일은 종료일보다 이전이어야 합니다.");
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      setDateRangeError("조회 기간은 최대 1년(365일)까지 가능합니다.");
      return;
    }

    setDateRangeError("");
  }, [startDate, endDate]);

  const handleFetch = useCallback(() => {
    // 필요시 추가 로직 구현
  }, []);

  const statisticsComponent = useMemo(() => {
    // 날짜가 없거나 유효하지 않으면 안내만 표시
    if (!startDate || !endDate) {
      return (
        <EmptyState
          icon="bi-calendar-range"
          title="조회 기간을 선택해주세요"
          description="통계 타입과 조회 기간을 설정하면 결과가 표시됩니다."
        />
      );
    }

    // RECENT_ACTIVITY 타입은 별도 컴포넌트 사용
    if (selectedType === "RECENT_ACTIVITY_USER_STORE" || selectedType === "RECENT_ACTIVITY_BOSS_STORE") {
      return (
        <RecentActivityStatistics
          statisticsType={selectedType as "RECENT_ACTIVITY_USER_STORE" | "RECENT_ACTIVITY_BOSS_STORE"}
          startDate={startDate}
          endDate={endDate}
          onFetch={handleFetch}
        />
      );
    }

    // STORE_BY_CATEGORY 타입은 카테고리별 통계 컴포넌트 사용
    if (selectedType === "STORE_BY_CATEGORY") {
      return (
        <StoreByCategoryStatistics
          statisticsType={selectedType}
          startDate={startDate}
          endDate={endDate}
          onFetch={handleFetch}
        />
      );
    }

    // 기본 통계 컴포넌트 사용
    return (
      <DefaultStatistics
        statisticsType={selectedType}
        startDate={startDate}
        endDate={endDate}
        onFetch={handleFetch}
      />
    );
  }, [selectedType, startDate, endDate, handleFetch]);

  return (
    <div>
      <FilterCard>
        <div className="row g-3">
          <div className="col-12 col-lg-4">
            <label className="form-label" htmlFor="stat-type">통계 타입</label>
            <select
              id="stat-type"
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {statisticsTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.description}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label" htmlFor="stat-start-date">시작일</label>
            <input
              id="stat-start-date"
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateRangeError("");
                setActiveQuickRange(null);
              }}
              max={endDate}
            />
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label" htmlFor="stat-end-date">종료일</label>
            <input
              id="stat-end-date"
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateRangeError("");
                setActiveQuickRange(null);
              }}
              min={startDate}
            />
          </div>

          <div className="col-12 col-lg-4">
            <label className="form-label">빠른 기간 선택</label>
            <div className="filter-chips">
              {QUICK_RANGES.map((range) => (
                <button
                  key={range.days}
                  type="button"
                  className={`filter-chip ${activeQuickRange === range.days ? "filter-chip--active" : ""}`}
                  onClick={() => setQuickDateRange(range.days)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {dateRangeError && (
          <div className="alert alert-danger py-2 px-3 mt-3 mb-0 small">
            <i className="bi bi-exclamation-triangle me-1"/>
            {dateRangeError}
          </div>
        )}
      </FilterCard>

      {/* 통계 타입에 따라 적절한 컴포넌트 렌더링 */}
      {dateRangeError ? (
        <EmptyState
          icon="bi-exclamation-triangle"
          title="조회 조건을 확인해주세요"
          description={dateRangeError}
        />
      ) : statisticsComponent}

      {/* 안내 문구 */}
      <div className="page-note mt-3">
        <i className="bi bi-info-circle"/>
        <span>해당 지표는 실 데이터와는 별도로 수집·집계되며, 지표 수집을 시작한 시점 이후 데이터부터 제공됩니다.</span>
      </div>
    </div>
  );
};

export default ServerStatistics;
