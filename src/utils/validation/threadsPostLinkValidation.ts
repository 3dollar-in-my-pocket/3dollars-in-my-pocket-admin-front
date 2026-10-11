export function isThreadsPostUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol)
      && /^(www\.)?threads\.(com|net)$/i.test(url.hostname)
      && !url.username && !url.password && !url.port
      && /^\/@[a-zA-Z0-9._]+\/post\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

/** 공식 embed.js가 사용하는 포스트 경로에 /embed/를 추가한다. */
export function getThreadsEmbedUrl(value: string): string | null {
  if (!isThreadsPostUrl(value)) return null;
  const path = new URL(value).pathname.replace(/\/$/, '');
  return `https://www.threads.com${path}/embed/`;
}
