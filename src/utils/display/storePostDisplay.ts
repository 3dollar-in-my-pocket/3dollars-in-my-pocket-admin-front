import {StorePost, StorePostSection} from '@/types/storePost';

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
