import { Event, inMemoryEventStore, eventStoreDb } from '../src'
import { StreamReducer } from '../src/eventstore/types'

type AddEvent = Event<'add', { addend: number }>
type SubstractEvent = Event<'substract', { subtrahend: number }>
type MultiplyEvent = Event<'multiply', { multiplicant: number }>

type OperatorEvent = AddEvent | SubstractEvent | MultiplyEvent

type CalculatorReducer = StreamReducer<number, OperatorEvent>

const operatorReducer: CalculatorReducer = {
    add: (eventData, current) => current + eventData.addend,
    substract: (eventData, current) => current - eventData.subtrahend,
    multiply: (eventData, current) => current * eventData.multiplicant
}

const TEST_DB_URL = 'esdb://admin:changeit@localhost:2113?tls=false&tlsVerifyCert=false'

const testProvider = [
    {
        createEventStore: async () => (await inMemoryEventStore()),
        description: 'In-memory Event Store streams'
    },
    {
        createEventStore: async () => (await eventStoreDb(TEST_DB_URL)),
        description: 'Event Store DB streams'
    }
]

testProvider.forEach(testData => {
    describe(testData.description, () => {
        it('Iterate through multiple streams', async () => {
            const store = await testData.createEventStore()
            const eventStreams: Array<{
                name: string
                events: OperatorEvent[]
                expectedResult: number
            }> = [
                {
                    name: `stream-1-${Date.now()}`,
                    events: [
                        { type: 'add', data: { addend: 2 } },
                        { type: 'multiply', data: { multiplicant: 5 } },
                        { type: 'add', data: { addend: 3 } },
                        { type: 'substract', data: { subtrahend: 4 } }
                    ],
                    expectedResult: 9
                },
                {
                    name: `stream-2-${Date.now()}`,
                    events: [
                        { type: 'add', data: { addend: 1 } },
                        { type: 'multiply', data: { multiplicant: 0 } },
                        { type: 'substract', data: { subtrahend: 2 } }
                    ],
                    expectedResult: -2
                },
                {
                    name: `stream-3-${Date.now()}`,
                    events: [
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
                const result = await store.stream<OperatorEvent>(stream.name)
                    .reduce<number>(0, operatorReducer)
                expect(result).toBe(stream.expectedResult)
            }
        })
    })
})
