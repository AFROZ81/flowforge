import {
    useState,
} from "react";

import {
    toast,
} from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Button,
} from "@/components/ui/button";

import {
    useWorkItem,
} from "../hooks/useWorkItem";

import {
    useOrganizationUsers,
} from "../hooks/useOrganizationUsers";

import {
    useArchiveWorkItem,
} from "../hooks/useArchiveWorkItem";

import {
    useRestoreWorkItem,
} from "../hooks/useRestoreWorkItem";

import {
    useCompleteWorkItem,
} from "../hooks/useCompleteWorkItem";

import {
    useBlockWorkItem,
} from "../hooks/useBlockWorkItem";

import {
    useActivateWorkItem,
} from "../hooks/useActivateWorkItem";

import ChecklistSection from "@/features/checklists/components/ChecklistSection";

import WorkItemHistory from "@/features/work-item-histories/components/WorkItemHistory";

import EditWorkItemDialog from "./EditWorkItemDialog";

type Props = {
    open: boolean;

    onOpenChange: (
        open: boolean
    ) => void;

    workItemId: string | null;
};

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

function getStatusClasses(
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
                border-gray-200
                bg-gray-50
                text-gray-700
            `;
    }
}

function formatDueDate(
    value?: string | null
) {
    if (!value) {
        return null;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

export default function WorkItemDetailsDialog({
    open,
    onOpenChange,
    workItemId,
}: Props) {
    const [
        editOpen,
        setEditOpen,
    ] = useState(false);

    const {
        data: workItem,
        isLoading,
        isError,
    } =
        useWorkItem(
            workItemId ?? ""
        );

    const {
        data: users = [],
    } =
        useOrganizationUsers();

    const archiveMutation =
        useArchiveWorkItem();

    const restoreMutation =
        useRestoreWorkItem();

    const completeMutation =
        useCompleteWorkItem();

    const blockMutation =
        useBlockWorkItem();

    const activateMutation =
        useActivateWorkItem();

    const isSaving =
        archiveMutation.isPending ||
        restoreMutation.isPending ||
        completeMutation.isPending ||
        blockMutation.isPending ||
        activateMutation.isPending;

    /*
     * ========================================
     * COMPLETE
     * ========================================
     */

    const handleComplete =
        async () => {
            if (!workItemId) {
                return;
            }

            try {
                await completeMutation.mutateAsync(
                    workItemId
                );

                toast.success(
                    "Work Item completed."
                );

                onOpenChange(false);
            } catch (error) {
                console.error(
                    error
                );

                toast.error(
                    "Failed to complete Work Item."
                );
            }
        };

    /*
     * ========================================
     * BLOCK
     * ========================================
     */

    const handleBlock =
        async () => {
            if (!workItemId) {
                return;
            }

            try {
                await blockMutation.mutateAsync(
                    workItemId
                );

                toast.success(
                    "Work Item blocked."
                );

                onOpenChange(false);
            } catch (error) {
                console.error(
                    error
                );

                toast.error(
                    "Failed to block Work Item."
                );
            }
        };

    /*
     * ========================================
     * ACTIVATE
     * ========================================
     */

    const handleActivate =
        async () => {
            if (!workItemId) {
                return;
            }

            try {
                await activateMutation.mutateAsync(
                    workItemId
                );

                toast.success(
                    "Work Item activated."
                );

                onOpenChange(false);
            } catch (error) {
                console.error(
                    error
                );

                toast.error(
                    "Failed to activate Work Item."
                );
            }
        };

    /*
     * ========================================
     * ARCHIVE
     * ========================================
     */

    const handleArchive =
        async () => {
            if (!workItemId) {
                return;
            }

            try {
                await archiveMutation.mutateAsync(
                    workItemId
                );

                toast.success(
                    "Work Item archived."
                );

                onOpenChange(false);
            } catch (error) {
                console.error(
                    error
                );

                toast.error(
                    "Failed to archive Work Item."
                );
            }
        };

    /*
     * ========================================
     * RESTORE
     * ========================================
     */

    const handleRestore =
        async () => {
            if (!workItemId) {
                return;
            }

            try {
                await restoreMutation.mutateAsync(
                    workItemId
                );

                toast.success(
                    "Work Item restored."
                );

                onOpenChange(false);
            } catch (error) {
                console.error(
                    error
                );

                toast.error(
                    "Failed to restore Work Item."
                );
            }
        };

    const statusLabel =
        workItem
            ? getStatusLabel(
                Number(workItem.status)
              )
            : "";

    const statusClasses =
        workItem
            ? getStatusClasses(
                Number(workItem.status)
              )
            : "";

    const dueDate =
        workItem
            ? formatDueDate(
                  workItem.dueDate
              )
            : null;

    const assignee =
        workItem?.assigneeId
            ? users.find(
                  (user) =>
                      user.id ===
                      workItem.assigneeId
              )
            : undefined;

    return (
        <>
            <Dialog
                open={
                    open &&
                    !editOpen
                }
                onOpenChange={
                    onOpenChange
                }
            >
                <DialogContent
                    className="
                        max-h-[90vh]
                        overflow-y-auto
                        sm:max-w-2xl
                    "
                >
                    <DialogHeader>
                        <div className="
                            flex
                            flex-col
                            gap-2
                            pr-8
                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                            sm:gap-4
                            sm:pr-10
                        ">
                            <div className="min-w-0">
                                <DialogTitle>
                                    {workItem?.title ??
                                        "Work Item"}
                                </DialogTitle>

                                <DialogDescription>
                                    Work item details and activity.
                                </DialogDescription>
                            </div>

                            {workItem && (
                                <span
                                    className={`
                                        w-fit
                                        shrink-0
                                        rounded-full
                                        border
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        ${statusClasses}
                                    `}
                                >
                                    {statusLabel}
                                </span>
                            )}
                        </div>
                    </DialogHeader>

                    {isLoading && (
                        <div className="
                            py-10
                            text-center
                            text-sm
                            text-muted-foreground
                        ">
                            Loading work item...
                        </div>
                    )}

                    {isError && (
                        <div className="
                            py-10
                            text-center
                            text-sm
                            text-red-500
                        ">
                            Failed to load work item.
                        </div>
                    )}

                    {workItem &&
                        !isLoading &&
                        !isError && (
                            <div className="
                                space-y-5
                            ">

                                {/* =========================
                                    BASIC INFORMATION
                                ========================== */}

                                <div className="
                                    rounded-lg
                                    border
                                    p-4
                                ">
                                    <div className="
                                        grid
                                        gap-4
                                        sm:grid-cols-2
                                    ">

                                        <div>
                                            <p className="
                                                text-xs
                                                text-muted-foreground
                                            ">
                                                Priority
                                            </p>

                                            <p className="
                                                mt-1
                                                text-sm
                                                font-medium
                                            ">
                                                P
                                                {
                                                    workItem.priority
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="
                                                text-xs
                                                text-muted-foreground
                                            ">
                                                Due Date
                                            </p>

                                            <p className="
                                                mt-1
                                                text-sm
                                                font-medium
                                            ">
                                                {
                                                    dueDate ??
                                                    "No due date"
                                                }
                                            </p>
                                        </div>

                                        <div className="
                                            sm:col-span-2
                                        ">
                                            <p className="
                                                text-xs
                                                text-muted-foreground
                                            ">
                                                Description
                                            </p>

                                            <p className="
                                                mt-1
                                                whitespace-pre-wrap
                                                text-sm
                                            ">
                                                {
                                                    workItem.description ||
                                                    "No description."
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="
                                                text-xs
                                                text-muted-foreground
                                            ">
                                                Assignee
                                            </p>

                                            <p className="
                                                mt-1
                                                text-sm
                                                font-medium
                                            ">
                                                {
                                                    assignee?.fullName ??
                                                    "Unassigned"
                                                }
                                            </p>

                                            {assignee?.email && (
                                                <p className="
                                                    text-xs
                                                    text-muted-foreground
                                                ">
                                                    {
                                                        assignee.email
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="
                                                text-xs
                                                text-muted-foreground
                                            ">
                                                Status
                                            </p>

                                            <p className="
                                                mt-1
                                                text-sm
                                                font-medium
                                            ">
                                                {
                                                    statusLabel
                                                }
                                            </p>
                                        </div>

                                    </div>
                                </div>

                                {/* =========================
                                    CHECKLIST
                                ========================== */}

                                <div>
                                    <div className="
                                        mb-2
                                        flex
                                        items-center
                                        justify-between
                                    ">
                                        <h3 className="
                                            text-sm
                                            font-semibold
                                        ">
                                            Checklist
                                        </h3>
                                    </div>

                                    <ChecklistSection
                                        workItemId={
                                            workItem.id
                                        }
                                        disabled={
                                            workItem.isArchived
                                        }
                                    />
                                </div>

                                {/* =========================
                                    ACTIVITY
                                ========================== */}

                                <div>
                                    <div className="
                                        mb-2
                                        flex
                                        items-center
                                        justify-between
                                    ">
                                        <h3 className="
                                            text-sm
                                            font-semibold
                                        ">
                                            Activity
                                        </h3>
                                    </div>

                                    <WorkItemHistory
                                        workItemId={
                                            workItem.id
                                        }
                                        users={
                                            users
                                        }
                                    />
                                </div>

                                {/* =========================
                                    ACTIONS
                                ========================== */}

                                <div className="
                                    flex
                                    flex-col
                                    gap-3
                                    border-t
                                    pt-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                ">

                                    {/* STATUS ACTIONS */}

                                    <div className="
                                        flex
                                        flex-wrap
                                        gap-2
                                    ">
                                        {!workItem.isArchived &&
                                            Number(workItem.status) !==
                                                2 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="
                                                        border-green-200
                                                        text-green-700
                                                        hover:bg-green-50
                                                    "
                                                    onClick={
                                                        handleComplete
                                                    }
                                                    disabled={
                                                        isSaving
                                                    }
                                                >
                                                    {
                                                        completeMutation.isPending
                                                            ? "Completing..."
                                                            : "Complete"
                                                    }
                                                </Button>
                                            )}

                                        {!workItem.isArchived &&
                                            Number(workItem.status) !==
                                                3 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="
                                                        border-amber-200
                                                        text-amber-700
                                                        hover:bg-amber-50
                                                    "
                                                    onClick={
                                                        handleBlock
                                                    }
                                                    disabled={
                                                        isSaving
                                                    }
                                                >
                                                    {
                                                        blockMutation.isPending
                                                            ? "Blocking..."
                                                            : "Block"
                                                    }
                                                </Button>
                                            )}

                                        {!workItem.isArchived &&
                                            Number(workItem.status) !==
                                                1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="
                                                        border-blue-200
                                                        text-blue-700
                                                        hover:bg-blue-50
                                                    "
                                                    onClick={
                                                        handleActivate
                                                    }
                                                    disabled={
                                                        isSaving
                                                    }
                                                >
                                                    {
                                                        activateMutation.isPending
                                                            ? "Activating..."
                                                            : "Activate"
                                                    }
                                                </Button>
                                            )}

                                        {workItem.isArchived ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={
                                                    handleRestore
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                            >
                                                {
                                                    restoreMutation.isPending
                                                        ? "Restoring..."
                                                        : "Restore"
                                                }
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={
                                                    handleArchive
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                            >
                                                {
                                                    archiveMutation.isPending
                                                        ? "Archiving..."
                                                        : "Archive"
                                                }
                                            </Button>
                                        )}
                                    </div>

                                    {/* EDIT / CLOSE */}

                                    <div className="
                                        flex
                                        gap-2
                                    ">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                onOpenChange(
                                                    false
                                                )
                                            }
                                        >
                                            Close
                                        </Button>

                                        {!workItem.isArchived && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    setEditOpen(
                                                        true
                                                    )
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                            >
                                                Edit Work Item
                                            </Button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        )}
                </DialogContent>
            </Dialog>

            {/* =========================================
                EDIT DIALOG
            ========================================== */}

            <EditWorkItemDialog
                open={
                    editOpen
                }
                onOpenChange={(
                    value
                ) => {
                    setEditOpen(
                        value
                    );

                    if (!value) {
                        onOpenChange(
                            true
                        );
                    }
                }}
                workItem={
                    workItem ?? null
                }
            />
        </>
    );
}