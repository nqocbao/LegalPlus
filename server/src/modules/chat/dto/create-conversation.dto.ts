import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional({
    description: 'User id (nếu dùng auth thì có thể bỏ)'
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({
    description: 'Lĩnh vực pháp lý, ví dụ: CIVIL, TAX, LABOR'
  })
  @IsOptional()
  @IsString()
  legalDomain?: string;

  @ApiPropertyOptional({
    description: 'Tiêu đề hội thoại'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Tin nhắn mở đầu (nếu muốn tạo cùng conversation)'
  })
  @IsOptional()
  @IsString()
  initialMessage?: string;
}
