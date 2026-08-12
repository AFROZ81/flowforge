import { useState } from "react";
import { useNavigate } from "react-router";

import LabelManagement from "@/features/labels/components/LabelManagement";

type SettingsSection = "general" | "members" | "labels";

export default function SettingsPage() {
    const navigate = useNavigate();

    const [activeSection, setActiveSection] =
        useState<SettingsSection>("labels");

    const navItemClass = (section: SettingsSection) =>
        `flex w-full items-center rounded-lg px-4 py-3 text-left text-sm transition ${
            activeSection === section
                ? "bg-blue-50 font-medium text-blue-600"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`;

    return (
        <div className="min-h-[calc(100vh-48px)] bg-[#f8fafc]">
            <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1500px] gap-8 px-6 py-8 lg:px-8">

                {/* =====================================================
                    SETTINGS SIDEBAR
                ====================================================== */}
                <aside className="w-[240px] shrink-0">
                    <div className="sticky top-6">

                        {/* Back to Dashboard */}
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="mb-7 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                            <span className="text-base">
                                ←
                            </span>

                            <span>
                                Back to Dashboard
                            </span>
                        </button>

                        {/* Settings Heading */}
                        <div className="mb-7 px-2">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                                Settings
                            </h1>

                            <p className="mt-1.5 text-sm text-gray-500">
                                Manage your workspace.
                            </p>
                        </div>

                        {/* Settings Navigation */}
                        <nav className="space-y-1">

                            {/* General */}
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveSection("general")
                                }
                                className={navItemClass("general")}
                            >
                                <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-sm">
                                    ⚙
                                </span>

                                <span>
                                    General
                                </span>
                            </button>

                            {/* Members */}
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveSection("members")
                                }
                                className={navItemClass("members")}
                            >
                                <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-sm">
                                    👥
                                </span>

                                <span>
                                    Members
                                </span>
                            </button>

                            {/* Labels */}
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveSection("labels")
                                }
                                className={navItemClass("labels")}
                            >
                                <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-sm">
                                    🏷
                                </span>

                                <span>
                                    Labels
                                </span>
                            </button>

                        </nav>
                    </div>
                </aside>

                {/* =====================================================
                    MAIN CONTENT
                ====================================================== */}
                <main className="min-w-0 flex-1">

                    {/* =================================================
                        GENERAL
                    ================================================== */}
                    {activeSection === "general" && (
                        <section className="min-h-[calc(100vh-112px)] rounded-2xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-200 px-7 py-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    General
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    General workspace settings.
                                </p>
                            </div>

                            <div className="p-7">
                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
                                    <p className="text-sm font-medium text-gray-600">
                                        General settings coming soon.
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Workspace configuration will appear
                                        here.
                                    </p>
                                </div>
                            </div>

                        </section>
                    )}

                    {/* =================================================
                        MEMBERS
                    ================================================== */}
                    {activeSection === "members" && (
                        <section className="min-h-[calc(100vh-112px)] rounded-2xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-200 px-7 py-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Members
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Manage workspace members and
                                    permissions.
                                </p>
                            </div>

                            <div className="p-7">
                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
                                    <p className="text-sm font-medium text-gray-600">
                                        Member management coming soon.
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Workspace members and permissions
                                        will appear here.
                                    </p>
                                </div>
                            </div>

                        </section>
                    )}

                    {/* =================================================
                        LABELS
                    ================================================== */}
                    {activeSection === "labels" && (
                        <section className="min-h-[calc(100vh-112px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <LabelManagement />
                        </section>
                    )}

                </main>
            </div>
        </div>
    );
}