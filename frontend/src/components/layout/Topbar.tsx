import { ChevronRight, LogOut, Menu, Moon, Sun } from "lucide-react";

import { useLocation, useNavigate } from "react-router";
import { useTheme } from "next-themes";

import OnlineMembers from "@/features/presence/components/OnlineMembers";
import { NotificationBell } from "@/features/notifications";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { describeRoute } from "@/components/layout/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

type TopbarProps = {
  /** Opens the mobile navigation drawer. Hidden at the desktop breakpoint. */
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  const logout = useAuthStore((state) => state.logout);

  const trail = describeRoute(location.pathname);
  const isDark = resolvedTheme === "dark";

  const handleLogout = () => {
    logout();

    navigate("/login", { replace: true });
  };

  return (
    <header
      className={cn(
        "flex h-[var(--topbar-height)] shrink-0 items-center justify-between gap-3",
        "border-b border-border bg-card/85 px-3 backdrop-blur-xs sm:px-5 lg:px-6"
      )}
    >
      {/* =================================================
          LEFT — navigation + breadcrumb
      ================================================= */}
      <div className="flex min-w-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="lg:hidden"
        >
          <Menu />
        </Button>

        {/* Breadcrumb reads as context, not as a second page title */}
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm">
            {trail.map((crumb, index) => {
              const last = index === trail.length - 1;

              return (
                <li
                  key={`${crumb}-${index}`}
                  className={cn("flex min-w-0 items-center gap-1.5", last && "min-w-0")}
                  aria-current={last ? "page" : undefined}
                >
                  {index > 0 && (
                    <ChevronRight
                      className="size-3.5 shrink-0 text-muted-foreground/45"
                      aria-hidden="true"
                    />
                  )}

                  <span
                    className={cn(
                      "truncate",
                      last
                        ? "font-semibold text-foreground"
                        : "hidden text-muted-foreground sm:inline"
                    )}
                  >
                    {crumb}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* =================================================
          RIGHT
      ================================================= */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <OnlineMembers />

        <NotificationBell />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground"
              />
            }
          >
            {isDark ? <Sun /> : <Moon />}
          </TooltipTrigger>

          <TooltipContent side="bottom">
            {isDark ? "Light theme" : "Dark theme"}
          </TooltipContent>
        </Tooltip>

        {/*
         * A rule between the routine controls and the one that ends the
         * session — sign-out should not look like a peer of the theme toggle.
         */}
        <span
          aria-hidden="true"
          className="mx-0.5 h-5 w-px shrink-0 self-center bg-border"
        />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={handleLogout}
                className="shrink-0 text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground"
              />
            }
          >
            <LogOut />
          </TooltipTrigger>

          <TooltipContent side="bottom">Sign out</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
