import {KeyboardEvent, useEffect, useState} from 'react';

export const POLL_SEARCH_MAX_LENGTH = 100;

interface PollSearchBoxProps {
  /** 현재 적용된 검색어 (비어 있으면 검색 중 아님) */
  keyword: string;
  onSearch: (keyword: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

/**
 * 투표 제목 검색 입력
 *
 * 폼 안(모달 등)에서도 쓸 수 있도록 form 요소 없이 Enter/버튼으로 검색한다.
 */
const PollSearchBox = ({keyword, onSearch, onClear, disabled}: PollSearchBoxProps) => {
  const [value, setValue] = useState(keyword);

  useEffect(() => {
    setValue(keyword);
  }, [keyword]);

  const search = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      if (keyword) onClear();
      return;
    }
    onSearch(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    e.preventDefault();
    search();
  };

  return (
    <div className="input-group">
      <span className="input-group-text"><i className="bi bi-search"/></span>
      <input
        type="search"
        className="form-control"
        placeholder="투표 제목으로 검색 (전체 카테고리)"
        aria-label="투표 제목 검색"
        maxLength={POLL_SEARCH_MAX_LENGTH}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      {keyword && (
        <button type="button" className="btn btn-outline-secondary" onClick={onClear} disabled={disabled}>
          초기화
        </button>
      )}
      <button type="button" className="btn btn-primary" onClick={search} disabled={disabled}>
        검색
      </button>
    </div>
  );
};

export default PollSearchBox;
