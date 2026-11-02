import {
    useEffect,
    useRef,
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
    Skeleton,
    SkeletonPanel,
} from "@/components/ui/skeleton";

import { ErrorState } from "@/components/ui/error-state";

import {
    Avatar,
} from "@/components/ui/avatar";

import {
    useConfirm,
} from "@/components/common/confirm";

import {
    normalizeError,
} from "@/lib/errors";

import {
    DueDateChip,
    WorkItemPriorityBadge,
    WorkItemStatusBadge,
} from "@/components/common/indicators";

import {
    Download,
    FileArchive,
    FileImage,
    FileText,
    FileVideo,
    File as FileIcon,
    Loader2,
    Paperclip,
    Trash2,
    Upload,
} from "lucide-react";

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

import ReminderSection from "@/features/reminders/components/ReminderSection";

import {
    getAttachmentsByWorkItem,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
} from "@/features/attachments/services/attachment.service";

import type {
    Attachment,
} from "@/features/attachments/types/attachment";

import EditWorkItemDialog from "./EditWorkItemDialog";


type Props = {
    open: boolean;

    onOpenChange: (
        open: boolean
    ) => void;

    workItemId: string | null;
};


/* =========================================================
   STATUS / DATE RENDERING
   Moved to components/common/indicators so this dialog, the
   board card and any future table can't drift apart.
========================================================= */


/* =========================================================
   ATTACHMENT HELPERS
========================================================= */

function formatFileSize(
    bytes: number
): string {

    if (
        bytes === 0
    ) {
        return "0 Bytes";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB",
        "TB",
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const value =
        bytes /
        Math.pow(
            1024,
            index
        );


    return `${value.toFixed(
        index === 0
            ? 0
            : 1
    )} ${units[index]}`;
}


function formatAttachmentDate(
    dateString: string
): string {

    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return new Intl.DateTimeFormat(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    ).format(date);
}


function getAttachmentIcon(
    contentType: string
) {

    if (
        contentType.startsWith(
            "image/"
        )
    ) {
        return FileImage;
    }


    if (
        contentType.startsWith(
            "video/"
        )
    ) {
        return FileVideo;
    }


    if (
        contentType.includes(
            "pdf"
        ) ||
        contentType.includes(
            "text"
        ) ||
        contentType.includes(
            "word"
        )
    ) {
        return FileText;
    }


    if (
        contentType.includes(
            "zip"
        ) ||
        contentType.includes(
            "compressed"
        ) ||
        contentType.includes(
            "archive"
        )
    ) {
        return FileArchive;
    }


    return FileIcon;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function WorkItemDetailsDialog({
    open,
    onOpenChange,
    workItemId,
}: Props) {

    const [
        editOpen,
        setEditOpen,
    ] = useState(false);


    /* =====================================================
       WORK ITEM
    ===================================================== */

    const {
        data: workItem,
        isLoading,
        isError,
        error,
        refetch,
    } =
        useWorkItem(
            workItemId ?? ""
        );


    /* =====================================================
       ORGANIZATION USERS
    ===================================================== */

    const {
        data: users = [],
    } =
        useOrganizationUsers();


    /* =====================================================
       WORK ITEM MUTATIONS
    ===================================================== */

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


    /* =====================================================
       ATTACHMENT STATE
    ===================================================== */

    const [
        attachments,
        setAttachments,
    ] =
        useState<Attachment[]>(
            []
        );


    const [
        attachmentsLoading,
        setAttachmentsLoading,
    ] =
        useState(false);


    const [
        uploading,
        setUploading,
    ] =
        useState(false);


    const [
        uploadProgress,
        setUploadProgress,
    ] =
        useState(0);


    const [
        uploadingFileName,
        setUploadingFileName,
    ] =
        useState<string | null>(
            null
        );


    const [
        deletingAttachmentId,
        setDeletingAttachmentId,
    ] =
        useState<string | null>(
            null
        );


    const fileInputRef =
        useRef<HTMLInputElement | null>(
            null
        );


    /* =====================================================
       LOAD ATTACHMENTS
    ===================================================== */

    const loadAttachments =
        async () => {

            if (!workItemId) {
                return;
            }


            try {

                setAttachmentsLoading(
                    true
                );


                const result =
                    await getAttachmentsByWorkItem(
                        workItemId
                    );


                setAttachments(
                    result
                );

            } catch (error) {

                console.error(
                    "Failed to load attachments:",
                    error
                );


                toast.error(
                    "Failed to load attachments."
                );

            } finally {

                setAttachmentsLoading(
                    false
                );
            }
        };


    useEffect(() => {

        if (
            open &&
            workItemId
        ) {

            void loadAttachments();

        }


        if (!open) {

            setAttachments(
                []
            );


            setUploading(
                false
            );


            setUploadProgress(
                0
            );


            setUploadingFileName(
                null
            );

        }

    }, [
        open,
        workItemId,
    ]);


    /* =====================================================
       COMPLETE
    ===================================================== */

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


                onOpenChange(
                    false
                );

            } catch (error) {

                console.error(
                    error
                );


                toast.error(
                    "Failed to complete Work Item."
                );
            }
        };


    /* =====================================================
       BLOCK
    ===================================================== */

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


                onOpenChange(
                    false
                );

            } catch (error) {

                console.error(
                    error
                );


                toast.error(
                    "Failed to block Work Item."
                );
            }
        };


    /* =====================================================
       ACTIVATE
    ===================================================== */

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


                onOpenChange(
                    false
                );

            } catch (error) {

                console.error(
                    error
                );


                toast.error(
                    "Failed to activate Work Item."
                );
            }
        };


    /* =====================================================
       ARCHIVE
    ===================================================== */

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


                onOpenChange(
                    false
                );

            } catch (error) {

                console.error(
                    error
                );


                toast.error(
                    "Failed to archive Work Item."
                );
            }
        };


    /* =====================================================
       RESTORE
    ===================================================== */

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


                onOpenChange(
                    false
                );

            } catch (error) {

                console.error(
                    error
                );


                toast.error(
                    "Failed to restore Work Item."
                );
            }
        };


    /* =====================================================
       UPLOAD
    ===================================================== */

    const handleFileSelection =
        async (
            event: React.ChangeEvent<HTMLInputElement>
        ) => {

            const files =
                event.target.files;


            if (
                !files ||
                files.length === 0 ||
                !workItemId
            ) {
                return;
            }


            try {

                setUploading(
                    true
                );


                const selectedFiles =
                    Array.from(
                        files
                    );


                for (
                    const file
                    of selectedFiles
                ) {

                    setUploadingFileName(
                        file.name
                    );


                    setUploadProgress(
                        0
                    );


                    await uploadAttachment(
                        workItemId,
                        file,
                        (
                            percentage
                        ) => {

                            setUploadProgress(
                                percentage
                            );

                        }
                    );

                }


                toast.success(
                    selectedFiles.length === 1
                        ? "Attachment uploaded successfully."
                        : `${selectedFiles.length} attachments uploaded successfully.`
                );


                await loadAttachments();

            } catch (error) {

                console.error(
                    "Failed to upload attachment:",
                    error
                );


                toast.error(
                    "Failed to upload attachment."
                );

            } finally {

                setUploading(
                    false
                );


                setUploadProgress(
                    0
                );


                setUploadingFileName(
                    null
                );


                if (
                    fileInputRef.current
                ) {

                    fileInputRef.current.value =
                        "";

                }

            }
        };


    /* =====================================================
       DOWNLOAD
    ===================================================== */

    const handleDownload =
        async (
            attachment: Attachment
        ) => {

            try {

                await downloadAttachment(
                    attachment.id,
                    attachment.fileName
                );

            } catch (error) {

                console.error(
                    "Failed to download attachment:",
                    error
                );


                toast.error(
                    "Failed to download attachment."
                );
            }
        };


    /* =====================================================
       DELETE ATTACHMENT
    ===================================================== */

    const handleDelete =
        async (
            attachment: Attachment
        ) => {

            const confirmed = await confirm({
                title: `Delete “${attachment.fileName}”?`,
                description:
                    "The file is removed from this work item for everyone. This can't be undone.",
                confirmLabel: "Delete file",
                tone: "destructive",
            });


            if (
                !confirmed
            ) {
                return;
            }


            try {

                setDeletingAttachmentId(
                    attachment.id
                );


                await deleteAttachment(
                    attachment.id
                );


                setAttachments(
                    current =>
                        current.filter(
                            item =>
                                item.id !==
                                attachment.id
                        )
                );


                toast.success("Attachment deleted", {
                    description: attachment.fileName,
                });

            } catch (error) {

                console.error(
                    "Failed to delete attachment:",
                    error
                );

                const { title, description } = normalizeError(error, {
                    title: "We couldn't delete that file",
                });

                toast.error(title, { description });

            } finally {

                setDeletingAttachmentId(
                    null
                );

            }
        };


    /* =====================================================
       ASSIGNEE
    ===================================================== */

    const confirm = useConfirm();

    const assignee =
        workItem?.assigneeId
            ? users.find(
                user =>
                    user.id ===
                    workItem.assigneeId
              )
            : undefined;


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <>

            {/* =================================================
                DETAILS DIALOG
            ================================================= */}

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
                        max-h-[92dvh] gap-0 px-0 pb-0 sm:max-w-3xl lg:max-w-4xl
                        sm:px-5 sm:pb-5
                    "
                >

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <DialogHeader>

                        <div
                            className="
                                flex
                                flex-col
                                gap-2
                                pr-8
                                sm:flex-row
                                sm:items-start
                                sm:justify-between
                                sm:gap-4
                                sm:pr-10
                            "
                        >

                            <div
                                className="
                                    min-w-0
                                "
                            >

                                <DialogTitle>
                                    {
                                        workItem?.title ??
                                        "Work Item"
                                    }
                                </DialogTitle>


                                <DialogDescription>
                                    Work item details and activity.
                                </DialogDescription>

                            </div>


                            {workItem && (
                                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                    <WorkItemStatusBadge
                                        status={workItem.status}
                                    />
                                    <WorkItemPriorityBadge
                                        priority={workItem.priority}
                                        compact
                                    />
                                </div>
                            )}

                        </div>

                    </DialogHeader>


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {isLoading && (
                        <div className="space-y-4 px-4 py-4 sm:px-0" role="status" aria-live="polite">
                            <span className="sr-only">
                                Loading work item
                            </span>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 rounded-lg" />
                                ))}
                            </div>

                            <SkeletonPanel height="h-28" />
                            <SkeletonPanel height="h-40" />
                        </div>
                    )}


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {isError && (
                        <ErrorState
                            error={error}
                            title="We couldn't open this work item"
                            description="It may have been archived or deleted by someone else."
                            action={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void refetch()}
                                >
                                    Try again
                                </Button>
                            }
                            className="my-4"
                        />
                    )}


                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    {workItem &&
                        !isLoading &&
                        !isError && (

                            <div
                                className="
                                    space-y-5 px-4 pb-5
                                    sm:px-0 sm:pb-0
                                "
                            >

                                {/* =================================================
                                    BASIC INFORMATION
                                ================================================= */}

                                <section
                                    aria-label="Work item overview"
                                    className="
                                        rounded-xl border border-border
                                        bg-surface-muted/50 p-4
                                    "
                                >

                                    <div
                                        className="
                                            grid
                                            gap-4
                                            sm:grid-cols-2
                                            lg:grid-cols-4
                                        "
                                    >

                                        {/* PRIORITY */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Priority
                                            </p>


                                            <p className="mt-1.5">
                                                <WorkItemPriorityBadge
                                                    priority={workItem.priority}
                                                />
                                            </p>

                                        </div>


                                        {/* DUE DATE */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Due Date
                                            </p>


                                            <p className="mt-1.5">
                                                <DueDateChip
                                                    dueDate={workItem.dueDate}
                                                    completed={
                                                        Number(workItem.status) === 2
                                                    }
                                                    prefix={null}
                                                />

                                                {!workItem.dueDate && (
                                                    <span className="text-sm text-muted-foreground">
                                                        No due date
                                                    </span>
                                                )}
                                            </p>

                                        </div>


                                        {/* ASSIGNEE */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Assignee
                                            </p>


                                            <div className="mt-1.5 flex items-center gap-2">
                                                {assignee ? (
                                                    <>
                                                        <Avatar
                                                            name={assignee.fullName}
                                                            size="sm"
                                                        />

                                                        <span className="min-w-0">
                                                            <span className="block truncate text-sm font-medium text-foreground">
                                                                {assignee.fullName}
                                                            </span>

                                                            {assignee.email && (
                                                                <span className="block truncate text-xs leading-tight text-muted-foreground">
                                                                    {assignee.email}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </div>

                                        </div>


                                        {/* STATUS */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Status
                                            </p>


                                            <p className="mt-1.5">
                                                <WorkItemStatusBadge
                                                    status={workItem.status}
                                                />
                                            </p>

                                        </div>

                                    </div>


                                    {/* DESCRIPTION — full width under the metadata */}

                                    <div className="mt-4 border-t border-border-subtle pt-4">

                                        <p
                                            className="
                                                text-xs
                                                text-muted-foreground
                                            "
                                        >
                                            Description
                                        </p>


                                        <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                                            {
                                                workItem.description ||
                                                "No description yet."
                                            }
                                        </p>

                                    </div>

                                </section>


                                {/* =================================================
                                    ATTACHMENTS
                                ================================================= */}

                                <div>

                                    <div
                                        className="
                                            mb-3
                                            flex
                                            items-center
                                            justify-between
                                            gap-3
                                        "
                                    >

                                        <div>

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    text-sm
                                                    font-semibold
                                                "
                                            >

                                                <Paperclip
                                                    className="
                                                        size-4
                                                    "
                                                    aria-hidden="true"
                                                />

                                                <span>Attachments</span>

                                                <span className="rounded-full bg-surface-sunken px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
                                                    {attachments.length}
                                                </span>

                                            </div>


                                            <p
                                                className="
                                                    mt-0.5
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Files attached to this work item.
                                            </p>

                                        </div>


                                        <div>

                                            <input
                                                ref={
                                                    fileInputRef
                                                }
                                                type="file"
                                                multiple
                                                className="
                                                    hidden
                                                "
                                                onChange={
                                                    handleFileSelection
                                                }
                                                disabled={
                                                    uploading ||
                                                    workItem.isArchived
                                                }
                                            />


                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                disabled={
                                                    uploading ||
                                                    workItem.isArchived
                                                }
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                            >

                                                {uploading ? (

                                                    <Loader2
                                                        className="
                                                            mr-2
                                                            h-4
                                                            w-4
                                                            animate-spin
                                                        "
                                                    />

                                                ) : (

                                                    <Upload
                                                        className="
                                                            mr-2
                                                            h-4
                                                            w-4
                                                        "
                                                    />

                                                )}


                                                {
                                                    uploading
                                                        ? "Uploading..."
                                                        : "Add Files"
                                                }

                                            </Button>

                                        </div>

                                    </div>


                                    {/* UPLOAD PROGRESS */}

                                    {uploading && (

                                        <div
                                            className="
                                                mb-3
                                                rounded-lg
                                                border
                                                bg-muted/30
                                                p-3
                                            "
                                        >

                                            <div
                                                className="
                                                    mb-2
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-3
                                                "
                                            >

                                                <span
                                                    className="
                                                        min-w-0
                                                        truncate
                                                        text-xs
                                                        font-medium
                                                    "
                                                >
                                                    {
                                                        uploadingFileName
                                                    }
                                                </span>


                                                <span
                                                    className="
                                                        shrink-0
                                                        text-xs
                                                        text-muted-foreground
                                                    "
                                                >
                                                    {
                                                        uploadProgress
                                                    }%
                                                </span>

                                            </div>


                                            <div
                                                className="
                                                    h-1.5
                                                    overflow-hidden
                                                    rounded-full
                                                    bg-muted
                                                "
                                            >

                                                <div
                                                    className="
                                                        h-full
                                                        rounded-full
                                                        bg-primary
                                                        transition-all
                                                    "
                                                    style={{
                                                        width:
                                                            `${uploadProgress}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    )}


                                    {/* ATTACHMENTS LOADING */}

                                    {attachmentsLoading ? (

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-center
                                                rounded-lg
                                                border
                                                py-8
                                            "
                                        >

                                            <Loader2
                                                className="
                                                    mr-2
                                                    h-5
                                                    w-5
                                                    animate-spin
                                                    text-muted-foreground
                                                "
                                            />


                                            <span
                                                className="
                                                    text-sm
                                                    text-muted-foreground
                                                "
                                            >
                                                Loading attachments...
                                            </span>

                                        </div>

                                    ) : attachments.length === 0 ? (

                                        /* EMPTY */

                                        <div
                                            className="
                                                flex
                                                flex-col
                                                items-center
                                                justify-center
                                                rounded-lg
                                                border
                                                border-dashed
                                                px-4
                                                py-8
                                                text-center
                                            "
                                        >

                                            <div
                                                className="
                                                    mb-3
                                                    flex
                                                    h-10
                                                    w-10
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-muted
                                                "
                                            >

                                                <Paperclip
                                                    className="
                                                        h-5
                                                        w-5
                                                        text-muted-foreground
                                                    "
                                                />

                                            </div>


                                            <p
                                                className="
                                                    text-sm
                                                    font-medium
                                                "
                                            >
                                                No attachments yet
                                            </p>


                                            <p
                                                className="
                                                    mt-1
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Add files to keep everything
                                                related to this task together.
                                            </p>


                                            {!workItem.isArchived && (

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="mt-4"
                                                    disabled={
                                                        uploading
                                                    }
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                >

                                                    <Upload
                                                        className="
                                                            mr-2
                                                            h-4
                                                            w-4
                                                        "
                                                    />

                                                    Add Files

                                                </Button>

                                            )}

                                        </div>

                                    ) : (

                                        /* ATTACHMENT LIST */

                                        <div
                                            className="
                                                space-y-2
                                            "
                                        >

                                            {attachments.map(
                                                attachment => {

                                                    const Icon =
                                                        getAttachmentIcon(
                                                            attachment.contentType
                                                        );


                                                    const deleting =
                                                        deletingAttachmentId ===
                                                        attachment.id;


                                                    return (

                                                        <div
                                                            key={
                                                                attachment.id
                                                            }
                                                            className="
                                                                group
                                                                flex
                                                                items-center
                                                                gap-3
                                                                rounded-lg
                                                                border
                                                                p-3
                                                                transition-colors
                                                                hover:bg-muted/40
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    flex
                                                                    h-9
                                                                    w-9
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-md
                                                                    bg-primary/10
                                                                    text-primary
                                                                "
                                                            >

                                                                <Icon
                                                                    className="
                                                                        h-4
                                                                        w-4
                                                                    "
                                                                />

                                                            </div>


                                                            <div
                                                                className="
                                                                    min-w-0
                                                                    flex-1
                                                                "
                                                            >

                                                                <p
                                                                    className="
                                                                        truncate
                                                                        text-sm
                                                                        font-medium
                                                                    "
                                                                    title={
                                                                        attachment.fileName
                                                                    }
                                                                >
                                                                    {
                                                                        attachment.fileName
                                                                    }
                                                                </p>


                                                                <p
                                                                    className="
                                                                        mt-0.5
                                                                        text-xs
                                                                        text-muted-foreground
                                                                    "
                                                                >

                                                                    {
                                                                        formatFileSize(
                                                                            attachment.fileSize
                                                                        )
                                                                    }

                                                                    {" · "}

                                                                    {
                                                                        formatAttachmentDate(
                                                                            attachment.createdAt
                                                                        )
                                                                    }

                                                                </p>

                                                            </div>


                                                            <div
                                                                className="
                                                                    flex
                                                                    shrink-0
                                                                    items-center
                                                                    gap-1
                                                                "
                                                            >

                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="
                                                                        h-8
                                                                        w-8
                                                                    "
                                                                    title="Download"
                                                                    disabled={
                                                                        deleting
                                                                    }
                                                                    onClick={() =>
                                                                        void handleDownload(
                                                                            attachment
                                                                        )
                                                                    }
                                                                >

                                                                    <Download
                                                                        className="
                                                                            h-4
                                                                            w-4
                                                                        "
                                                                    />

                                                                </Button>


                                                                {!workItem.isArchived && (

                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="
                                                                            h-8
                                                                            w-8
                                                                            text-destructive
                                                                            hover:text-destructive
                                                                        "
                                                                        title="Delete"
                                                                        disabled={
                                                                            deleting
                                                                        }
                                                                        onClick={() =>
                                                                            void handleDelete(
                                                                                attachment
                                                                            )
                                                                        }
                                                                    >

                                                                        {deleting ? (

                                                                            <Loader2
                                                                                className="
                                                                                    h-4
                                                                                    w-4
                                                                                    animate-spin
                                                                                "
                                                                            />

                                                                        ) : (

                                                                            <Trash2
                                                                                className="
                                                                                    h-4
                                                                                    w-4
                                                                                "
                                                                            />

                                                                        )}

                                                                    </Button>

                                                                )}

                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    )}

                                </div>


                                {/* =================================================
                                    REMINDER
                                ================================================= */}

                                <ReminderSection
                                    workItemId={
                                        workItem.id
                                    }
                                    dueDate={
                                        workItem.dueDate
                                    }
                                    disabled={
                                        workItem.isArchived
                                    }
                                />


                                {/* =================================================
                                    CHECKLIST
                                ================================================= */}

                                <div>

                                    <div
                                        className="
                                            mb-2
                                            flex
                                            items-center
                                            justify-between
                                        "
                                    >

                                        <h3
                                            className="
                                                text-sm
                                                font-semibold
                                            "
                                        >
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


                                {/* =================================================
                                    ACTIVITY
                                ================================================= */}

                                <div>

                                    <div
                                        className="
                                            mb-2
                                            flex
                                            items-center
                                            justify-between
                                        "
                                    >

                                        <h3
                                            className="
                                                text-sm
                                                font-semibold
                                            "
                                        >
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


                                {/* =================================================
                                    ACTIONS
                                ================================================= */}

                                {/* Pinned so Complete / Block / Archive stay
                                    reachable however long the activity runs */}
                                <div
                                    className="
                                        sticky bottom-0 z-10
                                        -mx-4 px-4 py-3
                                        flex flex-col gap-3
                                        border-t border-border bg-card/95 backdrop-blur-xs
                                        sm:-mx-5 sm:px-5 sm:pb-0 sm:pt-4
                                        sm:flex-row sm:items-center sm:justify-between
                                    "
                                >

                                    {/* STATUS ACTIONS */}

                                    <div
                                        className="
                                            flex
                                            flex-wrap
                                            gap-2
                                        "
                                    >

                                        {/* COMPLETE */}

                                        {!workItem.isArchived &&
                                            Number(
                                                workItem.status
                                            ) !== 2 && (

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="
                                                        border-success/40
                                                        text-success-foreground
                                                        hover:bg-success-subtle
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


                                        {/* BLOCK */}

                                        {!workItem.isArchived &&
                                            Number(
                                                workItem.status
                                            ) !== 3 && (

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="
                                                        border-warning/40
                                                        text-warning-foreground
                                                        hover:bg-warning-subtle
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


                                        {/* ACTIVATE */}

                                        {!workItem.isArchived &&
                                            Number(
                                                workItem.status
                                            ) !== 1 && (

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="
                                                        border-primary-muted
                                                        text-primary-hover
                                                        hover:bg-primary-subtle
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


                                        {/* ARCHIVE / RESTORE */}

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


                                    {/* CLOSE / EDIT */}

                                    <div
                                        className="
                                            flex
                                            gap-2
                                        "
                                    >

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


            {/* =================================================
                EDIT WORK ITEM DIALOG
            ================================================= */}

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