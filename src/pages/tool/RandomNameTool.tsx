import { useEffect, useState, useMemo } from 'react';
import { Alert, Button, Col, Container, Row, Spinner, Card, Table, Badge, ButtonGroup } from 'react-bootstrap';
import userApi from "../../api/userApi";
import { RandomNameItem } from "../../types/user";

type FilterType = 'all' | 'issued' | 'not_issued';

const RandomNameTool = () => {
  const [randomNames, setRandomNames] = useState<RandomNameItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const fetchRandomNames = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await userApi.getRandomNames();

      if (response.ok) {
        setRandomNames(response.data.contents);
      } else {
        setErrorMessage(response.data?.message || '데이터 조회에 실패했습니다.');
      }
    } catch (error: any) {
      if (!error.response) {
        setErrorMessage('서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMessage(error.response.data?.message || '예상치 못한 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomNames();
  }, []);

  const formatNickname = (prefix: string, sequence: number) => {
    return `${prefix}#${sequence}`;
  };

  const filteredRandomNames = useMemo(() => {
    switch (filterType) {
      case 'issued':
        return randomNames.filter(item => item.sequence > 0);
      case 'not_issued':
        return randomNames.filter(item => item.sequence === 0);
      case 'all':
      default:
        return randomNames;
    }
  }, [randomNames, filterType]);

  const statistics = useMemo(() => {
    if (randomNames.length === 0) {
      return {
        max: 0,
        min: 0,
        average: 0,
        total: 0
      };
    }

    const issuedItems = randomNames.filter(item => item.sequence > 0);
    const sequences = randomNames.map(item => item.sequence);
    const total = sequences.reduce((acc, curr) => acc + curr, 0);
    const average = total / randomNames.length; // 미발급(0)도 포함하여 평균 계산

    const max = issuedItems.length > 0 ? Math.max(...issuedItems.map(item => item.sequence)) : 0;
    const min = Math.min(...sequences); // 미발급(0)도 포함하여 최소값 계산

    return {
      max,
      min,
      average: Math.round(average * 10) / 10, // 소수점 첫째자리까지
      total
    };
  }, [randomNames]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={10}>
          <Card className="p-4 shadow rounded-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary">유저 랜덤 이름 관리</h2>
              <p className="text-muted small">유저에게 할당되는 랜덤 닉네임의 현황을 확인할 수 있습니다.</p>
            </div>

            {errorMessage && (
              <Alert variant="danger" className="text-center">
                {errorMessage}
              </Alert>
            )}

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <Badge bg="secondary" className="me-2">
                    전체 {randomNames.length}개
                  </Badge>
                  {filterType !== 'all' && (
                    <Badge bg="info">
                      필터링 결과 {filteredRandomNames.length}개
                    </Badge>
                  )}
                </div>
                <Button
                  variant="primary"
                  onClick={fetchRandomNames}
                  disabled={isLoading}
                  className="shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      조회 중...
                    </>
                  ) : (
                    '새로고침'
                  )}
                </Button>
              </div>

              <Card className="bg-light border-0 mb-3">
                <Card.Body className="p-3">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-graph-up me-2"></i>
                    발급 통계 (전체 기준)
                  </h6>
                  <Row>
                    <Col xs={6} md={3}>
                      <div className="text-center mb-3 mb-md-0">
                        <small className="text-muted d-block mb-1">총 발급</small>
                        <h5 className="mb-0 text-dark fw-bold">
                          {statistics.total.toLocaleString()}
                          <small className="text-muted ms-1">회</small>
                        </h5>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div className="text-center mb-3 mb-md-0">
                        <small className="text-muted d-block mb-1">최대 발급</small>
                        <h5 className="mb-0 text-danger">
                          {statistics.max}
                          <small className="text-muted ms-1">회</small>
                        </h5>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div className="text-center">
                        <small className="text-muted d-block mb-1">평균 발급</small>
                        <h5 className="mb-0 text-primary">
                          {statistics.average.toFixed(1)}
                          <small className="text-muted ms-1">회</small>
                        </h5>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div className="text-center">
                        <small className="text-muted d-block mb-1">최소 발급</small>
                        <h5 className="mb-0 text-success">
                          {statistics.min}
                          <small className="text-muted ms-1">회</small>
                        </h5>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <ButtonGroup className="w-100">
                <Button
                  variant={filterType === 'all' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilterType('all')}
                  disabled={isLoading}
                >
                  전체보기
                </Button>
                <Button
                  variant={filterType === 'issued' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilterType('issued')}
                  disabled={isLoading}
                >
                  발급된 닉네임만
                </Button>
                <Button
                  variant={filterType === 'not_issued' ? 'primary' : 'outline-primary'}
                  onClick={() => setFilterType('not_issued')}
                  disabled={isLoading}
                >
                  발급 이력 없는 닉네임만
                </Button>
              </ButtonGroup>
            </div>

            {isLoading && randomNames.length === 0 ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">데이터를 불러오는 중...</p>
              </div>
            ) : filteredRandomNames.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">
                  {randomNames.length === 0 ? '랜덤 이름 데이터가 없습니다.' : '필터 조건에 맞는 데이터가 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <Table striped bordered hover>
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: '10%' }} className="text-center">번호</th>
                      <th style={{ width: '40%' }}>접두사</th>
                      <th style={{ width: '20%' }} className="text-center">발급 횟수</th>
                      <th style={{ width: '30%' }}>마지막 발급 닉네임</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRandomNames.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="fw-bold">{item.prefix}</td>
                        <td className="text-center">
                          {item.sequence === 0 ? (
                            <span className="text-muted fst-italic">발급 이력 없음</span>
                          ) : (
                            <Badge bg="info">{item.sequence}</Badge>
                          )}
                        </td>
                        <td>
                          {item.sequence === 0 ? (
                            <span className="text-muted fst-italic">발급 이력 없음</span>
                          ) : (
                            <code className="text-primary">{formatNickname(item.prefix, item.sequence)}</code>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RandomNameTool;
