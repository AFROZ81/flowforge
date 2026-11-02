import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react"

/**
 * Navigation is declared once and consumed by the desktop sidebar and the
 * mobile drawer, so the two can never drift apart.
 *
 * These mirror the real routes in `app/router.tsx` exactly — no entries
 * are invented here.
 */
export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  /** NavLink `end` — true for leaf paths so parents don't stay active. */
  end: boolean
}

export type NavSection = {
  label: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Workspace",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        end: true,
      },
      {
        title: "Projects",
        href: "/projects",
        icon: FolderKanban,
        end: false,
      },
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart3,
        end: false,
      },
    ],
  },
  {
    label: "Manage",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        end: false,
      },
    ],
  },
]

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items
)

/**
 * Breadcrumb context for the top bar. Derived from the path rather than
 * from router matches, because several pages render their own titles and
 * the top bar only needs the coarse location.
 */
export function describeRoute(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return ["Dashboard"]

  const trail: string[] = []

  if (segments[0] === "dashboard") trail.push("Workspace", "Dashboard")
  else if (segments[0] === "reports") trail.push("Workspace", "Reports")
  else if (segments[0] === "settings") trail.push("Manage", "Settings")
  else if (segments[0] === "projects") {
    trail.push("Workspace", "Projects")

    if (segments[1]) trail.push("Project")
    if (segments[2] === "boards") trail.push("Board")
  } else trail.push(segments[0][0].toUpperCase() + segments[0].slice(1))

  return trail
}
