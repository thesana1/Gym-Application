import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const buttonBaseClassName = cn(
  'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full text-base font-bold',
  'whitespace-nowrap outline-none transition-[transform,background-color,color,box-shadow] duration-150 ease-out',
  'active:scale-97 disabled:pointer-events-none disabled:opacity-50',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
)

const buttonVariants = cva(
  buttonBaseClassName,
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm shadow-primary-ink/25 hover:bg-primary/85 active:shadow-none',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        outline:
          'border-2 border-foreground/15 bg-card hover:border-foreground/30 hover:bg-accent dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary-ink underline decoration-2 underline-offset-4 hover:decoration-primary',
      },
      size: {
        default: 'h-12 px-5 py-2',
        xs: 'h-11 gap-1 px-3',
        sm: 'h-11 gap-1.5 px-4',
        lg: 'h-14 px-7 text-lg',
        icon: 'size-11',
        'icon-xs': 'size-11',
        'icon-sm': 'size-11',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
