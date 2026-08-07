import {PushOsPlatform} from './device';

export interface PushRequest {
  accountIds: string[];
  accountType: string;
  title: string;
  body: string;
  path?: string;
  imageUrl?: string | null;
  targetOsPlatforms?: PushOsPlatform[];
}
