import {
    useEffect,
    useState,
} from "react";

import {
    LayoutDashboard,
    CheckCircle2,
    ClipboardList,
    Users,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";

import {
    getBoards,
} from "@/features/boards/api/board.service";

import {
    getBoardDetails,
} from "@/features/boards/api/boardDetails.service";

import {
    useOrganizationUsers,
} from "@/features/work-items/hooks/useOrganizationUsers";


type Props = {
    projectId: string;
};


type ProjectStatsData = {
    boards: number;
    tasks: number;
    completed: number;
};


export default function ProjectStats({
    projectId,
}: Props) {

    const [
        stats,
        setStats,
    ] =
        useState<ProjectStatsData>({
            boards: 0,
            tasks: 0,
            completed: 0,
        });


    const [
        loading,
        setLoading,
    ] =
        useState(true);


    const [
        error,
        setError,
    ] =
        useState(false);


    const {
        data: users = [],
        isLoading:
            usersLoading,
    } =
        useOrganizationUsers();


    useEffect(() => {

        let cancelled = false;


        const loadStats =
            async () => {

                if (!projectId) {
                    return;
                }


                try {

                    setLoading(
                        true
                    );

                    setError(
                        false
                    );


                    /*
                     * ==========================================
                     * LOAD PROJECT BOARDS
                     * ==========================================
                     */

                    const boards =
                        await getBoards(
                            projectId
                        );


                    if (
                        cancelled
                    ) {
                        return;
                    }


                    /*
                     * ==========================================
                     * LOAD BOARD DETAILS
                     *
                     * Board details already contains:
                     *
                     * Board
                     *   └── Columns
                     *         └── Work Items
                     * ==========================================
                     */

                    const boardDetails =
                        await Promise.all(
                            boards.map(
                                board =>
                                    getBoardDetails(
                                        board.id
                                    )
                            )
                        );


                    if (
                        cancelled
                    ) {
                        return;
                    }


                    let totalTasks =
                        0;

                    let completedTasks =
                        0;


                    for (
                        const board
                        of boardDetails
                    ) {

                        for (
                            const column
                            of board.columns ??
                            []
                        ) {

                            for (
                                const workItem
                                of column.workItems ??
                                []
                            ) {

                                /*
                                 * Don't count deleted/
                                 * archived work items as
                                 * active project work.
                                 */

                                if (
                                    workItem.isArchived
                                ) {
                                    continue;
                                }


                                totalTasks +=
                                    1;


                                if (
                                    Number(
                                        workItem.status
                                    ) === 2
                                ) {

                                    completedTasks +=
                                        1;
                                }
                            }
                        }
                    }


                    setStats({
                        boards:
                            boards.filter(
                                board =>
                                    !board.archived
                            ).length,

                        tasks:
                            totalTasks,

                        completed:
                            completedTasks,
                    });

                } catch (loadError) {

                    if (
                        cancelled
                    ) {
                        return;
                    }


                    console.error(
                        "Failed to load project statistics:",
                        loadError
                    );


                    setError(
                        true
                    );

                } finally {

                    if (
                        !cancelled
                    ) {

                        setLoading(
                            false
                        );
                    }
                }
            };


        void loadStats();


        return () => {

            cancelled = true;

        };

    }, [
        projectId,
    ]);


    const completedDisplay =
        loading
            ? "..."
            : error
                ? "—"
                : stats.completed;


    const tasksDisplay =
        loading
            ? "..."
            : error
                ? "—"
                : stats.tasks;


    const boardsDisplay =
        loading
            ? "..."
            : error
                ? "—"
                : stats.boards;


    /*
     * Project membership currently uses
     * organization membership because the
     * backend project model does not expose
     * project-specific members in the supplied
     * API contract.
     */

    const membersDisplay =
        usersLoading
            ? "..."
            : users.length;


    return (
        <div
            className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-4
            "
        >

            {/* ==========================================
                BOARDS
            =========================================== */}

            <StatCard
                title="Boards"
                value={
                    boardsDisplay
                }
                subtitle="Boards"
                icon={
                    LayoutDashboard
                }
                color="indigo"
            />


            {/* ==========================================
                TASKS
            =========================================== */}

            <StatCard
                title="Tasks"
                value={
                    tasksDisplay
                }
                subtitle="Work Items"
                icon={
                    ClipboardList
                }
                color="amber"
            />


            {/* ==========================================
                COMPLETED
            =========================================== */}

            <StatCard
                title="Completed"
                value={
                    completedDisplay
                }
                subtitle="Completed"
                icon={
                    CheckCircle2
                }
                color="emerald"
            />


            {/* ==========================================
                MEMBERS
            =========================================== */}

            <StatCard
                title="Members"
                value={
                    membersDisplay
                }
                subtitle="Workspace Members"
                icon={
                    Users
                }
                color="purple"
            />

        </div>
    );
}