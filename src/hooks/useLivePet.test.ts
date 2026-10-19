import { StrictMode } from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useLivePet, BUFFER_SIZE } from './useLivePet'
import { useMatchStore } from '../stores/matchStore'
import * as petProvider from '../services/petProvider'

describe('useLivePet (Pre-fetch Stack)', () => {
  beforeEach(() => {
    useMatchStore.setState({ liked: [], passed: [] })
    vi.restoreAllMocks()
  })

  it('pre-fetches a buffer of pets and exposes active and next pets', async () => {
    vi.spyOn(petProvider, 'getPetWithLiveImage').mockImplementation(async (id = 1) => ({
      id,
      name: `Pet ${id}`,
      breed: 'mix',
      bio: ['Bio 1', 'Bio 2', 'Bio 3'],
      image: `https://images.dog.ceo/breeds/dog${id}.jpg`,
    }))

    const { result } = renderHook(() => useLivePet(1))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.stack).toHaveLength(BUFFER_SIZE)
    expect(result.current.pet?.name).toBe('Pet 1')
    expect(result.current.nextPet?.name).toBe('Pet 2')
    expect(result.current.bufferedCount).toBe(BUFFER_SIZE)
  })

  it('fetches the initial buffer only once under StrictMode', async () => {
    const getPet = vi.spyOn(petProvider, 'getPetWithLiveImage').mockImplementation(async (id = 1) => ({
      id,
      name: `Pet ${id}`,
      breed: 'mix',
      bio: ['Bio 1', 'Bio 2', 'Bio 3'],
      image: `https://images.dog.ceo/breeds/dog${id}.jpg`,
    }))

    const { result } = renderHook(() => useLivePet(1), { wrapper: StrictMode })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(getPet).toHaveBeenCalledTimes(BUFFER_SIZE)
    expect(result.current.stack.map((p) => p.id)).toEqual([1, 2, 3])
  })

  it('does not re-run the initial load when a pet is liked', async () => {
    const getPet = vi.spyOn(petProvider, 'getPetWithLiveImage').mockImplementation(async (id = 1) => ({
      id,
      name: `Pet ${id}`,
      breed: 'mix',
      bio: ['Bio 1', 'Bio 2', 'Bio 3'],
      image: `https://images.dog.ceo/breeds/dog${id}.jpg`,
    }))

    const { result } = renderHook(() => useLivePet(1))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.like()
    })
    await waitFor(() => expect(result.current.bufferedCount).toBe(BUFFER_SIZE))

    // Only the single replenishment fetch, not a fresh batch of BUFFER_SIZE.
    expect(getPet).toHaveBeenCalledTimes(BUFFER_SIZE + 1)
    expect(result.current.stack.map((p) => p.id)).toEqual([2, 3, 4])
  })

  it('clears the error and loads again on reload', async () => {
    vi.spyOn(petProvider, 'getPetWithLiveImage')
      .mockImplementation(async (id = 1) => ({
        id,
        name: `Pet ${id}`,
        breed: 'mix',
        bio: ['Bio 1', 'Bio 2', 'Bio 3'],
        image: `https://images.dog.ceo/breeds/dog${id}.jpg`,
      }))
      .mockRejectedValueOnce(new Error('Network failure'))

    const { result } = renderHook(() => useLivePet(1))
    await waitFor(() => expect(result.current.error?.message).toBe('Network failure'))

    act(() => {
      result.current.reload()
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.pet?.id).toBe(1)
  })

  it('transitions immediately when liking and replenishes buffer in background', async () => {
    vi.spyOn(petProvider, 'getPetWithLiveImage').mockImplementation(async (id = 1) => ({
      id,
      name: `Pet ${id}`,
      breed: 'mix',
      bio: ['Bio 1', 'Bio 2', 'Bio 3'],
      image: `https://images.dog.ceo/breeds/dog${id}.jpg`,
    }))

    const { result } = renderHook(() => useLivePet(1))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.pet?.id).toBe(1)
    expect(result.current.nextPet?.id).toBe(2)

    // Synchronous pop of top card
    act(() => {
      result.current.like()
    })

    expect(useMatchStore.getState().liked).toEqual([1])
    expect(result.current.pet?.id).toBe(2)

    // Background replenishment refills the buffer to BUFFER_SIZE
    await waitFor(() => {
      expect(result.current.bufferedCount).toBe(BUFFER_SIZE)
    })
  })

  it('transitions immediately when passing and replenishes buffer in background', async () => {
    vi.spyOn(petProvider, 'getPetWithLiveImage').mockImplementation(async (id = 1) => ({
      id,
      name: `Pet ${id}`,
      breed: 'mix',
      bio: ['Bio 1', 'Bio 2', 'Bio 3'],
      image: `https://images.dog.ceo/breeds/dog${id}.jpg`,
    }))

    const { result } = renderHook(() => useLivePet(1))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.pass()
    })

    expect(useMatchStore.getState().passed).toEqual([1])
    expect(result.current.pet?.id).toBe(2)

    await waitFor(() => {
      expect(result.current.bufferedCount).toBe(BUFFER_SIZE)
    })
  })
})
