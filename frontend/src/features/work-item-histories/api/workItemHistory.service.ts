import api from "@/lib/api";

export type WorkItemHistory = {
    id: string;
    userId: string;
    action: number;
    description: string;
    createdAt: string;
};

export const getWorkItemHistory = async (
    workItemId: string
): Promise<WorkItemHistory[]> => {
    const response = await api.get(
        `/WorkItemHistories/${workItemId}`
    );

    return response.data.data;
};