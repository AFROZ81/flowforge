import {
    ArrowRight,
    Plus,
} from "lucide-react";

import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";


function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 17) {
        return "Good afternoon";
    }

    return "Good evening";
}


export default function DashboardHero() {
    const navigate = useNavigate();
    const greeting = getGreeting();

    return (
        <section
            className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                px-8
                py-8
                shadow-sm
            "
        >

            {/* Decorative background */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -right-24
                    -top-24
                    h-64
                    w-64
                    rounded-full
                    bg-blue-50
                    blur-3xl
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    -bottom-32
                    right-1/3
                    h-56
                    w-56
                    rounded-full
                    bg-indigo-50
                    blur-3xl
                "
            />


            {/* Main content */}

            <div
                className="
                    relative
                    flex
                    flex-col
                    gap-6
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >

                {/* Left content */}

                <div className="min-w-0">

                    {/* Greeting */}

                    <h1
                        className="
                            text-2xl
                            font-bold
                            tracking-tight
                            text-slate-900
                            sm:text-3xl
                        "
                    >
                        👋 {greeting}
                    </h1>


                    {/* Description */}

                    <p
                        className="
                            mt-2
                            max-w-2xl
                            text-sm
                            leading-6
                            text-slate-500
                            sm:text-base
                        "
                    >
                        Here's what's happening across your
                        FlowForge workspace.
                    </p>

                </div>


                {/* New Project action */}

                <div className="shrink-0">

                    <Button
                        type="button"
                        size="lg"
                        onClick={() => navigate("/projects")}
                        className="
                            h-11
                            rounded-xl
                            px-5
                            shadow-sm
                        "
                    >

                        <Plus
                            className="
                                mr-2
                                h-4
                                w-4
                            "
                        />

                        New Project

                        <ArrowRight
                            className="
                                ml-2
                                h-4
                                w-4
                            "
                        />

                    </Button>

                </div>

            </div>

        </section>
    );
}