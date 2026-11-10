import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {expect, it, vi} from 'vitest';
import enumApi from '@/api/enumApi';
import SectionConfigEditor from './SectionConfigEditor';

vi.mock('@/api/enumApi', () => ({default: {getEnum: vi.fn()}}));

it('적용 캐러셀은 서버 enum의 표시명으로 보여주고 선택한 키와 기존 값을 저장한다', async () => {
  vi.mocked(enumApi.getEnum).mockResolvedValue({
    ok: true,
    data: {
      HomeCurationCarouselType: [{key: 'NEW_CAROUSEL', description: '서버의 새 캐러셀'}],
    },
  });
  const onChange = vi.fn();
  const props = {
    sectionKey: 'curation',
    sectionType: 'HOME_CURATION',
    label: '홈 큐레이션',
    config: {type: 'HOME_CURATION', cardAdvertisementCarouselIds: ['LEGACY_CAROUSEL']},
    editable: true,
    onChange,
  };
  const {rerender} = render(<SectionConfigEditor {...props}/>);

  const option = await screen.findByRole('button', {name: '서버의 새 캐러셀'});
  expect(screen.queryByRole('button', {name: '최근 인기 간식'})).not.toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'LEGACY_CAROUSEL'})).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(option);
  expect(onChange).toHaveBeenCalledWith({
    ...props.config,
    cardAdvertisementCarouselIds: ['LEGACY_CAROUSEL', 'NEW_CAROUSEL'],
  });
  expect(enumApi.getEnum).toHaveBeenCalledTimes(1);

  rerender(<SectionConfigEditor {...props} editable={false}/>);
  expect(screen.getByRole('button', {name: '서버의 새 캐러셀'})).toBeDisabled();
});
