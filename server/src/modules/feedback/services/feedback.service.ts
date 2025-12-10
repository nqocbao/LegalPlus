import { Injectable } from "@nestjs/common";
import { PrismaService } from "libs/modules/prisma/prisma.service";
import { GetAllMessageFeedbackDto } from "../dto/get-all-message-feedback.dto";
import { assignPaging, returnPaging } from "libs/utils/helpers";
import { Prisma } from "@prisma/client";

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prismaService: PrismaService,
  ) { }

  async getMessageFeedbacks(query: GetAllMessageFeedbackDto) {
    const paging = assignPaging(query);

    const orderBy = {
      [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
    }

    const where: Prisma.MessageFeedbackWhereInput = {};

    if (paging.userId) {
      where.userId = paging.userId;
    }

    if (paging.rating && paging.rating.length === 2) {
      where.rating = {
        gte: paging.rating[0],
        lte: paging.rating[1],
      }
    }

    const [data, total] = await Promise.all([
      this.prismaService.messageFeedback.findMany({
        where,
        skip: paging.skip,
        take: paging.take,
        orderBy,
      }),
      this.prismaService.messageFeedback.count({
        where,
      }),
    ]);

    return returnPaging(data, total, paging);
  }
}
