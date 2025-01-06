import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import { QuestionCommentCreatedEvent } from '@/domain/forum/enterprise/events/question-comment-created-event'
import { SendNotificationUseCase } from '../use-cases/send-notification'

export class OnQuestionCommentCreated implements EventHandler {
  constructor(
    private questionCommentsRepository: QuestionCommentsRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendQuestionCommentCreatedNotification.bind(this),
      QuestionCommentCreatedEvent.name,
    )
  }

  private async sendQuestionCommentCreatedNotification({
    questionComment,
  }: QuestionCommentCreatedEvent) {
    const question = await this.questionCommentsRepository.findById(
      questionComment.id.toString(),
    )

    if (question) {
      await this.sendNotification.execute({
        recipientId: question.authorId.toString(),
        title: 'Novo comentário no seu tópico.',
        content: `${question.content.substring(0, 40).concat('...')}`,
      })
    }
  }
}
