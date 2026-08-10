import React from "react";

interface FilterCardProps {
  /** 필터 카드 제목 (기본: "조회 조건") */
  title?: string;
  /** 제목 왼쪽 아이콘 (Bootstrap Icons 클래스명) */
  icon?: string;
  /** 우측 상단 보조 영역 (초기화 버튼 등) */
  aside?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 조회 조건 영역 공통 카드
 * 페이지마다 달랐던 필터 카드 스타일을 하나로 통일한다.
 */
const FilterCard: React.FC<FilterCardProps> = ({
                                                 title = "조회 조건",
                                                 icon = "bi-funnel",
                                                 aside,
                                                 children
                                               }) => (
  <section className="filter-card">
    <div className="filter-card__head">
      <h2 className="filter-card__title">
        <i className={`bi ${icon}`}/>
        {title}
      </h2>
      {aside && <div className="filter-card__aside">{aside}</div>}
    </div>
    <div className="filter-card__body">{children}</div>
  </section>
);

export default FilterCard;
