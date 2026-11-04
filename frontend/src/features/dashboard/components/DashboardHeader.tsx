import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/stores/auth.store";

type Props = {
    /** When the snapshot was built, or null while there is nothing to stamp. */
    generatedAtUtc: string | null;
    isFetching: boolean;
    onRefresh: () => void;
};

function partOfDay(hour: number): string {
    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 17) {
        return "Good afternoon";
    }

    return "Good evening";
}

function clockTime(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * The page's only header.
 *
 * The timestamp is the server's, not the render's, so "Updated 14:32" means the
 * figures beside it were true at 14:32 rather than whenever this painted.
 */
export default function DashboardHeader({
    generatedAtUtc,
    isFetching,
    onRefresh,
}: Props) {
    const fullName = useAuthStore((state) => state.user?.fullName?.trim());
    const firstName = fullName ? fullName.split(/\s+/)[0] : "there";

    return (
        <PageHeader
            title={`${partOfDay(new Date().getHours())}, ${firstName}`}
            description={
                generatedAtUtc
                    ? `Updated ${clockTime(generatedAtUtc)}`
                    : "Loading your workspace snapshot"
            }
            actions={
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={onRefresh}
                    disabled={isFetching}
                >
                    {isFetching ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <RefreshCw />
                    )}
                    Refresh
                </Button>
            }
        />
    );
}
