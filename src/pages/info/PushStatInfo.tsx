import React from "react";
import {Card, Container} from "react-bootstrap";

const PushStatsInfo = () => {
  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-primary">📈 푸시 발송 통계</h2>

      <p className="text-muted mb-4">
        Firebase Messaging을 통해 발송된 푸시 메시지의 통계를 확인할 수 있는 페이지입니다.
        각각의 링크를 클릭하면 해당 앱의 Firebase Console 리포트 페이지로 이동합니다.
      </p>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-2">👤 유저 앱 푸시 통계</h5>
          <p className="mb-2 text-muted">
            일반 유저 대상 앱에서의 푸시 메시지 <strong>발송 / 수신 / 클릭 수</strong>를 확인할 수 있습니다.
          </p>
          <a
            href="https://console.firebase.google.com/u/0/project/dollar-in-my-pocket/messaging/reports"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            유저 앱 리포트 열기 🔗
          </a>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-2">💼 사장님 앱 푸시 통계</h5>
          <p className="mb-2 text-muted">
            사장님 대상 앱에서의 푸시 메시지 <strong>발송 / 수신 / 클릭 수</strong>를 확인할 수 있습니다.
          </p>
          <a
            href="https://console.firebase.google.com/u/2/project/dollars-in-my-pocket-manager/messaging/reports?pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            사장님 앱 리포트 열기 🔗
          </a>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PushStatsInfo;
