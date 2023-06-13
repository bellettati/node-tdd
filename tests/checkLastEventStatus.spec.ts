import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { set, reset } from 'mockdate'

enum EventStatus {
    ACTIVE = 'active',
    DONE = 'done',
    IN_REVIEW = 'inReview'
}

class CheckLastEventStatus {
    constructor(
        private readonly loadLastEventRepository: LoadLastEventRepository
    ) {}

    public async execute({ groupId }: { groupId: string }): Promise<EventStatus> {
        const event = await this.loadLastEventRepository.loadLastEvent({ groupId })
        const currDate = new Date()
        if(!event) {
            return EventStatus.DONE 
        }
        const isActive = currDate <= event.endDate
        return isActive ? EventStatus.ACTIVE : EventStatus.IN_REVIEW
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

    it('shoud return status ACTIVE when current date is before end date', async () => {
        const { SUT, loadLastEventRepository } = makeSut()
        loadLastEventRepository.output = {
            endDate: new Date(new Date().getTime() + 1)
        }

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.ACTIVE)
    })

    it('shoud return status ACTIVE when current date is equal to end date', async () => {
        const { SUT, loadLastEventRepository } = makeSut()
        loadLastEventRepository.output = {
            endDate: new Date()
        }

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.ACTIVE)
    })

    it('should return status IN_REVIEW when current date is after end date', async () => {
        const { SUT, loadLastEventRepository } = makeSut()
        loadLastEventRepository.output = {
            endDate: new Date(new Date().getTime() - 1)
        }

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.IN_REVIEW)
    })
})