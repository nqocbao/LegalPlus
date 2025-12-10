export enum TokenType {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface RagHit {
  articleId: number;
  chunkIndex: number;
  score: number;
  articleTitle?: string | null;
  articleNumber: string;
  clauseNumber?: string | null;
  chunkText: string;
}
