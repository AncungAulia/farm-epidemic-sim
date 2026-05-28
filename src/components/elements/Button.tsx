'use client'

import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const base = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-(family-name:--font-inter)'

const variants: Record<Variant, string> = {
  primary: 'bg-(--accent) text-(--bg) hover:opacity-85',
  outline: 'bg-transparent text-(--muted) border border-(--border) hover:border-(--accent) hover:text-(--text)',
  ghost:   'bg-transparent text-(--muted) hover:text-(--text)',
}

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
