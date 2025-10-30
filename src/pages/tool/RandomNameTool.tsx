import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Row, Spinner, Card, Table, Badge } from 'react-bootstrap';
import userApi from "../../api/userApi";
import { RandomNameItem } from "../../types/user";
import { toast } from "react-toastify";

const RandomNameTool = () => {
  const [randomNames, setRandomNames] = useState<RandomNameItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={10}>
          <Card className="p-4 shadow rounded-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary">유저 랜덤 이름 풀</h2>
              <p className="text-muted small">유저에게 할당되는 랜덤 닉네임의 현황을 확인할 수 있습니다.</p>
            </div>

            {errorMessage && (
              <Alert variant="danger" className="text-center">
                {errorMessage}
              </Alert>
            )}

            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="secondary" className="me-2">총 {randomNames.length}개</Badge>
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

            {isLoading && randomNames.length === 0 ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">데이터를 불러오는 중...</p>
              </div>
            ) : randomNames.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">랜덤 이름 데이터가 없습니다.</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <Table striped bordered hover>
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: '10%' }} className="text-center">번호</th>
                      <th style={{ width: '40%' }}>접두사</th>
                      <th style={{ width: '20%' }} className="text-center">마지막 발급 시퀀스</th>
                      <th style={{ width: '30%' }}>마지막 발급 닉네임</th>
                    </tr>
                  </thead>
                  <tbody>
                    {randomNames.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="fw-bold">{item.prefix}</td>
                        <td className="text-center">
                          <Badge bg="info">{item.sequence}</Badge>
                        </td>
                        <td>
                          <code className="text-primary">{formatNickname(item.prefix, item.sequence)}</code>
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
