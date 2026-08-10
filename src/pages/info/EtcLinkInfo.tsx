import PageHeader from "@/components/common/PageHeader";
import LinkCardGrid, {ExternalLinkCard} from "@/components/common/LinkCardGrid";

const LINKS: ExternalLinkCard[] = [
  {
    key: "service",
    icon: "bi-phone",
    title: "서비스 소개서",
    description: "가슴속 3천원 서비스의 전반적인 소개 및 주요 기능을 확인합니다.",
    href: "https://threedollars.framer.website/",
    linkLabel: "서비스 소개서 열기",
  },
  {
    key: "boss",
    icon: "bi-person-badge-fill",
    title: "사장님 앱 소개서",
    description: "사장님 대상 앱의 기능 및 사용 방법을 확인합니다.",
    href: "https://massive-iguana-121.notion.site/3-28c7ad52990e809caba2fb2040677a2a?source=copy_link",
    linkLabel: "사장님 앱 소개서 열기",
  },
  {
    key: "ad",
    icon: "bi-megaphone-fill",
    title: "광고 상품 소개서",
    description: "광고 상품의 종류 및 상세 정보를 확인합니다.",
    href: "https://massive-iguana-121.notion.site/?source=copy_link",
    linkLabel: "광고 상품 소개서 열기",
  },
];

const EtcLinkInfo = () => (
  <div>
    <PageHeader description="서비스와 관련된 주요 문서 및 소개 자료를 확인합니다. 링크를 클릭하면 해당 페이지로 이동합니다."/>
    <LinkCardGrid items={LINKS}/>
  </div>
);

export default EtcLinkInfo;
