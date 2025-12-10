import { Body, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { CoreControllers } from "libs/utils/decorators/controller-customer.decorator";
import { Auth } from "libs/utils/decorators";
import { Role } from "libs/utils/enum";
import { KnowledgeService } from "./services/knowledge.service";
import { CreateKnowledgeDto } from "./dto/create-knowledge.dto";
import { UpdateKnowledgeDto } from "./dto/update-knowledge.dto";
import { BulkUploadKnowledgeDto } from "./dto/bulk-upload.dto";
@CoreControllers({
  path: 'knowledge',
  tag: 'Knowledge',
})
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) { }

  @Auth([Role.ADMIN])
  @Get()
  async getList() {
    return this.knowledgeService.getKnowledgeList();
  }

  @Auth([Role.ADMIN])
  @Post()
  async create(@Body() dto: CreateKnowledgeDto) {
    return this.knowledgeService.createKnowledge(dto);
  }

  @Auth([Role.ADMIN])
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKnowledgeDto,
  ) {
    return this.knowledgeService.updateKnowledge(id, dto);
  }

  @Auth([Role.ADMIN])
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.knowledgeService.deleteKnowledge(id);
  }

  @Auth([Role.ADMIN])
  @Post("bulk")
  async bulkUpload(@Body() dto: BulkUploadKnowledgeDto) {
    return this.knowledgeService.bulkUpload(dto);
  }
}
