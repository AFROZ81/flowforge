import { Link, useNavigate } from "react-router"
import { ChevronDown, LogOut, Settings } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/auth.store"
import { cn } from "@/lib/utils"

/**
 * Who is signed in, and the only way to end the session.
 *
 * Sign out used to sit as a lone red icon beside the other controls, which gave
 * the bar three looks-equal buttons and left the most destructive one one
 * mis-click away. It now lives behind the person it applies to, next to the one
 * destination worth linking from the bar.
 */
export default function UserMenu() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const name = user?.fullName?.trim() || user?.email?.trim() || "Account"

  const signOut = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${name}`}
        render={
          <button
            type="button"
            className={cn(
              "flex h-9 max-w-full items-center gap-2 rounded-full py-1 pr-1.5 pl-1",
              "outline-none transition-colors hover:bg-surface-muted",
              "focus-visible:ring-3 focus-visible:ring-ring/40"
            )}
          />
        }
      >
        <Avatar name={name} size="sm" ring />
        <span className="hidden max-w-40 truncate text-sm font-medium text-foreground md:inline">
          {name}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0">
            <div className="flex items-center gap-2.5 px-1 py-1.5">
              <Avatar name={name} size="md" ring />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {name}
                </span>
                {user?.email ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                ) : null}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link to="/settings" />}>
          <Settings />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
