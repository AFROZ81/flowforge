import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";

import { useWorkItemDistribution } from "../hooks/useWorkItemDistribution";

export default function WorkItemStatus() {
    const { data, isLoading, error } = useWorkItemDistribution();

    if (isLoading) {
        return (
            <Card className="rounded-2xl p-6">
                Loading...
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="rounded-2xl p-6">
                Failed to load.
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-semibold">
                Work Item Status
            </h2>

            <div className="space-y-5">

                {data.data.byStatus.map((item) => (

                    <div key={item.name}>

                        <div className="mb-2 flex justify-between text-sm">

                            <span className="font-medium">
                                {item.name}
                            </span>

                            <span className="text-slate-500">
                                {item.count}
                                {" • "}
                                {item.percentage}%
                            </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${item.percentage}%`,
                                }}
                                transition={{
                                    duration: 0.8,
                                }}
                                className="h-full rounded-full bg-blue-600"
                            />

                        </div>

                    </div>

                ))}

            </div>

        </Card>
    );
}