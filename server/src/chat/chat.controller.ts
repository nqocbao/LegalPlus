import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  ask(@Body() dto: ChatRequestDto, @Req() req: any) {
    const userId = req?.user?.id as string | undefined;
    return this.chatService.ask(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  history(@Req() req: any) {
    return this.chatService.history(req.user.id);
  }
}
