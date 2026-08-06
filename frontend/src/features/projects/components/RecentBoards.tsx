import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RecentBoards() {
    return (
        <Card className="rounded-3xl p-6">

            <div className="flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                    Recent Boards
                </h2>

                <Button>
                    Create Board
                </Button>

            </div>

            <div className="mt-8 text-center text-slate-500">

                No boards yet.

            </div>

        </Card>
    );
}