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

      <div className="row h-100">
        {/* Mobile Preview */}
        <div className="col-12 col-lg-5 d-flex justify-content-center align-items-center mb-4 mb-lg-0">
          <div
            style={{
              width: "300px",
              height: "550px",
              backgroundColor: "#000",
              borderRadius: "25px",
              padding: "8px",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
              position: "relative"
            }}
          >
            {/* Phone Screen */}
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#1a1a1a",
                borderRadius: "18px",
                overflow: "hidden",
                position: "relative"
              }}
            >
              {/* Status Bar */}
              <div
                style={{
                  height: "30px",
                  backgroundColor: "#000",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 15px",
                  fontSize: "12px",
                  color: "#fff",
                  fontWeight: "500"
                }}
              >
                <span>9:41</span>
                <span>🔋 100%</span>
              </div>

              {/* Notification Area */}
              <div
                style={{
                  backgroundColor: "#2c2c2e",
                  margin: "10px",
                  borderRadius: "12px",
                  padding: "15px",
                  border: "1px solid #3a3a3c",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
                }}
              >
                {/* App Icon and Name */}
                <div className="d-flex align-items-center mb-2">
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      backgroundColor: "#007AFF",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px"
                    }}
                  >
                    <span style={{color: "white", fontSize: "12px", fontWeight: "bold"}}>3</span>
                  </div>
                  <span style={{color: "#fff", fontSize: "13px", fontWeight: "500"}}>
                    가슴속 3천원
                  </span>
                  <span style={{color: "#8e8e93", fontSize: "12px", marginLeft: "auto"}}>
                    지금
                  </span>
                </div>

                {/* Notification Content */}
                <div style={{color: "#fff"}}>
                  <div style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    marginBottom: "4px",
                    lineHeight: "1.3"
                  }}>
                    {title || "푸시 제목이 여기에 표시됩니다"}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#d1d1d6",
                    lineHeight: "1.4"
                  }}>
                    {body || "푸시 메시지 내용이 여기에 표시됩니다. 사용자가 입력한 내용을 실시간으로 확인할 수 있습니다."}
                  </div>
                  {path && (
                    <div style={{
                      fontSize: "12px",
                      color: "#007AFF",
                      marginTop: "8px",
                      padding: "4px 8px",
                      backgroundColor: "rgba(0, 122, 255, 0.1)",
                      borderRadius: "4px",
                      display: "inline-block"
                    }}>
                      📱 {path}
                    </div>
                  )}
                </div>
              </div>

              {/* Background Apps */}
              <div style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "#8e8e93",
                fontSize: "11px",
                textAlign: "center"
              }}>
                탭하여 앱에서 보기
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="col-12 col-lg-7">
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="fw-bold text-dark mb-0 d-none d-md-block">📣 푸시 발송</h3>
                <h5 className="fw-bold text-primary mb-0">
                  <i className="bi bi-pencil-square me-2"></i>
                  푸시 내용 편집
                </h5>
              </div>

              <Form className="flex-grow-1 d-flex flex-column">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-people me-2"></i>사용자 ID (쉼표로 구분)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="예: user1, user2, user3"
                    value={accountIdsInput}
                    onChange={(e) => setAccountIdsInput(e.target.value)}
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
                    disabled={loading || !title || !body || !accountIdsInput.trim()}
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

                {result && (
                  <Alert variant={result.type} className="mt-3 mb-0">
                    {result.message}
                  </Alert>
                )}

                <div className="bg-light rounded-3 p-3 mt-auto">
                  <h6 className="fw-semibold text-secondary mb-2">
                    <i className="bi bi-lightbulb me-1"></i>미리보기 가이드
                  </h6>
                  <ul className="small text-muted mb-0 ps-3">
                    <li>왼쪽에서 실시간으로 푸시 알림 모습을 확인할 수 있습니다</li>
                    <li>제목은 최대 50자, 내용은 최대 200자까지 입력 가능합니다</li>
                    <li>이동 경로는 앱 내 특정 화면으로 이동할 때 사용됩니다</li>
                  </ul>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>

    </Container>
  );
};

export default PushManage;
