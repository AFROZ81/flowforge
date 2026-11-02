import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
}

/**
 * A styled native `<select>`.
 *
 * Deliberately native rather than a listbox: on a phone the operating
 * system's own picker is faster and more reliable than any web popup, and
 * it composes with react-hook-form's `register` without a Controller.
 * Reach for `Select` from ui/select when you need rich option content.
 */
export function NativeSelect({
  className,
  size = "default",
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent pr-9 font-medium text-foreground",
          "outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
          "disabled:pointer-events-none disabled:bg-surface-sunken disabled:opacity-60",
          "aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20",
          size === "sm" ? "h-8 py-1 pl-2.5 text-[13px]" : "h-9 py-1 pl-3 text-sm",
          className
        )}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground",
          size === "sm" ? "size-3.5" : "size-4"
        )}
      />
    </div>
  )
}
