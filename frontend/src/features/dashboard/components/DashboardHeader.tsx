import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/stores/auth.store";
import { getIstHour, IST_TIME_ZONE, parseApiDate } from "@/lib/datetime";

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
    const date = parseApiDate(value);

    return date
        ? `${date.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: IST_TIME_ZONE,
          })} IST`
        : "—";
}

function fullDate(date: Date): string {
    return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: IST_TIME_ZONE,
    });
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

    const now = new Date();

    return (
        <PageHeader
            eyebrow={fullDate(now)}
            title={`${partOfDay(getIstHour(now) ?? 0)}, ${firstName}`}
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
