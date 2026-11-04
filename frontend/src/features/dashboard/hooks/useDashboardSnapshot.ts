import { useQuery } from "@tanstack/react-query";

import { getDashboardSnapshot } from "../api/dashboard.service";

/**
 * The dashboard's only query.
 *
 * A minute of freshness means returning to the page from a board does not
 * re-request the world, while the Refresh button still reaches the server.
 */
export function useDashboardSnapshot() {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: getDashboardSnapshot,
        staleTime: 60_000,
    });
}
