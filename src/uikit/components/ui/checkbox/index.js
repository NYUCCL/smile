import { cva } from 'class-variance-authority'

export { default as Checkbox } from './Checkbox.vue'

export const checkboxVariants = cva(
  'peer border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary',
        primary:
          'data-[state=checked]:bg-primary-button data-[state=checked]:text-primary-button-foreground data-[state=checked]:border-primary-button',
        info: 'data-[state=checked]:bg-info-button data-[state=checked]:text-info-button-foreground data-[state=checked]:border-info-button',
        success:
          'data-[state=checked]:bg-success-button data-[state=checked]:text-success-button-foreground data-[state=checked]:border-success-button',
        warning:
          'data-[state=checked]:bg-warning-button data-[state=checked]:text-warning-button-foreground data-[state=checked]:border-warning-button',
        danger:
          'data-[state=checked]:bg-danger-button data-[state=checked]:text-danger-button-foreground data-[state=checked]:border-danger-button',
      },
      size: {
        xs: 'size-3',
        sm: 'size-3.5',
        default: 'size-4',
        lg: 'size-5',
        xl: 'size-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
