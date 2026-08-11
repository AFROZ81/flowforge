import api from "@/lib/api";

import type {
    ChecklistItem,
    ChecklistProgress,
    CreateChecklistRequest,
    ReorderChecklistRequest,
    UpdateChecklistRequest,
} from "../types/checklist";

export const getChecklists = async (
    workItemId: string
): Promise<ChecklistItem[]> => {
    const res = await api.get(
        `/Checklists/${workItemId}`
    );

    return res.data.data ?? [];
};

export const createChecklist = async (
    data: CreateChecklistRequest
): Promise<ChecklistItem> => {
    const res = await api.post(
        "/Checklists",
        data
    );

    return res.data.data;
};

export const updateChecklist = async (
    data: UpdateChecklistRequest
): Promise<ChecklistItem> => {
    const res = await api.put(
        `/Checklists/${data.checklistItemId}`,
        {
            checklistItemId:
                data.checklistItemId,
            title: data.title,
        }
    );

    return res.data.data;
};

export const deleteChecklist = async (
    checklistItemId: string
) => {
    const res = await api.delete(
        `/Checklists/${checklistItemId}`
    );

    return res.data.data;
};

export const completeChecklist = async (
    checklistItemId: string
) => {
    const res = await api.patch(
        `/Checklists/${checklistItemId}/complete`
    );

    return res.data.data;
};

export const uncompleteChecklist = async (
    checklistItemId: string
) => {
    const res = await api.patch(
        `/Checklists/${checklistItemId}/uncomplete`
    );

    return res.data.data;
};

export const reorderChecklists = async (
    data: ReorderChecklistRequest
) => {
    const res = await api.patch(
        "/Checklists/reorder",
        data
    );

    return res.data.data;
};

export const getChecklistProgress = async (
    workItemId: string
): Promise<ChecklistProgress> => {
    const res = await api.get(
        `/Checklists/${workItemId}/progress`
    );

    return res.data.data;
};
