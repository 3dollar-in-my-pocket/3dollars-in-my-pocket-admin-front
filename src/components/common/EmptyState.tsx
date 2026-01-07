import React from 'react';
import { Button } from 'react-bootstrap';
import { EmptyStateProps } from '../../types/common';

/**
 * EmptyState 컴포넌트
 * 데이터가 없을 때 표시하는 빈 상태 UI
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionButton,
  iconSize = 80,
  iconColor = 'text-secondary',
  iconBg = 'bg-light',
  className = ''
}) => {
  return (
    <div className={`text-center py-5 ${className}`}>
      <div
        className={`${iconBg} rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center`}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`
        }}
      >
        <i className={`bi ${icon} fs-1 ${iconColor}`}></i>
      </div>

      <h5 className="text-dark mb-2">{title}</h5>

      {description && (
        <p className="text-muted mb-3">{description}</p>
      )}

      {actionButton && (
        <Button
          variant={actionButton.variant || 'primary'}
          onClick={actionButton.onClick}
          className="mt-2"
        >
          {actionButton.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
