import api from "@/lib/api";

import type { WorkItem } from "../types/workItem";

export type CreateWorkItemRequest = {
    columnId: string;
    title: string;
    description?: string;
    priority: number;
    dueDate?: string;
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