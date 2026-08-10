import {useEffect, useMemo, useState} from 'react';
import userApi from "@/api/userApi";
import {RandomNameItem} from "@/types/user";
import PageHeader from "@/components/common/PageHeader";
import FilterCard from "@/components/common/FilterCard";
import SectionCard from "@/components/common/SectionCard";
import DataTable from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";

type FilterType = 'all' | 'issued' | 'not_issued';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  {value: 'all', label: '전체'},
  {value: 'issued', label: '발급된 닉네임'},
  {value: 'not_issued', label: '발급 이력 없음'}
];

const RandomNameTool = () => {
  const [randomNames, setRandomNames] = useState<RandomNameItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const fetchRandomNames = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await userApi.getRandomNames();

      if (response.ok) {
        setRandomNames(response.data.contents);
      } else {
        setErrorMessage('데이터 조회에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomNames();
  }, []);

  const formatNickname = (prefix: string, sequence: number) => {
    return `${prefix}#${sequence}`;
  };

  const filteredRandomNames = useMemo(() => {
    switch (filterType) {
      case 'issued':
        return randomNames.filter(item => item.sequence > 0);
      case 'not_issued':
        return randomNames.filter(item => item.sequence === 0);
      case 'all':
      default:
        return randomNames;
    }
  }, [randomNames, filterType]);

  const statistics = useMemo(() => {
    if (randomNames.length === 0) {
      return {
        max: 0,
        min: 0,
        average: 0,
        total: 0
      };
    }

    const issuedItems = randomNames.filter(item => item.sequence > 0);
    const sequences = randomNames.map(item => item.sequence);
    const total = sequences.reduce((acc, curr) => acc + curr, 0);
    const average = total / randomNames.length; // 미발급(0)도 포함하여 평균 계산

    const max = issuedItems.length > 0 ? Math.max(...issuedItems.map(item => item.sequence)) : 0;
    const min = Math.min(...sequences); // 미발급(0)도 포함하여 최소값 계산

    return {
      max,
      min,
      average: Math.round(average * 10) / 10, // 소수점 첫째자리까지
      total
    };
  }, [randomNames]);

  const stats = [
    {label: '총 발급', value: `${statistics.total.toLocaleString()}회`},
    {label: '최대 발급', value: `${statistics.max}회`},
    {label: '평균 발급', value: `${statistics.average.toFixed(1)}회`},
    {label: '최소 발급', value: `${statistics.min}회`}
  ];

  return (
    <div>
      <PageHeader description="유저에게 할당되는 랜덤 닉네임의 발급 현황을 확인합니다."/>

      {errorMessage && (
        <div className="alert alert-danger py-2" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="row g-3 mb-3">
        {stats.map((stat) => (
          <div key={stat.label} className="col-6 col-md-3">
            <div className="stat-tile">
              <span className="stat-tile__label">{stat.label}</span>
              <span className="stat-tile__value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <FilterCard
        aside={
          <button className="btn btn-sm btn-outline-primary" onClick={fetchRandomNames} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                조회 중...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-1"/>
                새로고침
              </>
            )}
          </button>
        }
      >
        <span className="form-label d-block">발급 상태</span>
        <div className="filter-chips">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip ${filterType === option.value ? 'filter-chip--active' : ''}`}
              onClick={() => setFilterType(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterCard>

      <SectionCard
        title="랜덤 닉네임 목록"
        icon="bi-shuffle"
        aside={<span className="page-count">{filteredRandomNames.length}건</span>}
        flush
      >
        {isLoading && randomNames.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">불러오는 중</span>
            </div>
            <p className="text-muted small mt-3 mb-0">데이터를 불러오는 중...</p>
          </div>
        ) : filteredRandomNames.length === 0 ? (
          <EmptyState
            icon="bi-inbox"
            title={randomNames.length === 0 ? '랜덤 닉네임 데이터가 없습니다' : '조건에 맞는 데이터가 없습니다'}
            description={randomNames.length === 0 ? undefined : '다른 발급 상태를 선택해보세요.'}
          />
        ) : (
          <DataTable maxHeight="600px">
            <thead>
            <tr>
              <th style={{width: '10%'}}>번호</th>
              <th style={{width: '40%'}}>접두사</th>
              <th style={{width: '20%'}} className="num">발급 횟수</th>
              <th style={{width: '30%'}}>마지막 발급 닉네임</th>
            </tr>
            </thead>
            <tbody>
            {filteredRandomNames.map((item, index) => (
              <tr key={item.prefix}>
                <td className="num">{index + 1}</td>
                <td className="fw-semibold">{item.prefix}</td>
                <td className="num">
                  {item.sequence === 0
                    ? <span className="text-secondary">-</span>
                    : item.sequence.toLocaleString()}
                </td>
                <td>
                  {item.sequence === 0 ? (
                    <span className="text-secondary">발급 이력 없음</span>
                  ) : (
                    <code>{formatNickname(item.prefix, item.sequence)}</code>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </DataTable>
        )}
      </SectionCard>
    </div>
  );
};

export default RandomNameTool;
