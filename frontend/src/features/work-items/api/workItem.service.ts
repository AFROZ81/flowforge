import api from "@/lib/api";

import type { WorkItem } from "../types/workItem";

export type CreateWorkItemRequest = {
    columnId: string;
    title: string;
    description?: string;
    priority: number;
    dueDate?: string;
};

export type EditWorkItemRequest = {
    description?: string;
    priority: number;
    dueDate?: string | null;
};

export type RenameWorkItemRequest = {
    title: string;
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
    const res = await api.get(
        `/WorkItems/${id}`
    );

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

export const editWorkItem = async (
    id: string,
    data: EditWorkItemRequest
) => {
    const res = await api.patch(
        `/WorkItems/${id}/edit`,
        data
    );

    return res.data.data;
};

export const renameWorkItem = async (
    id: string,
    data: RenameWorkItemRequest
) => {
    const res = await api.patch(
        `/WorkItems/${id}/rename`,
        data
    );

    return res.data.data;
};

export const archiveWorkItem = async (
    id: string
) => {
    const res = await api.patch(
        `/WorkItems/${id}/archive`
    );

    return res.data.data;
};

export const restoreWorkItem = async (
    id: string
) => {
    const res = await api.patch(
        `/WorkItems/${id}/restore`
    );

    return res.data.data;
};

export const getWorkItemsByColumn = async (
    columnId: string,
    includeArchived = false
): Promise<WorkItem[]> => {
    const res = await api.get(
        `/WorkItems/column/${columnId}`,
        {
            params: {
                includeArchived,
            },
        }
    );

    return res.data.data;
};

export type MoveWorkItemRequest = {
    destinationColumnId: string;
    destinationIndex: number;
};

export const moveWorkItem = async (
    id: string,
    data: MoveWorkItemRequest
) => {
    const res = await api.patch(
        `/WorkItems/${id}/move`,
        data
    );

    return res.data.data;
};

export const assignWorkItem = async (
    workItemId: string,
    userId: string
) => {
    const response =
        await api.patch(
            `/WorkItems/${workItemId}/assign/${userId}`
        );

    return response.data.data;
};

export const unassignWorkItem = async (
    workItemId: string
) => {
    const response =
        await api.patch(
            `/WorkItems/${workItemId}/unassign`
        );

    return response.data.data;
};

export const completeWorkItem = async (
    id: string
) => {
    const res = await api.patch(
        `/WorkItems/${id}/complete`
    );

    return res.data.data;
};

export const blockWorkItem = async (
    id: string
) => {
    const res = await api.patch(
        `/WorkItems/${id}/block`
    );

    return res.data.data;
};

export const activateWorkItem = async (
    id: string
) => {
    const res = await api.patch(
        `/WorkItems/${id}/activate`
    );

    return res.data.data;
};