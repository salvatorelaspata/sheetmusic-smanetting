import { create } from 'zustand'
import { makeId } from '../../core/ids'

export type ToastTone = 'info' | 'success' | 'error'

export interface ToastItem {
  id: string
  tone: ToastTone
  message: string
}

interface ToastState {
  toasts: ToastItem[]
  push: (tone: ToastTone, message: string) => void
  dismiss: (id: string) => void
}

const TIMEOUT_MS = 3500

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (tone, message) => {
    const id = makeId('toast')
    set((s) => ({ toasts: [...s.toasts, { id, tone, message }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, TIMEOUT_MS)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** API comoda: toast.success('...'), toast.error('...'), toast.info('...'). */
export const toast = {
  info: (message: string) => useToastStore.getState().push('info', message),
  success: (message: string) => useToastStore.getState().push('success', message),
  error: (message: string) => useToastStore.getState().push('error', message),
}
