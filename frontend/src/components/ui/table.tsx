import * as React from "react"

import { cn } from "@/lib/utils"

type TableProps = React.ComponentProps<"table"> & {
  /**
   * Pin the header row to the app's scroll container.
   *
   * Only viable while the wrapper isn't itself a scroll container, so on
   * narrow screens the table keeps its horizontal scroll (and the header
   * scrolls with it) rather than silently failing to stick.
   */
  stickyHeader?: boolean
  /** Extra classes for the horizontal-scroll wrapper. */
  containerClassName?: string
}

function Table({
  className,
  containerClassName,
  stickyHeader,
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-sticky={stickyHeader ? "true" : undefined}
      className={cn(
        "group/table-container relative w-full",
        // `lg:overflow-x-clip` lets `position: sticky` resolve against the
        // page scroll container on desktop instead of being trapped here.
        stickyHeader
          ? "overflow-x-auto lg:overflow-x-clip"
          : "overflow-x-auto",
        containerClassName
      )}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-surface-muted font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border-subtle transition-colors duration-(--transition-fast)",
        "hover:bg-surface-muted/70 has-aria-expanded:bg-surface-muted/70 data-[state=selected]:bg-primary-subtle/60",
        "focus-within:bg-surface-muted/70",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 text-left align-middle font-heading text-xs font-semibold tracking-[0.02em] whitespace-nowrap text-muted-foreground uppercase [&:has([role=checkbox])]:pr-0",
        // Only sticks when the wrapper opted out of its own vertical scroll
        "group-data-[sticky=true]/table-container:sticky group-data-[sticky=true]/table-container:top-0 group-data-[sticky=true]/table-container:z-10 group-data-[sticky=true]/table-container:bg-card",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-2.5 align-middle whitespace-nowrap text-foreground/90 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
