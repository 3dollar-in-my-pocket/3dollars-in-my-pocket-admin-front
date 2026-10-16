import {SNS_SECTION_PLATFORMS} from '@/constants/snsPost';
import {StorePost, StorePostSection} from '@/types/storePost';
import {SnsPlatform} from '@/types/storeSnsPostLink';

/* deslop-ignore-file 15 스티커 반응은 이모지 자체가 데이터다 */
/** 스티커 ID별 기본 이모지 (서버가 emoji를 내려주지 않을 때의 폴백) */
const STICKER_EMOJI: Record<string, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  LAUGH: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡'
};

export const getStickerEmoji = (stickerId: string): string => STICKER_EMOJI[stickerId] || '👍';

/** 소식 본문에서 이미지 섹션만 추출 */
export const getPostImageSections = (post?: StorePost | null): StorePostSection[] =>
  post?.sections?.filter((section) => section.sectionType === 'IMAGE') || [];

/** 전체 스티커 반응 수 합계 */
export const getTotalStickerCount = (post?: StorePost | null): number =>
  post?.stickers?.reduce((total, sticker) => total + (sticker.count || 0), 0) || 0;

/** 등록 후 수정된 소식인지 여부 */
export const isPostEdited = (post?: StorePost | null): boolean =>
  Boolean(post?.updatedAt && post.updatedAt !== post.createdAt);

/** SNS 포스트의 링크 섹션에서 플랫폼과 URL을 추출 */
export const getSnsPostLink = (post: StorePost): { platform: SnsPlatform | null; url: string | null } => {
  const section = post.sections?.find(({sectionType}) => SNS_SECTION_PLATFORMS[sectionType]);
  return {platform: section ? SNS_SECTION_PLATFORMS[section.sectionType] : null, url: section?.url || null};
};
