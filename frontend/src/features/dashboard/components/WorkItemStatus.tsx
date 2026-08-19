import { motion } from "framer-motion";

import {
    AlertCircle,
    CheckCircle2,
    CircleDot,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { useWorkItemDistribution } from "../hooks/useWorkItemDistribution";


function getStatusConfig(
    status: string
) {

    switch (
        status.toLowerCase()
    ) {

        case "completed":

            return {
                icon: CheckCircle2,
                bar: "bg-emerald-500",
                iconClass:
                    "text-emerald-500",
            };


        case "blocked":

            return {
                icon: AlertCircle,
                bar: "bg-red-500",
                iconClass:
                    "text-red-500",
            };


        case "active":

            return {
                icon: CircleDot,
                bar: "bg-blue-600",
                iconClass:
                    "text-blue-600",
            };


        case "in progress":

            return {
                icon: CircleDot,
                bar: "bg-blue-600",
                iconClass:
                    "text-blue-600",
            };


        default:

            return {
                icon: CircleDot,
                bar: "bg-slate-500",
                iconClass:
                    "text-slate-500",
            };
    }
}


export default function WorkItemStatus() {

    const {
        data,
        isLoading,
        error,
    } = useWorkItemDistribution();


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

                                <div className="h-4 w-full rounded bg-slate-200" />

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

                    <span>
                        Failed to load work item status.
                    </span>

                </div>

            </Card>
        );
    }


    const items =
        data.data?.byStatus ?? [];


    return (
        <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="mb-7">

                <h2 className="text-xl font-semibold">
                    Work Item Status
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Current distribution of work items
                </p>

            </div>


            {items.length === 0 ? (

                <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-500">

                    No work item status data available.

                </div>

            ) : (

                <div className="space-y-6">

                    {items.map(
                        (item) => {

                            const config =
                                getStatusConfig(
                                    item.name
                                );


                            const Icon =
                                config.icon;


                            return (
                                <div
                                    key={
                                        item.name
                                    }
                                >

                                    <div className="mb-2 flex items-center justify-between">

                                        <div className="flex items-center gap-2">

                                            <Icon
                                                className={`h-4 w-4 ${config.iconClass}`}
                                            />

                                            <span className="text-sm font-medium">

                                                {
                                                    item.name
                                                }

                                            </span>

                                        </div>


                                        <span className="text-sm text-slate-500">

                                            {
                                                item.count
                                            }

                                            {" • "}

                                            {
                                                item.percentage
                                            }%

                                        </span>

                                    </div>


                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                                        <motion.div
                                            initial={{
                                                width: 0,
                                            }}
                                            animate={{
                                                width:
                                                    `${item.percentage}%`,
                                            }}
                                            transition={{
                                                duration:
                                                    0.8,
                                                ease:
                                                    "easeOut",
                                            }}
                                            className={`h-full rounded-full ${config.bar}`}
                                        />

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