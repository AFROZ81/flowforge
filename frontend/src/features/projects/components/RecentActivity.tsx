import { Card } from "@/components/ui/card";

export default function RecentActivity() {
    return (
        <Card className="rounded-3xl p-6">

            <h2 className="text-xl font-semibold">
                Recent Activity
            </h2>

            <div className="mt-8 text-slate-500">

                No activity yet.

            </div>

        </Card>
    );
}