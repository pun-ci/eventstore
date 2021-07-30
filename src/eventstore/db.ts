import { Event, EventStore, EventStream, InvalidEvent, StreamReducer } from './types'
import { EventStoreDBClient, jsonEvent, JSONType } from '@eventstore/db-client'
import { reduceEvents } from './reducer'

class EventStoreDbStream<E extends Event> implements EventStream<E> {
    constructor(
        private readonly dbClient: EventStoreDBClient,
        private readonly name: string
    ) { }

    public async addEvent(event: E): Promise<void> {
        await this.dbClient.appendToStream(this.name, jsonEvent({
            type: event.type,
            data: event.data as JSONType
        }))
    }

    public async reduce<T>(initialValue: T, reducer: StreamReducer<T, E>): Promise<T> {
        try {
            const events = await this.eventsFromDb()
            return reduceEvents<E, T>(initialValue, events, reducer)
        } catch (err) {
            if (err.type === 'stream-not-found') {
                return initialValue
            }
            throw err
        }
    }

    private async eventsFromDb(): Promise<E[]> {
        return (await this.dbClient.readStream(this.name)).map(event => {
            if (event.event) {
                return {
                    type: event.event.type,
                    data: event.event.data
                } as E
            }
            throw new InvalidEvent()
        })
    }
}

class EventStoreDb implements EventStore {
    constructor(
        private readonly dbClient: EventStoreDBClient
    ) { }

    public stream<E extends Event>(name: string): EventStream<E> {
        return new EventStoreDbStream<E>(this.dbClient, name)
    }
}

export const eventStoreDb = async (connection: string): Promise<EventStore> => {
    const db = EventStoreDBClient.connectionString(connection)
    try {
        await db.readStream(`non-existent-stream-${Date.now()}`)
        return new EventStoreDb(db)
    } catch (err) {
        if (err.type === 'stream-not-found') {
            return new EventStoreDb(db)
        }
        throw err
    }
}
