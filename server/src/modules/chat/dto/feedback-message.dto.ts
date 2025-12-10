import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class FeedbackMessageDto {
  @ApiPropertyOptional({ description: 'rating for response' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rating?: number;

  @ApiPropertyOptional({ description: 'Comment for feedback' })
  @IsOptional()
  @IsString()
  comment?: string;
}
