import { Event, StreamReducer } from './types'

export const reduceEvents =
    <E extends Event, T>(
        initialValue: T,
        events: E[],
        reducer: StreamReducer<T, E>
    ): T => {
        let current = initialValue
        for (const event of events) {
            current = reducer[event.type as E['type']](event.data as unknown as never, current)
        }
        return current
    }
