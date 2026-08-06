import api from "@/lib/api";

export type CreateProjectRequest = {
    name: string;
    key: string;
    description?: string;
    color: string;
    icon?: string;
};

export const getProjects = async () => {
    const res = await api.get("/Projects");
    return res.data.data.items;
};

export const createProject = async (
    data: CreateProjectRequest
) => {
    const res = await api.post("/Projects", data);
    return res.data.data;
};