import { DeleteQuestionCommentUseCase } from '@/domain/forum/application/use-cases/delete-question-comment'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  Param,
} from '@nestjs/common'

@Controller('questions')
export class DeleteQuestionCommentController {
  constructor(
    private readonly deleteQuestionComment: DeleteQuestionCommentUseCase,
  ) {}

  @Delete('comments/:id')
  @HttpCode(204)
  async handle(
    @CurrentUser()
    user: UserPayload,
    @Param('id') questionCommentId: string,
  ) {
    const userId = user.sub

    const result = await this.deleteQuestionComment.execute({
      questionCommentId,
      authorId: userId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
