import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  collapsed: boolean;
  onToggle: () => void;

  /** Id of the region whose width this changes, for `aria-controls`. */
  controls: string;

  className?: React.ComponentProps<"button">["className"];
};

/**
 * Collapse / expand, centred exactly on the point where the rail's right
 * border crosses the top bar's bottom border.
 *
 * It sits on the intersection because that is where the control takes effect:
 * half of it belongs to the rail that moves, half to the content it moves
 * for. Anchored to the rail's own edge, so it glides across with the width
 * transition instead of being re-positioned by hand.
 */
export default function SidebarToggle({
  collapsed,
  onToggle,
  controls,
  className,
}: Props) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";

  const Icon = collapsed ? ChevronRight : ChevronLeft;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onToggle}
            aria-label={label}
            aria-controls={controls}
            aria-expanded={!collapsed}
            className={cn(
              /*
               * Straddle the corner: right edge of the rail, bottom line of the
               * top bar. Offsets are half the button (size-7 = 28px), written
               * out rather than composed with translate, so the centring is
               * arithmetic and cannot half-apply.
               */
              "absolute top-[calc(var(--topbar-height)-0.875rem)] right-[-0.875rem] z-30",
              "flex size-7 items-center justify-center",
              "rounded-full border border-sidebar-border bg-sidebar",
              "text-sidebar-foreground/55 shadow-xs",
              "transition-colors duration-(--transition-fast) outline-none",
              "hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus-visible:ring-2 focus-visible:ring-sidebar-ring/45",
              className
            )}
          />
        }
      >
        <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
      </TooltipTrigger>

      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
