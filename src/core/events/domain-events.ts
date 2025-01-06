import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'

type DomainEventCallback = (event: unknown) => void

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {}

  private static markedAggregates: AggregateRoot<unknown>[] = []

  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>) {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id)

    if (!aggregateFound) {
      // biome-ignore lint/complexity/noThisInStatic: <explanation>
      this.markedAggregates.push(aggregate)
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<unknown>) {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    // biome-ignore lint/complexity/noForEach: <explanation>
    aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event))
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<unknown>,
  ) {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))

    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    this.markedAggregates.splice(index, 1)
  }

  private static findMarkedAggregateByID(
    id: UniqueEntityID,
  ): AggregateRoot<unknown> | undefined {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id))
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID) {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    const aggregate = this.findMarkedAggregateByID(id)

    if (aggregate) {
      // biome-ignore lint/complexity/noThisInStatic: <explanation>
      this.dispatchAggregateEvents(aggregate)
      aggregate.clearEvents()
      // biome-ignore lint/complexity/noThisInStatic: <explanation>
      this.removeAggregateFromMarkedDispatchList(aggregate)
    }
  }

  public static register(
    callback: DomainEventCallback,
    eventClassName: string,
  ) {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    const wasEventRegisteredBefore = eventClassName in this.handlersMap

    if (!wasEventRegisteredBefore) {
      // biome-ignore lint/complexity/noThisInStatic: <explanation>
      this.handlersMap[eventClassName] = []
    }

    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    this.handlersMap[eventClassName].push(callback)
  }

  public static clearHandlers() {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    this.handlersMap = {}
  }

  public static clearMarkedAggregates() {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    this.markedAggregates = []
  }

  private static dispatch(event: DomainEvent) {
    const eventClassName: string = event.constructor.name

    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    const isEventRegistered = eventClassName in this.handlersMap

    if (isEventRegistered) {
      // biome-ignore lint/complexity/noThisInStatic: <explanation>
      const handlers = this.handlersMap[eventClassName]

      for (const handler of handlers) {
        handler(event)
      }
    }
  }
}
