import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { set, reset } from 'mockdate'

enum EventStatus {
    ACTIVE = 'active',
    DONE = 'done',
    IN_REVIEW = 'in review'
}

class CheckLastEventStatus {
    constructor(
        private readonly loadLastEventRepository: LoadLastEventRepository
    ) {}

    public async execute({ groupId }: { groupId: string }): Promise<string> {
        const event = await this.loadLastEventRepository.loadLastEvent({ groupId })
        return event === undefined ? EventStatus.DONE : EventStatus.ACTIVE  
    }
}

interface LoadLastEventRepository {
    loadLastEvent(input: { groupId: string }): Promise<{ endDate: Date } | undefined>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
    groupId?: string
    callsCount = 0
    output?: { endDate: Date }

    async loadLastEvent({ groupId }: { groupId: string }): Promise<{ endDate: Date } | undefined> {
        this.groupId = groupId
        this.callsCount++
        return this.output
    }
}

type SutOutput = {
    SUT: CheckLastEventStatus,
    loadLastEventRepository: LoadLastEventRepositorySpy
}

const makeSut = (): SutOutput  => {
    const loadLastEventRepository = new LoadLastEventRepositorySpy()
    const SUT = new CheckLastEventStatus(loadLastEventRepository)
    return { SUT, loadLastEventRepository }
}

describe('CheckLastEventStatus', () => {
    const groupId = 'any_group_id'

    beforeAll(() => set(new Date()))
    
    afterAll(() => reset())

    it('should get last event data', async () => {
        const { loadLastEventRepository, SUT } = makeSut()
        
        await SUT.execute({ groupId })

        expect(loadLastEventRepository.groupId).toBe(groupId)
        expect(loadLastEventRepository.callsCount).toBe(1)
    })

    it('should return status DONE when group has no event', async () => {
        const { loadLastEventRepository, SUT } = makeSut()
        loadLastEventRepository.output = undefined

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.DONE)
    }),

    it('shoud return status active current date is before end date', async () => {
        const { SUT, loadLastEventRepository } = makeSut()
        loadLastEventRepository.output = {
            endDate: new Date(new Date().getTime() + 1)
        }

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.ACTIVE)
    })
})