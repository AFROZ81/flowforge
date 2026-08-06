import { CalendarDays, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardHero() {
    const hour = new Date().getHours();

    const greeting =
        hour < 12
            ? "Good Morning"
            : hour < 18
              ? "Good Afternoon"
              : "Good Evening";

    const today = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(new Date());

    return (
        <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <div className="flex items-center gap-2 text-slate-500">

                        <CalendarDays size={18} />

                        <span>{today}</span>

                    </div>

                    <h1 className="mt-4 text-4xl font-bold tracking-tight">
                        👋 {greeting}, Afroz
                    </h1>

                    <p className="mt-3 text-lg text-slate-500">
                        Welcome back! Here's what's happening across your workspace.
                    </p>

                </div>

                <Button
                    size="lg"
                    className="rounded-xl"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>

            </div>

        </Card>
    );
}