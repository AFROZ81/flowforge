import api from "@/lib/api";

export type CreateProjectRequest = {
    name: string;
    key: string;
    description?: string;
    color: string;
    icon?: string;
};

/**
 * The controller rejects a PUT whose body id does not match the route id, so
 * `projectId` travels in both places rather than in one.
 */
export type UpdateProjectRequest = CreateProjectRequest & {
    projectId: string;
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

export const updateProject = async (data: UpdateProjectRequest) => {
    const res = await api.put(`/Projects/${data.projectId}`, data);
    return res.data.data;
};

/**
 * Archive and restore take the id on the route only — the controller builds the
 * command itself, so an empty body is correct here, not an oversight.
 *
 * Archiving hides the project from the list rather than deleting anything, and
 * `PATCH /Projects/{id}/restore` puts it back.
 */
export const archiveProject = async (projectId: string) => {
    const res = await api.patch(`/Projects/${projectId}/archive`);
    return res.data.data;
};

export const restoreProject = async (projectId: string) => {
    const res = await api.patch(`/Projects/${projectId}/restore`);
    return res.data.data;
};