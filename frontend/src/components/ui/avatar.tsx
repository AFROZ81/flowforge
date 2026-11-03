import * as React from "react"

import { cn } from "@/lib/utils"
import { initialsOf } from "@/lib/format"

export type AvatarSize = "xs" | "sm" | "md" | "lg"

/**
 * Tints are drawn from a short, deliberately muted list so a workspace
 * full of people stays calm rather than turning into a color wheel.
 */
const tints = [
  "bg-primary-subtle text-primary",
  "bg-info-subtle text-info-foreground",
  "bg-success-subtle text-success-foreground",
  "bg-warning-subtle text-warning-foreground",
  "bg-accent text-accent-foreground",
  "bg-surface-sunken text-secondary-foreground",
] as const

const sizeClasses: Record<AvatarSize, string> = {
  xs: "size-5 text-[10px]",
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm rounded-lg",
}

/** Deterministic per-name tint — the same person is the same color everywhere. */
function tintFor(name: string) {
  let hash = 0

  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }

  return tints[hash % tints.length]
}

type AvatarProps = {
  name?: string | null
  /** Optional photo — falls back to initials when missing or broken. */
  imageSrc?: string | null
  size?: AvatarSize
  /** Ring helps an avatar separate from a same-colored card. */
  ring?: boolean
  /** e.g. a presence dot rendered in the bottom-right corner. */
  indicator?: React.ReactNode
  /** Pass when the avatar is decorative and the name is already adjacent. */
  decorative?: boolean
  className?: React.ComponentProps<"div">["className"]
}

export function Avatar({
  name,
  imageSrc,
  size = "md",
  ring = false,
  indicator,
  decorative = false,
  className,
  ...props
}: AvatarProps & Omit<React.ComponentProps<"div">, "className">) {
  const initials = initialsOf(name)

  /*
   * Recording *which* source failed (rather than a boolean) means a new
   * person's photo is tried again without an extra effect + setState pass.
   */
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)
  const showImage = Boolean(imageSrc) && failedSrc !== imageSrc

  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative inline-flex shrink-0",
        sizeClasses[size],
        size !== "lg" && "rounded-full",
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={imageSrc ?? undefined}
          alt={decorative ? "" : (name ?? "Avatar")}
          onError={() => setFailedSrc(imageSrc ?? null)}
          className={cn(
            "size-full object-cover",
            size === "lg" ? "rounded-lg" : "rounded-full",
            ring && "ring-1 ring-border"
          )}
        />
      ) : (
        <span
          role={decorative ? undefined : "img"}
          aria-hidden={decorative || undefined}
          aria-label={decorative ? undefined : (name ?? "Avatar")}
          className={cn(
            "flex size-full items-center justify-center rounded-[inherit] font-semibold tracking-tight select-none",
            tintFor(name ?? initials),
            ring && "ring-1 ring-border"
          )}
        >
          {initials}
        </span>
      )}

      {indicator && (
        <span className="absolute -right-0.5 -bottom-0.5 flex leading-none">
          {indicator}
        </span>
      )}
    </div>
  )
}

/**
 * Overlapping avatar group with a "+N" remainder — used wherever a
 * list of contributors needs to fit one column.
 */
export function AvatarGroup({
  people,
  max = 4,
  size = "sm",
  indicator,
  className,
}: {
  people: Array<{ id: string; name: string | null; imageSrc?: string | null }>
  max?: number
  size?: AvatarSize
  /**
   * Rendered on every person shown, e.g. a presence dot for a group that is
   * online by definition. Asking for one stops the avatars from overlapping:
   * the negative margin would bury each dot under the next circle.
   */
  indicator?: React.ReactNode
  className?: React.ComponentProps<"div">["className"]
}) {
  const shown = people.slice(0, max)
  const overflow = people.length - shown.length

  // Tighter steps for the smaller sizes so a group of 4 stays narrow
  const stepSize: Record<AvatarSize, string> = {
    xs: "-ml-1.5",
    sm: "-ml-2",
    md: "-ml-2.5",
    lg: "-ml-3",
  }

  if (shown.length === 0) return null

  return (
    <div
      data-slot="avatar-group"
      className={cn("flex items-center", indicator && "gap-1", className)}
      aria-label={`${people.length} member${people.length === 1 ? "" : "s"}`}
    >
      {shown.map((person, index) => (
        <div
          key={person.id}
          className={cn(
            "rounded-full ring-2 ring-card",
            !indicator && index > 0 && stepSize[size]
          )}
        >
          <Avatar
            name={person.name}
            imageSrc={person.imageSrc}
            size={size}
            decorative
            indicator={indicator}
          />
        </div>
      ))}

      {overflow > 0 && (
        <span
          className={cn(
            "-ml-2 flex items-center justify-center rounded-full bg-surface-sunken font-semibold text-muted-foreground ring-2 ring-card",
            sizeClasses[size]
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}
