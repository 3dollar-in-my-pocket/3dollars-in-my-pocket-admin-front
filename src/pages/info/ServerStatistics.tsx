import React, {useState, useEffect} from "react";
import {Card, Container, Form, Button, Row, Col, Table, Alert} from "react-bootstrap";
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
import enumApi from "../../api/enumApi";
import {DailyStatistic} from "../../types/statistics";
import {toast} from "react-toastify";
import RecentActivityStatistics from "./RecentActivityStatistics";

const ServerStatistics = () => {
  const [statisticsTypes, setStatisticsTypes] = useState<{ key: string; description: string }[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [data, setData] = useState<DailyStatistic[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRangeError, setDateRangeError] = useState<string>("");

  useEffect(() => {
    fetchStatisticsTypes();
    setQuickDateRange(30); // 기본값: 최근 30일
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatisticsTypes = async () => {
    try {
      const response = await enumApi.getEnum();
      if (response?.data?.StatisticsType) {
        const types = response.data.StatisticsType || [];

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
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateDateRange = (): boolean => {
    if (!startDate || !endDate) {
      setDateRangeError("시작일과 종료일을 모두 선택해주세요.");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setDateRangeError("시작일은 종료일보다 이전이어야 합니다.");
      return false;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      setDateRangeError("조회 기간은 최대 1년(365일)까지 가능합니다.");
      return false;
    }

    setDateRangeError("");
    return true;
  };

  const handleFetchData = async () => {
    if (!selectedType) {
      toast.error("통계 타입을 선택해주세요.");
      return;
    }

    if (!validateDateRange()) {
      return;
    }

    setLoading(true);
    try {
      const response = await statisticsApi.getDailyStatistics(selectedType, startDate, endDate);
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
        date: `${dateStr} (${dayOfWeek})`, // MM-DD (요일) 형식으로 표시
        "신규": item.newCount ?? 0,
        "누적": item.totalCount,
      };
    });
  };

  const isRecentActivityType = () => {
    return selectedType === "RECENT_ACTIVITY_USER_STORE" || selectedType === "RECENT_ACTIVITY_BOSS_STORE";
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-primary">📊 서비스 통계 (서버)</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-3">조회 조건</h5>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">통계 타입</Form.Label>
            <Form.Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={loading}
            >
              {statisticsTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.description}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">빠른 기간 선택</Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setQuickDateRange(7)}
                disabled={loading}
              >
                최근 7일
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setQuickDateRange(30)}
                disabled={loading}
              >
                최근 30일
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setQuickDateRange(90)}
                disabled={loading}
              >
                최근 90일
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setQuickDateRange(365)}
                disabled={loading}
              >
                최근 1년
              </Button>
            </div>
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">시작일</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDateRangeError("");
                  }}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">종료일</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDateRangeError("");
                  }}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          {dateRangeError && (
            <Alert variant="danger" className="mb-3">
              {dateRangeError}
            </Alert>
          )}

          {!isRecentActivityType() && (
            <Button
              variant="primary"
              onClick={handleFetchData}
              disabled={loading || !selectedType}
              className="w-100"
            >
              {loading ? "조회 중..." : "통계 조회"}
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* RECENT_ACTIVITY 타입은 별도 컴포넌트로 처리 */}
      {isRecentActivityType() ? (
        <RecentActivityStatistics
          key={selectedType}
          statisticsType={selectedType as "RECENT_ACTIVITY_USER_STORE" | "RECENT_ACTIVITY_BOSS_STORE"}
          startDate={startDate}
          endDate={endDate}
          onFetch={() => setData([])}
        />
      ) : (
        <>
          {data.length > 0 && (
            <>
              {/* 일자별 신규 건수 추이 */}
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <h5 className="fw-semibold mb-3">일자별 신규 건수 추이</h5>
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

              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <h5 className="fw-semibold mb-3">누적 건수 추이</h5>
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
                  <h5 className="fw-semibold mb-3">일자별 상세 데이터</h5>
                  <p className="text-muted mb-3">
                    총 <strong>{data.length}일</strong>의 데이터가 조회되었습니다.
                  </p>
                  <div style={{maxHeight: "500px", overflowY: "auto"}}>
                    <Table striped bordered hover>
                      <thead className="table-light" style={{position: "sticky", top: 0}}>
                      <tr>
                        <th>날짜</th>
                        <th className="text-end">신규 건수</th>
                        <th className="text-end">누적 건수</th>
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

          {!loading && data.length === 0 && (
            <Alert variant="info">
              조회 조건을 설정하고 <strong>통계 조회</strong> 버튼을 클릭하세요.
            </Alert>
          )}
        </>
      )}

      {/* 안내 문구 */}
      <Alert variant="secondary" className="mt-4">
        해당 지표는 실 데이터와는 별도로 수집·집계되며, 지표 수집을 시작한 시점 이후 데이터부터 제공됩니다.
      </Alert>
    </Container>
  );
};

export default ServerStatistics;
