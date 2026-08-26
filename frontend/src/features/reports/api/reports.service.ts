import api from "@/lib/api";

export interface WorkItemSummary {
    total: number;
    active: number;
    blocked: number;
    completed: number;
    archived: number;
    assigned: number;
    unassigned: number;
    overdue: number;
}

export interface ProjectSummary {
    projectId: string;
    projectName: string;
    total: number;
    active: number;
    completed: number;
    blocked: number;
    completionPercentage: number;
}

export interface AssigneeSummary {
    userId: string;
    fullName: string;
    email: string;
    assigned: number;
    active: number;
    completed: number;
    blocked: number;
    overdue: number;
}

export interface LabelUsage {
    labelId: string;
    name: string;
    color: string;
    usageCount: number;
}

export interface ProductivityPoint {
    date: string;
    created: number;
    completed: number;
}

const REPORTS_BASE_URL = "/Reports";

/* -------------------------------------------------------------------------- */
/* Response helpers                                                           */
/* -------------------------------------------------------------------------- */

function isObject(
    value: unknown
): value is Record<string, unknown> {
    return (
        value !== null &&
        typeof value === "object"
    );
}

/**
 * Supports both:
 *
 * 1. Axios response
 *    {
 *       data: {
 *          success: true,
 *          message: "...",
 *          data: [...]
 *       }
 *    }
 *
 * 2. API envelope
 *    {
 *       success: true,
 *       message: "...",
 *       data: [...]
 *    }
 *
 * 3. Already unwrapped data
 *    [...]
 */
function unwrapResponse<T>(
    response: unknown
): T {
    let current: unknown = response;

    /*
     * First unwrap an AxiosResponse if the api client
     * returned the complete Axios object.
     */
    if (
        isObject(current) &&
        "status" in current &&
        "headers" in current &&
        "data" in current
    ) {
        current = current.data;
    }

    /*
     * Then unwrap the application's standard API envelope.
     *
     * Swagger responses show:
     *
     * {
     *   success: true,
     *   message: "...",
     *   data: ...
     * }
     */
    if (
        isObject(current) &&
        "data" in current &&
        (
            "success" in current ||
            "message" in current
        )
    ) {
        current = current.data;
    }

    return current as T;
}

/**
 * Safely extracts an array from a report endpoint.
 */
function normalizeArrayResponse<T>(
    response: unknown
): T[] {
    const data =
        unwrapResponse<unknown>(
            response
        );

    if (Array.isArray(data)) {
        return data as T[];
    }

    /*
     * Defensive support for:
     *
     * {
     *   items: [...]
     * }
     */
    if (
        isObject(data) &&
        Array.isArray(data.items)
    ) {
        return data.items as T[];
    }

    return [];
}

/**
 * Safely extracts the work-item summary.
 */
function normalizeWorkItemSummary(
    response: unknown
): WorkItemSummary {
    const data =
        unwrapResponse<unknown>(
            response
        );

    if (!isObject(data)) {
        return {
            total: 0,
            active: 0,
            blocked: 0,
            completed: 0,
            archived: 0,
            assigned: 0,
            unassigned: 0,
            overdue: 0,
        };
    }

    return {
        total: Number(
            data.total ?? 0
        ),

        active: Number(
            data.active ?? 0
        ),

        blocked: Number(
            data.blocked ?? 0
        ),

        completed: Number(
            data.completed ?? 0
        ),

        archived: Number(
            data.archived ?? 0
        ),

        assigned: Number(
            data.assigned ?? 0
        ),

        unassigned: Number(
            data.unassigned ?? 0
        ),

        overdue: Number(
            data.overdue ?? 0
        ),
    };
}

/* -------------------------------------------------------------------------- */
/* Work Items                                                                 */
/* -------------------------------------------------------------------------- */

async function getWorkItemSummary(): Promise<WorkItemSummary> {
    const response =
        await api.get(
            `${REPORTS_BASE_URL}/work-items/summary`
        );

    return normalizeWorkItemSummary(
        response
    );
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

async function getProjectSummary(): Promise<ProjectSummary[]> {
    const response =
        await api.get(
            `${REPORTS_BASE_URL}/projects/summary`
        );

    return normalizeArrayResponse<ProjectSummary>(
        response
    );
}

/* -------------------------------------------------------------------------- */
/* Assignees                                                                  */
/* -------------------------------------------------------------------------- */

async function getAssigneeSummary(): Promise<AssigneeSummary[]> {
    const response =
        await api.get(
            `${REPORTS_BASE_URL}/assignees/summary`
        );

    return normalizeArrayResponse<AssigneeSummary>(
        response
    );
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

async function getLabelUsage(): Promise<LabelUsage[]> {
    const response =
        await api.get(
            `${REPORTS_BASE_URL}/labels/usage`
        );

    return normalizeArrayResponse<LabelUsage>(
        response
    );
}

/* -------------------------------------------------------------------------- */
/* Productivity                                                               */
/* -------------------------------------------------------------------------- */

async function getProductivityTrends(
    days: number = 30
): Promise<ProductivityPoint[]> {
    const response =
        await api.get(
            `${REPORTS_BASE_URL}/productivity-trends`,
            {
                params: {
                    days,
                },
            }
        );

    return normalizeArrayResponse<ProductivityPoint>(
        response
    );
}

/* -------------------------------------------------------------------------- */
/* Work Item Export                                                           */
/* -------------------------------------------------------------------------- */

async function exportWorkItems(): Promise<void> {
    const response =
        await api.get(
            `${REPORTS_BASE_URL}/export/work-items`,
            {
                responseType: "blob",
            }
        );

    /*
     * For the export endpoint we intentionally do NOT
     * unwrap response.data because the backend returns
     * the actual XLSX file as a blob.
     */

    const blob =
        response.data instanceof Blob
            ? response.data
            : new Blob(
                  [response.data],
                  {
                      type:
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  }
              );

    /*
     * Read filename from Content-Disposition.
     */
    const contentDisposition =
        response.headers?.[
            "content-disposition"
        ] ??
        response.headers?.[
            "Content-Disposition"
        ];

    let fileName =
        `FlowForge-Work-Item-Report-${new Date()
            .toISOString()
            .slice(0, 19)
            .replace(
                /[:T]/g,
                "-"
            )}.xlsx`;

    if (
        typeof contentDisposition ===
        "string"
    ) {
        /*
         * RFC 5987:
         *
         * filename*=UTF-8''some-file.xlsx
         */
        const utfMatch =
            contentDisposition.match(
                /filename\*=UTF-8''([^;]+)/i
            );

        /*
         * Standard:
         *
         * filename="some-file.xlsx"
         */
        const normalMatch =
            contentDisposition.match(
                /filename="?([^"]+)"?/i
            );

        if (utfMatch?.[1]) {
            try {
                fileName =
                    decodeURIComponent(
                        utfMatch[1]
                    );
            } catch {
                fileName =
                    utfMatch[1];
            }
        } else if (
            normalMatch?.[1]
        ) {
            fileName =
                normalMatch[1];
        }
    }

    const url =
        window.URL.createObjectURL(
            blob
        );

    const anchor =
        document.createElement(
            "a"
        );

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(
        anchor
    );

    anchor.click();

    anchor.remove();

    window.URL.revokeObjectURL(
        url
    );
}

/* -------------------------------------------------------------------------- */
/* Public service                                                             */
/* -------------------------------------------------------------------------- */

export const reportsService = {
    getWorkItemSummary,
    getProjectSummary,
    getAssigneeSummary,
    getLabelUsage,
    getProductivityTrends,
    exportWorkItems,
};

export default reportsService;