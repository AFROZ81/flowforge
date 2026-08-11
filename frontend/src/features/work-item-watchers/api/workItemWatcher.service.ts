import api from "@/lib/api";

import type {
    AddWorkItemWatcherRequest,
    WorkItemWatcher,
} from "../types/workItemWatcher";

export const getWorkItemWatchers = async (
    workItemId: string
): Promise<WorkItemWatcher[]> => {
    const res = await api.get(
        `/WorkItemWatchers/${workItemId}`
    );

    return res.data.data;
};

export const addWorkItemWatcher = async (
    data: AddWorkItemWatcherRequest
) => {
    const res = await api.post(
        "/WorkItemWatchers",
        data
    );

    return res.data.data;
};

export const removeWorkItemWatcher = async (
    watcherId: string
) => {
    const res = await api.delete(
        `/WorkItemWatchers/${watcherId}`
    );

    return res.data.data;
};