import { useQuery } from "@tanstack/react-query";

import {
    getOrganizationUsers,
} from "../api/user.service";

import type {
    OrganizationUser,
} from "../types/user";

export function useOrganizationUsers() {
    return useQuery<OrganizationUser[]>({
        queryKey: [
            "organization-users",
        ],

        queryFn:
            getOrganizationUsers,

        staleTime:
            5 * 60 * 1000,
    });
}