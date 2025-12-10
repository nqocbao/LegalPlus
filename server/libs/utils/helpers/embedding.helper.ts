import { Injectable } from "@nestjs/common";
import { OpenAI } from "openai";

@Injectable()
export class EmbeddingHelper {
  private readonly client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateEmbedding(text: string): Promise<number[]> {
    const res = await this.client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return res.data[0].embedding;
  }

  chunkText(text: string, chunkSize = 800): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
