export function isAdminRole(role?: string | null): boolean {
    return role === "1" || role?.toLowerCase() === "admin";
}

export function isMemberRole(role?: string | null): boolean {
    return isAdminRole(role) || role === "2" || role?.toLowerCase() === "member";
}
