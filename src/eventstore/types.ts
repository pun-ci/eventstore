export interface Event<
    Type extends string = string,
    Data extends Record<string, unknown> = Record<string, unknown>
> {
    type: Type
    data: Data
}

export interface EventStream<E extends Event> {

    addEvent: (event: E) => Promise<void>

    reduce: <T>(initialValue: T, reducer: (current: T, event: E) => T) => Promise<T>

}

export interface EventStore {

    stream: <E extends Event>(name: string) => EventStream<E>

    // waitUntilAvailable: (
    //     { timeoutInMillisecs }: { timeoutInMillisecs?: number }
    // ) => Promise<EventStore>

}

export class InvalidEvent extends Error { }
