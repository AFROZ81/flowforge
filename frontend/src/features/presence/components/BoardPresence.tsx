import { Users, Wifi, WifiOff } from "lucide-react";

import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { usePresenceContext } from "../context/PresenceContext";

/**
 * Who else is looking at this board, and whether the live connection is up.
 *
 * Third of three copies of the initials helper and the hand-rolled
 * click-away popover; both are now shared.
 */
export default function BoardPresence() {
    const { boardViewers, isBoardConnected } = usePresenceContext();

    const viewerCount = boardViewers.length;

    const summary =
        viewerCount === 0
            ? "No one else on this board"
            : viewerCount === 1
              ? "1 viewer"
              : `${viewerCount} viewers`;

    return (
        <Popover>
            <PopoverTrigger
                aria-label={`People on this board — ${summary}`}
                render={
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 rounded-full bg-card pl-1.5 shadow-xs"
                    />
                }
            >
                {/* Live-connection state — a dot alone would be missed */}
                <span
                    aria-hidden="true"
                    className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full",
                        isBoardConnected
                            ? "bg-success-subtle text-success-foreground"
                            : "bg-surface-sunken text-muted-foreground"
                    )}
                >
                    {isBoardConnected ? (
                        <Wifi className="size-3.5" />
                    ) : (
                        <WifiOff className="size-3.5" />
                    )}
                </span>

                {viewerCount > 0 ? (
                    <AvatarGroup
                        people={boardViewers.map((user) => ({
                            id: user.userId,
                            name: user.userName,
                        }))}
                        max={4}
                        size="sm"
                    />
                ) : (
                    <Users className="size-4 text-muted-foreground" />
                )}

                <span className="hidden pr-1 text-xs font-medium text-muted-foreground tabular-nums sm:inline">
                    {summary}
                </span>
            </PopoverTrigger>

            <PopoverContent className="flex w-[min(20rem,calc(100vw-1.5rem))] flex-col p-0">
                <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
                    <div className="min-w-0">
                        <PopoverTitle>People on this board</PopoverTitle>

                        <PopoverDescription className="mt-0.5">
                            Currently viewing this board
                        </PopoverDescription>
                    </div>

                    <span
                        className={cn(
                            "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold",
                            isBoardConnected
                                ? "bg-success-subtle text-success-foreground"
                                : "bg-surface-sunken text-muted-foreground"
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "size-1.5 rounded-full",
                                isBoardConnected ? "bg-success" : "bg-border-strong"
                            )}
                        />
                        {isBoardConnected ? "Live" : "Offline"}
                    </span>
                </div>

                {viewerCount === 0 ? (
                    <div className="flex flex-col items-center px-6 py-8 text-center">
                        <span
                            aria-hidden="true"
                            className="flex size-10 items-center justify-center rounded-full bg-surface-sunken text-muted-foreground"
                        >
                            <Users className="size-5" />
                        </span>

                        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                            You&rsquo;re the only person viewing this board.
                        </p>
                    </div>
                ) : (
                    <ul className="max-h-[min(18rem,45dvh)] overflow-y-auto py-1">
                        {boardViewers.map((user) => (
                            <li
                                key={user.userId}
                                className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-surface-muted"
                            >
                                <Avatar
                                    name={user.userName}
                                    size="sm"
                                    decorative
                                    indicator={
                                        <span className="size-2 rounded-full bg-success ring-2 ring-popover">
                                            <span className="sr-only">
                                                Viewing this board
                                            </span>
                                        </span>
                                    }
                                />

                                <div className="min-w-0">
                                    <p
                                        className="truncate text-sm font-medium text-foreground"
                                        title={user.userName}
                                    >
                                        {user.userName}
                                    </p>

                                    <p className="text-[11px] text-success-foreground">
                                        Viewing this board
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </PopoverContent>
        </Popover>
    );
}
