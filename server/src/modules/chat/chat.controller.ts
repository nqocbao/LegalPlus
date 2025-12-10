import { Body, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Auth } from 'libs/utils/decorators';
import { CoreControllers } from 'libs/utils/decorators/controller-customer.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { FeedbackMessageDto } from './dto/feedback-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { GetAllConversationsDto } from './dto/get-all-conversations.dto';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { GetMessagesDto } from './dto/get-all-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';

@CoreControllers({
  path: 'chat',
  tag: 'Chat',
})
export class ChatController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) { }

  // @Auth()
  // @Post('ask')
  // async ask(@Body() dto: ChatRequestDto, @Req() req: any) {
  //   const userId = req?.user?.id ? Number(req.user.id) : undefined;
  //   return await this.chatService.ask(dto, userId);
  // }

  // @Auth()
  // @Get('history')
  // async history(@Req() req: any) {
  //   const userId = req?.user?.id ? Number(req.user.id) : undefined;
  //   return await this.chatService.history(userId);
  // }

  @Auth()
  @Post('conversations')
  @ApiOperation({ summary: 'Tạo conversation mới (có thể kèm initial message)' })
  async createConversation(@Body() dto: CreateConversationDto) {
    return this.conversationService.createConversation(dto);
  }

  @Auth()
  @Get('conversations')
  @ApiOperation({ summary: 'Danh sách conversation (lọc theo userId / legalDomain)' })
  async listConversations(
    @Query() query: GetAllConversationsDto
  ) {
    return this.conversationService.listConversations(query);
  }

  @Auth()
  @Get('conversations/:id')
  @ApiOperation({ summary: 'Chi tiết 1 conversation' })
  async getConversation(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.conversationService.getConversationById(id);
  }

  @Auth()
  @Post('conversations/:id/close')
  @ApiOperation({ summary: 'Đóng conversation' })
  async closeConversation(@Param('id', ParseIntPipe) id: number) {
    return this.conversationService.closeConversation(id);
  }

  @Auth()
  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Lấy messages của 1 conversation (pagination)' })
  async getMessages(
    @Param('id', ParseIntPipe) conversationId: number,
    @Query() query: GetMessagesDto,
  ) {
    return this.messageService.getMessagesByConversation(conversationId, query);
  }

  @Auth()
  @Post('conversations/:id/messages')
  @ApiOperation({
    summary:
      'Tạo message mới trong conversation. Với USER + withRagContext=true sẽ trả thêm ragContext + queryLog',
  })
  async createMessage(
    @Param('id', ParseIntPipe) conversationId: number,
    @Body() dto: SendMessageDto,
  ) {
    return this.messageService.createMessage(conversationId, dto);
  }

  @Post('messages/:id/feedback/:userId')
  @ApiOperation({ summary: 'Gửi feedback cho 1 message' })
  async addMessageFeedback(
    @Param('id', ParseIntPipe) messageId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: FeedbackMessageDto,
  ) {
    const { rating, comment } = dto;
    return this.messageService.addMessageFeedback(messageId, userId, rating, comment);
  }
}
