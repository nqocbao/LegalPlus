import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "libs/modules/prisma/prisma.service";
import { CreateKnowledgeDto } from "../dto/create-knowledge.dto";
import { UpdateKnowledgeDto } from "../dto/update-knowledge.dto";
import { BulkUploadKnowledgeDto } from "../dto/bulk-upload.dto";
import { EmbeddingHelper } from "libs/utils/helpers/embedding.helper";
import { User } from "@prisma/client";
import { ContextProvider } from "libs/utils/providers/context.provider";

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingHelper: EmbeddingHelper,
  ) { }

  async getKnowledgeList() {
    return this.prisma.legalSource.findMany({
      where: { deletedAt: null },
      include: { articles: true },
    });
  }

  async createKnowledge(dto: CreateKnowledgeDto) {
    const user: User = ContextProvider.getAuthUser();
    if (!user) {
      throw new UnauthorizedException("Unauthorized");
    }
    const source = await this.prisma.legalSource.create({
      data: {
        name: dto.name,
        code: dto.code,
        legalDomain: dto.legalDomain,
        type: dto.type,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : null,
        expiredDate: dto.expiredDate ? new Date(dto.expiredDate) : null,
        sourceUrl: dto.sourceUrl,
        uploadedById: user.id,
      },
    });

    // Chunk document
    const chunks = this.embeddingHelper.chunkText(dto.content);

    // Generate embeddings + store article + embeddings
    let article = await this.prisma.legalArticle.create({
      data: {
        sourceId: source.id,
        articleNumber: "1",
        content: dto.content,
        tags: [],
      },
    });

    for (let i = 0; i < chunks.length; i++) {
      const emb = await this.embeddingHelper.generateEmbedding(chunks[i]);

      await this.prisma.lawEmbedding.create({
        data: {
          articleId: article.id,
          chunkIndex: i,
          chunkText: chunks[i],
        },
      });
    }

    return { source, article };
  }

  async updateKnowledge(id: number, dto: UpdateKnowledgeDto) {
    const existing = await this.prisma.legalSource.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException("Knowledge not found");

    const updatedSource = await this.prisma.legalSource.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        legalDomain: dto.legalDomain,
        type: dto.type,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : null,
        expiredDate: dto.expiredDate ? new Date(dto.expiredDate) : null,
        sourceUrl: dto.sourceUrl,
      },
    });

    if (dto.content) {
      // Remove old embeddings
      await this.prisma.legalArticle.updateMany({
        where: { sourceId: id },
        data: { deletedAt: new Date() },
      });

      // Recreate article + embeddings
      const article = await this.prisma.legalArticle.create({
        data: {
          sourceId: updatedSource.id,
          articleNumber: "1",
          content: dto.content,
          tags: [],
        },
      });

      const chunks = this.embeddingHelper.chunkText(dto.content);

      for (let i = 0; i < chunks.length; i++) {
        await this.prisma.lawEmbedding.create({
          data: {
            articleId: article.id,
            chunkIndex: i,
            chunkText: chunks[i],
          },
        });
      }
    }

    return updatedSource;
  }

  async deleteKnowledge(id: number) {
    const existing = await this.prisma.legalSource.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException("Knowledge not found");

    await this.prisma.legalSource.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: "Deleted" };
  }

  async bulkUpload(dto: BulkUploadKnowledgeDto) {
    const results = [];

    for (const content of dto.contents) {
      const fakeDto: CreateKnowledgeDto = {
        name: "Bulk Uploaded Document",
        legalDomain: dto.legalDomain,
        type: dto.type,
        content,
      };

      const res = await this.createKnowledge(fakeDto);
      results.push(res);
    }

    return { uploaded: results.length, results };
  }
}
