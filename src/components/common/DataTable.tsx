import React from "react";

interface DataTableProps {
  /** 헤더를 고정할 최대 높이 (예: "500px"). 지정하면 세로 스크롤이 생긴다. */
  maxHeight?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * 목록 테이블 공통 래퍼
 * 페이지마다 달랐던 table-dark / table-bordered 조합을 하나의 규격으로 통일한다.
 */
const DataTable: React.FC<DataTableProps> = ({maxHeight, className = "", children}) => (
  <div
    className="data-table__scroll"
    style={maxHeight ? {maxHeight, overflowY: "auto"} : undefined}
  >
    <table className={`table data-table ${className}`}>{children}</table>
  </div>
);

export default DataTable;
