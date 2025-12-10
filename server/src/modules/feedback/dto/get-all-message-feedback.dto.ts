import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional } from "class-validator";
import { DefaultPaginationDto } from "libs/utils/pagination";

export class GetAllMessageFeedbackDto extends DefaultPaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({
    description: 'Filter by rating range',
    examples: [[1, 3], [4, 6], [8, 10]],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  rating?: number[];
}
