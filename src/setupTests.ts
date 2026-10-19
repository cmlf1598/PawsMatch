import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'framer-motion'

// Finish framer-motion animations instantly so tests don't wait on swipes and transitions.
MotionGlobalConfig.skipAnimations = true

afterEach(() => {
  cleanup()
})
