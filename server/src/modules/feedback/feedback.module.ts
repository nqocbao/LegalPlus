import { Module } from "@nestjs/common";
import { FeedbackController } from "./feedback.controller";
import { FeedbackService } from "./services/feedback.service";

@Module({
  imports: [],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [],
})
export class FeedbackModule { }