import {useEffect, useRef, useState} from 'react';
import {getThreadsEmbedUrl} from '@/utils/validation/threadsPostLinkValidation';
import './ThreadsPostEmbed.css';

interface ThreadsPostEmbedProps {
  url: string;
}

const ThreadsPostEmbedFrame = ({url}: ThreadsPostEmbedProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(460);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const embedUrl = getThreadsEmbedUrl(url);

  useEffect(() => {
    if (!embedUrl) return;
    setIsLoading(true);
    setError(false);
    setHeight(460);
    const timeout = window.setTimeout(() => {
      setIsLoading(false);
      setError(true);
    }, 15000);

    // Threads는 포스트 프레임의 높이를 숫자 메시지로 전달한다.
    // 현재 iframe과 공식 출처를 모두 확인해 다른 프레임의 메시지를 배제한다.
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.threads.com'
        || !iframeRef.current?.contentWindow || event.source !== iframeRef.current.contentWindow) return;
      if (typeof event.data !== 'number'
        && !(typeof event.data === 'string' && /^\d+(\.\d+)?$/.test(event.data))) return;
      const nextHeight = Number(event.data);
      if (!Number.isFinite(nextHeight) || nextHeight <= 0 || nextHeight > 10000) return;
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
  }, [embedUrl, attempt]);

  return (
    <div className="threads-post-embed" aria-busy={isLoading && Boolean(embedUrl)}>
      {embedUrl && isLoading && (
        <div className="threads-post-embed__status" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true"/>
          Threads 포스트를 불러오는 중...
        </div>
      )}
      {embedUrl && (
        <iframe
          key={attempt} ref={iframeRef} src={embedUrl} title="Threads 포스트 미리보기"
          className="threads-post-embed__frame" height={height} hidden={error}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
          onError={() => { setIsLoading(false); setError(true); }}
        />
      )}
      {(!embedUrl || error) && (
        <div className="threads-post-embed__error" role="status">
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

const ThreadsPostEmbed = ({url}: ThreadsPostEmbedProps) => {
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
    <div ref={containerRef} className="threads-post-preview">
      {visible ? <ThreadsPostEmbedFrame key={url} url={url}/> : (
        <div className="threads-post-preview__placeholder" aria-hidden="true"/>
      )}
    </div>
  );
};

export default ThreadsPostEmbed;
