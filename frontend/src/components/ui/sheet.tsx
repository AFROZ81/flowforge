import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"

type Side = "left" | "right" | "bottom"

/**
 * Edge-anchored panel. Used for the mobile navigation drawer and for
 * bottom-sheet style modals on small screens, where a centered dialog
 * has awkward reach and poor use of the vertical viewport.
 */
function Sheet({ onOpenChange, ...props }: DialogPrimitive.Root.Props) {
  return (
    <DialogPrimitive.Root
      data-slot="sheet"
      {...props}
      disablePointerDismissal
      onOpenChange={(open, eventDetails) => {
        if (
          !open &&
          eventDetails.reason !== "close-press" &&
          eventDetails.reason !== "imperative-action"
        ) {
          eventDetails.cancel()
          return
        }

        onOpenChange?.(open, eventDetails)
      }}
    />
  )
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: DialogPrimitive.Popup.Props & {
  side?: Side
}) {
  const edge: Record<Side, string> = {
    left:
      "inset-y-0 left-0 h-full w-[min(20rem,88vw)] translate-x-0 border-r data-open:slide-in-from-left data-closed:slide-out-to-left",
    right:
      "inset-y-0 right-0 h-full w-[min(20rem,88vw)] translate-x-0 border-l data-open:slide-in-from-right data-closed:slide-out-to-right",
    bottom:
      "inset-x-0 bottom-0 max-h-[88vh] translate-y-0 rounded-t-2xl border-t data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="sheet-backdrop"
        className="fixed inset-0 isolate z-50 bg-gradient-to-b from-foreground/30 to-foreground/50 duration-200 supports-backdrop-filter:backdrop-blur-[6px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />

      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-0 bg-card text-card-foreground shadow-xl outline-none duration-250 ease-(--ease-standard) data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          side === "bottom" ? "" : "rounded-none",
          edge[side],
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex shrink-0 flex-col gap-0.5 border-b border-border px-4 py-4",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-sm leading-none font-semibold text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("min-h-0 flex-1 overflow-y-auto", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "shrink-0 border-t border-border bg-surface-muted p-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
}
