import {
    LayoutDashboard,
    CheckCircle2,
    ClipboardList,
    Users,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";

export default function ProjectStats() {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
                title="Boards"
                value={0}
                subtitle="Boards"
                icon={LayoutDashboard}
                color="indigo"
            />

            <StatCard
                title="Tasks"
                value={0}
                subtitle="Work Items"
                icon={ClipboardList}
                color="amber"
            />

            <StatCard
                title="Completed"
                value={0}
                subtitle="Completed"
                icon={CheckCircle2}
                color="emerald"
            />

            <StatCard
                title="Members"
                value={1}
                subtitle="Workspace Members"
                icon={Users}
                color="purple"
            />

        </div>
    );
}