import React, {useState, useEffect, useMemo, useCallback} from "react";
import {Card, Container, Form, Button, Row, Col, Alert} from "react-bootstrap";
import { useRecoilValue } from "recoil";
import { AdminAuthState } from "../../state/AdminAuthState";
import { AdminRole } from "../../types/admin";
import enumApi from "../../api/enumApi";
import RecentActivityStatistics from "./RecentActivityStatistics";
import DefaultStatistics from "./DefaultStatistics";
import StoreByCategoryStatistics from "./StoreByCategoryStatistics";

const ServerStatistics = () => {
  const adminAuth = useRecoilValue(AdminAuthState);
  const [statisticsTypes, setStatisticsTypes] = useState<{ key: string; description: string }[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateRangeError, setDateRangeError] = useState<string>("");

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
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
    // 날짜가 없으면 안내 메시지만 표시
    if (!startDate || !endDate) {
      return (
        <Alert variant="info">
          조회 조건을 설정하고 통계를 확인하세요.
        </Alert>
      );
    }

    // RECENT_ACTIVITY 타입은 기존 컴포넌트 사용
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
              >
                최근 7일
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setQuickDateRange(30)}
              >
                최근 30일
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setQuickDateRange(90)}
              >
                최근 90일
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setQuickDateRange(365)}
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
                />
              </Form.Group>
            </Col>
          </Row>

          {dateRangeError && (
            <Alert variant="danger" className="mb-0">
              {dateRangeError}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* 통계 타입에 따라 적절한 컴포넌트 렌더링 */}
      {statisticsComponent}

      {/* 안내 문구 */}
      <Alert variant="secondary" className="mt-4">
        해당 지표는 실 데이터와는 별도로 수집·집계되며, 지표 수집을 시작한 시점 이후 데이터부터 제공됩니다.
      </Alert>
    </Container>
  );
};

export default ServerStatistics;
