import { Event, EventStore, EventStream } from './types'

class InMemoryEventStream<E extends Event> implements EventStream<E> {
    private readonly events: E[] = []

    public async addEvent(event: E): Promise<void> {
        this.events.push(event)
    }

    public async reduce<T>(initialValue: T, reducer: (current: T, event: E) => T): Promise<T> {
        let result: T = initialValue
        for (const event of this.events) {
            result = reducer(result, event)
        }
        return result
    }
}

class InMemoryEventStore implements EventStore {
    private readonly streams: Map<string, InMemoryEventStream<Event>> = new Map()

    public stream<E extends Event>(name: string): EventStream<E> {
        if (!this.streams.has(name)) {
            this.streams.set(name, new InMemoryEventStream<E>())
        }
        return this.streams.get(name) as unknown as EventStream<E>
    }

    // public async waitUntilAvailable(
    //     { timeoutInMillisecs = 5000 }: { timeoutInMillisecs?: number }
    // ): Promise<EventStore> {
    //     return this
    // }
}

export const inMemoryEventStore = (): EventStore => {
    return new InMemoryEventStore()
}
