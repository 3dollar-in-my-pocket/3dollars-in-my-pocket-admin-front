import {act, renderHook, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

/** useLocation이 반환할 값. 케이스마다 state를 바꿔 끼웁니다. */
const mockLocation: {state: unknown} = {state: null};

vi.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
}));

vi.mock('react-toastify', () => ({
  toast: {error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn()},
}));

vi.mock('@/api/pushApi', () => ({
  default: {
    sendPush: vi.fn(),
    searchUserByNickname: vi.fn(),
  },
}));

vi.mock('@/api/nonceApi', () => ({
  default: {issueNonce: vi.fn()},
}));

vi.mock('@/api/uploadApi', () => ({
  default: {uploadImage: vi.fn()},
}));

import pushApi from '@/api/pushApi';
import nonceApi from '@/api/nonceApi';
import {AD_BODY_SUFFIX, AD_TITLE_PREFIX} from '@/utils/pushUtils';
import {PUSH_OS_PLATFORM} from '@/types/device';
import {usePushForm} from './usePushForm';

const sendPushMock = pushApi.sendPush as ReturnType<typeof vi.fn>;
const searchUserMock = pushApi.searchUserByNickname as ReturnType<typeof vi.fn>;
const issueNonceMock = nonceApi.issueNonce as ReturnType<typeof vi.fn>;

/** 훅을 렌더링하고 마운트 시 발급되는 nonce를 기다립니다. */
const renderPushForm = async () => {
  const rendered = renderHook(() => usePushForm());
  await waitFor(() => expect(issueNonceMock).toHaveBeenCalled());
  return rendered;
};

/** 발송이 가능한 최소 입력을 채웁니다. */
const fillValidForm = (form: ReturnType<typeof usePushForm>) => {
  form.updateFormData('pushType', 'SIMPLE');
  form.updateFormData('accountIdsInput', '1, 2');
  form.updateFormData('title', '새 소식');
  form.updateFormData('body', '내용입니다');
  form.updateFormData('path', '/home');
};

describe('usePushForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.state = null;
    issueNonceMock.mockResolvedValue({ok: true, data: {nonce: 'n-1'}});
  });

  it('마운트 시 nonce를 발급한다', async () => {
    await renderPushForm();

    expect(issueNonceMock).toHaveBeenCalledTimes(1);
  });

  it('다른 화면에서 넘긴 userIds를 발송 대상에 채운다', async () => {
    mockLocation.state = {userIds: [10, 20]};

    const {result} = await renderPushForm();

    await waitFor(() => expect(result.current.formData.accountIdsInput).toBe('10, 20'));
  });

  describe('광고성 푸시 법정 표기 자동 처리', () => {
    it('광고 타입으로 바꾸면 제목과 본문에 표기를 붙인다', async () => {
      const {result} = await renderPushForm();

      act(() => {
        result.current.updateFormData('title', '할인 안내');
        result.current.updateFormData('body', '할인 중입니다');
      });

      act(() => result.current.updateFormData('pushType', 'SIMPLE_MARKETING'));

      expect(result.current.formData.title).toBe(`${AD_TITLE_PREFIX} 할인 안내`);
      expect(result.current.formData.body).toBe(`할인 중입니다\n${AD_BODY_SUFFIX}`);
    });

    it('일반 타입으로 되돌리면 표기를 걷어낸다', async () => {
      const {result} = await renderPushForm();

      act(() => {
        result.current.updateFormData('title', '할인 안내');
        result.current.updateFormData('body', '할인 중입니다');
      });
      act(() => result.current.updateFormData('pushType', 'SIMPLE_MARKETING'));
      act(() => result.current.updateFormData('pushType', 'SIMPLE'));

      expect(result.current.formData.title).toBe('할인 안내');
      expect(result.current.formData.body).toBe('할인 중입니다');
    });

    // 타입을 여러 번 전환해도 표기가 중복되지 않아야 한다
    it('타입을 여러 번 전환해도 표기가 중복되지 않는다', async () => {
      const {result} = await renderPushForm();

      act(() => result.current.updateFormData('title', '할인 안내'));

      act(() => result.current.updateFormData('pushType', 'SIMPLE_MARKETING'));
      act(() => result.current.updateFormData('pushType', 'SIMPLE'));
      act(() => result.current.updateFormData('pushType', 'SIMPLE_MARKETING'));

      expect(result.current.formData.title).toBe(`${AD_TITLE_PREFIX} 할인 안내`);
    });

    it('같은 타입을 다시 선택하면 표기를 건드리지 않는다', async () => {
      const {result} = await renderPushForm();

      act(() => result.current.updateFormData('pushType', 'SIMPLE_MARKETING'));
      act(() => result.current.updateFormData('title', '직접 입력한 제목'));
      act(() => result.current.updateFormData('pushType', 'SIMPLE_MARKETING'));

      expect(result.current.formData.title).toBe('직접 입력한 제목');
    });

    it('광고 타입에서 표기를 지우면 누락으로 알린다', async () => {
      const {result} = await renderPushForm();

      act(() => {
        result.current.updateFormData('pushType', 'SIMPLE_MARKETING');
      });
      act(() => result.current.updateFormData('title', '표기 없는 제목'));

      expect(result.current.adNotice.missingTitlePrefix).toBe(true);
      expect(result.current.adNotice.hasMissing).toBe(true);
    });
  });

  describe('OS 플랫폼 선택', () => {
    it('기본값으로 AOS와 iOS가 선택되어 있다', async () => {
      const {result} = await renderPushForm();

      expect(result.current.targetOsPlatforms.has(PUSH_OS_PLATFORM.AOS)).toBe(true);
      expect(result.current.targetOsPlatforms.has(PUSH_OS_PLATFORM.IOS)).toBe(true);
    });

    it('토글로 선택을 해제하고 다시 선택한다', async () => {
      const {result} = await renderPushForm();

      act(() => result.current.toggleOsPlatform(PUSH_OS_PLATFORM.AOS));
      expect(result.current.targetOsPlatforms.has(PUSH_OS_PLATFORM.AOS)).toBe(false);

      act(() => result.current.toggleOsPlatform(PUSH_OS_PLATFORM.AOS));
      expect(result.current.targetOsPlatforms.has(PUSH_OS_PLATFORM.AOS)).toBe(true);
    });
  });

  describe('발송 대상 관리', () => {
    it('유저를 추가하면 대상 목록과 선택 목록에 반영된다', async () => {
      const {result} = await renderPushForm();

      act(() => result.current.handleAddUser(1, '홍길동'));

      expect(result.current.formData.accountIdsInput).toBe('1');
      expect(result.current.selectedUsers).toEqual([{id: '1', nickname: '홍길동'}]);
      expect(result.current.isUserSelected(1)).toBe(true);
    });

    it('같은 유저를 다시 추가해도 중복되지 않는다', async () => {
      const {result} = await renderPushForm();

      act(() => result.current.handleAddUser(1, '홍길동'));
      act(() => result.current.handleAddUser(1, '홍길동'));

      expect(result.current.formData.accountIdsInput).toBe('1');
      expect(result.current.selectedUsers).toHaveLength(1);
    });

    it('유저를 제거하면 두 목록에서 모두 빠진다', async () => {
      const {result} = await renderPushForm();

      act(() => result.current.handleAddUser(1, '홍길동'));
      act(() => result.current.handleAddUser(2, '김철수'));
      act(() => result.current.handleRemoveUser(1));

      expect(result.current.formData.accountIdsInput).toBe('2');
      expect(result.current.selectedUsers).toEqual([{id: '2', nickname: '김철수'}]);
      expect(result.current.isUserSelected(1)).toBe(false);
    });
  });

  describe('닉네임 검색', () => {
    it('검색 결과를 상태에 담는다', async () => {
      searchUserMock.mockResolvedValue({
        ok: true,
        data: [{id: '1', nickname: '홍길동'}],
      });

      const {result} = await renderPushForm();

      act(() => result.current.updateNicknameSearch('홍길동'));
      await act(async () => {
        await result.current.searchUserByNickname();
      });

      expect(result.current.searchState.searchResults).toHaveLength(1);
      expect(result.current.searchState.searchLoading).toBe(false);
    });

    it('검색 실패 시 결과를 비우고 로딩을 해제한다', async () => {
      searchUserMock.mockResolvedValue({ok: false, error: '검색 실패', data: []});

      const {result} = await renderPushForm();

      act(() => result.current.updateNicknameSearch('없는유저'));
      await act(async () => {
        await result.current.searchUserByNickname();
      });

      expect(result.current.searchState.searchResults).toEqual([]);
      expect(result.current.searchState.searchLoading).toBe(false);
    });
  });

  describe('발송 전 검증', () => {
    it('입력이 유효하지 않으면 확인 모달을 열지 않는다', async () => {
      const {result} = await renderPushForm();

      act(() => result.current.showSendConfirm());

      expect(result.current.uiState.showConfirm).toBe(false);
      expect(result.current.uiState.result?.type).toBe('danger');
    });

    it('OS를 모두 해제하면 확인 모달을 열지 않는다', async () => {
      const {result} = await renderPushForm();

      act(() => fillValidForm(result.current));
      act(() => {
        result.current.toggleOsPlatform(PUSH_OS_PLATFORM.AOS);
        result.current.toggleOsPlatform(PUSH_OS_PLATFORM.IOS);
      });

      act(() => result.current.showSendConfirm());

      expect(result.current.uiState.showConfirm).toBe(false);
      expect(result.current.uiState.result?.message).toBe('최소 하나의 OS를 선택해주세요.');
    });

    it('입력이 유효하면 확인 모달을 연다', async () => {
      const {result} = await renderPushForm();

      act(() => fillValidForm(result.current));
      act(() => result.current.showSendConfirm());

      expect(result.current.uiState.showConfirm).toBe(true);
    });

    it('확인 모달을 닫을 수 있다', async () => {
      const {result} = await renderPushForm();

      act(() => fillValidForm(result.current));
      act(() => result.current.showSendConfirm());
      act(() => result.current.hideSendConfirm());

      expect(result.current.uiState.showConfirm).toBe(false);
    });

    describe('canSend', () => {
      it('입력이 불완전하면 발송할 수 없다', async () => {
        const {result} = await renderPushForm();

        expect(result.current.canSend()).toBe(false);
      });

      it('입력이 완전하면 발송할 수 있다', async () => {
        const {result} = await renderPushForm();

        act(() => fillValidForm(result.current));

        expect(result.current.canSend()).toBe(true);
      });

      it('OS가 하나도 없으면 발송할 수 없다', async () => {
        const {result} = await renderPushForm();

        act(() => fillValidForm(result.current));
        act(() => {
          result.current.toggleOsPlatform(PUSH_OS_PLATFORM.AOS);
          result.current.toggleOsPlatform(PUSH_OS_PLATFORM.IOS);
        });

        expect(result.current.canSend()).toBe(false);
      });
    });
  });

  describe('발송', () => {
    it('성공하면 폼을 초기화하고 nonce를 다시 발급한다', async () => {
      sendPushMock.mockResolvedValue({ok: true, data: {}});

      const {result} = await renderPushForm();

      act(() => fillValidForm(result.current));

      let sent: boolean | undefined;
      await act(async () => {
        sent = await result.current.confirmSendPush();
      });

      expect(sent).toBe(true);
      expect(result.current.formData.accountIdsInput).toBe('');
      expect(result.current.formData.title).toBe('');
      expect(result.current.selectedUsers).toEqual([]);
      // 다음 발송을 위해 새 nonce를 발급한다.
      expect(issueNonceMock).toHaveBeenCalledTimes(2);
    });

    it('발송 시 입력값과 nonce를 전달한다', async () => {
      sendPushMock.mockResolvedValue({ok: true, data: {}});

      const {result} = await renderPushForm();

      act(() => fillValidForm(result.current));
      await act(async () => {
        await result.current.confirmSendPush();
      });

      expect(sendPushMock).toHaveBeenCalledWith(
        'SIMPLE',
        expect.objectContaining({
          accountIds: ['1', '2'],
          accountType: 'USER_ACCOUNT',
          title: '새 소식',
          path: '/home',
          targetOsPlatforms: expect.arrayContaining([PUSH_OS_PLATFORM.AOS, PUSH_OS_PLATFORM.IOS]),
        }),
        'n-1'
      );
    });

    // 회귀 테스트: 발송 실패가 성공으로 표시되던 문제
    it('실패하면 false를 반환하고 서버 메시지를 노출한다', async () => {
      sendPushMock.mockResolvedValue({ok: false, error: '대상이 유효하지 않습니다.'});

      const {result} = await renderPushForm();

      act(() => fillValidForm(result.current));

      let sent: boolean | undefined;
      await act(async () => {
        sent = await result.current.confirmSendPush();
      });

      expect(sent).toBe(false);
      expect(result.current.uiState.result?.type).toBe('danger');
      expect(result.current.uiState.result?.message).toBe('대상이 유효하지 않습니다.');
      // 실패했으므로 입력값을 유지해 재시도할 수 있어야 한다.
      expect(result.current.formData.title).toBe('새 소식');
    });

    it('예외가 발생해도 로딩을 해제하고 false를 반환한다', async () => {
      sendPushMock.mockRejectedValue(new Error('network'));

      const {result} = await renderPushForm();

      act(() => fillValidForm(result.current));

      let sent: boolean | undefined;
      await act(async () => {
        sent = await result.current.confirmSendPush();
      });

      expect(sent).toBe(false);
      expect(result.current.uiState.loading).toBe(false);
    });

    it('nonce가 없으면 발송하지 않는다', async () => {
      issueNonceMock.mockResolvedValue({ok: false, data: {}});

      const {result} = await renderPushForm();

      act(() => fillValidForm(result.current));

      let sent: boolean | undefined;
      await act(async () => {
        sent = await result.current.confirmSendPush();
      });

      expect(sent).toBe(false);
      expect(sendPushMock).not.toHaveBeenCalled();
      expect(result.current.uiState.result?.type).toBe('danger');
    });

    // 회귀 테스트: 확인 모달을 우회한 호출에서 검증이 빠져 있던 문제
    it('입력이 유효하지 않으면 발송하지 않는다', async () => {
      const {result} = await renderPushForm();

      let sent: boolean | undefined;
      await act(async () => {
        sent = await result.current.confirmSendPush();
      });

      expect(sent).toBe(false);
      expect(sendPushMock).not.toHaveBeenCalled();
      expect(result.current.uiState.result?.type).toBe('danger');
    });
  });

  describe('resetForm', () => {
    it('폼과 선택 상태를 초기값으로 되돌린다', async () => {
      const {result} = await renderPushForm();

      act(() => fillValidForm(result.current));
      act(() => result.current.handleAddUser(1, '홍길동'));
      act(() => result.current.toggleOsPlatform(PUSH_OS_PLATFORM.AOS));

      act(() => result.current.resetForm());

      expect(result.current.formData.accountIdsInput).toBe('');
      expect(result.current.formData.pushType).toBe('');
      expect(result.current.selectedUsers).toEqual([]);
      // OS 선택은 기본값으로 복원된다.
      expect(result.current.targetOsPlatforms.has(PUSH_OS_PLATFORM.AOS)).toBe(true);
      expect(result.current.targetOsPlatforms.has(PUSH_OS_PLATFORM.IOS)).toBe(true);
    });
  });

  describe('이미지', () => {
    it('제거하면 imageUrl을 비운다', async () => {
      const {result} = await renderPushForm();

      act(() => result.current.updateFormData('imageUrl', 'https://cdn/a.png'));
      act(() => result.current.removeImage());

      expect(result.current.formData.imageUrl).toBe('');
    });

    it('파일이 없으면 업로드하지 않는다', async () => {
      const {result} = await renderPushForm();

      await act(async () => {
        await result.current.uploadImage(null);
      });

      expect(result.current.uiState.uploading).toBe(false);
    });
  });
});
