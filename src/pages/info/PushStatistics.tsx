import {useEffect, useMemo, useState} from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import statisticsApi from "@/api/statisticsApi";
import {PushStatistic} from "@/types/statistics";
import {useEnumLabels} from "@/hooks/useEnumOptions";
import FilterCard from "@/components/common/FilterCard";
import SectionCard from "@/components/common/SectionCard";
import DataTable from "@/components/common/DataTable";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import {
  CHART_AXIS_PROPS,
  CHART_COLORS,
  CHART_GRID_PROPS,
  CHART_HEIGHT,
  CHART_LEGEND_PROPS,
  CHART_TOOLTIP_PROPS,
  formatAxisNumber,
  formatNumber,
  formatShortDateWithDay,
} from "@/constants/chart";

/** 서버 조회 가능 기간: 오늘-29일 ~ 어제 (발송 로그 보관 30일, 당일 조회 불가) */
const MAX_DAYS_AGO = 29;

const QUICK_RANGES = [
  {days: 7, label: "최근 7일"},
  {days: 14, label: "최근 14일"},
  {days: MAX_DAYS_AGO, label: `최근 ${MAX_DAYS_AGO}일`},
];

const ALL_PUSH_TYPES = "";

const SORT_COLUMNS = [
  {key: "pushType", label: "푸시 타입"},
  {key: "sentCount", label: "발송 수"},
  {key: "impressionCount", label: "노출 수"},
  {key: "clickCount", label: "클릭 수"},
  {key: "clickRate", label: "클릭률"},
] as const;
type SortKey = typeof SORT_COLUMNS[number]["key"];

const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateString(date);
};

/** 비율(0.15) → "15.00%". 노출 0으로 clickRate가 없으면 "-" */
const formatRate = (rate?: number | null): string =>
  rate === null || rate === undefined ? "-" : `${(rate * 100).toFixed(2)}%`;

const calcRate = (clickCount: number, impressionCount: number): number | null =>
  impressionCount > 0 ? clickCount / impressionCount : null;

interface PushStatisticsData {
  total: PushStatistic[];
  daily: PushStatistic[];
}

const PushStatistics = () => {
  const minDate = daysAgo(MAX_DAYS_AGO);
  const maxDate = daysAgo(1);

  const [startDate, setStartDate] = useState(daysAgo(7));
  const [endDate, setEndDate] = useState(maxDate);
  const [activeQuickRange, setActiveQuickRange] = useState<number | null>(7);
  const [chartPushType, setChartPushType] = useState(ALL_PUSH_TYPES);
  const [data, setData] = useState<PushStatisticsData>({total: [], daily: []});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [searchRange, setSearchRange] = useState<{startDate: string; endDate: string} | null>(null);
  const [sort, setSort] = useState<{key: SortKey; direction: "ascending" | "descending"} | null>(null);

  const pushTypeLabels = useEnumLabels(["PushType"]).PushType ?? {};
  const pushTypeLabel = (pushType: string) => pushTypeLabels[pushType] ?? pushType;

  const sortedTotal = useMemo(() => {
    if (!sort) return data.total;
    return [...data.total].sort((a, b) => {
      const aValue = sort.key === "pushType" ? (pushTypeLabels[a.pushType] ?? a.pushType) : a[sort.key];
      const bValue = sort.key === "pushType" ? (pushTypeLabels[b.pushType] ?? b.pushType) : b[sort.key];
      // 집계되지 않은 클릭률은 정렬 방향과 관계없이 마지막에 표시한다.
      if (aValue == null) return bValue == null ? 0 : 1;
      if (bValue == null) return -1;
      const comparison = typeof aValue === "string" && typeof bValue === "string"
        ? aValue.localeCompare(bValue, "ko")
        : Number(aValue) - Number(bValue);
      return sort.direction === "ascending" ? comparison : -comparison;
    });
  }, [data.total, sort, pushTypeLabels]);

  const dateRangeError = useMemo(() => {
    if (!startDate || !endDate) return "조회 기간을 선택해주세요.";
    if (startDate < minDate || endDate > maxDate) {
      return `푸시 통계는 최근 30일 이내 어제까지(${minDate} ~ ${maxDate})의 기간만 조회할 수 있습니다.`;
    }
    if (startDate > endDate) return "시작일은 종료일보다 이전이어야 합니다.";
    return "";
  }, [startDate, endDate, minDate, maxDate]);

  useEffect(() => {
    if (!searchRange) return;
    const {startDate, endDate} = searchRange;

    // 페이지를 벗어나면 이전 응답을 무시한다
    let cancelled = false;
    setLoading(true);
    setFetchError("");
    Promise.all([
      statisticsApi.getPushStatistics(startDate, endDate, "TOTAL"),
      statisticsApi.getPushStatistics(startDate, endDate, "DAILY"),
    ]).then(([totalResponse, dailyResponse]) => {
      if (cancelled) return;
      if (!totalResponse.ok || !dailyResponse.ok) {
        setData({total: [], daily: []});
        setFetchError(totalResponse.message || dailyResponse.message || "푸시 통계를 불러오지 못했습니다.");
        return;
      }
      setData({
        total: totalResponse.data?.contents ?? [],
        daily: dailyResponse.data?.contents ?? [],
      });
    }).catch(() => {
      if (cancelled) return;
      setData({total: [], daily: []});
      setFetchError("푸시 통계를 불러오지 못했습니다.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [searchRange]);

  const handleSearch = () => {
    if (loading || dateRangeError) return;
    setSearchRange({startDate, endDate});
  };

  const summary = useMemo(() => {
    const sentCount = data.total.reduce((sum, row) => sum + row.sentCount, 0);
    const impressionCount = data.total.reduce((sum, row) => sum + row.impressionCount, 0);
    const clickCount = data.total.reduce((sum, row) => sum + row.clickCount, 0);
    return {sentCount, impressionCount, clickCount, clickRate: calcRate(clickCount, impressionCount)};
  }, [data.total]);

  /** DAILY 행을 일자별로 합산 (선택한 푸시 타입만). 데이터 없는 날짜는 행이 없으므로 0으로 채운다 */
  const chartData = useMemo(() => {
    if (!searchRange) return [];
    const {startDate, endDate} = searchRange;
    const byDate = new Map<string, { sent: number; impression: number; click: number }>();
    for (let date = new Date(`${startDate}T00:00:00`); toDateString(date) <= endDate; date.setDate(date.getDate() + 1)) {
      byDate.set(toDateString(date), {sent: 0, impression: 0, click: 0});
    }
    data.daily
      .filter((row) => chartPushType === ALL_PUSH_TYPES || row.pushType === chartPushType)
      .forEach((row) => {
        const bucket = byDate.get(row.startDate);
        if (!bucket) return;
        bucket.sent += row.sentCount;
        bucket.impression += row.impressionCount;
        bucket.click += row.clickCount;
      });
    return Array.from(byDate, ([date, counts]) => ({
      date: formatShortDateWithDay(date),
      "발송": counts.sent,
      "노출": counts.impression,
      "클릭": counts.click,
    }));
  }, [data.daily, chartPushType, searchRange]);

  const setQuickDateRange = (days: number) => {
    setStartDate(daysAgo(days));
    setEndDate(maxDate);
    setActiveQuickRange(days);
  };

  const renderContent = () => {
    if (!searchRange) {
      return (
        <EmptyState
          icon="bi-search"
          title="조회 기간을 선택해주세요"
          description="기간을 선택한 후 검색 버튼을 눌러 푸시 통계를 조회하세요."
        />
      );
    }
    if (loading) {
      return <div className="py-5"><Loading/></div>;
    }
    if (fetchError) {
      return <EmptyState icon="bi-exclamation-triangle" title="조회에 실패했습니다" description={fetchError}/>;
    }
    if (data.total.length === 0) {
      return (
        <EmptyState
          icon="bi-bar-chart-line"
          title="조회된 데이터가 없습니다"
          description="선택한 기간에 집계된 푸시 통계가 없습니다. 조회 기간을 변경해보세요."
        />
      );
    }

    return (
      <>
        <div className="row g-3 mb-3">
          {[
            {label: "발송 수", value: formatNumber(summary.sentCount)},
            {label: "노출 수", value: formatNumber(summary.impressionCount)},
            {label: "클릭 수", value: formatNumber(summary.clickCount)},
            {label: "클릭률", value: formatRate(summary.clickRate)},
          ].map((tile) => (
            <div className="col-6 col-lg-3" key={tile.label}>
              <div className="stat-tile">
                <span className="stat-tile__label">{tile.label}</span>
                <strong className="stat-tile__value">{tile.value}</strong>
              </div>
            </div>
          ))}
        </div>

        <SectionCard
          title="푸시 타입별 합계"
          icon="bi-table"
          description={`${searchRange.startDate} ~ ${searchRange.endDate} 기간 합계입니다.`}
          flush
        >
          <DataTable maxHeight="440px">
            <thead>
            <tr>
              {SORT_COLUMNS.map(({key, label}) => (
                <th
                  key={key}
                  scope="col"
                  className={key === "pushType" ? undefined : "num"}
                  aria-sort={sort?.key === key ? sort.direction : "none"}
                >
                  <button
                    type="button"
                    className="btn btn-link p-0 text-reset text-decoration-none fw-semibold"
                    onClick={() => setSort((previous) => ({
                      key,
                      direction: previous?.key === key && previous.direction === "ascending"
                        ? "descending" : "ascending",
                    }))}
                  >
                    {label}{" "}
                    <i
                      aria-hidden="true"
                      className={`bi bi-${sort?.key === key
                        ? sort.direction === "ascending" ? "sort-up" : "sort-down"
                        : "arrow-down-up"}`}
                    />
                  </button>
                </th>
              ))}
            </tr>
            </thead>
            <tbody>
            {sortedTotal.map((row) => (
              <tr key={row.pushType}>
                <td>
                  <div>{pushTypeLabel(row.pushType)}</div>
                  {pushTypeLabels[row.pushType] && <small className="text-muted">{row.pushType}</small>}
                </td>
                <td className="num">{formatNumber(row.sentCount)}</td>
                <td className="num">{formatNumber(row.impressionCount)}</td>
                <td className="num">{formatNumber(row.clickCount)}</td>
                <td className="num">{formatRate(row.clickRate)}</td>
              </tr>
            ))}
            </tbody>
          </DataTable>
        </SectionCard>

        <SectionCard
          title="일자별 추이"
          icon="bi-graph-up"
          aside={
            <select
              className="form-select form-select-sm"
              aria-label="추이 차트 푸시 타입"
              value={chartPushType}
              onChange={(e) => setChartPushType(e.target.value)}
            >
              <option value={ALL_PUSH_TYPES}>전체 푸시 타입</option>
              {data.total.map((row) => (
                <option key={row.pushType} value={row.pushType}>{pushTypeLabel(row.pushType)}</option>
              ))}
            </select>
          }
        >
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart data={chartData}>
              <CartesianGrid {...CHART_GRID_PROPS}/>
              <XAxis dataKey="date" {...CHART_AXIS_PROPS}/>
              <YAxis tickFormatter={formatAxisNumber} {...CHART_AXIS_PROPS}/>
              <Tooltip {...CHART_TOOLTIP_PROPS} formatter={(value: number) => formatNumber(value)}/>
              <Legend {...CHART_LEGEND_PROPS}/>
              <Line type="monotone" dataKey="발송" stroke={CHART_COLORS.neutral} strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="노출" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="클릭" stroke={CHART_COLORS.success} strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </>
    );
  };

  return (
    <div>
      <FilterCard aside={
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSearch}
          disabled={loading || !!dateRangeError}
        >
          {loading ? "조회 중..." : "검색"}
        </button>
      }>
        <div className="row g-3">
          <div className="col-6 col-lg-3">
            <label className="form-label" htmlFor="push-stat-start-date">시작일</label>
            <input
              id="push-stat-start-date"
              type="date"
              className="form-control"
              value={startDate}
              min={minDate}
              max={endDate || maxDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActiveQuickRange(null);
              }}
            />
          </div>
          <div className="col-6 col-lg-3">
            <label className="form-label" htmlFor="push-stat-end-date">종료일</label>
            <input
              id="push-stat-end-date"
              type="date"
              className="form-control"
              value={endDate}
              min={startDate || minDate}
              max={maxDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActiveQuickRange(null);
              }}
            />
          </div>
          <div className="col-12 col-lg-6">
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
        {dateRangeError && <div className="text-danger mt-2" role="alert">{dateRangeError}</div>}
      </FilterCard>

      {renderContent()}

      <div className="page-note mt-3">
        <i className="bi bi-info-circle"/>
        <span>
          유저 앱 푸시만 집계합니다. 발송 수는 서버 발송 로그, 노출·클릭 수는 GA4 이벤트 기준이라 서로 일치하지 않을 수 있으며,
          어제 데이터는 GA4 적재 지연으로 노출·클릭이 적게 집계될 수 있습니다.
        </span>
      </div>
    </div>
  );
};

export default PushStatistics;
