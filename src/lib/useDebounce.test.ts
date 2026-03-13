import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('hello', 500))
        expect(result.current).toBe('hello')
    })

    it('should not update value before delay', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        )

        expect(result.current).toBe('initial')

        rerender({ value: 'updated', delay: 500 })

        // Before delay passes, should still be initial
        expect(result.current).toBe('initial')
    })

    it('should update value after delay passes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        )

        rerender({ value: 'updated', delay: 500 })

        // Advance timers by delay
        act(() => {
            vi.advanceTimersByTime(500)
        })

        expect(result.current).toBe('updated')
    })

    it('should reset timer on rapid changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'a', delay: 500 } }
        )

        rerender({ value: 'b', delay: 500 })
        act(() => {
            vi.advanceTimersByTime(200)
        })

        rerender({ value: 'c', delay: 500 })
        act(() => {
            vi.advanceTimersByTime(200)
        })

        // Still 'a' because timer keeps resetting
        expect(result.current).toBe('a')

        // After full delay
        act(() => {
            vi.advanceTimersByTime(500)
        })

        expect(result.current).toBe('c')
    })

    it('should use default delay of 300ms', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            { initialProps: { value: 'initial' } }
        )

        rerender({ value: 'updated' })

        act(() => {
            vi.advanceTimersByTime(299)
        })

        expect(result.current).toBe('initial')

        act(() => {
            vi.advanceTimersByTime(1)
        })

        expect(result.current).toBe('updated')
    })
})