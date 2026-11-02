import { Link } from "react-router";
import {
    Archive,
    ArrowUpRight,
    MoreHorizontal,
    Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
    projectId: string;
    projectName: string;
};

/**
 * Row actions.
 *
 * Edit and Archive have no endpoint behind them yet, so they are rendered
 * disabled with a reason instead of looking live and doing nothing — the
 * previous behaviour, which read as a bug on every click.
 */
export default function ProjectActions({ projectId, projectName }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={`Actions for ${projectName}`}
                render={
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                    />
                }
            >
                <MoreHorizontal />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="min-w-[184px]">
                <DropdownMenuItem
                    render={<Link to={`/projects/${projectId}`} />}
                >
                    <ArrowUpRight />
                    Open project
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem disabled title="Not available yet">
                    <Pencil />
                    Edit
                    <span className="ml-auto text-[11px] text-muted-foreground">
                        soon
                    </span>
                </DropdownMenuItem>

                <DropdownMenuItem disabled title="Not available yet">
                    <Archive />
                    Archive
                    <span className="ml-auto text-[11px] text-muted-foreground">
                        soon
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
