import React, {useEffect, useState} from "react";
import {
  Bar,
  BarChart,
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

interface DefaultStatisticsProps {
  statisticsType: string;
  startDate: string;
  endDate: string;
  onFetch?: () => void;
}

const DefaultStatistics: React.FC<DefaultStatisticsProps> = ({
                                                               statisticsType,
                                                               startDate,
                                                               endDate,
                                                               onFetch
                                                             }) => {
  const [data, setData] = useState<DailyStatistic[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!statisticsType || !startDate || !endDate) {
      return;
    }

    setLoading(true);
    try {
      const response = await statisticsApi.getDailyStatistics(statisticsType, startDate, endDate);
      if (response.ok && response.data) {
        setData(response.data.contents || []);
        if (response.data.contents.length === 0) {
          toast.info("조회된 데이터가 없습니다.");
        }
      }
    } catch (error) {
      console.error("통계 데이터 조회 실패:", error);
      setData([]);
    } finally {
      setLoading(false);
      onFetch?.();
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statisticsType, startDate, endDate]);

  const chartData = data.map((item) => ({
    date: formatShortDateWithDay(item.date),
    "신규": item.newCount ?? 0,
    "누적": item.totalCount,
  }));

  // 요약 지표
  const totalNew = data.reduce((sum, item) => sum + (item.newCount ?? 0), 0);
  const latestTotal = data.length > 0 ? data[data.length - 1].totalCount : 0;
  const dailyAverage = data.length > 0 ? Math.round(totalNew / data.length) : 0;

  if (loading) {
    return (
      <div className="py-5">
        <Loading/>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon="bi-bar-chart-line"
        title="조회된 데이터가 없습니다"
        description="선택한 기간에 집계된 통계가 없습니다. 조회 기간을 변경해보세요."
      />
    );
  }

  return (
    <>
      {/* 요약 지표 */}
      <div className="row g-3 mb-3">
        <div className="col-4">
          <div className="stat-tile">
            <span className="stat-tile__label">기간 내 신규</span>
            <strong className="stat-tile__value">{formatNumber(totalNew)}</strong>
          </div>
        </div>
        <div className="col-4">
          <div className="stat-tile">
            <span className="stat-tile__label">일 평균 신규</span>
            <strong className="stat-tile__value">{formatNumber(dailyAverage)}</strong>
          </div>
        </div>
        <div className="col-4">
          <div className="stat-tile">
            <span className="stat-tile__label">최종 누적</span>
            <strong className="stat-tile__value">{formatNumber(latestTotal)}</strong>
          </div>
        </div>
      </div>

      <SectionCard title="일자별 신규 건수 추이" icon="bi-bar-chart-fill">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={chartData}>
            <CartesianGrid {...CHART_GRID_PROPS}/>
            <XAxis dataKey="date" {...CHART_AXIS_PROPS}/>
            <YAxis tickFormatter={formatAxisNumber} {...CHART_AXIS_PROPS}/>
            <Tooltip {...CHART_TOOLTIP_PROPS}/>
            <Legend {...CHART_LEGEND_PROPS}/>
            <Bar dataKey="신규" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="누적 건수 추이" icon="bi-graph-up">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={chartData}>
            <CartesianGrid {...CHART_GRID_PROPS}/>
            <XAxis dataKey="date" {...CHART_AXIS_PROPS}/>
            <YAxis domain={["auto", "auto"]} tickFormatter={formatAxisNumber} {...CHART_AXIS_PROPS}/>
            <Tooltip {...CHART_TOOLTIP_PROPS}/>
            <Legend {...CHART_LEGEND_PROPS}/>
            <Line type="monotone" dataKey="누적" stroke={CHART_COLORS.success} strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard
        title="일자별 상세 데이터"
        icon="bi-table"
        description={`총 ${data.length}일의 데이터가 조회되었습니다.`}
        flush
      >
        <DataTable maxHeight="440px">
          <thead>
          <tr>
            <th>날짜</th>
            <th className="num">신규 건수</th>
            <th className="num">누적 건수</th>
          </tr>
          </thead>
          <tbody>
          {[...data].reverse().map((item) => (
            <tr key={item.date}>
              <td>{formatDateWithDay(item.date)}</td>
              <td className="num">{formatNumber(item.newCount ?? 0)}</td>
              <td className="num">{formatNumber(item.totalCount)}</td>
            </tr>
          ))}
          </tbody>
        </DataTable>
      </SectionCard>
    </>
  );
};

export default DefaultStatistics;
