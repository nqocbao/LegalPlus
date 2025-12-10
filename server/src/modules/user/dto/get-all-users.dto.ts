import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "libs/utils/enum";
import { DefaultPaginationDto } from "libs/utils/pagination";

export class GetAllUsersDto extends DefaultPaginationDto {
  @ApiPropertyOptional({
    description: 'Filter users by full name / email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter users by role',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
