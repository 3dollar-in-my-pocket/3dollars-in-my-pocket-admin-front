import React, {useState, useEffect} from "react";
import {Card, Button, Alert, Table} from "react-bootstrap";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";
import statisticsApi from "../../api/statisticsApi";
import {DailyStatistic} from "../../types/statistics";
import {toast} from "react-toastify";

interface RecentActivityStatisticsProps {
  statisticsType: "RECENT_ACTIVITY_USER_STORE" | "RECENT_ACTIVITY_BOSS_STORE";
  startDate: string;
  endDate: string;
  onFetch: () => void;
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

  useEffect(() => {
    if (startDate && endDate) {
      handleFetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const formatNumber = (num: number): string => {
    return num.toLocaleString("ko-KR");
  };

  const formatDateWithDay = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = days[date.getDay()];
    return `${dateStr} (${dayOfWeek})`;
  };

  const getChartData = () => {
    // 최근 활동 스토어 데이터가 있는 날짜만 사용
    const activityDates = new Set(activityData.map((item) => item.date));

    // 날짜를 기준으로 데이터 매핑
    const dataMap = new Map<string, { base: number; activity: number; ratio: number }>();

    baseData.forEach((item) => {
      // 최근 활동 데이터가 있는 날짜만 포함
      if (activityDates.has(item.date)) {
        if (!dataMap.has(item.date)) {
          dataMap.set(item.date, {base: 0, activity: 0, ratio: 0});
        }
        dataMap.get(item.date)!.base = item.totalCount;
      }
    });

    activityData.forEach((item) => {
      if (!dataMap.has(item.date)) {
        dataMap.set(item.date, {base: 0, activity: 0, ratio: 0});
      }
      dataMap.get(item.date)!.activity = item.totalCount;
    });

    // 비율 계산
    dataMap.forEach((value) => {
      if (value.base > 0) {
        value.ratio = (value.activity / value.base) * 100;
      }
    });

    // 날짜순 정렬 및 차트 데이터 생성
    return Array.from(dataMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => {
        const dateObj = new Date(date);
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const dayOfWeek = days[dateObj.getDay()];
        const dateStr = date.substring(5); // MM-DD

        return {
          date: `${dateStr} (${dayOfWeek})`,
          "전체 가게 수": value.base,
          "최근 활동이 있는 가게 수": value.activity,
          "활동 비율(%)": parseFloat(value.ratio.toFixed(2)),
        };
      });
  };

  const getTableData = () => {
    // 최근 활동 스토어 데이터가 있는 날짜만 사용
    const activityDates = new Set(activityData.map((item) => item.date));

    const dataMap = new Map<
      string,
      { base: number; activity: number; ratio: number }
    >();

    baseData.forEach((item) => {
      // 최근 활동 데이터가 있는 날짜만 포함
      if (activityDates.has(item.date)) {
        if (!dataMap.has(item.date)) {
          dataMap.set(item.date, {base: 0, activity: 0, ratio: 0});
        }
        dataMap.get(item.date)!.base = item.totalCount;
      }
    });

    activityData.forEach((item) => {
      if (!dataMap.has(item.date)) {
        dataMap.set(item.date, {base: 0, activity: 0, ratio: 0});
      }
      dataMap.get(item.date)!.activity = item.totalCount;
    });

    dataMap.forEach((value) => {
      if (value.base > 0) {
        value.ratio = (value.activity / value.base) * 100;
      }
    });

    return Array.from(dataMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({
        date,
        base: value.base,
        activity: value.activity,
        ratio: value.ratio,
      }));
  };

  const chartData = getChartData();
  const tableData = getTableData();
  const hasData = chartData.length > 0;

  return (
    <>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Alert variant="info" className="mb-3">
            <strong>{statisticsType === "RECENT_ACTIVITY_USER_STORE" ? "유저 스토어" : "사장님 스토어"}</strong>의
            최근 활동 통계입니다.
            <br/>
            전체 스토어 수 대비 최근 활동이 있는 스토어의 비율을 확인할 수 있습니다.
          </Alert>

          <Button variant="primary" onClick={handleFetchData} disabled={loading} className="w-100">
            {loading ? "조회 중..." : "통계 조회"}
          </Button>
        </Card.Body>
      </Card>

      {/* 안내 문구 */}
      <Alert variant="secondary" className="mb-4">
        해당 지표는 실 데이터와는 별도로 수집·집계되며, 지표 수집을 시작한 시점 이후 데이터부터 제공됩니다.
      </Alert>

      {hasData && (
        <>
          {/* 누적 건수 비교 차트 */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="fw-semibold mb-3">최근 활동이 있는 가게 수 추이</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date"/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Line
                    type="monotone"
                    dataKey="최근 활동이 있는 가게 수"
                    stroke="#198754"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* 활동 비율 차트 */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="fw-semibold mb-3">최근 활동 가게 비율 추이 (%)</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date"/>
                  <YAxis domain={[0, 100]}/>
                  <Tooltip/>
                  <Legend/>
                  <Line
                    type="monotone"
                    dataKey="활동 비율(%)"
                    stroke="#dc3545"
                    strokeWidth={2}
                    dot={{fill: "#dc3545"}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* 테이블 영역 */}
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-semibold mb-3">일자별 상세 데이터</h5>
              <p className="text-muted mb-3">
                총 <strong>{tableData.length}일</strong>의 데이터가 조회되었습니다.
              </p>
              <div style={{maxHeight: "500px", overflowY: "auto"}}>
                <Table striped bordered hover>
                  <thead className="table-light" style={{position: "sticky", top: 0}}>
                  <tr>
                    <th>날짜</th>
                    <th className="text-end">전체 가게 수</th>
                    <th className="text-end">최근 활동이 있는 가게 수</th>
                    <th className="text-end">비율 (%)</th>
                  </tr>
                  </thead>
                  <tbody>
                  {tableData.map((item, index) => (
                    <tr key={index}>
                      <td>{formatDateWithDay(item.date)}</td>
                      <td className="text-end">{formatNumber(item.base)}</td>
                      <td className="text-end">{formatNumber(item.activity)}</td>
                      <td className="text-end">{item.ratio.toFixed(2)}%</td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {!loading && !hasData && (
        <Alert variant="info">
          <strong>통계 조회</strong> 버튼을 클릭하여 데이터를 조회하세요.
        </Alert>
      )}
    </>
  );
};

export default RecentActivityStatistics;
