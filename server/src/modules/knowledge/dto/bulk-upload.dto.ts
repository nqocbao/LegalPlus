import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class BulkUploadKnowledgeDto {
  @ApiProperty({
    type: [String],
    description: "Danh sách văn bản luật (text)"
  })
  @IsArray()
  @IsString({ each: true })
  contents: string[];

  @ApiProperty()
  @IsString()
  legalDomain: string;

  @ApiProperty({ required: false })
  @IsString()
  type?: string;
}
