import {
    useParams,
} from "react-router";

import {
    Card,
} from "@/components/ui/card";

import {
    useProject,
} from "../hooks/useProject";

import ProjectHeader from "../components/ProjectHeader";
import ProjectStats from "../components/ProjectStats";

import BoardGrid from "@/features/boards/components/BoardGrid";

import RecentActivity from "../components/RecentActivity";


export default function ProjectDetailsPage() {

    const {
        id,
    } =
        useParams();


    const {
        data: project,
        isLoading,
        isError,
    } =
        useProject(
            id!
        );


    if (
        isLoading
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[60vh]
                    items-center
                    justify-center
                    p-6
                    text-sm
                    text-muted-foreground
                "
            >
                Loading project...
            </div>
        );

    }


    if (
        isError ||
        !project
    ) {

        return (
            <div
                className="
                    flex
                    min-h-[60vh]
                    items-center
                    justify-center
                    p-6
                "
            >

                <Card
                    className="
                        p-8
                        text-center
                    "
                >

                    <h2
                        className="
                            text-lg
                            font-semibold
                        "
                    >
                        Project not found
                    </h2>


                    <p
                        className="
                            mt-2
                            text-sm
                            text-muted-foreground
                        "
                    >
                        The project may have been deleted or you may not have access to it.
                    </p>

                </Card>

            </div>
        );

    }


    return (
        <div
            className="
                space-y-8
                p-6
            "
        >

            {/* =================================================
                PROJECT HEADER
            ================================================= */}

            <ProjectHeader
                project={
                    project
                }
            />


            {/* =================================================
                LIVE PROJECT STATS
            ================================================= */}

            <ProjectStats
                projectId={
                    project.id
                }
            />


            {/* =================================================
                BOARDS
            ================================================= */}

            <section
                className="
                    space-y-6
                "
            >

                <BoardGrid
                    projectId={
                        project.id
                    }
                />

            </section>


            {/* =================================================
                RECENT ACTIVITY
            ================================================= */}

            <RecentActivity
                projectId={
                    project.id
                }
            />


            {/* =================================================
                PROJECT INFORMATION
            ================================================= */}

            <Card
                className="
                    space-y-6
                    p-6
                "
            >

                <div>

                    <h2
                        className="
                            font-semibold
                        "
                    >
                        Description
                    </h2>


                    <p
                        className="
                            mt-2
                            text-sm
                            leading-6
                            text-muted-foreground
                        "
                    >
                        {
                            project.description ||
                            "No description"
                        }
                    </p>

                </div>


                <div
                    className="
                        grid
                        gap-6
                        sm:grid-cols-2
                    "
                >

                    {/* STATUS */}

                    <div>

                        <p
                            className="
                                text-sm
                                text-muted-foreground
                            "
                        >
                            Status
                        </p>


                        <p
                            className="
                                mt-1
                                font-medium
                            "
                        >
                            {
                                project.archived
                                    ? "Archived"
                                    : "Active"
                            }
                        </p>

                    </div>


                    {/* COLOR */}

                    <div>

                        <p
                            className="
                                text-sm
                                text-muted-foreground
                            "
                        >
                            Color
                        </p>


                        <div
                            className="
                                mt-2
                                h-6
                                w-6
                                rounded-full
                                border
                            "
                            style={{
                                backgroundColor:
                                    project.color,
                            }}
                        />

                    </div>

                </div>

            </Card>

        </div>
    );
}