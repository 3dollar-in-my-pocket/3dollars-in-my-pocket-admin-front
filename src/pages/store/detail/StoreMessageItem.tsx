import React from 'react';
import {StoreMessage} from '@/types/storeMessage';
import {formatDateTimeKoNoSec as formatDateTime} from '@/utils/dateUtils';

interface StoreMessageItemProps {
  message: StoreMessage;
}

const StoreMessageItem: React.FC<StoreMessageItemProps> = ({message}) => {
  const isEdited = Boolean(message.updatedAt && message.updatedAt !== message.createdAt);

  return (
    <div className="item-card mb-3">
      <div className="item-card__body">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <div className="d-flex align-items-center flex-wrap gap-2 min-w-0">
            <h3 className="item-card__name">가게 메시지</h3>
            <span className="badge bg-success-subtle text-success-emphasis">
              <i className="bi bi-person-badge me-1"/>
              사장님
            </span>
          </div>
          <span className="item-card__desc mt-0 flex-shrink-0">
            <i className="bi bi-clock me-1"/>
            {formatDateTime(message.createdAt)}
            {isEdited && ' · 수정됨'}
          </span>
        </div>

        {message.body && (
          <div className="detail-value-strong detail-value-strong--text">
            {message.body}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreMessageItem;
