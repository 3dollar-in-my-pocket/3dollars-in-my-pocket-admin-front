import '@testing-library/jest-dom/vitest';
import {afterEach, vi} from 'vitest';
import {cleanup} from '@testing-library/react';

// 각 테스트 후 렌더링된 DOM을 정리합니다.
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
