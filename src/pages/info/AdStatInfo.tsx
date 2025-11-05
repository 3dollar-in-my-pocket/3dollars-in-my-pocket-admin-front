import {Card, Container} from "react-bootstrap";

const AdStatInfo = () => {
  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-primary">📊 광고 통계</h2>

      <p className="text-muted mb-4">
        Google Analytics 및 AdMob을 통해 광고 관련 통계를 확인할 수 있는 페이지입니다.
        각각의 링크를 클릭하면 해당 플랫폼의 대시보드로 이동합니다.
      </p>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-2">👤 유저 앱 (Google Analytics)</h5>
          <p className="mb-2 text-muted">
            유저 앱의 Google Analytics 분석 데이터를 확인할 수 있습니다.
          </p>
          <a
            href="https://analytics.google.com/analytics/web/?authuser=0&hl=ko#/analysis/p222054236"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            Google Analytics 열기 🔗
          </a>
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-2">📱 유저 앱 AdMob (iOS)</h5>
          <p className="mb-2 text-muted">
            iOS 유저 앱의 AdMob 광고 수익 및 성과를 확인할 수 있습니다.
          </p>
          <a
            href="https://admob.google.com/v2/apps/1242588198/overview?sac=true&authuser=1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            AdMob iOS 열기 🔗
          </a>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-2">🤖 유저 앱 AdMob (Android)</h5>
          <p className="mb-2 text-muted">
            Android 유저 앱의 AdMob 광고 수익 및 성과를 확인할 수 있습니다.
          </p>
          <a
            href="https://admob.google.com/v2/apps/6340312334/overview?sac=true&authuser=2"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            AdMob Android 열기 🔗
          </a>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdStatInfo;
