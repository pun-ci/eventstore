import { Event, EventStore, EventStream, InvalidEvent } from './types'
import { EventStoreDBClient, jsonEvent, JSONType } from '@eventstore/db-client'

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

    public async reduce<T>(initialValue: T, reducer: (current: T, event: E) => T): Promise<T> {
        try {
            let result: T = initialValue
            for (const event of await this.eventsFromDb()) {
                result = reducer(result, event)
            }
            return result
        } catch (err) {
            if (err.type === 'stream-not-found') {
                return initialValue
            }
            throw err
        }
    }

    private async eventsFromDb(): Promise<E[]> {
        return (await this.dbClient.readStream(this.name))
            .map(event => {
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

export const eventStoreDb = (connection: string): EventStore => {
    return new EventStoreDb(
        EventStoreDBClient.connectionString(connection)
    )
}
