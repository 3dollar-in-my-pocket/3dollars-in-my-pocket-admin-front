import React, {useState} from "react";
import axios from "axios";
import {Alert, Button, Card, Col, Container, Form, Row} from "react-bootstrap";

const PushManage = () => {
  const [accountIdsInput, setAccountIdsInput] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [path, setPath] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendPush = async () => {
    const accountIds = accountIdsInput
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!accountIds.length || !title || !body) {
      setResult({type: "danger", message: "모든 필드를 입력해 주세요."});
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/push/send", {
        accountIds,
        accountType: "USER_ACCOUNT",
        title,
        body,
        path,
      });

      if (response.status === 200) {
        setResult({type: "success", message: "✅ 푸시 발송 성공!"});
        setAccountIdsInput("");
        setTitle("");
        setBody("");
        setPath("");
      } else {
        setResult({type: "danger", message: "❌ 푸시 발송 실패"});
      }
    } catch (error) {
      console.error(error);
      setResult({type: "danger", message: "⚠️ 서버 오류 발생"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <style>{`
        @media (max-width: 767px) {
          .push-preview-phone {
            width: 280px !important;
            height: 500px !important;
            padding-top: 20px !important;
          }
          .push-form-card {
            margin-bottom: 2rem;
          }
          .mobile-full-width {
            width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* 모바일 헤더 */}
      <div className="d-md-none mb-4 border-bottom pb-3">
        <h2 className="fw-bold mb-0">📣 푸시 발송</h2>
      </div>

      <Row>
        <Col md={6} className="mb-4 mb-md-0">
          <Card className="shadow-sm p-3 p-md-4 push-form-card">
            <Card.Body>
              {/* 데스크톱 헤더 */}
              <h3 className="fw-bold mb-4 d-none d-md-block">📣 푸시 발송</h3>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-people me-2"></i>사용자 ID (쉼표로 구분)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="예: user1, user2, user3"
                    value={accountIdsInput}
                    onChange={(e) => setAccountIdsInput(e.target.value)}
                    size="lg"
                    className="border-2"
                  />
                  <Form.Text className="text-muted small">
                    여러 사용자에게 발송하려면 쉼표로 구분해주세요
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-type me-2"></i>제목
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="푸시 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="lg"
                    className="border-2"
                    maxLength={50}
                  />
                  <Form.Text className="text-muted small">
                    {title.length}/50자
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-chat-text me-2"></i>내용
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="푸시 메시지 내용을 입력하세요"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    size="lg"
                    className="border-2"
                    maxLength={200}
                  />
                  <Form.Text className="text-muted small">
                    {body.length}/200자
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-link-45deg me-2"></i>이동 경로 (선택)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="/home, /event 등"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    size="lg"
                    className="border-2"
                  />
                  <Form.Text className="text-muted small">
                    푸시 터치 시 이동할 앱 화면 경로
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={sendPush}
                    disabled={loading}
                    className="py-3 fw-bold"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        발송 중...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        푸시 발송
                      </>
                    )}
                  </Button>
                </div>
              </Form>

              {result && (
                <Alert variant={result.type} className="mt-4 mb-0">
                  {result.message}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm p-3 p-md-4">
            <Card.Body>
              <h3 className="fw-bold mb-4 text-center text-md-start">
                <i className="bi bi-phone me-2"></i>푸시 알림 미리보기
              </h3>
              <div
                className="push-preview-phone mobile-full-width"
                style={{
                  width: "350px",
                  height: "600px",
                  backgroundColor: "#fff",
                  borderRadius: "30px",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                  position: "relative",
                  margin: "0 auto",
                  paddingTop: "30px",
                  paddingBottom: "20px",
                }}
              >
                <div
                  style={{
                    height: "50px",
                    backgroundColor: "#f0f0f0",
                    borderBottom: "1px solid #ddd",
                    padding: "10px 15px",
                    fontSize: "14px",
                    color: "#333",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  푸시 알림
                </div>

                <div
                  style={{
                    padding: "20px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: "10px",
                    textAlign: "center",
                  }}
                >
                  {title || "푸시 제목"}
                </div>

                <div
                  style={{
                    padding: "0 20px",
                    fontSize: "16px",
                    color: "#555",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  {body || "푸시 내용이 여기에 들어갑니다."}
                </div>

                {path && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#007aff",
                      textAlign: "center",
                      textDecoration: "underline",
                    }}
                  >
                    {path}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PushManage;
