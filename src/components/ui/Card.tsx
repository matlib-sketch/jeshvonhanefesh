import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export const Card = ({ elevated = false, className = '', children, ...props }: CardProps) => (
  <div
    className={[
      'rounded-xl bg-white dark:bg-sepia-900 border border-sepia-200 dark:border-sepia-700',
      elevated ? 'shadow-md' : 'shadow-sm',
      'p-4',
      className,
    ].join(' ')}
    {...props}
  >
    {children}
  </div>
)
