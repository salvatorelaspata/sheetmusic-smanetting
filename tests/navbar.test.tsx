import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NavBar } from '../src/components/layout/NavBar'
import '../src/i18n'

describe('NavBar', () => {
  it('mostra le voci di navigazione in italiano', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )
    expect(screen.getByText('Teoria')).toBeInTheDocument()
    expect(screen.getByText('Pratica')).toBeInTheDocument()
    expect(screen.getByText('Componi')).toBeInTheDocument()
  })
})
