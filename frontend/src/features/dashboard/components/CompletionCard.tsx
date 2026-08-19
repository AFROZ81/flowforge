import {
    AlertCircle,
    CheckCircle2,
    CircleDot,
    FolderKanban,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { useProjectProgress } from "../hooks/useProjectProgress";


function getProgressWidth(
    value: number
) {

    if (
        !Number.isFinite(value)
    ) {
        return 0;
    }

    return Math.min(
        100,
        Math.max(
            0,
            value
        )
    );
}


export default function CompletionCard() {

    const {
        data,
        isLoading,
        error,
    } = useProjectProgress();


    if (isLoading) {

        return (
            <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

                <div className="animate-pulse space-y-6">

                    <div className="h-6 w-48 rounded bg-slate-200" />

                    {Array.from({
                        length: 3,
                    }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="space-y-3"
                            >
                                <div className="h-4 w-40 rounded bg-slate-200" />

                                <div className="h-2 rounded-full bg-slate-200" />
                            </div>
                        )
                    )}

                </div>

            </Card>
        );
    }


    if (
        error ||
        !data
    ) {

        return (
            <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

                <div className="flex items-center gap-3 text-red-600">

                    <AlertCircle className="h-5 w-5" />

                    <span className="font-medium">
                        Failed to load project progress.
                    </span>

                </div>

            </Card>
        );
    }


    const projects =
        Array.isArray(data.data)
            ? data.data
            : [];


    return (
        <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="mb-7 flex items-center justify-between">

                <div>

                    <h2 className="text-xl font-semibold">
                        Project Progress
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Completion across your projects
                    </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

                    <FolderKanban className="h-5 w-5" />

                </div>

            </div>


            {projects.length === 0 ? (

                <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-500">

                    No project progress available.

                </div>

            ) : (

                <div className="space-y-7">

                    {projects.map(
                        (project) => {

                            const progress =
                                getProgressWidth(
                                    project.completionPercentage
                                );


                            return (
                                <div
                                    key={
                                        project.projectId
                                    }
                                    className="space-y-3"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex min-w-0 items-center gap-3">

                                            <div
                                                className="h-9 w-9 shrink-0 rounded-xl"
                                                style={{
                                                    backgroundColor:
                                                        project.color
                                                            ? `${project.color}18`
                                                            : "#f1f5f9",
                                                    color:
                                                        project.color ??
                                                        "#64748b",
                                                }}
                                            >
                                                <div className="flex h-full items-center justify-center text-xs font-bold">
                                                    {
                                                        project.projectKey
                                                            ?.slice(
                                                                0,
                                                                3
                                                            )
                                                            .toUpperCase()
                                                    }
                                                </div>
                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {
                                                        project.projectName
                                                    }
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {
                                                        project.projectKey
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <span className="shrink-0 text-sm font-semibold text-slate-700">

                                            {
                                                project.completionPercentage
                                            }%

                                        </span>

                                    </div>


                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width:
                                                    `${progress}%`,

                                                backgroundColor:
                                                    project.color ??
                                                    "#2563eb",
                                            }}
                                        />

                                    </div>


                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">

                                        <span className="flex items-center gap-1">

                                            <CircleDot className="h-3 w-3" />

                                            {
                                                project.activeWorkItems
                                            } active

                                        </span>

                                        <span className="flex items-center gap-1">

                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />

                                            {
                                                project.completedWorkItems
                                            } completed

                                        </span>

                                        <span className="flex items-center gap-1">

                                            <AlertCircle className="h-3 w-3 text-red-500" />

                                            {
                                                project.blockedWorkItems
                                            } blocked

                                        </span>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>
            )}

        </Card>
    );
}