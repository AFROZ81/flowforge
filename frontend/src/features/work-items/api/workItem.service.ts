import api from "@/lib/api";

import type { WorkItem } from "../types/workItem";

export type CreateWorkItemRequest = {
    boardId: string;

    title: string;

    description?: string;

    status: string;

    priority: string;

    estimate?: number;
};

export const getWorkItems = async (
    boardId: string
): Promise<WorkItem[]> => {

    const res = await api.get("/WorkItems", {
        params: {
            boardId,
        },
    });

    return res.data.data.items;
};

export const getWorkItem = async (
    id: string
): Promise<WorkItem> => {

    const res = await api.get(`/WorkItems/${id}`);

    return res.data.data;
};

export const createWorkItem = async (
    data: CreateWorkItemRequest
) => {

    const res = await api.post(
        "/WorkItems",
        data
    );

    return res.data.data;
};