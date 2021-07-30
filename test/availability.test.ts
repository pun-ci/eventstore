import { eventStoreDb } from '../src'

describe.only('Availability', () => {
    it('Throw error if DB is not available', async () => {
        await expect(eventStoreDb('esdb://wrong-connection')).rejects.toThrowError()
    })
})
