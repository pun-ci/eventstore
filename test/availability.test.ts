import { eventStoreDb } from '../src'

describe.only('Availability', () => {
    it('Waiting for DB to be available', async () => {
        const store = eventStoreDb('esdb://wrong-connection')
        try {
            await store.stream('test').reduce(null, {})
            fail('Exception not thrown')
        } catch (err) {
        }
    })
})
