import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Smonta i componenti renderizzati dopo ogni test.
afterEach(() => {
  cleanup()
})
