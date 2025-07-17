import { cva } from 'class-variance-authority'

export { default as Switch } from './Switch.vue'

export const switchVariants = cva(
  'peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[state=checked]:bg-ring data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        primary:
          'data-[state=checked]:bg-primary-button data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        info: 'data-[state=checked]:bg-info-button data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        success:
          'data-[state=checked]:bg-success-button data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        warning:
          'data-[state=checked]:bg-warning-button data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        danger:
          'data-[state=checked]:bg-danger-button data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
      },
      size: {
        sm: 'h-[1rem] w-6',
        default: 'h-[1.15rem] w-8',
        lg: 'h-[1.5rem] w-12',
        xl: 'h-[1.75rem] w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
