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
 */
export default function EmptyStatePanel({ icon, title, description }: Props) {
    return (
        <EmptyState
            icon={icon}
            size="sm"
            title={title}
            description={description}
            className="py-10"
        />
    );
}
