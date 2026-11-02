import { Circle, Users } from "lucide-react";

import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";

import { usePresenceContext } from "../context/PresenceContext";

/**
 * Who's currently in the workspace.
 *
 * The trigger shows an avatar stack; the panel lists everyone. It used to
 * be a hand-rolled popover — a fixed overlay button for click-away, no
 * Escape handling, and its own copy of the initials algorithm.
 */
export default function OnlineMembers() {
    const { onlineUsers } = usePresenceContext();

    const onlineCount = onlineUsers.length;

    /* Nothing to report — don't reserve space for an empty control */
    if (onlineCount === 0) {
        return null;
    }

    return (
        <Popover>
            <PopoverTrigger
                aria-label={`View the ${onlineCount} member${onlineCount === 1 ? "" : "s"} online`}
                render={
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 px-2 text-muted-foreground hover:text-foreground"
                    />
                }
            >
                <AvatarGroup
                    people={onlineUsers.map((user) => ({
                        id: user.userId,
                        name: user.fullName,
                    }))}
                    max={3}
                    size="sm"
                />

                <span className="hidden text-xs font-medium tabular-nums sm:inline">
                    {onlineCount} online
                </span>
            </PopoverTrigger>

            <PopoverContent className="flex w-[min(20rem,calc(100vw-1.5rem))] flex-col p-0">
                <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <span
                            aria-hidden="true"
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success-subtle text-success-foreground"
                        >
                            <Users size={16} />
                        </span>

                        <div className="min-w-0">
                            <PopoverTitle>People online</PopoverTitle>

                            <PopoverDescription className="mt-0.5">
                                Active in your workspace right now
                            </PopoverDescription>
                        </div>
                    </div>

                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success-subtle px-2 py-1 text-xs font-semibold text-success-foreground tabular-nums">
                        <Circle size={7} className="fill-current" aria-hidden="true" />
                        {onlineCount}
                    </span>
                </div>

                <ul className="max-h-[min(19rem,50dvh)] overflow-y-auto p-1.5">
                    {onlineUsers.map((user) => (
                        <li
                            key={user.userId}
                            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-muted"
                        >
                            <Avatar
                                name={user.fullName}
                                size="md"
                                decorative
                                indicator={
                                    <span
                                        title="Online"
                                        className="flex size-2.5 rounded-full bg-success ring-2 ring-popover"
                                    >
                                        <span className="sr-only">Online</span>
                                    </span>
                                }
                            />

                            <div className="min-w-0 flex-1">
                                <p
                                    className="truncate text-sm font-medium text-foreground"
                                    title={user.fullName}
                                >
                                    {user.fullName || "Unknown member"}
                                </p>

                                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-success-foreground">
                                    <Circle
                                        size={5}
                                        className="fill-current"
                                        aria-hidden="true"
                                    />
                                    Online
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </PopoverContent>
        </Popover>
    );
}
