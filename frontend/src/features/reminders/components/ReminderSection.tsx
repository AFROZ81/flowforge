import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Bell,
    CalendarClock,
    Loader2,
    Trash2,
} from "lucide-react";

import {
    toast,
} from "sonner";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";

import {
    getUpcomingReminders,
    updateReminder,
    deleteReminder,
} from "../services/reminder.service";

import type {
    Reminder,
} from "../types/reminder";


type Props = {
    workItemId: string;

    dueDate?: string | null;

    disabled?: boolean;
};


function toDateTimeLocal(
    value?: string | null
): string {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const hours =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutes =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}T${hours}:${minutes}`;
}


function formatReminderDate(
    value?: string | null
): string {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


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
            hour: "numeric",
            minute: "2-digit",
        }
    ).format(date);
}


export default function ReminderSection({
    workItemId,
    dueDate,
    disabled = false,
}: Props) {

    const [
        reminder,
        setReminder,
    ] =
        useState<Reminder | null>(
            null
        );


    const [
        reminderDate,
        setReminderDate,
    ] =
        useState("");


    const [
        loading,
        setLoading,
    ] =
        useState(true);


    const [
        saving,
        setSaving,
    ] =
        useState(false);


    const [
        deleting,
        setDeleting,
    ] =
        useState(false);


    const [
        editing,
        setEditing,
    ] =
        useState(false);


    const [
        error,
        setError,
    ] =
        useState(false);


    /*
     * ==========================================
     * LOAD CURRENT REMINDER
     * ==========================================
     *
     * The backend does not expose:
     *
     * GET /Reminders/{workItemId}
     *
     * Therefore we discover future reminders
     * through the upcoming endpoint.
     */

    useEffect(() => {

        let cancelled = false;


        const load =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError(
                        false
                    );


                    /*
                     * Large enough window to find
                     * an existing future reminder.
                     */

                    const reminders =
                        await getUpcomingReminders(
                            3650
                        );


                    if (
                        cancelled
                    ) {
                        return;
                    }


                    const current =
                        reminders.find(
                            item =>
                                item.workItemId ===
                                workItemId
                        );


                    setReminder(
                        current ??
                        null
                    );


                    setReminderDate(
                        toDateTimeLocal(
                            current?.reminderDate
                        )
                    );

                } catch (loadError) {

                    if (
                        cancelled
                    ) {
                        return;
                    }


                    console.error(
                        "Failed to load reminder:",
                        loadError
                    );


                    setError(
                        true
                    );

                } finally {

                    if (
                        !cancelled
                    ) {

                        setLoading(
                            false
                        );
                    }
                }
            };


        void load();


        return () => {

            cancelled = true;

        };

    }, [
        workItemId,
    ]);


    /*
     * ==========================================
     * DEFAULT REMINDER DATE
     * ==========================================
     */

    const minimumReminderDate =
        useMemo(
            () => {

                const now =
                    new Date();


                now.setSeconds(
                    0,
                    0
                );


                return toDateTimeLocal(
                    now.toISOString()
                );

            },
            []
        );


    /*
     * ==========================================
     * SAVE
     * ==========================================
     */

    const handleSave =
        async () => {

            if (
                !reminderDate
            ) {

                toast.error(
                    "Please select a reminder date and time."
                );

                return;
            }


            const reminderDateValue =
                new Date(
                    reminderDate
                );


            if (
                Number.isNaN(
                    reminderDateValue.getTime()
                )
            ) {

                toast.error(
                    "Please select a valid reminder date and time."
                );

                return;
            }


            if (
                reminderDateValue.getTime() <=
                Date.now()
            ) {

                toast.error(
                    "Reminder must be set for a future date and time."
                );

                return;
            }


            if (
                dueDate
            ) {

                const dueDateValue =
                    new Date(
                        dueDate
                    );


                if (
                    !Number.isNaN(
                        dueDateValue.getTime()
                    ) &&
                    reminderDateValue.getTime() >
                        dueDateValue.getTime()
                ) {

                    toast.error(
                        "Reminder cannot be later than the work item's due date."
                    );

                    return;
                }
            }


            try {

                setSaving(
                    true
                );


                const result =
                    await updateReminder({
                        workItemId,

                        dueDate:
                            dueDate ??
                            reminderDateValue.toISOString(),

                        reminderDate:
                            reminderDateValue.toISOString(),
                    });


                setReminder(
                    result ?? {
                        workItemId,

                        title:
                            "",

                        dueDate:
                            dueDate ??
                            reminderDateValue.toISOString(),

                        reminderDate:
                            reminderDateValue.toISOString(),
                    }
                );


                setEditing(
                    false
                );


                toast.success(
                    reminder
                        ? "Reminder updated successfully."
                        : "Reminder set successfully."
                );

            } catch (saveError) {

                console.error(
                    "Failed to save reminder:",
                    saveError
                );

                toast.error(
                    "Failed to save reminder."
                );

            } finally {

                setSaving(
                    false
                );
            }
        };


    /*
     * ==========================================
     * DELETE
     * ==========================================
     */

    const handleDelete =
        async () => {

            const confirmed =
                window.confirm(
                    "Remove the reminder from this work item?"
                );


            if (
                !confirmed
            ) {
                return;
            }


            try {

                setDeleting(
                    true
                );


                await deleteReminder(
                    workItemId
                );


                setReminder(
                    null
                );


                setReminderDate(
                    ""
                );


                setEditing(
                    false
                );


                toast.success(
                    "Reminder removed successfully."
                );

            } catch (deleteError) {

                console.error(
                    "Failed to delete reminder:",
                    deleteError
                );

                toast.error(
                    "Failed to remove reminder."
                );

            } finally {

                setDeleting(
                    false
                );
            }
        };


    return (
        <div>

            {/* ==========================================
                HEADER
            =========================================== */}

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

                        <Bell
                            className="
                                h-4
                                w-4
                            "
                        />

                        Reminder

                    </div>


                    <p
                        className="
                            mt-0.5
                            text-xs
                            text-muted-foreground
                        "
                    >
                        Get a reminder before this work item is due.
                    </p>

                </div>

            </div>


            {/* ==========================================
                LOADING
            =========================================== */}

            {loading && (

                <div
                    className="
                        flex
                        items-center
                        justify-center
                        rounded-lg
                        border
                        py-6
                    "
                >

                    <Loader2
                        className="
                            mr-2
                            h-4
                            w-4
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
                        Loading reminder...
                    </span>

                </div>

            )}


            {/* ==========================================
                ERROR
            =========================================== */}

            {!loading &&
                error && (

                    <div
                        className="
                            rounded-lg
                            border
                            border-red-200
                            bg-red-50
                            p-4
                            text-sm
                            text-red-700
                        "
                    >
                        Unable to load the current reminder.
                    </div>

                )}


            {/* ==========================================
                EXISTING REMINDER
            =========================================== */}

            {!loading &&
                !error &&
                reminder &&
                !editing && (

                    <div
                        className="
                            rounded-lg
                            border
                            bg-muted/20
                            p-4
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >

                            <div
                                className="
                                    flex
                                    min-w-0
                                    items-start
                                    gap-3
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
                                        rounded-full
                                        bg-primary/10
                                        text-primary
                                    "
                                >

                                    <CalendarClock
                                        className="
                                            h-4
                                            w-4
                                        "
                                    />

                                </div>


                                <div
                                    className="
                                        min-w-0
                                    "
                                >

                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                        "
                                    >
                                        Reminder set
                                    </p>


                                    <p
                                        className="
                                            mt-1
                                            text-sm
                                            text-muted-foreground
                                        "
                                    >
                                        {
                                            formatReminderDate(
                                                reminder.reminderDate
                                            )
                                        }
                                    </p>

                                </div>

                            </div>


                            {!disabled && (

                                <div
                                    className="
                                        flex
                                        shrink-0
                                        gap-2
                                    "
                                >

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            setEditing(
                                                true
                                            )
                                        }
                                    >
                                        Edit
                                    </Button>


                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="
                                            text-destructive
                                            hover:text-destructive
                                        "
                                        disabled={
                                            deleting
                                        }
                                        onClick={() =>
                                            void handleDelete()
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

                                </div>

                            )}

                        </div>

                    </div>

                )}


            {/* ==========================================
                NO REMINDER
            =========================================== */}

            {!loading &&
                !error &&
                !reminder &&
                !editing && (

                    <div
                        className="
                            rounded-lg
                            border
                            border-dashed
                            p-5
                            text-center
                        "
                    >

                        <Bell
                            className="
                                mx-auto
                                mb-2
                                h-5
                                w-5
                                text-muted-foreground
                            "
                        />


                        <p
                            className="
                                text-sm
                                font-medium
                            "
                        >
                            No reminder set
                        </p>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-muted-foreground
                            "
                        >
                            Set a reminder to stay on top of this work item.
                        </p>


                        {!disabled && (

                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="mt-3"
                                onClick={() =>
                                    setEditing(
                                        true
                                    )
                                }
                            >
                                Set Reminder
                            </Button>

                        )}

                    </div>

                )}


            {/* ==========================================
                EDIT / CREATE
            =========================================== */}

            {!loading &&
                !error &&
                editing && (

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

                            <div
                                className="
                                    sm:col-span-2
                                "
                            >

                                <label
                                    className="
                                        mb-1.5
                                        block
                                        text-sm
                                        font-medium
                                    "
                                >
                                    Reminder date & time
                                </label>


                                <Input
                                    type="datetime-local"
                                    value={
                                        reminderDate
                                    }
                                    min={
                                        minimumReminderDate
                                    }
                                    onChange={
                                        event =>
                                            setReminderDate(
                                                event.target.value
                                            )
                                    }
                                    disabled={
                                        saving
                                    }
                                />


                                <p
                                    className="
                                        mt-1.5
                                        text-xs
                                        text-muted-foreground
                                    "
                                >
                                    Choose when you want FlowForge to remind you.
                                </p>

                            </div>

                        </div>


                        <div
                            className="
                                mt-4
                                flex
                                justify-end
                                gap-2
                            "
                        >

                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    saving
                                }
                                onClick={() => {

                                    if (
                                        reminder
                                    ) {

                                        setReminderDate(
                                            toDateTimeLocal(
                                                reminder.reminderDate
                                            )
                                        );

                                    } else {

                                        setReminderDate(
                                            ""
                                        );
                                    }

                                    setEditing(
                                        false
                                    );

                                }}
                            >
                                Cancel
                            </Button>


                            <Button
                                type="button"
                                disabled={
                                    saving
                                }
                                onClick={() =>
                                    void handleSave()
                                }
                            >

                                {saving ? (

                                    <>
                                        <Loader2
                                            className="
                                                mr-2
                                                h-4
                                                w-4
                                                animate-spin
                                            "
                                        />

                                        Saving...

                                    </>

                                ) : (

                                    reminder
                                        ? "Update Reminder"
                                        : "Set Reminder"

                                )}

                            </Button>

                        </div>

                    </div>

                )}

        </div>
    );
}