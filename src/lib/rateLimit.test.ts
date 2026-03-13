import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { checkRateLimit } from './rateLimit'

describe('Rate Limiter', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should allow first request', () => {
        const result = checkRateLimit(`test-unique-${Date.now()}-1`, 5, 60000)
        expect(result.allowed).toBe(true)
        expect(result.remainingAttempts).toBe(4)
    })

    it('should track multiple attempts for same IP', () => {
        const ip = `test-unique-${Date.now()}-2`

        // First call
        checkRateLimit(ip, 5, 60000)
        // Second call
        checkRateLimit(ip, 5, 60000)
        // Third call
        const result = checkRateLimit(ip, 5, 60000)

        expect(result.allowed).toBe(true)
        expect(result.remainingAttempts).toBe(2)
    })

    it('should block after max attempts', () => {
        const ip = `test-unique-${Date.now()}-3`

        // First 3 attempts allowed, 4th should be blocked
        checkRateLimit(ip, 3, 60000) // remaining: 2
        checkRateLimit(ip, 3, 60000) // remaining: 1
        checkRateLimit(ip, 3, 60000) // remaining: 0, count becomes 3
        const result = checkRateLimit(ip, 3, 60000) // count >= 3, should block

        expect(result.allowed).toBe(false)
        expect(result.remainingAttempts).toBe(0)
    })

    it('should reset after window expires', () => {
        const ip = `test-unique-${Date.now()}-4`

        checkRateLimit(ip, 2, 5000)
        checkRateLimit(ip, 2, 5000)

        // Advance timers past window
        vi.advanceTimersByTime(6000)

        const result = checkRateLimit(ip, 2, 5000)
        expect(result.allowed).toBe(true)
    })

    it('should track different identifiers separately', () => {
        const result1 = checkRateLimit(`ip-a-${Date.now()}`, 2, 60000)
        const result2 = checkRateLimit(`ip-b-${Date.now()}`, 2, 60000)

        expect(result1.remainingAttempts).toBe(1)
        expect(result2.remainingAttempts).toBe(1)
    })
})