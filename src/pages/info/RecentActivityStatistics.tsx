import React, {useEffect, useState} from "react";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import statisticsApi from "@/api/statisticsApi";
import {DailyStatistic} from "@/types/statistics";
import {toast} from "react-toastify";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import SectionCard from "@/components/common/SectionCard";
import DataTable from "@/components/common/DataTable";
import {
  CHART_AXIS_PROPS,
  CHART_COLORS,
  CHART_GRID_PROPS,
  CHART_HEIGHT,
  CHART_LEGEND_PROPS,
  CHART_TOOLTIP_PROPS,
  formatAxisNumber,
  formatDateWithDay,
  formatNumber,
  formatShortDateWithDay,
} from "@/constants/chart";

interface RecentActivityStatisticsProps {
  statisticsType: "RECENT_ACTIVITY_USER_STORE" | "RECENT_ACTIVITY_BOSS_STORE";
  startDate: string;
  endDate: string;
  onFetch: () => void;
}

interface ActivityRow {
  date: string;
  base: number;
  activity: number;
  ratio: number;
}

const RecentActivityStatistics: React.FC<RecentActivityStatisticsProps> = ({
                                                                            statisticsType,
                                                                            startDate,
                                                                            endDate,
                                                                            onFetch,
                                                                          }) => {
  const [baseData, setBaseData] = useState<DailyStatistic[]>([]);
  const [activityData, setActivityData] = useState<DailyStatistic[]>([]);
  const [loading, setLoading] = useState(false);

  const baseType = statisticsType === "RECENT_ACTIVITY_USER_STORE" ? "USER_STORE" : "BOSS_STORE";
  const storeLabel = statisticsType === "RECENT_ACTIVITY_USER_STORE" ? "유저 가게" : "사장님 가게";

  useEffect(() => {
    if (startDate && endDate) {
      handleFetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statisticsType, startDate, endDate]);

  const handleFetchData = async () => {
    if (!startDate || !endDate) {
      toast.error("시작일과 종료일을 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const [baseResponse, activityResponse] = await Promise.all([
        statisticsApi.getDailyStatistics(baseType, startDate, endDate),
        statisticsApi.getDailyStatistics(statisticsType, startDate, endDate),
      ]);

      if (baseResponse.ok && baseResponse.data) {
        setBaseData(baseResponse.data.contents || []);
      }

      if (activityResponse.ok && activityResponse.data) {
        setActivityData(activityResponse.data.contents || []);
      }

      if (
        (baseResponse.data?.contents.length === 0 || activityResponse.data?.contents.length === 0) &&
        baseResponse.ok &&
        activityResponse.ok
      ) {
        toast.info("조회된 데이터가 없습니다.");
      }

      onFetch();
    } catch (error) {
      console.error("통계 데이터 조회 실패:", error);
      setBaseData([]);
      setActivityData([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 전체 가게 수와 최근 활동 가게 수를 날짜 기준으로 병합한다.
   * 최근 활동 데이터가 있는 날짜만 대상으로 한다.
   */
  const getMergedRows = (): ActivityRow[] => {
    const activityDates = new Set(activityData.map((item) => item.date));
    const dataMap = new Map<string, ActivityRow>();

    const ensureRow = (date: string): ActivityRow => {
      if (!dataMap.has(date)) {
        dataMap.set(date, {date, base: 0, activity: 0, ratio: 0});
      }
      return dataMap.get(date)!;
    };

    baseData.forEach((item) => {
      if (activityDates.has(item.date)) {
        ensureRow(item.date).base = item.totalCount;
      }
    });

    activityData.forEach((item) => {
      ensureRow(item.date).activity = item.totalCount;
    });

    dataMap.forEach((row) => {
      row.ratio = row.base > 0 ? (row.activity / row.base) * 100 : 0;
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const rows = getMergedRows();

  const chartData = rows.map((row) => ({
    date: formatShortDateWithDay(row.date),
    "전체 가게 수": row.base,
    "최근 활동이 있는 가게 수": row.activity,
    "활동 비율(%)": parseFloat(row.ratio.toFixed(2)),
  }));

  if (loading) {
    return (
      <div className="py-5">
        <Loading/>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="bi-bar-chart-line"
        title="조회된 데이터가 없습니다"
        description="선택한 기간에 집계된 최근 활동 통계가 없습니다."
      />
    );
  }

  const latest = rows[rows.length - 1];

  return (
    <>
      <div className="page-note mb-3">
        <i className="bi bi-info-circle"/>
        <span>
          <strong>{storeLabel}</strong>의 전체 가게 수 대비 최근 활동이 있는 가게의 비율입니다.
        </span>
      </div>

      {/* 최신일 요약 */}
      <div className="row g-3 mb-3">
        <div className="col-4">
          <div className="stat-tile">
            <span className="stat-tile__label">전체 가게 수</span>
            <strong className="stat-tile__value">{formatNumber(latest.base)}</strong>
          </div>
        </div>
        <div className="col-4">
          <div className="stat-tile">
            <span className="stat-tile__label">최근 활동 가게</span>
            <strong className="stat-tile__value">{formatNumber(latest.activity)}</strong>
          </div>
        </div>
        <div className="col-4">
          <div className="stat-tile">
            <span className="stat-tile__label">활동 비율</span>
            <strong className="stat-tile__value">{latest.ratio.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      <SectionCard title="최근 활동이 있는 가게 수 추이" icon="bi-graph-up">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={chartData}>
            <CartesianGrid {...CHART_GRID_PROPS}/>
            <XAxis dataKey="date" {...CHART_AXIS_PROPS}/>
            <YAxis tickFormatter={formatAxisNumber} {...CHART_AXIS_PROPS}/>
            <Tooltip {...CHART_TOOLTIP_PROPS}/>
            <Legend {...CHART_LEGEND_PROPS}/>
            <Line
              type="monotone"
              dataKey="전체 가게 수"
              stroke={CHART_COLORS.neutral}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="최근 활동이 있는 가게 수"
              stroke={CHART_COLORS.success}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="최근 활동 가게 비율 추이" icon="bi-percent">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={chartData}>
            <CartesianGrid {...CHART_GRID_PROPS}/>
            <XAxis dataKey="date" {...CHART_AXIS_PROPS}/>
            <YAxis domain={[0, 100]} unit="%" {...CHART_AXIS_PROPS}/>
            <Tooltip {...CHART_TOOLTIP_PROPS}/>
            <Legend {...CHART_LEGEND_PROPS}/>
            <Line
              type="monotone"
              dataKey="활동 비율(%)"
              stroke={CHART_COLORS.danger}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard
        title="일자별 상세 데이터"
        icon="bi-table"
        description={`총 ${rows.length}일의 데이터가 조회되었습니다.`}
        flush
      >
        <DataTable maxHeight="440px">
          <thead>
          <tr>
            <th>날짜</th>
            <th className="num">전체 가게 수</th>
            <th className="num">최근 활동이 있는 가게 수</th>
            <th className="num">비율</th>
          </tr>
          </thead>
          <tbody>
          {[...rows].reverse().map((row) => (
            <tr key={row.date}>
              <td>{formatDateWithDay(row.date)}</td>
              <td className="num">{formatNumber(row.base)}</td>
              <td className="num">{formatNumber(row.activity)}</td>
              <td className="num">{row.ratio.toFixed(2)}%</td>
            </tr>
          ))}
          </tbody>
        </DataTable>
      </SectionCard>
    </>
  );
};

export default RecentActivityStatistics;
