import React, {useState} from "react";
import {Card, Container, Nav} from "react-bootstrap";
import ServerStatistics from "./ServerStatistics";

const ServiceStatInfo = () => {
  const [activeTab, setActiveTab] = useState<"firebase" | "server">("server");

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-primary">📊 서비스 통계</h2>

      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link
            active={activeTab === "server"}
            onClick={() => setActiveTab("server")}
            style={{cursor: "pointer"}}
          >
            서버 통계
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === "firebase"}
            onClick={() => setActiveTab("firebase")}
            style={{cursor: "pointer"}}
          >
            클라이언트 통계 (GA)
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === "firebase" && (
        <div>
          <p className="text-muted mb-4">
            Firebase Analytics를 통해 각 앱의 서비스 사용 통계를 확인할 수 있는 페이지입니다.
            각각의 링크를 클릭하면 해당 앱의 Firebase Console 대시보드로 이동합니다.
          </p>

          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="fw-semibold mb-2">👤 유저 앱 통계</h5>
              <p className="mb-2 text-muted">
                일반 유저 대상 앱의 사용 통계 및 분석 데이터를 확인할 수 있습니다.
              </p>
              <a
                href="https://console.firebase.google.com/u/2/project/dollar-in-my-pocket/analytics/app/ios:com.macgongmon.-dollar-in-my-pocket/overview/reports~2Fdashboard%3Fr%3Dfirebase-overview&fpn%3D174359764387&params%3D_u..built_comparisons_enabled%253Dtrue%2526_u..comparisons%253D%255B%257B%2522savedComparisonId%2522:%25226720312021%2522,%2522name%2522:%2522%25EB%25AA%25A8%25EB%2593%25A0%2520%25EC%2582%25AC%25EC%259A%25A9%25EC%259E%2590%2522,%2522isEnabled%2522:true,%2522filters%2522:%255B%255D,%2522systemDefinedSavedComparisonType%2522:8,%2522isSystemDefined%2522:true%257D,%257B%2522savedComparisonId%2522:%25229765745347%2522,%2522hasCustomName%2522:true,%2522name%2522:%2522%255CbAndroid%2522,%2522isEnabled%2522:true,%2522filters%2522:%255B%257B%2522fieldName%2522:%2522operatingSystem%2522,%2522expressionList%2522:%255B%2522Android%2522%255D,%2522isCaseSensitive%2522:true%257D%255D,%2522systemDefinedSavedComparisonType%2522:0,%2522isSystemDefined%2522:false%257D,%257B%2522savedComparisonId%2522:%25229765819335%2522,%2522hasCustomName%2522:true,%2522name%2522:%2522%255CbiOS%2522,%2522isEnabled%2522:true,%2522filters%2522:%255B%257B%2522fieldName%2522:%2522operatingSystem%2522,%2522expressionList%2522:%255B%2522iOS%2522%255D,%2522isCaseSensitive%2522:true%257D%255D,%2522systemDefinedSavedComparisonType%2522:0,%2522isSystemDefined%2522:false%257D%255D"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary"
              >
                유저 앱 Analytics 열기 🔗
              </a>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-semibold mb-2">💼 사장님 앱 통계</h5>
              <p className="mb-2 text-muted">
                사장님 대상 앱의 사용 통계 및 분석 데이터를 확인할 수 있습니다.
              </p>
              <a
                href="https://console.firebase.google.com/u/2/project/dollars-in-my-pocket-manager/analytics/app/android:app.threedollars.manager/overview/reports~2Fdashboard%3Fr%3Dfirebase-overview&fpn%3D263138332433&params%3D_u..comparisons%253D%255B%257B%2522savedComparisonId%2522:%25226753279962%2522,%2522name%2522:%2522%25EB%25AA%25A8%25EB%2593%25A0%2520%25EC%2582%25AC%25EC%259A%25A9%25EC%259E%2590%2522,%2522isEnabled%2522:true,%2522filters%2522:%255B%255D,%2522systemDefinedSavedComparisonType%2522:8,%2522isSystemDefined%2522:true%257D,%257B%2522name%2522:%2522%25ED%2594%258C%25EB%259E%25AB%25ED%258F%25BC%2520%25EB%258B%25A4%25EC%259D%258C%25EA%25B3%25BC%2520%25EC%25A0%2595%25ED%2599%2595%25ED%2595%2598%25EA%25B2%258C%2520%25EC%259D%25BC%25EC%25B9%2598%2520iOS%2522,%2522isEnabled%2522:true,%2522filters%2522:%255B%257B%2522fieldName%2522:%2522platform%2522,%2522expressionList%2522:%255B%2522iOS%2522%255D,%2522isCaseSensitive%2522:true%257D%255D%257D,%257B%2522savedComparisonId%2522:%252212914561777%2522,%2522hasCustomName%2522:true,%2522name%2522:%2522Andorid%2520%25ED%2594%258C%25EB%259E%25AB%25ED%258F%25BC%2522,%2522isEnabled%2522:true,%2522filters%2522:%255B%257B%2522fieldName%2522:%2522platform%2522,%2522expressionList%2522:%255B%2522Android%2522%255D,%2522isCaseSensitive%2522:false%257D%255D,%2522systemDefinedSavedComparisonType%2522:0,%2522isSystemDefined%2522:false%257D%255D%2526_u..built_comparisons_enabled%253Dtrue"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary"
              >
                사장님 앱 Analytics 열기 🔗
              </a>
            </Card.Body>
          </Card>
        </div>
      )}

      {activeTab === "server" && <ServerStatistics/>}
    </Container>
  );
};

export default ServiceStatInfo;
