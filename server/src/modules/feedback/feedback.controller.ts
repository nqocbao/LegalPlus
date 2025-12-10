import { Get, Query } from "@nestjs/common";
import { Auth } from "libs/utils/decorators";
import { CoreControllers } from "libs/utils/decorators/controller-customer.decorator";
import { Role } from "libs/utils/enum";
import { FeedbackService } from "./services/feedback.service";
import { GetAllMessageFeedbackDto } from "./dto/get-all-message-feedback.dto";

@CoreControllers({
  path: 'feedback',
  tag: 'Feedback',
})
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
  ) { }

  @Auth([Role.ADMIN])
  @Get()
  async getMessageFeedbacks(
    @Query() query: GetAllMessageFeedbackDto,
  ) {
    return await this.feedbackService.getMessageFeedbacks(query);
  }
}
