import api from "@/lib/api";

import type { DashboardSnapshot } from "../types/dashboard.types";

/**
 * The dashboard in one request.
 *
 * This replaces six calls the page used to fan out on mount, which is what made
 * the figures on screen describe six slightly different moments.
 */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
    const response = await api.get<{ data: DashboardSnapshot }>("/Dashboard");

    return response.data.data;
}

export const dashboardService = {
    getDashboardSnapshot,
};
