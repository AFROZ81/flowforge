import * as React from "react"
import { CircleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

type FormFieldProps = {
  label: React.ReactNode
  /** Must match the `id` of the control inside `children`. */
  htmlFor: string
  hint?: React.ReactNode
  error?: string | null
  /** Renders the asterisk and marks the control `aria-required`. */
  required?: boolean
  /** Prints a quiet "(optional)" beside the label. */
  optional?: boolean
  /** Set when the control is a checkbox group or otherwise self-labelling. */
  hideLabel?: boolean
  className?: React.ComponentProps<"div">["className"]
  /**
   * Either the control markup, or a render function receiving the
   * accessibility props. The function form is the only way to attach
   * `aria-describedby` correctly when the input is nested inside a
   * positioned wrapper — cloning it onto the wrapper would be wrong.
   */
  children: React.ReactNode | ((aria: FieldAria) => React.ReactNode)
}

/** Props a control inside a FormField should spread onto the real element. */
export type FieldAria = {
  id: string
  "aria-describedby"?: string
  "aria-required"?: boolean
  "aria-invalid"?: boolean
}

/**
 * Every form in the app previously wired its own label/error markup with
 * slightly different spacing and colors. This standardises the block and
 * wires the error to the control programmatically, so a screen reader
 * announces the reason instead of just reporting an invalid field.
 *
 *   <FormField label="Email" htmlFor="email" error={errors.email?.message}>
 *     {(aria) => <Input {...aria} {...register("email")} />}
 *   </FormField>
 *
 * Plain children also work when the control already carries a matching id,
 * but then `aria-describedby` is lost.
 */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  hideLabel,
  className,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined

  const aria: FieldAria = {
    id: htmlFor,
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(required ? { "aria-required": true } : {}),
    ...(error ? { "aria-invalid": true } : {}),
  }

  const control =
    typeof children === "function" ? children(aria) : children

  return (
    <div
      data-slot="form-field"
      className={cn("group/field space-y-1.5", className)}
    >
      <label
        htmlFor={htmlFor}
        className={cn(
          "flex items-center gap-1 text-[13px] leading-none font-medium text-foreground",
          hideLabel && "sr-only"
        )}
      >
        {label}

        {required && (
          <span aria-hidden="true" className="text-danger">
            *
          </span>
        )}

        {optional && !required && (
          <span className="text-xs font-normal text-muted-foreground/80">
            (optional)
          </span>
        )}
      </label>

      {control}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-danger-foreground"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p
            id={hintId}
            className="text-xs leading-relaxed text-muted-foreground"
          >
            {hint}
          </p>
        )
      )}
    </div>
  )
}
