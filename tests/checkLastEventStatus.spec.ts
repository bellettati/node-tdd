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
        
        if(!event) { return EventStatus.DONE }
        
        const isActive = currDate <= event.endDate
        if(isActive) { return EventStatus.ACTIVE }
        
        const reviewDurationInMs = event.reviewDurationInHours * 1000 * 60 * 60
        const reviewDate = new Date(event.endDate.getTime() + reviewDurationInMs)
        return reviewDate >= currDate ? EventStatus.IN_REVIEW : EventStatus.DONE  
    }
}

type LoadLastEventOutput = {
    endDate: Date,
    reviewDurationInHours: number
}
interface LoadLastEventRepository {
    loadLastEvent(input: { groupId: string }): Promise<LoadLastEventOutput | undefined>
}

class LoadLastEventRepositorySpy implements LoadLastEventRepository {
    groupId?: string
    callsCount = 0
    output?: LoadLastEventOutput
    private currDateInMs = new Date().getTime()

    async loadLastEvent({ groupId }: { groupId: string }): Promise<LoadLastEventOutput | undefined> {
        this.groupId = groupId
        this.callsCount++
        return this.output
    }

    setEndDateAfterCurrDate(): void {
        this.output = {
            endDate: new Date(this.currDateInMs + 1),
            reviewDurationInHours: 1
        }
    }

    setEndDateToCurrDate(): void {
        this.output = {
            endDate: new Date(),
            reviewDurationInHours: 1
        }
    }

    setEndDateBeforeCurrDate(): void {
        this.output = {
            endDate: new Date(this.currDateInMs - 1),
            reviewDurationInHours: 1
        }
    }

    setCurrDateBeforeReviewEndDate(): void {
        const reviewDurationInHours = 1
        const reviewDurationInMs = reviewDurationInHours * 1000 * 60 * 60

        this.output = {
            endDate: new Date(this.currDateInMs - reviewDurationInMs + 1),
            reviewDurationInHours
        }
    }

    setCurrDateToReviewDate(): void {
        const reviewDurationInHours = 1
        const reviewDurationInMs = reviewDurationInHours * 1000 * 60 * 60

        this.output = {
            endDate: new Date(this.currDateInMs - reviewDurationInMs),
            reviewDurationInHours
        }
    }

    setCurrDateAfterReviewEndDate(): void {
        const reviewDurationInHours = 1
        const reviewDurationInMs = reviewDurationInHours * 1000 * 60 * 60

        this.output = {
            endDate: new Date(this.currDateInMs - reviewDurationInMs - 1),
            reviewDurationInHours
        }
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
        loadLastEventRepository.setEndDateAfterCurrDate()

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.ACTIVE)
    })

    it('shoud return status ACTIVE when current date is equal to end date', async () => {
        const { SUT, loadLastEventRepository } = makeSut()
        loadLastEventRepository.setEndDateToCurrDate()

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.ACTIVE)
    })

    it('should return status IN_REVIEW when current date is after end date', async () => {
        const { SUT, loadLastEventRepository } = makeSut()
        loadLastEventRepository.setEndDateBeforeCurrDate()

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.IN_REVIEW)
    })

    it('should return status IN_REVIEW when current date is before end of review date', async () => {
        const { SUT, loadLastEventRepository } = makeSut()
        loadLastEventRepository.setCurrDateBeforeReviewEndDate()

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.IN_REVIEW)
    })

    it('should return status IN_REVIEW when current date is equal to end of review date', async () => {
        const { SUT, loadLastEventRepository } = makeSut()
        loadLastEventRepository.setCurrDateToReviewDate()

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.IN_REVIEW)
    })
    
    it('should return status DONE when current date is after end of review date', async () => {
        const { SUT, loadLastEventRepository } = makeSut()
        loadLastEventRepository.setCurrDateAfterReviewEndDate()

        const status = await SUT.execute({ groupId })

        expect(status).toBe(EventStatus.DONE)
    })
})