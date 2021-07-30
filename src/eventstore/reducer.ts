import { Event, StreamReducer } from './types'

export const reduceEvents =
    <E extends Event, T>(
        initialValue: T,
        events: E[],
        reducer: StreamReducer<T, E>
    ): T => {
        let result = initialValue
        for (const event of events) {
            result = reducer[event.type as E['type']](result, event.data as unknown as never)
        }
        return result
    }
