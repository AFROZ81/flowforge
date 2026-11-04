import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-foreground/25 duration-200 supports-backdrop-filter:backdrop-blur-[3px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * On phones a centered dialog wastes vertical space and its close button
 * lands far from the thumb, so below `sm` the sheet docks to the bottom
 * edge and grows upward; from `sm` it behaves as a conventional dialog.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          /* --- mobile: bottom sheet --- */
          /*
           * `w-full` is not decorative. Without it a fixed, translated box
           * shrink-wraps to its content, so `sm:max-w-xl` only sets a ceiling
           * and every dialog renders a different width depending on what is
           * inside it. With it, max-width is the width.
           */
          "fixed inset-x-0 bottom-0 z-50 flex w-full max-h-[92dvh] flex-col gap-4 overflow-y-auto overscroll-contain",
          "rounded-t-2xl border-t border-border bg-popover pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] px-4",
          "text-sm text-popover-foreground shadow-xl outline-none",

          /* --- sm and up: centered dialog --- */
          "sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2",
          "sm:rounded-xl sm:border sm:p-5",

          /* One animation set that reads correctly at both sizes */
          "data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-4",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-4",
          "sm:data-open:slide-in-from-bottom-0 sm:data-open:zoom-in-95",
          "sm:data-closed:slide-out-to-bottom-0 sm:data-closed:zoom-out-95 sm:duration-150",

          /* ---------- single scroller ----------
             When a dialog has a DialogBody, that body is the scroller and
             the popup must not also scroll — two nested scrollboxes meant
             content got sliced at the body's bottom edge and the browser
             coerced overflow-x to `auto` on both of them. Dialogs without
             a body keep the popup scrolling. */
          "has-data-[slot=dialog-body]:overflow-hidden",

          className
        )}
        {...props}
      >
        {/* Grab handle — a sheet with no visible affordance feels broken */}
        <span
          aria-hidden="true"
          className="mx-auto -mt-1 mb-0.5 h-1 w-9 shrink-0 rounded-full bg-border-strong sm:hidden"
        />

        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2 z-10"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

/**
 * Scrollable middle of a dialog. Put long bodies here so the header and
 * footer stay pinned and the actions are always reachable.
 *
 * The three unusual declarations are all about not shaving the edges off
 * the content:
 *
 *  - `overflow-x-clip` — declaring only `overflow-y` makes the browser
 *    coerce `overflow-x` to `auto`, which clips at the padding box. The
 *    body has no horizontal padding of its own (the dialog does that), so
 *    a focused input's 3px ring and any drop shadow were being cut off at
 *    the left and right edges. `clip` reserves the scroll position without
 *    creating a horizontal scrollport.
 *  - `overflow-clip-margin` — lets that ring paint a few px past the box
 *    instead of stopping dead at it.
 *  - `scrollbar-gutter: stable both-edges` — reserving a single scrollbar on
 *    the right made every row sit further from the right edge than from the
 *    left. The width is `--scrollbar-size`, so this quotes no number: it only
 *    reserves the mirror gutter, which keeps content centred and stops it
 *    shifting when scrolling starts. `both-edges` alone is not a valid value;
 *    it only applies alongside `stable`.
 */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        "min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-clip",
        "[overflow-clip-margin:0.5rem] [scrollbar-gutter:stable_both-edges] pb-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * Header text is inset on the right to clear the close button, which is
 * absolutely positioned at right-2 and 32px wide — it occupies 8–40px from
 * the edge. Reserving anything less lets a long title run underneath it.
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex shrink-0 flex-col gap-1.5 pr-11", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        /*
         * Pinned to the bottom of the sheet on mobile, inline on desktop.
         * Buttons stretch on narrow screens so they clear touch targets.
         */
        "-mx-4 -mb-4 flex shrink-0 flex-col-reverse gap-2 border-t bg-surface-muted px-4 py-3",
        "sm:mx-0 sm:mb-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-4",
        "[&>*]:w-full sm:[&>*]:w-auto",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-snug font-semibold tracking-[-0.01em] text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm leading-relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
