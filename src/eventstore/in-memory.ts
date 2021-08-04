import { reduceEvents } from './reducer'
import { Event, EventStore, EventStream, StreamReducer } from './types'

class InMemoryEventStream<E extends Event> implements EventStream<E> {
    private readonly events: E[] = []

    public async addEvent(event: E): Promise<void> {
        this.events.push(event)
    }

    public async reduce<T>(initialValue: T, reducer: StreamReducer<T, E>): Promise<T> {
        return reduceEvents<E, T>(initialValue, this.events, reducer)
    }
}

class InMemoryEventStore implements EventStore {
    private readonly streams = new Map<string, InMemoryEventStream<Event>>()

    public stream<E extends Event>(name: string): EventStream<E> {
        if (!this.streams.has(name)) {
            this.streams.set(name, new InMemoryEventStream<E>())
        }
        return this.streams.get(name) as unknown as EventStream<E>
    }
}

export const inMemoryEventStore = async (): Promise<EventStore> => {
    return new InMemoryEventStore()
}
