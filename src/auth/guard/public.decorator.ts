import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * 認証を必要としないAPIエンドポイントに付与するデコレータ。
 * JwtAuthGuardでこのメタデータを確認し、認証チェックをスキップする。
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
