import React, {useEffect, useState} from 'react';
import {Alert, Button, Col, Container, Form, Row, Spinner, Card} from 'react-bootstrap';
import enumApi from "@/api/enumApi";
import cacheToolApi from "@/api/cacheToolApi";
import {toast} from "react-toastify";

const CacheTools = () => {
  const [cacheTypes, setCacheTypes] = useState([]);
  const [selectedCacheType, setSelectedCacheType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const evictCaches = async () => {
    if (!selectedCacheType) {
      setErrorMessage('❗ 캐시 타입을 선택해주세요.');
      return;
    }

    if (!window.confirm('정말로 캐시를 제거하겠습니까?')) return;

    try {
      setIsLoading(true);
      const response = await cacheToolApi.evictAll(selectedCacheType);
      if (response.ok) {
        toast.success('✅ 캐시가 성공적으로 제거되었습니다');
        setSelectedCacheType('');
        setErrorMessage('');
      }
    } catch (error: any) {
      if (error.response) {
        // HTTP 에러 (인터셉터가 toast까지 처리)
        setErrorMessage(error.response.data?.message || '예상치 못한 오류가 발생했습니다.');
      } else if (error.request) {
        setErrorMessage('서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMessage(error.message || '예상치 못한 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectedCache = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCacheType(e.target.value);
    setErrorMessage('');
  };

  useEffect(() => {
    enumApi.getEnum().then((response) => {
      if (response.ok) {
        setCacheTypes(response.data['CacheType']);
      }
    });
  }, []);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="p-4 shadow rounded-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-danger">🧹 캐시 만료 도구</h2>
              <p className="text-muted small">선택한 캐시 타입의 모든 항목을 만료 처리합니다.</p>
            </div>

            {errorMessage && (
              <Alert variant="danger" className="text-center">
                {errorMessage}
              </Alert>
            )}

            <Form.Group controlId="selectCacheType" className="mb-4">
              <Form.Label className="fw-semibold">📦 캐시 타입 선택</Form.Label>
              <Form.Select
                value={selectedCacheType}
                onChange={handleSelectedCache}
                aria-label="캐시 타입 선택"
                className="shadow-sm"
              >
                <option value="">캐시 타입을 선택하세요</option>
                {cacheTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.description}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="danger"
                onClick={evictCaches}
                disabled={!selectedCacheType || isLoading}
                className="btn-lg shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2"/>
                    처리 중...
                  </>
                ) : (
                  '🗑️ 캐시 만료시키기'
                )}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CacheTools;
