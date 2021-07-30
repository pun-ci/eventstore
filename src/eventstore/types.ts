export interface Event<
    Type extends string = string,
    Data extends Record<string, unknown> = Record<string, unknown>
> {
    type: Type
    data: Data
}

export interface EventStream<E extends Event> {
    addEvent: (event: E) => Promise<void>
    reduce: <T>(initialValue: T, reducer: StreamReducer<T, E>) => Promise<T>

}

export interface EventStore {
    stream: <E extends Event>(name: string) => EventStream<E>
}

export type StreamReducer<T, E extends Event> = {
    [event in E as event['type']]: (eventData: event['data'], current: T) => T
}

export class InvalidEvent extends Error { }
