import { describe, expect, it } from "vitest";

import { isAdminRole, isMemberRole } from "./auth-roles";

describe("role helpers", () => {
    it("recognizes current and legacy admin role claims", () => {
        expect(isAdminRole("Admin")).toBe(true);
        expect(isAdminRole("admin")).toBe(true);
        expect(isAdminRole("1")).toBe(true);
        expect(isAdminRole("Member")).toBe(false);
        expect(isAdminRole(null)).toBe(false);
    });

    it("allows members and admins but excludes viewers", () => {
        expect(isMemberRole("Member")).toBe(true);
        expect(isMemberRole("member")).toBe(true);
        expect(isMemberRole("2")).toBe(true);
        expect(isMemberRole("Admin")).toBe(true);
        expect(isMemberRole("Viewer")).toBe(false);
        expect(isMemberRole(null)).toBe(false);
    });
});
