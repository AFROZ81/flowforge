import { Badge } from "@/components/ui/badge";

type Props = {
    archived?: boolean;
};

/**
 * Active / Archived, in the same soft tones used by work item status,
 * so a green chip means "finished, healthy" everywhere in the product.
 */
export default function ProjectStatusBadge({ archived }: Props) {
    return (
        <Badge variant={archived ? "softNeutral" : "softSuccess"}>
            {archived ? "Archived" : "Active"}
        </Badge>
    );
}
