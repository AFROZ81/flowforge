import { Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
    search: string;
    onSearch: (value: string) => void;
    onCreate: () => void;
};

export default function ProjectToolbar({
    search,
    onSearch,
    onCreate,
}: Props) {
    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="relative w-full md:max-w-sm">

                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                    value={search}
                    placeholder="Search projects..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="pl-10"
                />

            </div>

            <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
            </Button>

        </div>
    );
}