import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common'
import { z } from 'zod'

const editAnswerBodySchema = z.object({
  content: z.string(),
})

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>

@Controller('answers')
export class EditAnswerController {
  constructor(private readonly editAnswer: EditAnswerUseCase) {}

  @Put(':id')
  @HttpCode(204)
  async handle(
    @CurrentUser()
    user: UserPayload,
    @Body(new ZodValidationPipe(editAnswerBodySchema))
    body: EditAnswerBodySchema,
    @Param('id') answerId: string,
  ) {
    const { content } = body
    const userId = user.sub

    const result = await this.editAnswer.execute({
      authorId: userId,
      answerId,
      content,
      attachmentsIds: [],
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
