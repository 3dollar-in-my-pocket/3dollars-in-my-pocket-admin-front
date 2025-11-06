import {Card, Container} from "react-bootstrap";

const EtcLinkInfo = () => {
  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-primary">🔗 기타 링크</h2>

      <p className="text-muted mb-4">
        서비스와 관련된 주요 문서 및 소개 자료를 확인할 수 있는 페이지입니다.
        각각의 링크를 클릭하면 해당 페이지로 이동합니다.
      </p>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-2">📱 서비스 소개서</h5>
          <p className="mb-2 text-muted">
            가슴속 3천원 서비스의 전반적인 소개 및 주요 기능을 확인할 수 있습니다.
          </p>
          <a
            href="https://threedollars.framer.website/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            서비스 소개서 열기 🔗
          </a>
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-2">💼 사장님 앱 소개서</h5>
          <p className="mb-2 text-muted">
            사장님 대상 앱의 기능 및 사용 방법을 확인할 수 있습니다.
          </p>
          <a
            href="https://massive-iguana-121.notion.site/3-28c7ad52990e809caba2fb2040677a2a?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            사장님 앱 소개서 열기 🔗
          </a>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-2">📢 광고 상품 소개서</h5>
          <p className="mb-2 text-muted">
            광고 상품의 종류 및 상세 정보를 확인할 수 있습니다.
          </p>
          <a
            href="https://massive-iguana-121.notion.site/?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            광고 상품 소개서 열기 🔗
          </a>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EtcLinkInfo;
