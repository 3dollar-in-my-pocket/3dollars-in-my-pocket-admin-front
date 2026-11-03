import {FormEvent, ReactNode, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import storeApi from '@/api/storeApi';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';
import SectionCard from '@/components/common/SectionCard';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import StoreDetailModal from './StoreDetailModal';
import {SimilarStore} from '@/types/store';

const NAME_MAX_LENGTH = 50;
const ADDRESS_MAX_LENGTH = 100;
const RADIUS_MIN = 50;
const RADIUS_MAX = 1000;
const DEFAULT_RADIUS = 300;

/** 서버에 중복 판정 임계 점수가 없어 화면 강조 기준만 클라이언트에서 정합니다. */
const HIGH_SCORE = 70;
const MEDIUM_SCORE = 40;

type FieldName = 'name' | 'address' | 'radiusMeters';
type FieldErrors = Partial<Record<FieldName, string>>;

interface SearchForm {
  name: string;
  address: string;
  radiusMeters: string;
}

/** 서버 검증 규칙과 같은 기준으로 먼저 확인해 불필요한 AI 호출을 막습니다. */
const validate = ({name, address, radiusMeters}: SearchForm): FieldErrors => {
  const errors: FieldErrors = {};
  if (!name.trim()) errors.name = '가게명을 입력해주세요';
  else if (name.trim().length > NAME_MAX_LENGTH) errors.name = `가게명은 최대 ${NAME_MAX_LENGTH}자까지 입력할 수 있습니다`;

  if (!address.trim()) errors.address = '주소를 입력해주세요';
  else if (address.trim().length > ADDRESS_MAX_LENGTH) errors.address = `주소는 최대 ${ADDRESS_MAX_LENGTH}자까지 입력할 수 있습니다`;

  const radius = Number(radiusMeters);
  if (!Number.isInteger(radius)) errors.radiusMeters = '탐색 반경을 숫자로 입력해주세요';
  else if (radius < RADIUS_MIN) errors.radiusMeters = `탐색 반경은 ${RADIUS_MIN}m 이상이어야 합니다`;
  else if (radius > RADIUS_MAX) errors.radiusMeters = `탐색 반경은 최대 ${RADIUS_MAX}m까지 입력할 수 있습니다`;
  return errors;
};

const getScoreVariant = (score: number) => {
  if (score >= HIGH_SCORE) return 'danger';
  if (score >= MEDIUM_SCORE) return 'warning';
  return 'secondary';
};

const SimilarStoreSearch = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<SearchForm>({name: '', address: '', radiusMeters: String(DEFAULT_RADIUS)});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<SimilarStore[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<SimilarStore | null>(null);

  const handleChange = (field: FieldName, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
    setFieldErrors(prev => ({...prev, [field]: undefined}));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResults(null);
    try {
      const response = await storeApi.getSimilarStores({
        name: form.name.trim(),
        address: form.address.trim(),
        radiusMeters: Number(form.radiusMeters)
      });
      if (response.ok) {
        setResults(response.data?.contents || []);
        return;
      }
      handleError(response.error, response.errorDetails);
    } finally {
      setIsLoading(false);
    }
  };

  // 공통 에러 토스트를 끈 호출이므로 인증/권한 처리까지 여기서 담당합니다.
  const handleError = (error?: string | null, errorDetails?: { field: string; reason: string }[]) => {
    if (error === 'unauthorized') {
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
      navigate('/');
      return;
    }
    if (error === 'forbidden_access_denied') {
      setErrorMessage('유사 가게 찾기 권한이 없습니다.');
      return;
    }
    if (error === 'invalid_parameter') {
      if (errorDetails && errorDetails.length > 0) {
        const serverErrors: FieldErrors = {};
        errorDetails.forEach(({field, reason}) => {
          serverErrors[field as FieldName] = reason;
        });
        setFieldErrors(serverErrors);
        return;
      }
      // errorDetails 없는 400은 주소 좌표 변환 실패입니다. (서버 메시지는 일반 문구라 노출하지 않음)
      setFieldErrors({address: '주소를 찾을 수 없습니다. 도로명 주소로 다시 입력해주세요'});
      return;
    }
    setErrorMessage('유사 가게를 찾는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
  };

  const renderField = (field: FieldName, label: string, input: ReactNode, colClass: string) => (
    <div className={colClass}>
      <label className="form-label" htmlFor={`similar-store-${field}`}>{label}</label>
      {input}
      {fieldErrors[field] && <div className="invalid-feedback d-block">{fieldErrors[field]}</div>}
    </div>
  );

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="text-center py-4">
          <Loading/>
          <p className="text-muted small mt-2 mb-0">주소를 확인하고 AI가 유사 가게를 판정하는 중입니다</p>
        </div>
      );
    }
    if (errorMessage) {
      return <div className="alert alert-danger mb-0" role="alert">{errorMessage}</div>;
    }
    if (results === null) {
      return (
        <EmptyState
          icon="bi-intersect"
          title="가게 이름과 주소를 입력해주세요"
          description="예상 주소 반경 안의 활성 가게(가까운 순 최대 30곳) 중 같은 가게로 의심되는 곳을 찾습니다."
        />
      );
    }
    if (results.length === 0) {
      return (
        <EmptyState
          icon="bi-check-circle"
          title="유사한 가게가 없습니다"
          description="탐색 반경을 넓혀 다시 찾아볼 수 있습니다."
        />
      );
    }
    return (
      <ul className="list-group">
        {results.map(store => (
          <li key={store.storeId} className="list-group-item p-0">
            <button
              type="button"
              className="btn w-100 text-start d-flex gap-3 align-items-start p-3"
              onClick={() => setSelectedStore(store)}
              aria-label={`${store.name} 상세 보기`}
            >
              <span
                className={`badge bg-${getScoreVariant(store.score)} fs-6 flex-shrink-0`}
                style={{minWidth: '3.5rem'}}
                title="유사도 점수 (0~100)"
              >
                {store.score}
              </span>
              <span className="flex-grow-1 min-w-0">
                <span className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <strong>{store.name}</strong>
                  <StoreTypeBadge storeType={store.storeType}/>
                  <span className="text-muted small">ID {store.storeId}</span>
                </span>
                <span className="d-block small text-muted">
                  <i className="bi bi-geo-alt me-1"/>
                  {store.address || '주소 정보 없음'} · {store.distanceMeters.toLocaleString()}m
                </span>
                {store.categories.length > 0 && (
                  <span className="d-block small text-muted">
                    <i className="bi bi-tag me-1"/>
                    {store.categories.map(category => category.name).join(', ')}
                  </span>
                )}
                <span className="d-block small mt-1">
                  <i className="bi bi-robot me-1"/>
                  {store.reason}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <PageHeader description="가게를 등록하기 전에 이름과 예상 주소로 이미 등록된 중복 의심 가게를 AI로 찾습니다."/>

      <FilterCard>
        <form className="row g-3" onSubmit={handleSubmit} noValidate>
          {renderField('name', '가게 이름', (
            <input
              id="similar-store-name"
              className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
              value={form.name}
              maxLength={NAME_MAX_LENGTH}
              placeholder="예) 은평 붕어빵"
              onChange={e => handleChange('name', e.target.value)}
            />
          ), 'col-12 col-md-4')}
          {renderField('address', '예상 주소', (
            <input
              id="similar-store-address"
              className={`form-control ${fieldErrors.address ? 'is-invalid' : ''}`}
              value={form.address}
              maxLength={ADDRESS_MAX_LENGTH}
              placeholder="예) 서울특별시 은평구 연서로 123"
              onChange={e => handleChange('address', e.target.value)}
            />
          ), 'col-12 col-md-5')}
          {renderField('radiusMeters', '탐색 반경 (m)', (
            <input
              id="similar-store-radiusMeters"
              type="number"
              className={`form-control ${fieldErrors.radiusMeters ? 'is-invalid' : ''}`}
              value={form.radiusMeters}
              min={RADIUS_MIN}
              max={RADIUS_MAX}
              step={50}
              onChange={e => handleChange('radiusMeters', e.target.value)}
            />
          ), 'col-6 col-md-2')}
          <div className="col-6 col-md-1 d-flex align-items-end">
            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading
                ? <span className="spinner-border spinner-border-sm" role="status" aria-label="찾는 중"/>
                : '찾기'}
            </button>
          </div>
          <p className="form-field__hint mb-0 col-12">
            AI 판정에 시간이 걸릴 수 있습니다. 점수 {HIGH_SCORE}점 이상은 빨간색, {MEDIUM_SCORE}점 이상은 노란색으로 표시합니다.
          </p>
        </form>
      </FilterCard>

      <SectionCard title={results ? `유사 가게 ${results.length}곳` : '유사 가게'}>
        {renderResults()}
      </SectionCard>

      <StoreDetailModal
        show={!!selectedStore}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onStoreDeleted={(storeId: number) => {
          setResults(prev => prev?.filter(store => store.storeId !== storeId) ?? prev);
          setSelectedStore(null);
        }}
      />
    </div>
  );
};

export default SimilarStoreSearch;
