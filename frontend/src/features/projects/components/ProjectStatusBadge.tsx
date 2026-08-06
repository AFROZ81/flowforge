import { Badge } from "@/components/ui/badge";

type Props = {
    archived?: boolean;
};

export default function ProjectStatusBadge({
    archived,
}: Props) {
    return archived ? (
        <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-700"
        >
            Archived
        </Badge>
    ) : (
        <Badge
            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
        >
            Active
        </Badge>
    );
}