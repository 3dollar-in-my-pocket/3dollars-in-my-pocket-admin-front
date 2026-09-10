import React from 'react';
import {act, renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@/api/uploadApi', () => ({
  default: {uploadImage: vi.fn()},
}));

import {toast} from 'react-toastify';
import uploadApi from '@/api/uploadApi';
import useImageUpload from './useImageUpload';

/** 지정한 타입/크기를 가진 가짜 파일을 만듭니다. */
const makeFile = (
  {type = 'image/png', sizeMB = 1, name = 'photo.png'}: {
    type?: string;
    sizeMB?: number;
    name?: string;
  } = {}
): File => {
  const file = new File(['x'], name, {type});
  // File.size는 읽기 전용이라 정의를 덮어씁니다.
  Object.defineProperty(file, 'size', {value: sizeMB * 1024 * 1024});
  return file;
};

const uploadImageMock = uploadApi.uploadImage as ReturnType<typeof vi.fn>;

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('업로드에 성공하면 URL을 반환하고 콜백을 호출한다', async () => {
    uploadImageMock.mockResolvedValue({ok: true, data: 'https://cdn/a.png'});
    const onUploaded = vi.fn();

    const {result} = renderHook(() => useImageUpload({
      imageType: 'STORE_IMAGE',
      onUploaded,
    }));

    let url: string | null = null;
    await act(async () => {
      url = await result.current.upload(makeFile());
    });

    expect(url).toBe('https://cdn/a.png');
    expect(uploadImageMock).toHaveBeenCalledWith('STORE_IMAGE', expect.any(File));
    expect(onUploaded).toHaveBeenCalledWith('https://cdn/a.png', undefined);
    expect(toast.success).toHaveBeenCalledWith('이미지가 업로드되었습니다.');
  });

  it('이미지가 아닌 파일은 업로드하지 않는다', async () => {
    const {result} = renderHook(() => useImageUpload({imageType: 'STORE_IMAGE'}));

    let url: string | null = 'not-null';
    await act(async () => {
      url = await result.current.upload(makeFile({type: 'application/pdf', name: 'a.pdf'}));
    });

    expect(url).toBeNull();
    expect(uploadImageMock).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('이미지 파일만 업로드 가능합니다.');
  });

  it('최대 크기를 넘는 파일은 업로드하지 않는다', async () => {
    const {result} = renderHook(() => useImageUpload({
      imageType: 'MEDAL_IMAGE',
      maxSizeMB: 2,
    }));

    await act(async () => {
      await result.current.upload(makeFile({sizeMB: 3}));
    });

    expect(uploadImageMock).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('파일 크기는 2MB 이하여야 합니다.');
  });

  it('onError를 넘기면 토스트 대신 콜백으로 알린다', async () => {
    const onError = vi.fn();
    const {result} = renderHook(() => useImageUpload({
      imageType: 'STORE_IMAGE',
      onError,
    }));

    await act(async () => {
      await result.current.upload(makeFile({type: 'text/plain'}));
    });

    expect(onError).toHaveBeenCalledWith('이미지 파일만 업로드 가능합니다.');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('successMessage가 null이면 성공 토스트를 띄우지 않는다', async () => {
    uploadImageMock.mockResolvedValue({ok: true, data: 'https://cdn/a.png'});

    const {result} = renderHook(() => useImageUpload({
      imageType: 'PUSH_IMAGE',
      successMessage: null,
    }));

    await act(async () => {
      await result.current.upload(makeFile());
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  // 회귀 테스트: 서버 실패 메시지가 사라져 기본 문구만 노출되던 문제
  it('서버가 실패 메시지를 주면 그 메시지로 알린다', async () => {
    uploadImageMock.mockResolvedValue({ok: false, data: null, message: '용량을 초과했습니다.'});

    const {result} = renderHook(() => useImageUpload({imageType: 'STORE_IMAGE'}));

    let url: string | null = 'not-null';
    await act(async () => {
      url = await result.current.upload(makeFile());
    });

    expect(url).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('용량을 초과했습니다.');
  });

  it('실패 메시지가 없으면 기본 문구로 알린다', async () => {
    uploadImageMock.mockResolvedValue({ok: false, data: null});

    const {result} = renderHook(() => useImageUpload({imageType: 'STORE_IMAGE'}));

    await act(async () => {
      await result.current.upload(makeFile());
    });

    expect(toast.error).toHaveBeenCalledWith('이미지 업로드에 실패했습니다.');
  });

  it('예외가 발생해도 로딩이 해제된다', async () => {
    uploadImageMock.mockRejectedValue(new Error('network'));

    const {result} = renderHook(() => useImageUpload({imageType: 'STORE_IMAGE'}));

    await act(async () => {
      await result.current.upload(makeFile());
    });

    expect(toast.error).toHaveBeenCalledWith('이미지 업로드 중 오류가 발생했습니다.');
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadingField).toBeNull();
  });

  // 회귀 테스트: 동시 업로드로 로딩 상태가 어긋나는 것을 막는다
  it('업로드 중에는 중복 업로드를 차단한다', async () => {
    let resolveUpload: (value: unknown) => void = () => {};
    uploadImageMock.mockImplementation(
      () => new Promise(resolve => {
        resolveUpload = resolve;
      })
    );

    const {result} = renderHook(() => useImageUpload({imageType: 'STORE_IMAGE'}));

    await act(async () => {
      result.current.upload(makeFile());
      // 첫 업로드가 끝나기 전 두 번째 시도는 차단되어야 한다.
      const second = await result.current.upload(makeFile());
      expect(second).toBeNull();
    });

    expect(uploadImageMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveUpload({ok: true, data: 'https://cdn/a.png'});
    });
  });

  it('field를 넘기면 업로드 중인 필드를 알려준다', async () => {
    let resolveUpload: (value: unknown) => void = () => {};
    uploadImageMock.mockImplementation(
      () => new Promise(resolve => {
        resolveUpload = resolve;
      })
    );

    const {result} = renderHook(() => useImageUpload({imageType: 'ADVERTISEMENT_IMAGE'}));

    act(() => {
      result.current.upload(makeFile(), 'bannerImage');
    });

    expect(result.current.isUploading).toBe(true);
    expect(result.current.uploadingField).toBe('bannerImage');

    await act(async () => {
      resolveUpload({ok: true, data: 'https://cdn/a.png'});
    });

    expect(result.current.uploadingField).toBeNull();
  });

  // 회귀 테스트: 같은 파일을 다시 선택해도 onChange가 발생해야 한다
  it('handleFileChange는 처리 후 input 값을 비운다', async () => {
    uploadImageMock.mockResolvedValue({ok: true, data: 'https://cdn/a.png'});

    const {result} = renderHook(() => useImageUpload({imageType: 'STORE_IMAGE'}));

    const input = {files: [makeFile()], value: 'C:\\fakepath\\photo.png'};
    const event = {target: input} as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleFileChange(event);
    });

    expect(input.value).toBe('');
    expect(uploadImageMock).toHaveBeenCalledTimes(1);
  });

  it('파일을 선택하지 않으면 아무 일도 하지 않는다', async () => {
    const {result} = renderHook(() => useImageUpload({imageType: 'STORE_IMAGE'}));

    const event = {
      target: {files: [], value: ''},
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    let url: string | null = 'not-null';
    await act(async () => {
      url = await result.current.handleFileChange(event);
    });

    expect(url).toBeNull();
    expect(uploadImageMock).not.toHaveBeenCalled();
  });
});
