import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import DetailLayout from "@/layouts/DetailLayout";
import { PageHeader } from "@/components/ui/page-header";
import PillNav from "@/components/ui/pill-nav";
import {
    paramsWith,
    parseParam,
    searchWith,
} from "@/lib/query-params";

import LabelManagement from "@/features/labels/components/LabelManagement";

import GeneralSettings from "../components/GeneralSettings";
import MembersSettings from "../components/MembersSettings";

type SettingsSection = "general" | "members" | "labels";

type SectionDefinition = {
    id: SettingsSection;
    label: string;
    title: string;
    description?: string;
};

const SECTIONS: SectionDefinition[] = [
    {
        id: "general",
        label: "General",
        title: "General",
    },
    {
        id: "members",
        label: "Members",
        title: "Members",
    },
    {
        id: "labels",
        label: "Labels",
        title: "Labels",
    },
];

const SECTION_IDS = SECTIONS.map((section) => section.id);
const DEFAULT_SECTION: SettingsSection = "general";

export default function SettingsPage() {
    const [params, setParams] = useSearchParams();

    /*
     * Which panel is open lives in the URL, so a refresh, a back press or a
     * pasted link lands on the same section. Anything unrecognised falls back to
     * General and is then removed from the address bar rather than left there
     * claiming a section the page is not showing.
     */
    const { value: section, invalid } = parseParam<SettingsSection>(
        params.get("section"),
        SECTION_IDS,
        DEFAULT_SECTION
    );

    useEffect(() => {
        if (!invalid) {
            return;
        }

        setParams((current) => paramsWith(current, { section: null }), {
            replace: true,
        });
    }, [invalid, setParams]);

    const active =
        SECTIONS.find((entry) => entry.id === section) ?? SECTIONS[0];

    return (
        <DetailLayout>
            <div className="space-y-6">
                <PageHeader
                    back={
                        /*
                         * The page carries no top bar, so this is the only way back
                         * besides the browser control. Deterministic to the dashboard
                         * rather than navigate(-1), which would bounce somebody who
                         * arrived from the account menu straight out of Settings.
                         */
                        <Link
                            to="/dashboard"
                            className="
                                inline-flex h-8 items-center gap-1.5 rounded-lg -mx-2 px-2
                                text-[13px] font-medium text-muted-foreground
                                transition-colors hover:bg-surface-muted hover:text-foreground
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
                            "
                        >
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Dashboard
                        </Link>
                    }
                    title="Settings"
                    toolbar={
                        <PillNav
                            ariaLabel="Settings sections"
                            active={section}
                            items={SECTIONS.map((entry) => ({
                                id: entry.id,
                                label: entry.label,
                                href: searchWith(params, {
                                    section:
                                        entry.id === DEFAULT_SECTION
                                            ? null
                                            : entry.id,
                                }),
                            }))}
                        />
                    }
                />

                <section
                    aria-label={active.title}
                    className="min-h-[50vh] space-y-4"
                >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-3">
                        <h2 className="text-lg font-semibold text-foreground">
                            {active.title}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {active.description}
                        </p>
                    </div>

                    {section === "general" ? <GeneralSettings /> : null}
                    {section === "members" ? <MembersSettings /> : null}
                    {section === "labels" ? <LabelManagement /> : null}
                </section>
            </div>
        </DetailLayout>
    );
}
