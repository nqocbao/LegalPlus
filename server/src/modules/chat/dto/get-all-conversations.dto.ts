import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";
import { DefaultPaginationDto } from "libs/utils/pagination";

export class GetAllConversationsDto extends DefaultPaginationDto {
  @ApiPropertyOptional({
    description: 'Filter conversation by userId'
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  userId?: number;

  @ApiPropertyOptional({
    description: 'Filter conversation by legalDomain'
  })
  @IsOptional()
  @IsString()
  legalDomain?: string;
}
