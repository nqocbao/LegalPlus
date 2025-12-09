import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { Auth } from 'libs/utils/decorators';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Auth()
  @Post('ask')
  async ask(@Body() dto: ChatRequestDto, @Req() req: any) {
    const userId = req?.user?.id ? Number(req.user.id) : undefined;
    return await this.chatService.ask(dto, userId);
  }

  @Auth()
  @Get('history')
  async history(@Req() req: any) {
    const userId = req?.user?.id ? Number(req.user.id) : undefined;
    return await this.chatService.history(userId);
  }
}
