import { describe, expect, it } from 'vitest'

enum EventStatus {
    ACTIVE = 'active',
    DONE = 'done',
    IN_REVIEW = 'in review'
}

class CheckLastEventStatus {
    constructor(
        private readonly loadLastEventRepository: LoadLastEventRepository
    ) {}

    public async execute(groupId: string): Promise<string> {
        await this.loadLastEventRepository.loadLastEvent(groupId)
        return 'done'
    }
}

interface LoadLastEventRepository {
    loadLastEvent(groupId: string): Promise<undefined>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
    groupId: string
    callsCount = 0
    output: undefined

    async loadLastEvent(groupId: string): Promise<undefined> {
        this.groupId = groupId
        this.callsCount++
        return this.output
    }
}

describe('CheckLastEventStatus', () => {
    it('should get last event data', async () => {
        const loadLastEventRepository = new LoadLastEventRepositorySpy()
        const SUT = new CheckLastEventStatus(loadLastEventRepository)
        
        await SUT.execute('any_group_id')

        expect(loadLastEventRepository.groupId).toBe('any_group_id')
        expect(loadLastEventRepository.callsCount).toBe(1)
    })

    it('should return status DONE when group has no event', async () => {
        const loadLastEventRepository = new LoadLastEventRepositorySpy()
        loadLastEventRepository.output = undefined
        const SUT = new CheckLastEventStatus(loadLastEventRepository)

        const status = await SUT.execute('any_group_id')

        expect(status).toBe(EventStatus.DONE)
    })
})