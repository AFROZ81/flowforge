import {
    Archive,
    MoreHorizontal,
    Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectActions() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button
                    variant="ghost"
                    size="icon"
                >
                    <MoreHorizontal size={18} />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <Pencil
                        className="mr-2"
                        size={16}
                    />
                    Edit
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <Archive
                        className="mr-2"
                        size={16}
                    />
                    Archive
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}