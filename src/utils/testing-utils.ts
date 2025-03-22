import { waitFor, waitForElement, waitForElementToBeRemoved, waitForSomethingToChange } from './testing-utils'

describe('testing-utils', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('waitFor', () => {
        it('resolves when the callback returns a truthy value', async () => {
            const callback = jest.fn()
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true)

            const promise = waitFor(callback)
            
            // Fast-forward until all timers have been executed
            jest.runAllTimers()
            
            await expect(promise).resolves.toBeUndefined()
            expect(callback).toHaveBeenCalledTimes(3)
        })

        it('rejects when the callback never returns a truthy value within timeout', async () => {
            const callback = jest.fn().mockReturnValue(false)
            
            const promise = waitFor(callback, { timeout: 1000 })
            
            // Fast-forward until all timers have been executed
            jest.advanceTimersByTime(1000)
            
            await expect(promise).rejects.toThrow('Timed out')
            expect(callback).toHaveBeenCalled()
        })

        it('uses custom error message when provided', async () => {
            const callback = jest.fn().mockReturnValue(false)
            const errorMessage = 'Custom error message'
            
            const promise = waitFor(callback, { timeout: 1000, errorMessage })
            
            jest.advanceTimersByTime(1000)
            
            await expect(promise).rejects.toThrow(errorMessage)
        })

        it('respects the interval option', async () => {
            const callback = jest.fn()
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true)
            
            const promise = waitFor(callback, { interval: 500 })
            
            // Should not have resolved after 400ms (less than one interval)
            jest.advanceTimersByTime(400)
            expect(callback).toHaveBeenCalledTimes(1)
            
            // Should have called the callback again after another 100ms
            jest.advanceTimersByTime(100)
            expect(callback).toHaveBeenCalledTimes(2)
            
            // Should resolve after another 500ms when callback returns true
            jest.advanceTimersByTime(500)
            
            await expect(promise).resolves.toBeUndefined()
            expect(callback).toHaveBeenCalledTimes(3)
        })
    })

    describe('waitForElement', () => {
        it('resolves when the element is found', async () => {
            const element = document.createElement('div')
            element.id = 'test-element'
            
            // Element not in DOM initially
            const getElement = jest.fn()
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(element)
            
            const promise = waitForElement(getElement)
            
            jest.runAllTimers()
            
            await expect(promise).resolves.toBe(element)
            expect(getElement).toHaveBeenCalledTimes(3)
        })

        it('rejects when the element is not found within timeout', async () => {
            const getElement = jest.fn().mockReturnValue(null)
            
            const promise = waitForElement(getElement, { timeout: 1000 })
            
            jest.advanceTimersByTime(1000)
            
            await expect(promise).rejects.toThrow('Timed out waiting for element')
            expect(getElement).toHaveBeenCalled()
        })

        it('uses custom error message when provided', async () => {
            const getElement = jest.fn().mockReturnValue(null)
            const errorMessage = 'Custom element error'
            
            const promise = waitForElement(getElement, { timeout: 1000, errorMessage })
            
            jest.advanceTimersByTime(1000)
            
            await expect(promise).rejects.toThrow(errorMessage)
        })
    })

    describe('waitForElementToBeRemoved', () => {
        it('resolves when the element is removed', async () => {
            const element = document.createElement('div')
            
            // Element exists initially, then is removed
            const getElement = jest.fn()
                .mockReturnValueOnce(element)
                .mockReturnValueOnce(element)
                .mockReturnValueOnce(null)
            
            const promise = waitForElementToBeRemoved(getElement)
            
            jest.runAllTimers()
            
            await expect(promise).resolves.toBeUndefined()
            expect(getElement).toHaveBeenCalledTimes(3)
        })

        it('rejects when the element is not removed within timeout', async () => {
            const element = document.createElement('div')
            const getElement = jest.fn().mockReturnValue(element)
            
            const promise = waitForElementToBeRemoved(getElement, { timeout: 1000 })
            
            jest.advanceTimersByTime(1000)
            
            await expect(promise).rejects.toThrow('Timed out waiting for element to be removed')
            expect(getElement).toHaveBeenCalled()
        })

        it('uses custom error message when provided', async () => {
            const element = document.createElement('div')
            const getElement = jest.fn().mockReturnValue(element)
            const errorMessage = 'Custom removal error'
            
            const promise = waitForElementToBeRemoved(getElement, { timeout: 1000, errorMessage })
            
            jest.advanceTimersByTime(1000)
            
            await expect(promise).rejects.toThrow(errorMessage)
        })

        it('resolves immediately if element is already null', async () => {
            const getElement = jest.fn().mockReturnValue(null)
            
            const promise = waitForElementToBeRemoved(getElement)
            
            await expect(promise).resolves.toBeUndefined()
            expect(getElement).toHaveBeenCalledTimes(1)
        })
    })

    describe('waitForSomethingToChange', () => {
        it('resolves when the value changes', async () => {
            let value = 'initial'
            const getValue = jest.fn().mockImplementation(() => value)
            
            // Start the wait
            const promise = waitForSomethingToChange(getValue)
            
            // First check happens immediately
            expect(getValue).toHaveBeenCalledTimes(1)
            
            // Change the value after some time
            setTimeout(() => {
                value = 'changed'
            }, 500)
            
            jest.advanceTimersByTime(500)
            
            // Wait for the next check interval
            jest.advanceTimersByTime(100)
            
            await expect(promise).resolves.toBe('changed')
        })

        it('rejects when the value does not change within timeout', async () => {
            const getValue = jest.fn().mockReturnValue('constant')
            
            const promise = waitForSomethingToChange(getValue, { timeout: 1000 })
            
            jest.advanceTimersByTime(1000)
            
            await expect(promise).rejects.toThrow('Timed out waiting for value to change')
            expect(getValue).toHaveBeenCalled()
        })

        it('uses custom error message when provided', async () => {
            const getValue = jest.fn().mockReturnValue('constant')
            const errorMessage = 'Custom change error'
            
            const promise = waitForSomethingToChange(getValue, { timeout: 1000, errorMessage })
            
            jest.advanceTimersByTime(1000)
            
            await expect(promise).rejects.toThrow(errorMessage)
        })

        it('respects the interval option', async () => {
            let value = 'initial'
            const getValue = jest.fn().mockImplementation(() => value)
            
            const promise = waitForSomethingToChange(getValue, { interval: 500 })
            
            // First check happens immediately
            expect(getValue).toHaveBeenCalledTimes(1)
            
            // No change after 400ms (less than one interval)
            jest.advanceTimersByTime(400)
            expect(getValue).toHaveBeenCalledTimes(1)
            
            // Change the value
            value = 'changed'
            
            // After another 100ms, the second check should happen
            jest.advanceTimersByTime(100)
            
            await expect(promise).resolves.toBe('changed')
            expect(getValue).toHaveBeenCalledTimes(2)
        })
    })
})
