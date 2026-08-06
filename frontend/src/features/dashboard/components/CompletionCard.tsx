import { Card } from "@/components/ui/card";

export default function CompletionCard() {
    return (
        <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

            <h2 className="text-xl font-semibold">
                Completion Progress
            </h2>

            <p className="mt-6 text-slate-500">
                Coming in Sprint 6.3
            </p>

        </Card>
    );
}