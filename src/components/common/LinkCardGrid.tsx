import React from "react";
import SectionCard from "./SectionCard";

export interface ExternalLinkCard {
  key: string;
  /** Bootstrap Icons 클래스명 */
  icon: string;
  title: string;
  description: React.ReactNode;
  href: string;
  /** 링크 버튼 문구 (기본: "열기") */
  linkLabel?: string;
}

interface LinkCardGridProps {
  items: ExternalLinkCard[];
  /** 한 행에 노출할 카드 수 기준 컬럼 클래스 */
  colClassName?: string;
}

/**
 * 외부 콘솔·대시보드 링크 카드 목록
 * 통계 페이지들이 공통으로 사용한다.
 */
const LinkCardGrid: React.FC<LinkCardGridProps> = ({items, colClassName = "col-12 col-md-6"}) => (
  <div className="row g-3">
    {items.map((item) => (
      <div key={item.key} className={colClassName}>
        <SectionCard title={item.title} icon={item.icon} className="h-100">
          <p className="item-card__desc mb-3">{item.description}</p>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary btn-sm"
          >
            <i className="bi bi-box-arrow-up-right me-1"/>
            {item.linkLabel || "열기"}
          </a>
        </SectionCard>
      </div>
    ))}
  </div>
);

export default LinkCardGrid;
