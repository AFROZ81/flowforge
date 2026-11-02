import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Solid brand action — one per view, never two side by side */
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active",

        /* The quiet companion to a primary — outlined, sits on white */
        outline:
          "border-border bg-card text-foreground hover:border-border-strong hover:bg-surface-muted hover:text-foreground aria-expanded:border-border-strong aria-expanded:bg-surface-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-surface-sunken aria-expanded:bg-surface-sunken aria-expanded:text-secondary-foreground",

        ghost:
          "text-muted-foreground hover:bg-surface-muted hover:text-foreground aria-expanded:bg-surface-muted aria-expanded:text-foreground dark:hover:bg-muted/50",

        destructive:
          "border-danger/25 bg-danger-subtle text-danger-foreground hover:border-danger/40 hover:bg-danger/15 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",

        success:
          "border-success/25 bg-success-subtle text-success-foreground hover:border-success/45 hover:bg-success/15 focus-visible:border-success/40",

        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-7 gap-1 rounded-md px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-lg px-2.5 text-[13px] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-10 gap-2 rounded-lg px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        icon: "size-9",
        "icon-xs":
          "size-7 rounded-md in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm":
          "size-8 rounded-lg in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
