import DetailField from '@/components/common/DetailField';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {SimpleStore} from '@/types/store';

interface Props {
  store: SimpleStore;
  /** 가게명 클릭 콜백 (가게 상세 모달 열기). 없으면 가게명을 텍스트로 표시합니다. */
  onStoreClick?: (store: SimpleStore) => void;
}

/** 상세 모달의 가게 정보 섹션 (가게 이름·ID·타입) */
const StoreInfoSection = ({store, onStoreClick}: Props) => (
  <div className="modal-section">
    <h3 className="modal-section__title">
      <i className="bi bi-shop"/>
      가게 정보
    </h3>
    <div className="row g-3">
      <DetailField label="가게 이름" className="col-12 col-md-6">
        {onStoreClick ? (
          <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => onStoreClick(store)}>
            {store.name}
            <i className="bi bi-box-arrow-up-right ms-1 small"/>
          </button>
        ) : store.name}
      </DetailField>
      <DetailField label="가게 ID" className="col-6 col-md-3" monospace>
        {store.storeId}
      </DetailField>
      <DetailField label="가게 타입" className="col-6 col-md-3">
        <StoreTypeBadge storeType={store.storeType}/>
      </DetailField>
    </div>
  </div>
);

export default StoreInfoSection;
