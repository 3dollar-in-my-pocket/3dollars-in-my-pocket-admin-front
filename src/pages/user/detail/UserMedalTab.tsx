import React from 'react';
import EmptyState from '@/components/common/EmptyState';
import {Medal} from '@/types/medal';

interface UserMedalTabProps {
  /** 유저가 보유한 메달 목록 */
  medals: Medal[];
  /** 전체 메달 목록 */
  allMedals: Medal[];
  /** 대표 메달 */
  representativeMedal: Medal | null;
  /** 지급 대상으로 선택된 메달 ID */
  selectedMedalForAssign: number | null;
  /** 메달 지급 진행 중 여부 */
  isAssigningMedal: boolean;
  /** 메달 카드 클릭 콜백 */
  onSelectMedal: (medalId: number) => void;
  /** 메달 지급 확인 모달 열기 콜백 */
  onOpenAssignConfirm: () => void;
}

/** 이미지 로드 실패 시 비활성 아이콘으로 대체 */
const handleIconError = (event: React.SyntheticEvent<HTMLImageElement>, fallbackUrl?: string) => {
  const target = event.target as HTMLImageElement;
  target.src = fallbackUrl || '/default-medal.png';
};

/**
 * 유저 상세 모달의 메달 정보 탭
 */
const UserMedalTab = ({
                        medals,
                        allMedals,
                        representativeMedal,
                        selectedMedalForAssign,
                        isAssigningMedal,
                        onSelectMedal,
                        onOpenAssignConfirm
                      }: UserMedalTabProps) => {
  const isAlreadyOwned = selectedMedalForAssign
    ? medals.some((medal) => medal.medalId === selectedMedalForAssign)
    : false;

  return (
    <div className="history-panel">
      <div className="history-panel__head">
        <h3 className="history-panel__title">
          <i className="bi bi-award"/>
          보유 메달
          <span className="history-panel__count">
            {medals.length} / {allMedals.length}
          </span>
        </h3>
        {selectedMedalForAssign && (
          <div className="history-panel__aside">
            <button
              className="btn btn-sm btn-primary"
              onClick={onOpenAssignConfirm}
              disabled={isAssigningMedal || isAlreadyOwned}
            >
              <i className={`bi ${isAlreadyOwned ? 'bi-check-circle' : 'bi-award'} me-1`}/>
              {isAlreadyOwned ? '이미 보유한 메달' : '선택한 메달 지급'}
            </button>
          </div>
        )}
      </div>

      {/* 대표 메달 */}
      {representativeMedal && (
        <div className="modal-section">
          <h4 className="modal-section__title">
            <i className="bi bi-star-fill text-warning"/>
            대표 메달
          </h4>
          <div className="item-card">
            <div className="item-card__body d-flex align-items-center gap-3">
              <img
                src={representativeMedal.iconUrl}
                alt={representativeMedal.name}
                className="medal-tile__icon"
                onError={(event) => handleIconError(event, representativeMedal.disableIconUrl)}
              />
              <div className="min-w-0">
                <h5 className="item-card__name">{representativeMedal.name}</h5>
                <p className="item-card__desc">{representativeMedal.introduction}</p>
                {representativeMedal.acquisition?.description && (
                  <span className="badge bg-primary-subtle text-primary-emphasis mt-1">
                    <i className="bi bi-info-circle me-1"/>
                    {representativeMedal.acquisition.description}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 전체 메달 */}
      <div className="modal-section">
        <h4 className="modal-section__title">
          <i className="bi bi-collection"/>
          전체 메달
        </h4>

        {allMedals.length === 0 ? (
          <EmptyState
            icon="bi-award"
            title="메달 정보가 없습니다"
            description="조회할 수 있는 메달이 없습니다."
          />
        ) : (
          <div className="row g-2">
            {allMedals.map((medal, index) => {
              const isOwned = medals.some((m) => m.medalId === medal.medalId);
              const isRepresentative = representativeMedal?.medalId === medal.medalId;
              const isSelected = selectedMedalForAssign === medal.medalId;
              const ownedMedal = medals.find((m) => m.medalId === medal.medalId);

              const tileClass = [
                'medal-tile',
                isOwned ? '' : 'medal-tile--locked',
                isSelected ? 'medal-tile--selected' : '',
                isRepresentative ? 'medal-tile--representative' : ''
              ].filter(Boolean).join(' ');

              return (
                <div key={medal.medalId || index} className="col-6 col-md-4 col-xl-3">
                  <button
                    type="button"
                    className={tileClass}
                    onClick={() => onSelectMedal(medal.medalId)}
                    aria-pressed={isSelected}
                  >
                    <span className="medal-tile__figure">
                      <img
                        src={isOwned ? medal.iconUrl : medal.disableIconUrl}
                        alt={medal.name}
                        className="medal-tile__icon"
                        onError={(event) => handleIconError(event, medal.disableIconUrl)}
                      />
                      {isRepresentative && (
                        <i className="bi bi-star-fill medal-tile__mark text-warning" title="대표 메달"/>
                      )}
                      {isSelected && (
                        <i className="bi bi-check-circle-fill medal-tile__mark text-primary" title="선택됨"/>
                      )}
                    </span>
                    <span className="medal-tile__name">{medal.name}</span>
                    <span className="medal-tile__desc">{medal.introduction}</span>
                    {isOwned ? (
                      ownedMedal?.acquisition?.description && (
                        <span className="badge bg-primary-subtle text-primary-emphasis">
                          {ownedMedal.acquisition.description}
                        </span>
                      )
                    ) : (
                      <span className="badge bg-secondary-subtle text-secondary-emphasis">
                        <i className="bi bi-lock me-1"/>
                        미획득
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMedalTab;
