import {AdminRole} from "@/types/admin";

/** 메뉴 항목 타입 정의 */
export interface MenuItem {
  path: string;
  label: string;
  icon: string; // Bootstrap Icons 클래스명 (예: "bi-search")
  allowedRoles?: AdminRole[]; // 접근 가능한 역할 목록 (정의되지 않으면 OWNER만 접근 가능)
}

/** 메뉴 그룹 타입 정의 */
export interface MenuGroup {
  title: string;
  icon: string;
  description: string;
  items: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    title: "유저 관리",
    icon: "bi-people-fill",
    description: "유저 정보를 조회하고 닉네임·랭킹을 관리합니다",
    items: [
      {path: "/manage/user-search", label: "유저 검색", icon: "bi-search", allowedRoles: [AdminRole.OPERATOR]},
      {path: "/manage/tool/random-name", label: "유저 랜덤 닉네임 관리", icon: "bi-person-badge"},
      {path: "/manage/user-ranking", label: "유저 랭킹 관리", icon: "bi-trophy-fill"},
    ],
  },
  {
    title: "사장님 관리",
    icon: "bi-person-badge-fill",
    description: "사장님 가입 신청을 관리합니다",
    items: [
      {
        path: "/manage/registration",
        label: "사장님 가입 신청 관리",
        icon: "bi-person-lines-fill",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
    ],
  },
  {
    title: "가게 관리",
    icon: "bi-shop",
    description: "등록된 가게 정보와 리뷰·쿠폰·신고를 관리합니다",
    items: [
      {
        path: "/manage/store-file-upload",
        label: "신규 가게 등록",
        icon: "bi-file-earmark-arrow-up",
        allowedRoles: [AdminRole.OPERATOR]
      },
      {
        path: "/manage/store-search",
        label: "가게 검색",
        icon: "bi-shop",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
      {
        path: "/manage/popular-neighborhood-stores",
        label: "인기 가게",
        icon: "bi-star-fill",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
      {
        path: "/manage/review",
        label: "가게 리뷰 관리",
        icon: "bi-chat-square-text",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
      {path: "/manage/store-image", label: "가게 이미지 관리", icon: "bi-image"},
      {
        path: "/manage/store-post",
        label: "가게 소식",
        icon: "bi-newspaper",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
      {
        path: "/manage/coupon",
        label: "가게 쿠폰 관리",
        icon: "bi-ticket-perforated",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
      {
        path: "/manage/store-message",
        label: "가게 메시지 관리",
        icon: "bi-chat-left-text",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
      {
        path: "/manage/store-report",
        label: "가게 신고 이력",
        icon: "bi-flag-fill",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
      {
        path: "/manage/store-marker",
        label: "가게 지도 핀 관리",
        icon: "bi-geo-alt-fill",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
    ],
  },
  {
    title: "콘텐츠",
    icon: "bi-megaphone-fill",
    description: "광고, 메달, FAQ 등 콘텐츠를 관리합니다",
    items: [
      {path: "/manage/advertisement", label: "광고 관리", icon: "bi-bullseye", allowedRoles: [AdminRole.OPERATOR]},
      {path: "/manage/medal", label: "메달 관리", icon: "bi-award-fill", allowedRoles: [AdminRole.OPERATOR]},
      {path: "/manage/faq", label: "FAQ 관리", icon: "bi-question-circle-fill", allowedRoles: [AdminRole.OPERATOR]},
      {
        path: "/manage/store-category",
        label: "가게 카테고리 관리",
        icon: "bi-grid-3x3-gap",
        allowedRoles: [AdminRole.OPERATOR]
      },
    ]
  },
  {
    title: "커뮤니티 관리",
    icon: "bi-chat-dots-fill",
    description: "투표 등 커뮤니티 기능을 관리합니다",
    items: [
      {
        path: "/manage/poll",
        label: "투표 관리",
        icon: "bi-bar-chart-fill",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
    ],
  },
  {
    title: "운영 툴",
    icon: "bi-tools",
    description: "푸시, 정책, 캐시 등 운영 도구를 사용합니다",
    items: [
      {path: "/manage/push-message", label: "푸시 발송", icon: "bi-send-fill", allowedRoles: [AdminRole.OPERATOR]},
      {path: "/manage/policy", label: "정책 설정", icon: "bi-shield-fill-check", allowedRoles: [AdminRole.OPERATOR]},
      {path: "/manage/prompt", label: "AI 프롬프트 관리", icon: "bi-robot", allowedRoles: [AdminRole.OWNER]},
      {path: "/manage/tool/cache", label: "캐시 툴", icon: "bi-brush-fill"},
      {
        path: "/manage/tool/upload",
        label: "이미지 업로드 툴",
        icon: "bi-image-fill",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
    ],
  },
  {
    title: "PoC",
    icon: "bi-stars",
    description: "출시 전 기능을 테스트합니다",
    items: [
      {
        path: "/manage/proto/ai-menu-image-extract",
        label: "AI 메뉴 이미지 추출",
        icon: "bi-stars",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
    ],
  },
  {
    title: "통계 & 분석",
    icon: "bi-graph-up",
    description: "서비스 사용 통계와 광고 성과를 확인합니다",
    items: [
      {
        path: "/info/service-statistics",
        label: "서비스 통계",
        icon: "bi-graph-up",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
      {path: "/info/ad-statistics", label: "광고 통계", icon: "bi-badge-ad", allowedRoles: [AdminRole.OPERATOR]},
      {
        path: "/info/push-statistics",
        label: "푸시 통계",
        icon: "bi-bar-chart-line-fill",
        allowedRoles: [AdminRole.OPERATOR]
      },
    ],
  },
  {
    title: "시스템 설정",
    icon: "bi-gear-fill",
    description: "관리자 계정 및 시스템 설정을 관리합니다",
    items: [
      {path: "/manage/admin", label: "관리자 관리", icon: "bi-people-fill"},
    ],
  },
  {
    title: "기타",
    icon: "bi-link-45deg",
    description: "관련 외부 링크를 모아둔 공간입니다",
    items: [
      {
        path: "/info/etc-link",
        label: "기타 링크",
        icon: "bi-link-45deg",
        allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]
      },
    ],
  },
];
