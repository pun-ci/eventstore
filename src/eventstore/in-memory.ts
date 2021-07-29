import { Event, EventStore, EventStream, StreamReducer } from './types'

class InMemoryEventStream<E extends Event> implements EventStream<E> {
    private readonly events: E[] = []

    public async addEvent(event: E): Promise<void> {
        this.events.push(event)
    }

    public async reduce<T>(initialValue: T, reducer: StreamReducer<T, E>): Promise<T> {
        let result = initialValue
        for (const event of this.events) {
            result = reducer[event.type as E['type']](result, event.data as unknown as never)
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
