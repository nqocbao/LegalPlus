import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsJSON, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum SenderType {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export class SendMessageDto {
  @ApiProperty({ enum: SenderType })
  @IsEnum(SenderType)
  senderType: SenderType;

  @ApiPropertyOptional({ description: 'SenderId, thường là userId. Với ASSISTANT/SYSTEM có thể bỏ.' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  senderId?: number;

  @ApiProperty({ description: 'Nội dung tin nhắn (plain text / markdown)' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Có hiển thị cho user không? Mặc định true' })
  @IsOptional()
  @IsBoolean()
  isUserVisible?: boolean;

  @ApiPropertyOptional({ description: 'Metadata (JSON) cho logging / trace / tool-calls' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Có trigger RAG retrieval nếu là USER message' })
  @IsOptional()
  @IsBoolean()
  withRagContext?: boolean;
}
