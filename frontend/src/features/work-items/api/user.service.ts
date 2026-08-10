import api from "@/lib/api";

import type {
    OrganizationUser,
} from "../types/user";

export const getOrganizationUsers =
    async (): Promise<OrganizationUser[]> => {
        const response =
            await api.get("/Users");

        return response.data.data;
    };