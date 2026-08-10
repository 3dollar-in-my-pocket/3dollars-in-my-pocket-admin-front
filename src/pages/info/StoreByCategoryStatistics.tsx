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
import storeCategoryApi from "@/api/storeCategoryApi";
import {DailyStatistic} from "@/types/statistics";
import {StoreCategory} from "@/types/storeCategory";
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

interface StoreByCategoryStatisticsProps {
  statisticsType: string;
  startDate: string;
  endDate: string;
  onFetch?: () => void;
}

const StoreByCategoryStatistics: React.FC<StoreByCategoryStatisticsProps> = ({
                                                                              statisticsType,
                                                                              startDate,
                                                                              endDate,
                                                                              onFetch
                                                                            }) => {
  const [data, setData] = useState<DailyStatistic[]>([]);
  const [loading, setLoading] = useState(false);
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    fetchStoreCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory && startDate && endDate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statisticsType, selectedCategory, startDate, endDate]);

  const fetchStoreCategories = async () => {
    try {
      const response = await storeCategoryApi.getAllStoreCategories();
      if (response?.ok && response?.data?.contents) {
        const categories = response.data.contents;
        setStoreCategories(categories);
        if (categories.length > 0) {
          setSelectedCategory(categories[0].categoryId);
        }
      }
    } catch (error) {
      console.error("카테고리 조회 실패:", error);
    }
  };

  const fetchData = async () => {
    if (!selectedCategory) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await statisticsApi.getDailyStatistics(
        statisticsType,
        startDate,
        endDate,
        selectedCategory
      );
      if (response.ok && response.data) {
        setData(response.data.contents || []);
        if (response.data.contents.length === 0) {
          toast.info("조회된 데이터가 없습니다.");
        }
      }
    } catch (error) {
      console.error("카테고리 데이터 조회 실패:", error);
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

  const categoryName = storeCategories.find(c => c.categoryId === selectedCategory)?.name || "";

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
          description="선택한 카테고리와 기간에 집계된 통계가 없습니다."
        />
      );
    }

    return (
      <>
        <SectionCard title={`일자별 신규 가게 수 추이`} icon="bi-bar-chart-fill" description={categoryName}>
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

        <SectionCard title="누적 가게 수 추이" icon="bi-graph-up" description={categoryName}>
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
          description={`${categoryName} · 총 ${data.length}일의 데이터가 조회되었습니다.`}
          flush
        >
          <DataTable maxHeight="440px">
            <thead>
            <tr>
              <th>날짜</th>
              <th className="num">신규 가게 수</th>
              <th className="num">누적 가게 수</th>
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
      <FilterCard title="카테고리 선택" icon="bi-grid-3x3-gap">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="stat-store-category">가게 카테고리</label>
            <select
              id="stat-store-category"
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading}
            >
              {storeCategories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
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

export default StoreByCategoryStatistics;
