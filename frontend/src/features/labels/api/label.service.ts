import api from "@/lib/api";

import type {
    CreateLabelRequest,
    Label,
    UpdateLabelRequest,
    WorkItemLabel,
} from "../types/label";

/*
 * ==========================================
 * GET ALL LABELS
 * ==========================================
 */

export const getLabels = async (): Promise<Label[]> => {
    const res = await api.get("/Labels");

    return res.data.data;
};

/*
 * ==========================================
 * GET SINGLE LABEL
 * ==========================================
 */

export const getLabel = async (
    labelId: string
): Promise<Label> => {
    const res = await api.get(
        `/Labels/${labelId}`
    );

    return res.data.data;
};

/*
 * ==========================================
 * CREATE LABEL
 * ==========================================
 */

export const createLabel = async (
    data: CreateLabelRequest
): Promise<Label> => {
    const res = await api.post(
        "/Labels",
        data
    );

    return res.data.data;
};

/*
 * ==========================================
 * UPDATE LABEL
 * ==========================================
 */

export const updateLabel = async (
    id: string,
    data: UpdateLabelRequest
): Promise<Label> => {
    const response = await api.patch(
        `/Labels/${id}/update`,
        data
    );

    return response.data.data;
};

/*
 * ==========================================
 * DELETE LABEL
 * ==========================================
 */

export const deleteLabel = async (
    labelId: string
) => {
    const res = await api.delete(
        `/Labels/${labelId}`
    );

    return res.data.data;
};

/*
 * ==========================================
 * GET LABELS FOR WORK ITEM
 * ==========================================
 */

export const getWorkItemLabels = async (
    workItemId: string
): Promise<WorkItemLabel[]> => {
    const res = await api.get(
        `/Labels/workitem/${workItemId}`
    );

    return res.data.data;
};

/*
 * ==========================================
 * ASSIGN LABEL TO WORK ITEM
 * ==========================================
 */

export const assignLabelToWorkItem = async (
    workItemId: string,
    labelId: string
) => {
    const res = await api.post(
        `/Labels/workitem/${workItemId}/label/${labelId}`
    );

    return res.data.data;
};

/*
 * ==========================================
 * REMOVE LABEL FROM WORK ITEM
 * ==========================================
 */

export const removeLabelFromWorkItem = async (
    workItemId: string,
    labelId: string
) => {
    const res = await api.delete(
        `/Labels/workitem/${workItemId}/label/${labelId}`
    );

    return res.data.data;
};