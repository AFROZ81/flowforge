import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

type Color =
    | "indigo"
    | "emerald"
    | "amber"
    | "purple";

type Props = {
    title: string;
    value: number | string;
    subtitle: string;
    icon: LucideIcon;
    color: Color;
};

const colors = {
    indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
    },
    emerald: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
    },
    amber: {
        bg: "bg-amber-50",
        text: "text-amber-600",
    },
    purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
    },
};

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}: Props) {
    const theme = colors[color];

    return (
        <Card className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <h2 className="mt-3 text-4xl font-bold tracking-tight">
                        {value}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        {subtitle}
                    </p>

                </div>

                <div className={`rounded-2xl p-4 ${theme.bg}`}>
                    <Icon
                        size={30}
                        className={theme.text}
                    />
                </div>

            </div>

        </Card>
    );
}