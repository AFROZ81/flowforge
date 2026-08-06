import api from "@/lib/api";

import type { ProjectResponse } from "../types/project";

export async function getProjects() {
    const response =
        await api.get<ProjectResponse>("/Projects");

    return response.data;
}