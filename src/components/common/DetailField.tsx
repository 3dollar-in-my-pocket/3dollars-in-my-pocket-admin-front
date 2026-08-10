import React from "react";

interface DetailFieldProps {
  label: string;
  /** 값이 없을 때 표시할 문자열 */
  placeholder?: string;
  /** 값을 등폭 글꼴로 표시 (ID, URL 등) */
  monospace?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 모달 상세 보기의 라벨/값 한 쌍
 */
const DetailField: React.FC<DetailFieldProps> = ({
                                                   label,
                                                   placeholder = "-",
                                                   monospace = false,
                                                   className = "",
                                                   children
                                                 }) => {
  const isEmpty = children === null || children === undefined || children === "";

  return (
    <div className={className}>
      <span className="detail-field__label">{label}</span>
      <div className={`detail-field__value ${monospace ? "font-monospace small" : ""}`}>
        {isEmpty ? <span className="text-body-tertiary">{placeholder}</span> : children}
      </div>
    </div>
  );
};

export default DetailField;
