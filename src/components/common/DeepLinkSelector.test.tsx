import React, {useState} from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import applicationApi from '@/api/applicationApi';
import DeepLinkSelector from './DeepLinkSelector';

vi.mock('@/api/applicationApi', () => ({default: {getSchemes: vi.fn()}}));

beforeEach(() => {
  vi.mocked(applicationApi.getSchemes).mockResolvedValue({
    ok: true,
    data: {contents: [{path: '/home', description: '홈'}, {
      path: '/store/{{storeId}}/{{storeType}}', description: '가게 상세'
    }]}
  });
});

describe('DeepLinkSelector', () => {
  it('저장된 딥링크를 지우지 않고 편집 가능한 입력란으로 복원한다', async () => {
    const onChange = vi.fn();
    render(<DeepLinkSelector value="/store/123/USER_STORE" onChange={onChange}/>);

    await screen.findByRole('option', {name: '홈'});
    expect(screen.getByRole('combobox')).toHaveValue('custom');
    expect(screen.getByRole('textbox')).toHaveValue('/store/123/USER_STORE');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('외부에서 다른 광고 주소가 전달되면 해당 주소를 복원한다', async () => {
    const onChange = vi.fn();
    const {rerender} = render(<DeepLinkSelector value="" onChange={onChange}/>);
    await screen.findByRole('option', {name: '홈'});

    rerender(<DeepLinkSelector value="/event/456" onChange={onChange}/>);
    expect(screen.getByRole('textbox')).toHaveValue('/event/456');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('경로 선택 후 여러 파라미터를 입력해도 선택 상태를 유지한다', async () => {
    const onChange = vi.fn();
    const Form = () => {
      const [value, setValue] = useState('/home');
      return <DeepLinkSelector value={value} onChange={next => { onChange(next); setValue(next); }}/>;
    };
    render(<Form/>);
    await screen.findByRole('option', {name: '가게 상세'});

    fireEvent.change(screen.getByRole('combobox'), {target: {value: '/store/{{storeId}}/{{storeType}}'}});
    fireEvent.change(screen.getByPlaceholderText('storeId 값을 입력하세요'), {target: {value: '123'}});
    fireEvent.change(screen.getAllByRole('combobox')[1], {target: {value: 'USER_STORE'}});

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('/store/123/USER_STORE'));
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('/store/{{storeId}}/{{storeType}}');
    expect(screen.getByPlaceholderText('storeId 값을 입력하세요')).toHaveValue('123');
  });
});
