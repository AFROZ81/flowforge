import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react"

/**
 * Navigation is declared once and consumed by the desktop sidebar and the
 * mobile drawer, so the two can never drift apart.
 *
 * These mirror the real routes in `app/router.tsx` exactly — no entries
 * are invented here. Settings is deliberately absent: it is chrome-free and
 * reached from the account menu, the same way an app reaches its own
 * preferences, rather than competing with the workspace destinations.
 */
export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  /** NavLink `end` — true for leaf paths so parents don't stay active. */
  end: boolean
}

export type NavSection = {
  /**
   * Heading above the group. Optional: a single unnamed group needs no label,
   * and the rail never shows one while collapsed.
   */
  label?: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
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
]

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items
)

/**
 * Breadcrumb context for the top bar. Derived from the path rather than from
 * router matches, because several pages render their own titles and the top bar
 * only needs the coarse location.
 *
 * Ancestors that have a real route carry an `href`, so the trail is navigable;
 * the segment you are already on never does. Only the location itself is
 * returned — a grouping prefix would repeat the sidebar two centimetres away
 * and cost room on a phone.
 */
export type BreadcrumbSegment = {
  label: string
  href?: string
}

const SINGLE_SEGMENT_ROUTES: Record<string, string> = {
  dashboard: "Dashboard",
  reports: "Reports",
  settings: "Settings",
  projects: "Projects",
}

export function describeRoute(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return [{ label: "Dashboard" }]

  const root = segments[0]

  /*
   * A project or board has a GUID in the URL, not a readable name, so the row
   * is labelled by what it is. Its parent still links back to the list.
   */
  if (root === "projects" && segments[1]) {
    const trail: BreadcrumbSegment[] = [
      { label: "Projects", href: "/projects" },
      { label: "Project" },
    ]

    if (segments[2] === "boards") {
      trail[1] = { label: "Project", href: `/projects/${segments[1]}` }
      trail.push({ label: "Board" })
    }

    return trail
  }

  const label =
    SINGLE_SEGMENT_ROUTES[root] ??
    root.charAt(0).toUpperCase() + root.slice(1)

  return [
    {
      label,
      href: SINGLE_SEGMENT_ROUTES[root] ? `/${root}` : undefined,
    },
  ]
}
