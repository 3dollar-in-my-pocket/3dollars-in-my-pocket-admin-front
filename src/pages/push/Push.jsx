import React, { useState } from "react";
import axios from "axios";
import { Alert, Button, Form, Container, Row, Col, Card } from "react-bootstrap";

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
            setResult({ type: "danger", message: "모든 필드를 입력해 주세요." });
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
                setResult({ type: "success", message: "✅ 푸시 발송 성공!" });
                setAccountIdsInput("");
                setTitle("");
                setBody("");
                setPath("");
            } else {
                setResult({ type: "danger", message: "❌ 푸시 발송 실패" });
            }
        } catch (error) {
            console.error(error);
            setResult({ type: "danger", message: "⚠️ 서버 오류 발생" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row>
                <Col md={6}>
                    <Card className="shadow-sm p-4">
                        <Card.Body>
                            <h3 className="fw-bold mb-4">📣 푸시 발송</h3>

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>사용자 ID (쉼표로 구분)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="예: user1, user2, user3"
                                        value={accountIdsInput}
                                        onChange={(e) => setAccountIdsInput(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>제목</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="푸시 제목"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>내용</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="푸시 내용"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>이동 경로 (선택)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="/home, /event 등"
                                        value={path}
                                        onChange={(e) => setPath(e.target.value)}
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" onClick={sendPush} disabled={loading}>
                                        {loading ? "발송 중..." : "푸시 발송"}
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
                    <Card className="shadow-sm p-4">
                        <Card.Body>
                            <h3 className="fw-bold mb-4">푸시 알림 예시</h3>
                            <div
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
