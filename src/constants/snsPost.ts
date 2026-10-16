import {SnsPlatform} from '@/types/storeSnsPostLink';

export const SNS_PLATFORMS: SnsPlatform[] = ['THREADS', 'INSTAGRAM'];

export const SNS_PLATFORM_LABELS: Record<SnsPlatform, string> = {THREADS: 'Threads', INSTAGRAM: 'Instagram'};

/** SNS 포스트 섹션 타입별 플랫폼 */
export const SNS_SECTION_PLATFORMS: Record<string, SnsPlatform> = {
  THREADS_POST_LINK: 'THREADS',
  INSTAGRAM_POST_LINK: 'INSTAGRAM',
};
