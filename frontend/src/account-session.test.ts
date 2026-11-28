import { describe, expect, it } from "vitest";

import { toOrganizationSlug } from "@/features/auth/lib/organization-slug";
import { registerSchema } from "@/features/auth/validation/register.schema";
import { getUserFromToken } from "@/stores/auth.store";

function tokenWith(payload: Record<string, unknown>): string {
    const encoded = btoa(JSON.stringify(payload))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

    return `header.${encoded}.signature`;
}

describe("account-first authentication", () => {
    it("decodes account identity without trusting organization claims", () => {
        const user = getUserFromToken(tokenWith({
            nameid: "user-1",
            fullName: "Ada Lovelace",
            email: "ada@example.com",
            sessionState: "account",
            orgIds: ["stale-organization"],
        }));

        expect(user).toEqual({
            id: "user-1",
            fullName: "Ada Lovelace",
            email: "ada@example.com",
            organizationId: null,
            role: null,
        });
    });

    it("decodes the current organization and role for session routing", () => {
        const user = getUserFromToken(tokenWith({
            nameid: "user-1",
            organizationId: "organization-1",
            membershipId: "membership-1",
            tokenVersion: "3",
            role: "Admin",
        }));

        expect(user.organizationId).toBe("organization-1");
        expect(user.role).toBe("Admin");
    });

    it("keeps normal registration free of organization fields", () => {
        const values = registerSchema.parse({
            fullName: "Ada Lovelace",
            email: "ada@example.com",
            password: "Analytical1",
            confirmPassword: "Analytical1",
        });

        expect(values).not.toHaveProperty("organizationId");
        expect(values).not.toHaveProperty("organizationName");
    });

    it("derives a stable workspace slug after authentication", () => {
        expect(toOrganizationSlug("  FlowForge Studio  ")).toBe("flowforge-studio");
        expect(toOrganizationSlug("A!")).toBe("workspace-a");
    });
});
