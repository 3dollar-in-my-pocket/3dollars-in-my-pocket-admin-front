import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import ThreadsPostEmbed from './ThreadsPostEmbed';

const url = 'https://www.threads.com/@three/post/C1a2B3c4D5e';
let intersect: IntersectionObserverCallback;
let disconnect: ReturnType<typeof vi.fn>;
const enterViewport = () => act(() => {
  intersect([{isIntersecting: true}] as IntersectionObserverEntry[], {} as IntersectionObserver);
});
const frame = () => screen.getByTitle('Threads 포스트 미리보기') as HTMLIFrameElement;
const resize = (source: Window, data: unknown, origin = 'https://www.threads.com') => {
  fireEvent(window, new MessageEvent('message', {source, data, origin}));
};

describe('Threads 자동 임베드', () => {
  beforeEach(() => {
    disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { intersect = callback; }
      observe = vi.fn();
      disconnect = disconnect;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('화면에 가까워질 때만 공식 임베드를 생성하고 별도 API 요청을 보내지 않는다', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const {container} = render(<ThreadsPostEmbed url="http://threads.net/@three/post/C1a2B3c4D5e/?share=1#fragment"/>);
    expect(container.querySelector('iframe')).toBeNull();
    enterViewport();
    expect(frame()).toHaveAttribute('src', `${url}/embed/`);
    expect(screen.getByText('Threads 포스트를 불러오는 중...')).toBeInTheDocument();
    expect(disconnect).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(container.querySelector('script')).toBeNull();
  });

  it('현재 공식 프레임의 유효한 높이 메시지만 반영한다', () => {
    render(<ThreadsPostEmbed url={url}/>);
    enterViewport();
    const source = frame().contentWindow;
    resize(source, 900, 'https://evil.example');
    resize(window, 900);
    resize(source, {height: 900});
    resize(source, -1);
    resize(source, 10001);
    expect(frame()).toHaveAttribute('height', '460');
    resize(source, '720.2');
    expect(frame()).toHaveAttribute('height', '721');
    expect(screen.queryByText('Threads 포스트를 불러오는 중...')).not.toBeInTheDocument();
  });

  it('응답이 없으면 원본 링크와 재시도를 표시하고 이전 프레임 메시지를 무시한다', () => {
    vi.useFakeTimers();
    render(<ThreadsPostEmbed url={url}/>);
    enterViewport();
    const previousFrame = frame();
    const oldSource = previousFrame.contentWindow;
    act(() => { vi.advanceTimersByTime(15000); });
    expect(previousFrame).toHaveAttribute('hidden');
    expect(screen.getByRole('link', {name: '원본 포스트 열기'})).toHaveAttribute('href', url);
    fireEvent.click(screen.getByRole('button', {name: '다시 시도'}));
    expect(frame()).not.toBe(previousFrame);
    expect(frame()).not.toHaveAttribute('hidden');
    resize(oldSource, 900);
    expect(frame()).toHaveAttribute('height', '460');
    resize(frame().contentWindow, 800);
    expect(frame()).toHaveAttribute('height', '800');
  });

  it('타임아웃 이후 늦게 도착한 정상 응답으로 미리보기를 복구한다', () => {
    vi.useFakeTimers();
    render(<ThreadsPostEmbed url={url}/>);
    enterViewport();
    act(() => { vi.advanceTimersByTime(15000); });
    resize(frame().contentWindow, 680);
    expect(frame()).not.toHaveAttribute('hidden');
    expect(screen.queryByText(/포스트 미리보기를 불러오지 못했습니다/)).not.toBeInTheDocument();
  });

  it('지원하지 않는 URL은 외부 프레임이나 링크로 렌더링하지 않는다', () => {
    render(<ThreadsPostEmbed url="javascript:alert(1)"/>);
    enterViewport();
    expect(screen.queryByTitle('Threads 포스트 미리보기')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('포스트가 바뀌면 상태를 초기화하고 제거 시 관찰자와 메시지 리스너를 정리한다', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const {rerender, unmount} = render(<ThreadsPostEmbed url={url}/>);
    enterViewport();
    resize(frame().contentWindow, 680);
    rerender(<ThreadsPostEmbed url="https://www.threads.com/@three/post/AnotherPost"/>);
    expect(frame()).toHaveAttribute('src', 'https://www.threads.com/@three/post/AnotherPost/embed/');
    expect(frame()).toHaveAttribute('height', '460');
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });
});
