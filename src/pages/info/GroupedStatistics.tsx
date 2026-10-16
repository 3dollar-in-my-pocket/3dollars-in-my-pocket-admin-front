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
import FilterCard from "@/components/common/FilterCard";
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

export interface StatisticsGroup {
  id: string;
  name: string;
}

interface GroupedStatisticsProps {
  statisticsType: string;
  startDate: string;
  endDate: string;
  /** groupId 로 전달될 그룹 목록 (예: 가게 카테고리, SNS 플랫폼) */
  groups: StatisticsGroup[];
  /** 그룹 선택 라벨 (예: "가게 카테고리") */
  groupLabel: string;
  /** 집계 대상 단위 (예: "가게 수") */
  unitLabel: string;
  onFetch?: () => void;
}

/** groupId 별로 나뉘어 집계되는 일자별 통계 */
const GroupedStatistics: React.FC<GroupedStatisticsProps> = ({
                                                               statisticsType,
                                                               startDate,
                                                               endDate,
                                                               groups,
                                                               groupLabel,
                                                               unitLabel,
                                                               onFetch
                                                             }) => {
  const [data, setData] = useState<DailyStatistic[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // 그룹 목록이 바뀌면 (통계 타입 변경 등) 첫 그룹으로 초기화
  useEffect(() => {
    setSelectedGroup(groups[0]?.id ?? "");
  }, [groups]);

  useEffect(() => {
    if (selectedGroup && startDate && endDate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statisticsType, selectedGroup, startDate, endDate]);

  const fetchData = async () => {

    setLoading(true);
    try {
      const response = await statisticsApi.getDailyStatistics(
        statisticsType,
        startDate,
        endDate,
        selectedGroup
      );
      if (response.ok && response.data) {
        setData(response.data.contents || []);
        if (response.data.contents.length === 0) {
          toast.info("조회된 데이터가 없습니다.");
        }
      }
    } catch (error) {
      console.error("그룹별 통계 데이터 조회 실패:", error);
      setData([]);
    } finally {
      setLoading(false);
      onFetch?.();
    }
  };

  const chartData = data.map((item) => ({
    date: formatShortDateWithDay(item.date),
    "신규": item.newCount ?? 0,
    "누적": item.totalCount,
  }));

  const groupName = groups.find(g => g.id === selectedGroup)?.name || "";

  const renderResult = () => {
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
          description="선택한 그룹과 기간에 집계된 통계가 없습니다."
        />
      );
    }

    return (
      <>
        <SectionCard title={`일자별 신규 ${unitLabel} 추이`} icon="bi-bar-chart-fill" description={groupName}>
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

        <SectionCard title={`누적 ${unitLabel} 추이`} icon="bi-graph-up" description={groupName}>
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
          description={`${groupName} · 총 ${data.length}일의 데이터가 조회되었습니다.`}
          flush
        >
          <DataTable maxHeight="440px">
            <thead>
            <tr>
              <th>날짜</th>
              <th className="num">신규 {unitLabel}</th>
              <th className="num">누적 {unitLabel}</th>
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

  return (
    <>
      <FilterCard title={`${groupLabel} 선택`} icon="bi-grid-3x3-gap">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="stat-group">{groupLabel}</label>
            <select
              id="stat-group"
              className="form-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              disabled={loading}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterCard>

      {renderResult()}
    </>
  );
};

export default GroupedStatistics;
