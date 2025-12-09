import { IsNotEmpty, IsString } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  question!: string;
}
