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
       DELETE
    ===================================================== */

    const handleDelete =
        async (
            attachment: Attachment
        ) => {

            const confirmed =
                window.confirm(
                    `Delete "${attachment.fileName}"?`
                );


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


                toast.success(
                    "Attachment deleted successfully."
                );

            } catch (error) {

                console.error(
                    "Failed to delete attachment:",
                    error
                );

                toast.error(
                    "Failed to delete attachment."
                );

            } finally {

                setDeletingAttachmentId(
                    null
                );
            }
        };


    /* =====================================================
       STATUS / ASSIGNEE
    ===================================================== */

    const statusLabel =
        workItem
            ? getStatusLabel(
                Number(
                    workItem.status
                )
              )
            : "";


    const statusClasses =
        workItem
            ? getStatusClasses(
                Number(
                    workItem.status
                )
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
                                    {
                                        statusLabel
                                    }
                                </span>

                            )}

                        </div>

                    </DialogHeader>


                    {isLoading && (

                        <div
                            className="
                                py-10
                                text-center
                                text-sm
                                text-muted-foreground
                            "
                        >
                            Loading work item...
                        </div>

                    )}


                    {isError && (

                        <div
                            className="
                                py-10
                                text-center
                                text-sm
                                text-red-500
                            "
                        >
                            Failed to load work item.
                        </div>

                    )}


                    {workItem &&
                        !isLoading &&
                        !isError && (

                            <div
                                className="
                                    space-y-5
                                "
                            >

                                {/* =================================
                                    BASIC INFORMATION
                                ================================== */}

                                <div
                                    className="
                                        rounded-lg
                                        border
                                        p-4
                                    "
                                >

                                    <div
                                        className="
                                            grid
                                            gap-4
                                            sm:grid-cols-2
                                        "
                                    >

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Priority
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    font-medium
                                                "
                                            >
                                                P
                                                {
                                                    workItem.priority
                                                }
                                            </p>

                                        </div>


                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Due Date
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    font-medium
                                                "
                                            >
                                                {
                                                    dueDate ??
                                                    "No due date"
                                                }
                                            </p>

                                        </div>


                                        <div
                                            className="
                                                sm:col-span-2
                                            "
                                        >

                                            <p
                                                className="
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Description
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    whitespace-pre-wrap
                                                    text-sm
                                                "
                                            >
                                                {
                                                    workItem.description ||
                                                    "No description."
                                                }
                                            </p>

                                        </div>


                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Assignee
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    font-medium
                                                "
                                            >
                                                {
                                                    assignee?.fullName ??
                                                    "Unassigned"
                                                }
                                            </p>

                                            {assignee?.email && (

                                                <p
                                                    className="
                                                        text-xs
                                                        text-muted-foreground
                                                    "
                                                >
                                                    {
                                                        assignee.email
                                                    }
                                                </p>

                                            )}

                                        </div>


                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-muted-foreground
                                                "
                                            >
                                                Status
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-sm
                                                    font-medium
                                                "
                                            >
                                                {
                                                    statusLabel
                                                }
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================
                                    ATTACHMENTS
                                ================================== */}

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
                                                        h-4
                                                        w-4
                                                    "
                                                />

                                                Attachments

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


                                    {/* LOADING */}

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

                                        /* EMPTY STATE */

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


                                {/* =================================
                                    CHECKLIST
                                ================================== */}

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


                                {/* =================================
                                    ACTIVITY
                                ================================== */}

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


                                {/* =================================
                                    ACTIONS
                                ================================== */}

                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-3
                                        border-t
                                        pt-4
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
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

                                        {!workItem.isArchived &&
                                            Number(
                                                workItem.status
                                            ) !== 2 && (

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
                                            Number(
                                                workItem.status
                                            ) !== 3 && (

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
                                            Number(
                                                workItem.status
                                            ) !== 1 && (

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