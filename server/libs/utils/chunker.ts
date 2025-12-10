export interface ChunkedText {
  title: string;
  content: string;
  source?: string;
  article?: string;
}

export const chunkText = (title: string, content: string, source?: string, article?: string): ChunkedText[] => {
  const tokens = content.split(/\s+/);
  const chunks: ChunkedText[] = [];
  let buffer: string[] = [];

  tokens.forEach((word) => {
    buffer.push(word);
    if (buffer.join(' ').length > 450) {
      chunks.push({ title, content: buffer.join(' '), source, article });
      buffer = [];
    }
  });

  if (buffer.length) {
    chunks.push({ title, content: buffer.join(' '), source, article });
  }

  return chunks;
};
