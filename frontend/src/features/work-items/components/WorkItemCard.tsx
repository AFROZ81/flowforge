import { Card } from "@/components/ui/card";

type WorkItem = {
    id: string;
    title: string;
    description?: string | null;
    priority: number;
    status: number;
    displayOrder: number;
    dueDate?: string | null;
    isArchived: boolean;
    assigneeId?: string | null;
};

type OrganizationUser = {
    id: string;
    fullName: string;
    email?: string | null;
};

type Props = {
    item: WorkItem;
    users?: OrganizationUser[];
    onClick?: () => void;
};

function formatDueDate(
    dueDate?: string | null
) {
    if (!dueDate) {
        return null;
    }

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
}

function getStatusLabel(
    status: number
) {
    switch (status) {
        case 1:
            return "Active";

        case 2:
            return "Completed";

        case 3:
            return "Blocked";

        default:
            return "Unknown";
    }
}

function getStatusClassName(
    status: number
) {
    switch (status) {
        case 1:
            return `
                border-blue-200
                bg-blue-50
                text-blue-700
            `;

        case 2:
            return `
                border-green-200
                bg-green-50
                text-green-700
            `;

        case 3:
            return `
                border-red-200
                bg-red-50
                text-red-700
            `;

        default:
            return `
                border-muted
                bg-muted
                text-muted-foreground
            `;
    }
}

export default function WorkItemCard({
    item,
    users = [],
    onClick,
}: Props) {
    const dueDate =
        formatDueDate(
            item.dueDate
        );

    const assignee =
        item.assigneeId
            ? users.find(
                  (user) =>
                      user.id ===
                      item.assigneeId
              )
            : undefined;

    const statusLabel =
        getStatusLabel(
            item.status
        );

    const statusClassName =
        getStatusClassName(
            item.status
        );

    return (
        <Card
            draggable
            onClick={onClick}
            className="
                cursor-pointer
                p-3
                transition
                hover:shadow-md
            "
        >

            {/* =========================
                HEADER
            ========================== */}

            <div className="flex items-start justify-between gap-3">

                <h4 className="min-w-0 font-medium">
                    {item.title}
                </h4>

                <div className="flex shrink-0 items-center gap-1.5">

                    {/* Status */}

                    <span
                        className={`
                            rounded-full
                            border
                            px-2
                            py-1
                            text-[11px]
                            font-medium
                            ${statusClassName}
                        `}
                    >
                        {statusLabel}
                    </span>

                    {/* Priority */}

                    <span className="
                        rounded-full
                        bg-muted
                        px-2
                        py-1
                        text-[11px]
                        font-medium
                    ">
                        P{item.priority}
                    </span>

                </div>

            </div>


            {/* =========================
                DESCRIPTION
            ========================== */}

            {item.description && (
                <p className="
                    mt-2
                    text-sm
                    text-muted-foreground
                ">
                    {item.description}
                </p>
            )}


            {/* =========================
                DUE DATE
            ========================== */}

            {dueDate && (
                <p className="
                    mt-3
                    text-xs
                    text-muted-foreground
                ">
                    Due: {dueDate}
                </p>
            )}


            {/* =========================
                ASSIGNEE
            ========================== */}

            {assignee && (
                <div className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    border-t
                    pt-3
                ">

                    {/* Avatar */}

                    <div className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-muted
                        text-xs
                        font-medium
                    ">
                        {assignee.fullName
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                    </div>


                    {/* User Details */}

                    <div className="min-w-0">

                        <p className="
                            truncate
                            text-xs
                            font-medium
                        ">
                            {assignee.fullName}
                        </p>

                        {assignee.email && (
                            <p className="
                                truncate
                                text-[11px]
                                text-muted-foreground
                            ">
                                {assignee.email}
                            </p>
                        )}

                    </div>

                </div>
            )}

        </Card>
    );
}