import PageHeader from "@/components/common/PageHeader";
import LinkCardGrid, {ExternalLinkCard} from "@/components/common/LinkCardGrid";

const LINKS: ExternalLinkCard[] = [
  {
    key: "ga",
    icon: "bi-graph-up",
    title: "유저 앱 (Google Analytics)",
    description: "유저 앱의 Google Analytics 분석 데이터를 확인합니다.",
    href: "https://analytics.google.com/analytics/web/?authuser=0&hl=ko#/analysis/p222054236",
    linkLabel: "Google Analytics 열기",
  },
  {
    key: "admob-ios",
    icon: "bi-apple",
    title: "유저 앱 AdMob (iOS)",
    description: "iOS 유저 앱의 AdMob 광고 수익 및 성과를 확인합니다.",
    href: "https://admob.google.com/v2/apps/1242588198/overview?sac=true&authuser=1",
    linkLabel: "AdMob iOS 열기",
  },
  {
    key: "admob-android",
    icon: "bi-android2",
    title: "유저 앱 AdMob (Android)",
    description: "Android 유저 앱의 AdMob 광고 수익 및 성과를 확인합니다.",
    href: "https://admob.google.com/v2/apps/6340312334/overview?sac=true&authuser=2",
    linkLabel: "AdMob Android 열기",
  },
];

const AdStatInfo = () => (
  <div>
    <PageHeader description="Google Analytics 및 AdMob에서 광고 관련 통계를 확인합니다. 링크를 클릭하면 해당 플랫폼의 대시보드로 이동합니다."/>
    <LinkCardGrid items={LINKS}/>
  </div>
);

export default AdStatInfo;
