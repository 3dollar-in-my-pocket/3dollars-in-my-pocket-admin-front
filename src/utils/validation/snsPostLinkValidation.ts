import {SnsPlatform} from '@/types/storeSnsPostLink';

const THREADS_HOST = /^(www\.)?threads\.(com|net)$/i;
const INSTAGRAM_HOST = /^(www\.)?instagram\.com$/i;
const THREADS_POST_PATH = /^\/@[a-zA-Z0-9._]+\/post\/[a-zA-Z0-9_-]+\/?$/;
// /p/, /reel/, /tv/ 포스트만 허용한다. /share/ 링크는 포스트 코드를 알 수 없어 거부한다.
const INSTAGRAM_POST_PATH = /^(\/[a-zA-Z0-9._]+)?\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?$/;

const parseHttpUrl = (value: string): URL | null => {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;
    return url;
  } catch {
    return null;
  }
};

/** host로 플랫폼을 판별한다. 포스트 형식 여부는 확인하지 않는다. */
export function getSnsPlatformByHost(value: string): SnsPlatform | null {
  const url = parseHttpUrl(value);
  if (!url) return null;
  if (THREADS_HOST.test(url.hostname)) return 'THREADS';
  if (INSTAGRAM_HOST.test(url.hostname)) return 'INSTAGRAM';
  return null;
}

export function isThreadsPostUrl(value: string): boolean {
  const url = parseHttpUrl(value);
  return Boolean(url && THREADS_HOST.test(url.hostname) && THREADS_POST_PATH.test(url.pathname));
}

export function isInstagramPostUrl(value: string): boolean {
  const url = parseHttpUrl(value);
  return Boolean(url && INSTAGRAM_HOST.test(url.hostname) && INSTAGRAM_POST_PATH.test(url.pathname));
}

/** 등록 가능한 SNS 포스트 URL이면 플랫폼을, 아니면 null을 반환한다. */
export function getSnsPostPlatform(value: string): SnsPlatform | null {
  if (isThreadsPostUrl(value)) return 'THREADS';
  if (isInstagramPostUrl(value)) return 'INSTAGRAM';
  return null;
}

/** 공식 embed.js가 사용하는 포스트 경로에 /embed/를 추가한다. */
export function getSnsEmbedUrl(value: string): string | null {
  const platform = getSnsPostPlatform(value);
  if (!platform) return null;
  const path = new URL(value).pathname.replace(/\/$/, '');
  if (platform === 'THREADS') return `https://www.threads.com${path}/embed/`;
  // 사용자명 접두 경로(/{username}/p/{code})도 embed는 /p/{code}/embed/로 요청한다.
  const [, type, code] = path.match(/\/(p|reel|tv)\/([^/]+)$/) || [];
  return `https://www.instagram.com/${type}/${code}/embed/`;
}
