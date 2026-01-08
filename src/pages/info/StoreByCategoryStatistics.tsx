import React, {useState, useEffect} from "react";
import {Card, Table, Alert, Form} from "react-bootstrap";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import statisticsApi from "../../api/statisticsApi";
import storeCategoryApi from "../../api/storeCategoryApi";
import {DailyStatistic} from "../../types/statistics";
import {StoreCategory} from "../../types/storeCategory";
import {toast} from "react-toastify";

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

  const formatNumber = (num: number): string => {
    return num.toLocaleString("ko-KR");
  };

  const formatDateWithDay = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = days[date.getDay()];
    return `${dateStr} (${dayOfWeek})`;
  };

  const formatYAxisTick = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toString();
  };

  const getChartData = () => {
    return data.map((item) => {
      const date = new Date(item.date);
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      const dayOfWeek = days[date.getDay()];
      const dateStr = item.date.substring(5); // MM-DD

      return {
        date: `${dateStr} (${dayOfWeek})`,
        "신규": item.newCount ?? 0,
        "누적": item.totalCount,
      };
    });
  };

  const getSelectedCategoryName = () => {
    const category = storeCategories.find(c => c.categoryId === selectedCategory);
    return category?.name || "";
  };

  return (
    <>
      {/* 카테고리 선택 */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">카테고리 선택</Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading}
            >
              {storeCategories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
            {selectedCategory && (
              <Form.Text className="text-muted">
                현재 선택된 카테고리: <strong>{getSelectedCategoryName()}</strong>
              </Form.Text>
            )}
          </Form.Group>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">조회 중...</span>
          </div>
        </div>
      ) : data.length === 0 ? (
        <Alert variant="info">
          카테고리를 선택하면 해당 카테고리의 가게 통계가 표시됩니다.
        </Alert>
      ) : (
        <>
          {/* 일자별 신규 가게 수 추이 */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="fw-semibold mb-3">
                [{getSelectedCategoryName()}] 일자별 신규 가게 수 추이
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date"/>
                  <YAxis tickFormatter={formatYAxisTick}/>
                  <Tooltip/>
                  <Legend/>
                  <Bar dataKey="신규" fill="#0d6efd"/>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* 누적 가게 수 추이 */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="fw-semibold mb-3">
                [{getSelectedCategoryName()}] 누적 가게 수 추이
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date"/>
                  <YAxis domain={["auto", "auto"]} tickFormatter={formatYAxisTick}/>
                  <Tooltip/>
                  <Legend/>
                  <Line type="monotone" dataKey="누적" stroke="#198754" strokeWidth={2}/>
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* 테이블 영역 */}
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-semibold mb-3">
                [{getSelectedCategoryName()}] 일자별 상세 데이터
              </h5>
              <p className="text-muted mb-3">
                총 <strong>{data.length}일</strong>의 데이터가 조회되었습니다.
              </p>
              <div style={{maxHeight: "500px", overflowY: "auto"}}>
                <Table striped bordered hover>
                  <thead className="table-light" style={{position: "sticky", top: 0}}>
                  <tr>
                    <th>날짜</th>
                    <th className="text-end">신규 가게 수</th>
                    <th className="text-end">누적 가게 수</th>
                  </tr>
                  </thead>
                  <tbody>
                  {[...data].reverse().map((item, index) => (
                    <tr key={index}>
                      <td>{formatDateWithDay(item.date)}</td>
                      <td className="text-end">{formatNumber(item.newCount ?? 0)}</td>
                      <td className="text-end">{formatNumber(item.totalCount)}</td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
};

export default StoreByCategoryStatistics;
