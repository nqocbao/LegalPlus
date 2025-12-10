import { Module } from "@nestjs/common";
import { KnowledgeService } from "./services/knowledge.service";
import { EmbeddingHelper } from "libs/utils/helpers/embedding.helper";
import { KnowledgeController } from "./knowledge.controller";

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, EmbeddingHelper],
})
export class KnowledgeModule { }
