import {useEffect, useState} from 'react';
import {Alert, Button, Card, Col, Container, Row, Spinner, Badge} from 'react-bootstrap';
import medalApi from "../../api/medalApi";
import {Medal, hasAcquisition, getAcquisitionDescription} from "../../types/medal";
import MedalModal from "./MedalModal";

const MedalManagement = () => {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null);

  const fetchMedals = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await medalApi.getMedals();

      if (response.ok) {
        setMedals(response.data.contents);
      } else {
        setErrorMessage(response.data?.message || '메달 목록 조회에 실패했습니다.');
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
    fetchMedals();
  }, []);

  const handleMedalClick = (medal: Medal) => {
    setSelectedMedal(medal);
  };

  const handleModalClose = () => {
    setSelectedMedal(null);
  };

  const handleMedalUpdate = () => {
    fetchMedals();
    setSelectedMedal(null);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h2 className="fw-bold">🏅 메달 관리</h2>
        <Button variant="primary" onClick={fetchMedals} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2"/>
              조회 중...
            </>
          ) : (
            '새로고침'
          )}
        </Button>
      </div>

      {errorMessage && (
        <Alert variant="danger" className="text-center">
          {errorMessage}
        </Alert>
      )}

      <div className="mb-3">
        <Badge bg="secondary" className="me-2">총 {medals.length}개</Badge>
      </div>

      {isLoading && medals.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary"/>
          <p className="mt-3 text-muted">메달 목록을 불러오는 중...</p>
        </div>
      ) : medals.length === 0 ? (
        <div className="text-center py-5">
          <div className="bg-light rounded-circle mx-auto mb-3"
               style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <i className="bi bi-award fs-1 text-secondary"></i>
          </div>
          <h5 className="text-muted">메달이 없습니다.</h5>
        </div>
      ) : (
        <Row className="g-3 g-md-4">
          {medals.map((medal) => (
            <Col key={medal.medalId} xs={12} sm={6} md={4} lg={3}>
              <Card
                className="h-100 shadow-sm hover-shadow"
                style={{cursor: 'pointer', transition: 'all 0.3s'}}
                onClick={() => handleMedalClick(medal)}
              >
                <Card.Body className="d-flex flex-column">
                  <div className="text-center mb-3">
                    <img
                      src={medal.iconUrl}
                      alt={medal.name}
                      className="img-fluid"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'contain'
                      }}
                      onError={(e: any) => {
                        e.target.src = medal.disableIconUrl;
                      }}
                    />
                  </div>

                  <div className="text-center mb-2">
                    <h6 className="fw-bold mb-1">{medal.name}</h6>
                  </div>

                  <p className="text-muted small text-center mb-3" style={{minHeight: '40px'}}>
                    {medal.introduction}
                  </p>

                  {hasAcquisition(medal) && (
                    <div className="mt-auto">
                      <div className="bg-light rounded p-2 border border-success border-opacity-25">
                        <small className="text-success fw-semibold d-block mb-1">
                          <i className="bi bi-trophy-fill me-1"></i>
                          획득 조건
                        </small>
                        <small className="text-dark">
                          {getAcquisitionDescription(medal)}
                        </small>
                      </div>
                    </div>
                  )}

                  {!hasAcquisition(medal) && (
                    <div className="mt-auto">
                      <div className="bg-light rounded p-2 border">
                        <small className="text-muted fst-italic">
                          <i className="bi bi-info-circle me-1"></i>
                          기본 메달
                        </small>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <MedalModal
        show={!!selectedMedal}
        onHide={handleModalClose}
        medal={selectedMedal}
        onUpdate={handleMedalUpdate}
      />
    </Container>
  );
};

export default MedalManagement;
