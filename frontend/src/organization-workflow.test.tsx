import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    OrganizationMembership,
    OrganizationProfile,
} from "@/features/organizations/types/organization.types";

const mocks = vi.hoisted(() => ({
    auth: {
        isAuthenticated: true,
        user: {
            id: "self-user",
            organizationId: "org-1" as string | null,
            role: "Admin",
        },
        login: vi.fn(),
        logout: vi.fn(),
        switchOrganization: vi.fn(),
    },
    organizations: [] as OrganizationMembership[],
    profile: null as OrganizationProfile | null,
    members: [] as Array<{
        userId: string;
        fullName: string;
        email: string;
        role: number;
        isOwner: boolean;
    }>,
    invitation: null as null | {
        email: string;
        organizationName: string;
        role: string;
        isAccepted: boolean;
    },
    search: "",
    location: { pathname: "/onboarding", search: "" },
    navigate: vi.fn(),
    invalidate: vi.fn(),
}));

vi.mock("react-router", () => ({
    useNavigate: () => mocks.navigate,
    useSearchParams: () => [new URLSearchParams(mocks.search)],
    useLocation: () => mocks.location,
    Navigate: ({ to }: { to: string }) => <div data-redirect={to} />,
    Outlet: () => <div data-outlet="true" />,
}));

vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
    useMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/stores/auth.store", () => ({
    useAuthStore: (selector?: (state: typeof mocks.auth) => unknown) =>
        selector ? selector(mocks.auth) : mocks.auth,
}));

vi.mock("@/components/layout/Logo", () => ({
    default: () => <div>FlowForge</div>,
}));

vi.mock("@/features/organizations/components/CreateOrganizationForm", () => ({
    default: () => <div data-create-form="true">Create workspace form</div>,
}));

vi.mock("@/features/settings/components/MembersSettings", () => ({
    default: ({ isAdmin }: { isAdmin?: boolean }) => (
        <div data-members-admin={String(isAdmin)}>Members</div>
    ),
}));

vi.mock("@/components/common/confirm", () => ({
    useConfirm: () => vi.fn().mockResolvedValue(true),
}));

vi.mock("@/features/settings/hooks/useInvitations", () => ({
    useInvitationDetails: () => ({
        data: mocks.invitation,
        isLoading: false,
        isError: false,
    }),
    useAcceptInvitation: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useMembers: () => ({ data: mocks.members }),
}));

vi.mock("@/features/organizations/hooks/useOrganizations", () => {
    const mutation = () => ({ isPending: false, mutateAsync: vi.fn() });

    return {
        useMyOrganizations: () => ({
            data: mocks.organizations,
            isLoading: false,
            isPending: false,
            isFetching: false,
            error: null,
            refetch: vi.fn(),
        }),
        useOrganizationProfile: () => ({
            data: mocks.profile,
            isPending: false,
            error: null,
            refetch: vi.fn(),
        }),
        useCreateOrganization: mutation,
        useUpdateOrganization: mutation,
        useTransferOwnership: mutation,
        useLeaveOrganization: mutation,
        useArchiveOrganization: mutation,
        useRestoreOrganization: mutation,
        useDeleteOrganization: mutation,
    };
});

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <button>{children}</button>,
    DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuSeparator: () => null,
}));

import OnboardingPage from "@/features/organizations/pages/OnboardingPage";
import OrganizationSettings from "@/features/organizations/components/OrganizationSettings";
import OrgSwitcher from "@/components/layout/OrgSwitcher";
import AuthCard from "@/features/auth/components/AuthCard";
import ProtectedRoute from "@/routes/ProtectedRoute";

const activeMembership: OrganizationMembership = {
    id: "org-1",
    name: "Acme Studio",
    slug: "acme-studio",
    logoUrl: null,
    role: "Admin",
    isActive: true,
    isOwner: true,
};

beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.user.organizationId = "org-1";
    mocks.auth.user.role = "Admin";
    mocks.organizations = [];
    mocks.profile = null;
    mocks.members = [];
    mocks.invitation = null;
    mocks.search = "";
    mocks.location = { pathname: "/onboarding", search: "" };
});

describe("organization onboarding", () => {
    it("offers workspace creation and invitation acceptance without a public directory", () => {
        const markup = renderToStaticMarkup(<OnboardingPage />);

        expect(markup).toContain("Set up your workspace");
        expect(markup).toContain("Create workspace form");
        expect(markup).toContain("Accept an invitation");
        expect(markup).toContain("Private by default");
        expect(markup).toContain("Invite your teammates");
        expect(markup).not.toContain("<select");
        expect(markup).not.toContain("Organizations/options");
    });

    it("shows restore and terminal delete actions only for archived owned workspaces", () => {
        mocks.organizations = [{ ...activeMembership, isActive: false }];
        mocks.auth.user.organizationId = null;

        const markup = renderToStaticMarkup(<OnboardingPage />);

        expect(markup).toContain("Archived workspaces");
        expect(markup).toContain("Acme Studio");
        expect(markup).toContain("Restore");
        expect(markup).toContain("Delete");
    });

    it("lets an account resume a valid active membership instead of looping", () => {
        mocks.organizations = [activeMembership];
        mocks.auth.user.organizationId = "stale-org";

        const markup = renderToStaticMarkup(<OnboardingPage />);

        expect(markup).toContain("Choose a workspace");
        expect(markup).toContain("Open workspace");
        expect(markup).toContain("Acme Studio");
    });

    it("shows invitation details for authenticated invitation acceptance", () => {
        mocks.search = "?invitationToken=invite-token";
        mocks.invitation = {
            email: "ada@example.com",
            organizationName: "Analytical Engines",
            role: "Member",
            isAccepted: false,
        };

        const markup = renderToStaticMarkup(<OnboardingPage />);

        expect(markup).toContain("Analytical Engines");
        expect(markup).toContain("ada@example.com");
        expect(markup).toContain("Accept invitation");
    });
});

describe("invitation authentication", () => {
    it("allows an existing invitee to sign in without losing the invitation token", () => {
        mocks.search = "?mode=signin&invitationToken=invite-token";

        const markup = renderToStaticMarkup(<AuthCard />);

        expect(markup).toContain("Welcome Back");
        expect(markup).not.toContain("Create your account");
    });
});

describe("workspace switcher", () => {
    it("renders database-backed names and roles instead of raw organization IDs", () => {
        mocks.organizations = [activeMembership];

        const markup = renderToStaticMarkup(<OrgSwitcher />);

        expect(markup).toContain("Acme Studio");
        expect(markup).toContain("Admin");
        expect(markup).toContain("Create workspace");
        expect(markup).not.toContain("org-1");
    });
});

describe("organization settings permissions", () => {
    it("enables profile, ownership, and archive controls for an Owner/Admin", () => {
        mocks.profile = { ...activeMembership, description: "Build useful things" };

        const markup = renderToStaticMarkup(<OrganizationSettings />);

        expect(markup).toContain("Acme Studio");
        expect(markup).toContain("Edit");
        expect(markup).toContain("Transfer ownership");
        expect(markup).toContain("Archive organization");
        expect(markup).not.toContain("Save changes");
        expect(markup).toContain("data-members-admin=\"true\"");
        expect(markup).not.toContain("Leave organization");
    });

    it("hides admin controls and allows leave for a Member", () => {
        mocks.auth.user.role = "Member";
        mocks.profile = {
            ...activeMembership,
            role: "Member",
            isOwner: false,
            description: null,
        };

        const markup = renderToStaticMarkup(<OrganizationSettings />);

        expect(markup).toContain("Leave organization");
        expect(markup).toContain("data-members-admin=\"false\"");
        expect(markup).not.toContain("Save changes");
        expect(markup).not.toContain("Transfer ownership");
        expect(markup).not.toContain("Archive organization");
    });
});

describe("database-backed organization route guard", () => {
    it("redirects a stale organization session to onboarding", () => {
        mocks.location = { pathname: "/dashboard", search: "" };
        mocks.auth.user.organizationId = "removed-org";
        mocks.organizations = [activeMembership];

        const markup = renderToStaticMarkup(<ProtectedRoute />);

        expect(markup).toContain("data-redirect=\"/onboarding\"");
    });

    it("redirects an account without membership to onboarding", () => {
        mocks.location = { pathname: "/dashboard", search: "" };
        mocks.auth.user.organizationId = null;

        const markup = renderToStaticMarkup(<ProtectedRoute />);

        expect(markup).toContain("data-redirect=\"/onboarding\"");
    });

    it("keeps invitation onboarding available to an active member", () => {
        mocks.organizations = [activeMembership];
        mocks.location = {
            pathname: "/onboarding",
            search: "?invitationToken=invite-token",
        };

        const markup = renderToStaticMarkup(<ProtectedRoute />);

        expect(markup).not.toContain("data-redirect");
        expect(markup).toContain("data-outlet=\"true\"");
    });
});
