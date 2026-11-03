import { useQuery } from "@tanstack/react-query";

import {
    reportsService,
    type AssigneeSummary,
} from "@/features/reports/api/reports.service";

/**
 * How much work each person is carrying.
 *
 * This is the existing assignee report, reused rather than re-implemented: the
 * endpoint is already the workspace-wide rollup, and a second client for the
 * same route would give Settings and Reports a reason to disagree.
 *
 * Members with no assignments are absent from the response, which is different
 * from having a row of zeroes — the table shows a dash for them.
 */
export function useMemberWorkload() {
    return useQuery({
        queryKey: ["workspace", "workload"],
        queryFn: reportsService.getAssigneeSummary,
        staleTime: 30_000,
    });
}

export type { AssigneeSummary };
