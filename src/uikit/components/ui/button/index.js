import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 disabled:bg-gray-300 disabled:text-gray-500',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 disabled:bg-gray-300 disabled:text-gray-500',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 disabled:text-gray-400 disabled:hover:bg-transparent',
        link: 'text-primary underline-offset-4 hover:underline disabled:text-gray-400 disabled:no-underline',
        primary:
          'bg-primary-button text-primary-button-foreground shadow-xs hover:bg-primary-button/90 disabled:bg-gray-300 disabled:text-gray-500',
        'primary-light':
          'bg-primary-button-light text-primary-button-light-foreground shadow-xs hover:bg-primary-button-light/80 disabled:bg-gray-100 disabled:text-gray-400',
        'button-link':
          'text-link-button underline-offset-4 hover:underline disabled:text-gray-400 disabled:no-underline',
        'button-link-light':
          'bg-link-button-light text-link-button-light-foreground shadow-xs hover:bg-link-button-light/80 disabled:bg-gray-100 disabled:text-gray-400',
        info: 'bg-info-button text-info-button-foreground shadow-xs hover:bg-info-button/90 disabled:bg-gray-300 disabled:text-gray-500',
        'info-light':
          'bg-info-button-light text-info-button-light-foreground shadow-xs hover:bg-info-button-light/80 disabled:bg-gray-100 disabled:text-gray-400',
        success:
          'bg-success-button text-success-button-foreground shadow-xs hover:bg-success-button/90 disabled:bg-gray-300 disabled:text-gray-500',
        'success-light':
          'bg-success-button-light text-success-button-light-foreground shadow-xs hover:bg-success-button-light/80 disabled:bg-gray-100 disabled:text-gray-400',
        warning:
          'bg-warning-button text-warning-button-foreground shadow-xs hover:bg-warning-button/90 disabled:bg-gray-300 disabled:text-gray-500',
        'warning-light':
          'bg-warning-button-light text-warning-button-light-foreground shadow-xs hover:bg-warning-button-light/80 disabled:bg-gray-100 disabled:text-gray-400',
        danger:
          'bg-danger-button text-danger-button-foreground shadow-xs hover:bg-danger-button/90 disabled:bg-gray-300 disabled:text-gray-500',
        'danger-light':
          'bg-danger-button-light text-danger-button-light-foreground shadow-xs hover:bg-danger-button-light/80 disabled:bg-gray-100 disabled:text-gray-400',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3 text-sm',
        xs: 'h-7 text-xs rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-sm',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4 text-base',
        xl: 'h-12 rounded-md px-8 has-[>svg]:px-6 text-lg',
        icon: 'size-9 text-sm',
        menu: 'h-5.5 px-2 has-[>svg]:px-2 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
