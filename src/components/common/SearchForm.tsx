import React from 'react';
import FilterCard from './FilterCard';

export interface SearchOption {
  value: string;
  label: string;
}

/** 검색 방식별 부가 파라미터 (userIds, storeTypes 등 화면마다 키/값이 달라 any) */
export type AdditionalParams = Record<string, any>;

export interface SearchCustomInputsArgs {
  searchType: string;
  searchQuery: string;
  handleSearchQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  additionalParams: AdditionalParams;
  handleAdditionalParamChange: (key: string, value: any) => void;
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
}

interface SearchFormProps {
  searchType: string;
  setSearchType: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  additionalParams?: AdditionalParams;
  setAdditionalParams?: React.Dispatch<React.SetStateAction<AdditionalParams>>;
  searchOptions?: SearchOption[];
  onSearch: (reset?: boolean) => void;
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
  isSearching?: boolean;
  placeholder?: string;
  customInputs?: ((args: SearchCustomInputsArgs) => React.ReactNode) | null;
  /** 검색 조건 아래에 덧붙일 추가 필터 영역 */
  children?: React.ReactNode;
}

const SearchForm = ({
                      searchType,
                      setSearchType,
                      searchQuery,
                      setSearchQuery,
                      additionalParams = {},
                      setAdditionalParams,
                      searchOptions = [],
                      onSearch,
                      onKeyPress,
                      isSearching = false,
                      placeholder = "검색어를 입력하세요",
                      customInputs = null,
                      children
                    }: SearchFormProps) => {
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAdditionalParamChange = (key: string, value: any) => {
    setAdditionalParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <FilterCard title="검색 조건" icon="bi-search">
      <div className="row g-3">
        {searchOptions.length > 0 && (
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label" htmlFor="search-type">검색 방식</label>
            <select
              id="search-type"
              className="form-select"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              {searchOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="col-12 col-md">
          <label className="form-label" htmlFor="search-query">검색어</label>
          {customInputs ? (
            customInputs({
              searchType,
              searchQuery,
              handleSearchQueryChange,
              additionalParams,
              handleAdditionalParamChange,
              onKeyPress
            })
          ) : (
            <input
              id="search-query"
              type="text"
              className="form-control"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchQueryChange}
              onKeyPress={onKeyPress}
              onCompositionEnd={(e: any) => setSearchQuery(e.target.value)}
            />
          )}
        </div>

        <div className="col-12 col-md-auto d-flex align-items-end">
          <button
            className="btn btn-primary w-100"
            onClick={() => onSearch(true)}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                검색 중...
              </>
            ) : (
              <>
                <i className="bi bi-search me-1"/>
                검색
              </>
            )}
          </button>
        </div>

        {children}
      </div>
    </FilterCard>
  );
};

export default SearchForm;
