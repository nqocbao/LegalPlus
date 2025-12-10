import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, IsNotEmpty } from "class-validator";

export class CreateKnowledgeDto {
  @ApiProperty({
    description: 'Knowledge name'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Knowledge code'
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Legal domain of the knowledge'
  })
  @IsNotEmpty()
  @IsString()
  legalDomain: string;

  @ApiPropertyOptional({
    description: 'Type of the knowledge document'
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Effective date of the knowledge document'
  })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Expired date of the knowledge document'
  })
  @IsOptional()
  @IsDateString()
  expiredDate?: string;

  @ApiPropertyOptional({
    description: 'Source URL of the knowledge document'
  })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiProperty({ description: "Full document text" })
  @IsString()
  content: string;
}
