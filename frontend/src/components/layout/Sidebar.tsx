import { NavLink } from "react-router";

import Logo from "@/components/layout/Logo";
import { NAV_SECTIONS, type NavItem } from "@/components/layout/navigation";
import { Avatar } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed: boolean;

  /**
   * `drawer` is the mobile slide-out: always expanded, and it closes
   * itself after a navigation so tapping a link dismisses the panel.
   *
   * Collapsing is not offered here — a drawer that collapses into itself has
   * nothing to collapse against. The rail's toggle lives in AppLayout, on the
   * corner where the rail meets the top bar.
   */
  variant?: "fixed" | "drawer";
  onNavigate?: () => void;
};

/* =========================================================
   SINGLE NAV ROW
   ========================================================= */

function NavRow({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  const link = (
    <NavLink
      to={item.href}
      end={item.end}
      onClick={onNavigate}
      aria-label={collapsed ? item.title : undefined}
      className={({ isActive }) =>
        cn(
          "group/nav relative flex h-10 w-full items-center rounded-lg",
          "text-sm transition-colors duration-(--transition-fast) outline-none",
          collapsed ? "justify-center px-0" : "gap-2.5 px-3",

          isActive
            ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
            : "font-medium text-sidebar-foreground/65 hover:bg-sidebar-foreground/[0.045] hover:text-sidebar-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Accent rail — the fastest possible read of "you are here" */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-0 w-[3px] rounded-r-full bg-primary transition-[height,opacity] duration-(--transition-normal)",
              isActive
                ? "top-1/2 h-5 -translate-y-1/2 opacity-100"
                : "top-1/2 h-0 -translate-y-1/2 opacity-0"
            )}
          />

          <Icon
            size={17}
            strokeWidth={isActive ? 2.15 : 1.8}
            className={cn(
              "shrink-0 transition-colors",
              isActive
                ? "text-primary"
                : "text-sidebar-foreground/45 group-hover/nav:text-sidebar-foreground/80"
            )}
          />

          {!collapsed && <span className="truncate">{item.title}</span>}
        </>
      )}
    </NavLink>
  );

  // A collapsed rail has no visible label, so the name must come from somewhere
  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={<div className="w-full" />}>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

export default function Sidebar({
  collapsed,
  variant = "fixed",
  onNavigate,
}: SidebarProps) {
  const isDrawer = variant === "drawer";
  const showCollapsed = isDrawer ? false : collapsed;

  const user = useAuthStore((state) => state.user);

  const fullName = user?.fullName?.trim() || "User";
  const email = user?.email?.trim() || "";

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-sidebar",
        !isDrawer && "border-r border-sidebar-border",
        isDrawer && "border-r border-border"
      )}
    >
      {/* ==================================================
          BRAND
      ================================================== */}
      <div
        className={cn(
          "flex h-[var(--topbar-height)] shrink-0 items-center border-b border-sidebar-border",
          showCollapsed ? "justify-center px-2" : "px-4"
        )}
      >
        {showCollapsed ? (
          <Logo variant="mark" size="md" />
        ) : (
          <Logo size="md" tagline={isDrawer ? "Enterprise Workspace" : null} />
        )}
      </div>

      {/* ==================================================
          NAVIGATION
      ================================================== */}
      <nav
        aria-label="Primary"
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4"
      >
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <div
            key={section.label}
            className={cn(sectionIndex > 0 && "mt-6")}
          >
            {showCollapsed ? (
              /* Keep a visible seam where the label would have been */
              <div
                aria-hidden="true"
                className="mx-3 mb-3 h-px bg-sidebar-border"
              />
            ) : (
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold tracking-[0.1em] text-sidebar-foreground/40 uppercase">
                {section.label}
              </p>
            )}

            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavRow
                    item={item}
                    collapsed={showCollapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ==================================================
          FOOTER — account

          Identity only. Signing out lives in the top bar with the
          other session controls, not down here among the navigation.
      ================================================== */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg p-1.5",
            showCollapsed && "justify-center"
          )}
        >
          <Avatar name={fullName} size={showCollapsed ? "sm" : "md"} ring />

          {!showCollapsed && (
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[13px] leading-tight font-semibold text-sidebar-foreground"
                title={fullName}
              >
                {fullName}
              </p>

              <p
                className="mt-0.5 truncate text-[11px] leading-tight text-sidebar-foreground/50"
                title={email}
              >
                {email || "Signed in"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
