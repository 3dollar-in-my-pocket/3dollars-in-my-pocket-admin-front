import PageHeader from "@/components/common/PageHeader";
import LinkCardGrid, {ExternalLinkCard} from "@/components/common/LinkCardGrid";

const LINKS: ExternalLinkCard[] = [
  {
    key: "user",
    icon: "bi-people-fill",
    title: "유저 앱 푸시 통계",
    description: <>일반 유저 대상 앱의 푸시 메시지 <strong>발송 · 수신 · 클릭 수</strong>를 확인합니다.</>,
    href: "https://console.firebase.google.com/u/0/project/dollar-in-my-pocket/messaging/reports",
    linkLabel: "유저 앱 리포트 열기",
  },
  {
    key: "boss",
    icon: "bi-person-badge-fill",
    title: "사장님 앱 푸시 통계",
    description: <>사장님 대상 앱의 푸시 메시지 <strong>발송 · 수신 · 클릭 수</strong>를 확인합니다.</>,
    href: "https://console.firebase.google.com/u/2/project/dollars-in-my-pocket-manager/messaging/reports?pli=1",
    linkLabel: "사장님 앱 리포트 열기",
  },
];

const PushStatsInfo = () => (
  <div>
    <PageHeader description="Firebase Messaging으로 발송된 푸시 메시지의 통계를 확인합니다. 링크를 클릭하면 해당 앱의 Firebase Console 리포트로 이동합니다."/>
    <LinkCardGrid items={LINKS}/>
  </div>
);

export default PushStatsInfo;
