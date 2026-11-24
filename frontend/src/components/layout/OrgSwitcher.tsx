import {
    useMemo,
} from "react";

import {
    ChevronDown,
    Building2,
    Check,
} from "lucide-react";

import {
    useAuthStore,
} from "@/stores/auth.store";

import {
    Button,
} from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function OrgSwitcher() {

    const {
        user,
        switchOrganization,
    } = useAuthStore();

    const organizations =
        useMemo(() => {

            if (!user?.organizationIds) {
                return [];
            }

            return user.organizationIds.map(
                (id) => ({
                    id,
                    name: id,
                })
            );
        }, [user?.organizationIds]);

    const currentOrgId =
        user?.organizationId;

    if (organizations.length <= 1) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 min-w-[140px] justify-between"
                >
                    <Building2
                        className="size-4 shrink-0"
                    />

                    <span
                        className="truncate text-sm font-medium"
                    >
                        {currentOrgId
                            ? currentOrgId.slice(0, 8) + "..."
                            : "No org"}
                    </span>

                    <ChevronDown
                        className="size-4 shrink-0 text-muted-foreground"
                    />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="min-w-[180px]"
            >
                {organizations.map(
                    (org) => (
                        <DropdownMenuItem
                            key={org.id}
                            onSelect={() =>
                                void switchOrganization(org.id)
                            }
                            className="flex items-center gap-2"
                        >
                            <Building2
                                className="size-4 shrink-0"
                            />

                            <span
                                className="truncate flex-1"
                            >
                                {org.name}
                            </span>

                            {org.id === currentOrgId && (
                                <Check
                                    className="size-4 shrink-0 text-primary"
                                />
                            )}
                        </DropdownMenuItem>
                    )
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}