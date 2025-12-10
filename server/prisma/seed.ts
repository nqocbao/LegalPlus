import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // ----------------------------------------------------------
  // 1. Users
  // ----------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin User',
      email: 'admin@example.com',
      passwordHash: bcrypt.hashSync('Password123', 10),
      role: 'ADMIN',
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      fullName: 'John Doe',
      email: 'john@example.com',
      passwordHash: bcrypt.hashSync('Password123', 10),
      role: 'USER',
    },
  });

  // ----------------------------------------------------------
  // 2. Conversation
  // ----------------------------------------------------------
  const conversation = await prisma.conversation.create({
    data: {
      userId: normalUser.id,
      legalDomain: 'civil',
      title: 'Hỏi về hợp đồng lao động',
      status: 'OPEN',
      lastMessageAt: new Date(),
    },
  });

  // ----------------------------------------------------------
  // 3. Messages (user → ai)
  // ----------------------------------------------------------
  const userMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'USER',
      senderId: normalUser.id,
      content: 'Tôi muốn hỏi về điều kiện chấm dứt hợp đồng lao động.',
    },
  });

  const aiMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'AI',
      content: 'Theo Bộ luật Lao động, điều kiện chấm dứt hợp đồng bao gồm...',
    },
  });

  // ----------------------------------------------------------
  // 4. Legal Sources
  // ----------------------------------------------------------
  const source = await prisma.legalSource.create({
    data: {
      code: 'BLLĐ-2019',
      name: 'Bộ luật Lao động 2019',
      legalDomain: 'civil',
      uploadedById: admin.id,
      type: 'LAW',
      effectiveDate: new Date('2021-01-01'),
    },
  });

  // ----------------------------------------------------------
  // 5. Legal Articles
  // ----------------------------------------------------------
  const article = await prisma.legalArticle.create({
    data: {
      sourceId: source.id,
      articleNumber: '34',
      clauseNumber: '1',
      title: 'Điều 34. Chấm dứt hợp đồng lao động',
      content: 'Nội dung điều 34...',
      tags: ['labor', 'contract'],
    },
  });

  // ----------------------------------------------------------
  // 6. RAG Embeddings for Article
  // ----------------------------------------------------------
  const embedding1 = await prisma.lawEmbedding.create({
    data: {
      articleId: article.id,
      chunkIndex: 0,
      chunkText: 'Nội dung đoạn 1...',
    },
  });

  const embedding2 = await prisma.lawEmbedding.create({
    data: {
      articleId: article.id,
      chunkIndex: 1,
      chunkText: 'Nội dung đoạn 2...',
    },
  });

  // ----------------------------------------------------------
  // 7. Citation (AI message cites article)
  // ----------------------------------------------------------
  await prisma.messageCitation.create({
    data: {
      messageId: aiMessage.id,
      articleId: article.id,
      chunkIndex: 0,
      rank: 1,
      score: 0.92,
    },
  });

  // ----------------------------------------------------------
  // 8. Message Feedback
  // ----------------------------------------------------------
  await prisma.messageFeedback.create({
    data: {
      messageId: aiMessage.id,
      userId: normalUser.id,
      rating: 4,
      comment: 'Trả lời khá đầy đủ.',
    },
  });

  // ----------------------------------------------------------
  // 9. Conversation Feedback
  // ----------------------------------------------------------
  await prisma.conversationFeedback.create({
    data: {
      conversationId: conversation.id,
      userId: normalUser.id,
      rating: 'GOOD',
      comment: 'Cuộc trò chuyện hữu ích.',
    },
  });

  // ----------------------------------------------------------
  // 10. QueryLog
  // ----------------------------------------------------------
  await prisma.queryLog.create({
    data: {
      conversationId: conversation.id,
      messageId: userMessage.id,
      userId: normalUser.id,
      rawQueryText: 'điều kiện chấm dứt hợp đồng',
      intent: 'ASK_LABOR_LAW',
      successFlag: true,
    },
  });

  // ----------------------------------------------------------
  // 11. Admin Logs
  // ----------------------------------------------------------
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'UPLOAD_LEGAL_SOURCE',
      details: {
        sourceId: source.id,
        name: source.name,
      },
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
