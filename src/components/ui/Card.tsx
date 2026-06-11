import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: ReactNode
  action?: ReactNode
}

export function Card({ children, className, title, action }: CardProps) {
  return (
    <div className={`rounded-xl border border-border bg-surface ${className ?? ''}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          {title && (
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
          )}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
