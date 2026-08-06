import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Pencil,
    Archive,
    ArrowLeft,
} from "lucide-react";
import { Link } from "react-router";

import type { Project } from "../types/project";

type Props = {
    project: Project;
};

export default function ProjectHeader({
    project,
}: Props) {
    return (
        <div className="space-y-6">

            <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
            >
                <ArrowLeft size={16} />
                Projects
            </Link>

            <div className="flex items-start justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <h1 className="text-4xl font-bold">
                            {project.name}
                        </h1>

                        <Badge>
                            {project.archived
                                ? "Archived"
                                : "Active"}
                        </Badge>

                    </div>

                    <p className="mt-3 text-slate-500">
                        {project.description}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                        {project.key}
                    </p>

                </div>

                <div className="flex gap-3">

                    <Button
                        variant="outline"
                    >
                        <Pencil
                            size={16}
                            className="mr-2"
                        />
                        Edit
                    </Button>

                    <Button
                        variant="outline"
                    >
                        <Archive
                            size={16}
                            className="mr-2"
                        />
                        Archive
                    </Button>

                </div>

            </div>

        </div>
    );
}