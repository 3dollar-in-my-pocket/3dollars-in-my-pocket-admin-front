import React from 'react';
import {act, renderHook, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

import {toast} from 'react-toastify';
import useModalForm from './useModalForm';

interface Form {
  name: string;
  email: string;
}

const initialValues: Form = {name: '', email: ''};

/** submit 이벤트를 흉내냅니다. */
const submitEvent = () => ({preventDefault: vi.fn()} as unknown as React.FormEvent);

/** input change 이벤트를 흉내냅니다. */
const changeEvent = (name: string, value: string) =>
  ({target: {name, value}} as React.ChangeEvent<HTMLInputElement>);

describe('useModalForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기값으로 폼을 채운다', () => {
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues: {name: '홍길동', email: 'a@b.com'},
      onSubmit: vi.fn(),
    }));

    expect(result.current.formData).toEqual({name: '홍길동', email: 'a@b.com'});
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleChange가 name 기준으로 값을 갱신한다', () => {
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit: vi.fn(),
    }));

    act(() => result.current.handleChange(changeEvent('name', '떡볶이')));

    expect(result.current.formData.name).toBe('떡볶이');
  });

  it('값을 수정하면 해당 필드의 에러가 사라진다', async () => {
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit: vi.fn(),
      validate: values => (values.name ? {} : {name: '이름은 필수입니다.'}),
    }));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });
    expect(result.current.errors.name).toBe('이름은 필수입니다.');

    act(() => result.current.handleChange(changeEvent('name', '가')));

    expect(result.current.errors.name).toBeUndefined();
  });

  it('검증에 실패하면 제출하지 않고 에러를 표시한다', async () => {
    const onSubmit = vi.fn();
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit,
      validate: () => ({name: '이름은 필수입니다.', email: '이메일은 필수입니다.'}),
    }));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual({
      name: '이름은 필수입니다.',
      email: '이메일은 필수입니다.',
    });
  });

  it('검증을 통과하면 폼 데이터로 제출한다', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ok: true});
    const onSuccess = vi.fn();
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit,
      onSuccess,
      validate: () => ({}),
    }));

    act(() => result.current.setFieldValue('name', '떡볶이'));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(onSubmit).toHaveBeenCalledWith({name: '떡볶이', email: ''});
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('성공하면 폼을 초기값으로 되돌린다', async () => {
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit: vi.fn().mockResolvedValue({ok: true}),
    }));

    act(() => result.current.setFieldValue('name', '떡볶이'));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(result.current.formData).toEqual(initialValues);
  });

  it('resetOnSuccess가 false면 입력값을 유지한다', async () => {
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit: vi.fn().mockResolvedValue({ok: true}),
      resetOnSuccess: false,
    }));

    act(() => result.current.setFieldValue('name', '떡볶이'));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(result.current.formData.name).toBe('떡볶이');
  });

  it('응답이 ok:false면 성공 콜백을 실행하지 않고 메시지를 띄운다', async () => {
    const onSuccess = vi.fn();
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit: vi.fn().mockResolvedValue({ok: false, message: '중복된 이름입니다.'}),
      onSuccess,
    }));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('중복된 이름입니다.');
  });

  it('예외가 발생하면 서버 메시지를 우선 표시한다', async () => {
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit: vi.fn().mockRejectedValue({response: {data: {message: '서버가 거부했습니다.'}}}),
    }));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(toast.error).toHaveBeenCalledWith('서버가 거부했습니다.');
    expect(result.current.isSubmitting).toBe(false);
  });

  // 회귀 테스트: 응답 완료 전 중복 제출이 서버를 두 번 호출하던 문제
  it('제출 중에는 중복 제출을 차단한다', async () => {
    let resolveSubmit: (value: unknown) => void = () => {};
    const onSubmit = vi.fn().mockImplementation(
      () => new Promise(resolve => {
        resolveSubmit = resolve;
      })
    );

    const {result} = renderHook(() => useModalForm<Form>({initialValues, onSubmit}));

    act(() => {
      result.current.handleSubmit(submitEvent());
      result.current.handleSubmit(submitEvent());
      result.current.handleSubmit(submitEvent());
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmit({ok: true});
    });

    await waitFor(() => expect(result.current.isSubmitting).toBe(false));
  });

  it('제출이 끝나면 다시 제출할 수 있다', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ok: true});
    const {result} = renderHook(() => useModalForm<Form>({initialValues, onSubmit}));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });
    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('setFieldError와 clearErrors로 에러를 직접 제어한다', () => {
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit: vi.fn(),
    }));

    act(() => result.current.setFieldError('email', '이미 사용 중인 이메일입니다.'));
    expect(result.current.errors.email).toBe('이미 사용 중인 이메일입니다.');

    act(() => result.current.clearErrors());
    expect(result.current.errors).toEqual({});
  });

  it('resetForm은 폼과 에러를 초기화한다', async () => {
    const {result} = renderHook(() => useModalForm<Form>({
      initialValues,
      onSubmit: vi.fn(),
    }));

    act(() => {
      result.current.setFieldValue('name', '떡볶이');
      result.current.setFieldError('email', '오류');
    });

    act(() => result.current.resetForm());

    expect(result.current.formData).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });
});
