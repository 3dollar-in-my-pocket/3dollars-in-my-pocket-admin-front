import React from "react";

interface PageHeaderProps {
  /** 페이지 설명. 상단바에 이미 제목이 노출되므로 제목은 받지 않는다. */
  description?: string;
  /** 설명 우측(모바일에서는 하단)에 배치되는 액션 버튼 영역 */
  actions?: React.ReactNode;
  /** 조회 건수 등 부가 정보 */
  meta?: React.ReactNode;
}

/**
 * 관리 페이지 공통 헤더
 * 페이지 제목은 Layout 상단바가 담당하고, 여기서는 설명과 액션만 노출한다.
 */
const PageHeader: React.FC<PageHeaderProps> = ({description, actions, meta}) => {
  if (!description && !actions && !meta) {
    return null;
  }

  return (
    <div className="page-header">
      <div className="min-w-0">
        {description && <p className="page-header__desc">{description}</p>}
        {meta && <div className="page-header__meta">{meta}</div>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
