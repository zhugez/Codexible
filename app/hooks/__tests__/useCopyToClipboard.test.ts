import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from '../useCopyToClipboard'

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset clipboard mock
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    })
  })

  it('should start with idle state', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current.state).toBe('idle')
  })

  it('should copy text successfully', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    navigator.clipboard.writeText = mockWriteText

    const { result } = renderHook(() => useCopyToClipboard())

    let success = false
    await act(async () => {
      success = await result.current.copy('test text')
    })

    expect(success).toBe(true)
    expect(result.current.state).toBe('success')
    expect(mockWriteText).toHaveBeenCalledWith('test text')
  })

  it('should handle empty text', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    let success = false
    await act(async () => {
      success = await result.current.copy('')
    })

    expect(success).toBe(false)
    expect(result.current.state).toBe('idle')
  })

  it('should handle clipboard API failure', async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard error'))
    navigator.clipboard.writeText = mockWriteText

    const { result } = renderHook(() => useCopyToClipboard())

    // Mock execCommand
    const originalExecCommand = document.execCommand
    document.execCommand = vi.fn().mockReturnValue(false)

    let success = false
    await act(async () => {
      success = await result.current.copy('test text')
    })

    expect(success).toBe(false)
    expect(result.current.state).toBe('error')

    // Restore
    document.execCommand = originalExecCommand
  })

  it('should use fallback when clipboard API fails', async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard error'))
    navigator.clipboard.writeText = mockWriteText

    const { result } = renderHook(() => useCopyToClipboard())

    // Mock successful execCommand fallback
    const originalExecCommand = document.execCommand
    document.execCommand = vi.fn().mockReturnValue(true)

    let success = false
    await act(async () => {
      success = await result.current.copy('fallback text')
    })

    expect(success).toBe(true)
    expect(result.current.state).toBe('success')

    // Restore
    document.execCommand = originalExecCommand
  })

  it('should reset state manually', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    navigator.clipboard.writeText = mockWriteText

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current.copy('test')
    })

    expect(result.current.state).toBe('success')

    act(() => {
      result.current.reset()
    })

    expect(result.current.state).toBe('idle')
  })

  it('should auto-reset after delay', async () => {
    vi.useFakeTimers()
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    navigator.clipboard.writeText = mockWriteText

    const { result } = renderHook(() => useCopyToClipboard(100))

    await act(async () => {
      await result.current.copy('test')
    })

    expect(result.current.state).toBe('success')

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.state).toBe('idle')
    vi.useRealTimers()
  })
})
