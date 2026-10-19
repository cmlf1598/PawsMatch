import { StrictMode } from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { usePetDeck } from './usePetDeck'
import { useMatchStore } from '../stores/matchStore'
import * as petService from '../services/petService'

describe('usePetDeck', () => {
  beforeEach(() => {
    useMatchStore.setState({ liked: [], passed: [] })
    vi.restoreAllMocks()
  })

  it('loads the pets and shows the first one', async () => {
    const { result } = renderHook(() => usePetDeck())
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.currentPet?.id).toBe(1)
    expect(result.current.remainingCount).toBe(50)
  })

  it('loads the pets only once under StrictMode', async () => {
    const getPets = vi.spyOn(petService, 'getPets')

    const { result } = renderHook(() => usePetDeck(), { wrapper: StrictMode })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(getPets).toHaveBeenCalledOnce()
    expect(result.current.currentPet?.id).toBe(1)
  })

  it('records a like or pass and moves to the next pet', async () => {
    const { result } = renderHook(() => usePetDeck())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.like())
    expect(useMatchStore.getState().liked).toEqual([1])
    expect(result.current.currentPet?.id).toBe(2)

    act(() => result.current.pass())
    expect(useMatchStore.getState().passed).toEqual([2])
    expect(result.current.currentPet?.id).toBe(3)
    expect(result.current.remainingCount).toBe(48)
  })

  it('returns no current pet once every pet has been decided', async () => {
    const allIds = (await petService.getPets()).map((pet) => pet.id)
    useMatchStore.setState({ liked: allIds })

    const { result } = renderHook(() => usePetDeck())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.currentPet).toBeNull()
    expect(result.current.remainingCount).toBe(0)
  })

  it('exposes an error when the pets fail to load', async () => {
    vi.spyOn(petService, 'getPets').mockRejectedValue(new Error('Network down'))

    const { result } = renderHook(() => usePetDeck())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error?.message).toBe('Network down')
    expect(result.current.currentPet).toBeNull()
  })
})
