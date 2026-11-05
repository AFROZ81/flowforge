import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

type Props = {
    icon?: LucideIcon;
    title: string;
    description: string;
};

/**
 * An empty state sized to sit inside a DataSection, so a section never collapses
 * to a thin line when it has nothing in it.
 *
 * It also takes whatever height the card offers and centres itself in it.
 * Dashboard rows are a fixed height now, and an empty card that left its
 * message at the top with a slab of blank below would look like a bug rather
 * than like nothing. The floor is what makes that safe in a one-column layout:
 * a flex item grown from a zero basis has no height of its own to keep.
 */
export default function EmptyStatePanel({ icon, title, description }: Props) {
    return (
        <EmptyState
            icon={icon}
            size="sm"
            title={title}
            description={description}
            className="min-h-[9rem] flex-1"
        />
    );
}
