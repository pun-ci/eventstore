import { Event, InvalidEvent, InMemoryEventStore, eventStoreDb } from '../src'

type AddEvent = Event<'add', { addend: number }>
type SubstractEvent = Event<'substract', { subtrahend: number }>
type MultiplyEvent = Event<'multiply', { multiplicant: number }>
type OperatorEvent = AddEvent | SubstractEvent | MultiplyEvent

const testProvider = [
    {
        createEventStore: () => new InMemoryEventStore(),
        description: 'In-memory Event Store streams'
    },
    {
        createEventStore: () => eventStoreDb(
            'esdb://admin:changeit@localhost:2113?tls=false&tlsVerifyCert=false'
        ),
        description: 'Event Store DB streams'
    }
]

testProvider.forEach(testData => {
    describe(testData.description, () => {

        it('Iterate through multiple streams', async () => {
            const store = testData.createEventStore()
            const eventStreams: Array<{
                name: string
                events: OperatorEvent[]
                expectedResult: number
            }> = [
                {
                    name: `stream-1-${Date.now()}`,
                    events:
                            [
                                { type: 'add', data: { addend: 2 } },
                                { type: 'multiply', data: { multiplicant: 5 } },
                                { type: 'add', data: { addend: 3 } },
                                { type: 'substract', data: { subtrahend: 4 } }
                            ],
                    expectedResult: 9
                },
                {
                    name: `stream-2-${Date.now()}`,
                    events:
                            [
                                { type: 'add', data: { addend: 1 } },
                                { type: 'multiply', data: { multiplicant: 0 } },
                                { type: 'substract', data: { subtrahend: 2 } }
                            ],
                    expectedResult: -2
                },
                {
                    name: `stream-3-${Date.now()}`,
                    events:
                            [
                                { type: 'add', data: { addend: 2 } },
                                { type: 'multiply', data: { multiplicant: 2 } },
                                { type: 'multiply', data: { multiplicant: 2 } },
                                { type: 'multiply', data: { multiplicant: 2 } },
                                { type: 'multiply', data: { multiplicant: 2 } }
                            ],
                    expectedResult: 32
                },
                {
                    name: `stream-4-${Date.now()}`,
                    events: [],
                    expectedResult: 0
                }
            ]
            await Promise.all(eventStreams.map(async stream => {
                for (const event of stream.events) {
                    await store.stream<OperatorEvent>(stream.name).addEvent(event)
                }
            }))
            for (const stream of eventStreams) {
                const result = await store.stream<OperatorEvent>(stream.name).reduce<number>(
                    0, (current: number, event: OperatorEvent) => {
                        if (event.type === 'add') {
                            return current + event.data.addend
                        }
                        if (event.type === 'substract') {
                            return current - event.data.subtrahend
                        }
                        if (event.type === 'multiply') {
                            return current * event.data.multiplicant
                        }
                        throw new InvalidEvent()
                    }
                )
                expect(result).toBe(stream.expectedResult)
            }
        })

    })
})

describe('Event Store DB', () => {

    it('Throw error on wrong connection string', async () => {
        const store = eventStoreDb('esdb://wrong-connection')
        try {
            await store.stream('test').reduce<null>(null, param => param)
            fail('Exception not thrown')
        } catch (err) {
        }
    })

})
