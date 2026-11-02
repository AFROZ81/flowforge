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


    /*
     * A dash is a *result*. While loading, show the tile's skeleton shape
     * instead of "..." so the row doesn't jump when numbers arrive.
     */

    const display = (value: number) =>
        loading ? "\u00A0" : error ? "\u2014" : value;

    /*
     * Project membership reads from organization membership because the
     * backend project model doesn't expose project-scoped members in the
     * supplied API contract.
     */
    const membersDisplay = usersLoading ? "\u00A0" : users.length;

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* ==========================================
                BOARDS
            =========================================== */}

            <div className={loading ? "animate-pulse" : undefined}>
                <StatCard
                    title="Boards"
                    value={display(stats.boards)}
                    subtitle="Active on this project"
                    icon={LayoutDashboard}
                    color="indigo"
                />
            </div>


            {/* ==========================================
                TASKS
            =========================================== */}

            <div className={loading ? "animate-pulse" : undefined}>
                <StatCard
                    title="Work Items"
                    value={display(stats.tasks)}
                    subtitle="Excluding archived"
                    icon={ClipboardList}
                    color="amber"
                />
            </div>


            {/* ==========================================
                COMPLETED
            =========================================== */}

            <div className={loading ? "animate-pulse" : undefined}>
                <StatCard
                    title="Completed"
                    value={display(stats.completed)}
                    subtitle={
                        stats.tasks > 0 && !loading && !error
                            ? `${Math.round((stats.completed / stats.tasks) * 100)}% of all work`
                            : "Finished work items"
                    }
                    icon={CheckCircle2}
                    color="emerald"
                />
            </div>


            {/* ==========================================
                MEMBERS
            =========================================== */}

            <div className={loading || usersLoading ? "animate-pulse" : undefined}>
                <StatCard
                    title="Members"
                    value={membersDisplay}
                    subtitle="In this workspace"
                    icon={Users}
                    color="purple"
                />
            </div>

        </div>
    );
}