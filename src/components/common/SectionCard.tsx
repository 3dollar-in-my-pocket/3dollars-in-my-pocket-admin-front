import React from "react";

interface SectionCardProps {
  title?: string;
  /** 제목 왼쪽 아이콘 (Bootstrap Icons 클래스명) */
  icon?: string;
  /** 제목 아래 보조 설명 */
  description?: string;
  /** 헤더 우측 영역 (건수 배지, 버튼 등) */
  aside?: React.ReactNode;
  /** 본문 패딩 제거 (테이블을 카드에 꽉 채울 때) */
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * 차트·테이블 등 콘텐츠 블록 공통 카드
 */
const SectionCard: React.FC<SectionCardProps> = ({
                                                   title,
                                                   icon,
                                                   description,
                                                   aside,
                                                   flush = false,
                                                   className = "",
                                                   children
                                                 }) => (
  <section className={`section-card ${className}`}>
    {(title || aside) && (
      <div className="section-card__head">
        <div className="min-w-0">
          {title && (
            <h2 className="section-card__title">
              {icon && <i className={`bi ${icon}`}/>}
              {title}
            </h2>
          )}
          {description && <p className="section-card__desc">{description}</p>}
        </div>
        {aside && <div className="section-card__aside">{aside}</div>}
      </div>
    )}
    <div className={flush ? "" : "section-card__body"}>{children}</div>
  </section>
);

export default SectionCard;
