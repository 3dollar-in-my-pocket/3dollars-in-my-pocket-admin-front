import {useEffect, useRef, useState} from 'react';
import {SnsPlatform} from '@/types/storeSnsPostLink';
import {getSnsEmbedUrl, getSnsPostPlatform} from '@/utils/validation/snsPostLinkValidation';
import './SnsPostEmbed.css';

interface SnsPostEmbedProps {
  url: string;
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) return Number(value);
  return null;
};

/** 플랫폼별 embed 출처와 iframe이 보내는 높이 메시지 형식 */
const EMBED_PLATFORMS: Record<SnsPlatform, {label: string; origin: string; parseHeight: (data: unknown) => number | null}> = {
  // Threads는 포스트 프레임의 높이를 숫자 메시지로 전달한다.
  THREADS: {label: 'Threads', origin: 'https://www.threads.com', parseHeight: toNumber},
  // Instagram은 {"type":"MEASURE","details":{"height":N}} JSON 문자열로 전달한다.
  INSTAGRAM: {
    label: 'Instagram', origin: 'https://www.instagram.com',
    parseHeight: data => {
      try {
        const message = typeof data === 'string' ? JSON.parse(data) : data;
        return message?.type === 'MEASURE' ? toNumber(message.details?.height) : null;
      } catch {
        return null;
      }
    },
  },
};

const SnsPostEmbedFrame = ({url}: SnsPostEmbedProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(460);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const embedUrl = getSnsEmbedUrl(url);
  const platform = EMBED_PLATFORMS[getSnsPostPlatform(url) ?? 'THREADS'];

  useEffect(() => {
    if (!embedUrl) return;
    setIsLoading(true);
    setError(false);
    setHeight(460);
    const timeout = window.setTimeout(() => {
      setIsLoading(false);
      setError(true);
    }, 15000);

    // 현재 iframe과 공식 출처를 모두 확인해 다른 프레임의 메시지를 배제한다.
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== platform.origin
        || !iframeRef.current?.contentWindow || event.source !== iframeRef.current.contentWindow) return;
      const nextHeight = platform.parseHeight(event.data);
      if (nextHeight === null || !Number.isFinite(nextHeight) || nextHeight <= 0 || nextHeight > 10000) return;
      window.clearTimeout(timeout);
      setHeight(Math.ceil(nextHeight));
      setIsLoading(false);
      setError(false);
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('message', handleMessage);
    };
  }, [embedUrl, platform, attempt]);

  return (
    <div className="sns-post-embed" aria-busy={isLoading && Boolean(embedUrl)}>
      {embedUrl && isLoading && (
        <div className="sns-post-embed__status" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true"/>
          {platform.label} 포스트를 불러오는 중...
        </div>
      )}
      {embedUrl && (
        <iframe
          key={attempt} ref={iframeRef} src={embedUrl} title={`${platform.label} 포스트 미리보기`}
          className="sns-post-embed__frame" height={height} hidden={error}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
          onError={() => { setIsLoading(false); setError(true); }}
        />
      )}
      {(!embedUrl || error) && (
        <div className="sns-post-embed__error" role="status">
          <p className="mb-2">포스트 미리보기를 불러오지 못했습니다. 원본 링크에서 확인해주세요.</p>
          {embedUrl && (
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-sm btn-outline-secondary"
                onClick={() => setAttempt(value => value + 1)}>다시 시도</button>
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                원본 포스트 열기
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SnsPostEmbed = ({url}: SnsPostEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    let active = true;
    const observer = new IntersectionObserver(entries => {
      if (active && entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, {rootMargin: '200px 0px'});
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { active = false; observer.disconnect(); };
  }, []);

  return (
    <div ref={containerRef} className="sns-post-preview">
      {visible ? <SnsPostEmbedFrame key={url} url={url}/> : (
        <div className="sns-post-preview__placeholder" aria-hidden="true"/>
      )}
    </div>
  );
};

export default SnsPostEmbed;
