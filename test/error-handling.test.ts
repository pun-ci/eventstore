import { eventStoreDb } from '../src'

describe('Error handling', () => {
    it('Throw error on wrong connection string', async () => {
        const store = eventStoreDb('esdb://wrong-connection')
        try {
            await store.stream('test').reduce<null>(null, {})
            fail('Exception not thrown')
        } catch (err) {
        }
    })
})
