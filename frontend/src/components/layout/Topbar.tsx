import { Link, useLocation } from "react-router"
import { ChevronRight, Menu } from "lucide-react"

import OnlineMembers from "@/features/presence/components/OnlineMembers"
import { NotificationBell } from "@/features/notifications"
import { Button } from "@/components/ui/button"
import { describeRoute } from "@/components/layout/navigation"
import UserMenu from "@/components/layout/UserMenu"
import { cn } from "@/lib/utils"

type TopbarProps = {
  /** Opens the mobile navigation drawer. Hidden at the desktop breakpoint. */
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const trail = describeRoute(location.pathname)

  return (
    <header
      className={cn(
        "relative flex h-[var(--topbar-height)] shrink-0 items-center justify-between gap-3",
        "border-b border-border bg-card/80 px-3 backdrop-blur-md sm:px-4 lg:px-6"
      )}
    >
      {/*
        A themed hairline laid over the border: the bar is the one surface that
        is always on screen, so it carries a hint of the accent instead of a
        flat grey rule. Pointer-events none keeps it out of the way of the
        controls it sits under.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      {/* =================================================
          LEFT — where you are
      ================================================= */}
      <div className="flex min-w-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="shrink-0 lg:hidden"
        >
          <Menu />
        </Button>

        {/*
          Ancestors link, the last crumb is the current location. Group labels
          are omitted — the sidebar already shows them beside this bar.
        */}
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-1 text-sm">
            {trail.map((crumb, index) => {
              const last = index === trail.length - 1

              return (
                <li
                  key={`${crumb.label}-${index}`}
                  className="flex min-w-0 items-center gap-1"
                  aria-current={last ? "page" : undefined}
                >
                  {index > 0 && (
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-muted-foreground/40"
                    />
                  )}

                  {last || !crumb.href ? (
                    <span
                      className={cn(
                        "truncate",
                        last
                          ? "font-semibold tracking-tight text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.href}
                      className={cn(
                        "truncate rounded-sm text-muted-foreground underline-offset-2",
                        "outline-none transition-colors hover:text-foreground hover:underline",
                        "focus-visible:ring-3 focus-visible:ring-ring/40"
                      )}
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      {/* =================================================
          RIGHT — who is here, what needs attention, who you are
      ================================================= */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <OnlineMembers />

        <NotificationBell />

        {/* Separates the shared workspace tools from your own account. */}
        <span
          aria-hidden="true"
          className="mx-1 h-6 w-px shrink-0 self-center bg-border"
        />

        <UserMenu />
      </div>
    </header>
  )
}
