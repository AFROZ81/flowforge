import api from "@/lib/api";

import type {
    Reminder,
    ReminderApiResponse,
    UpdateReminderRequest,
} from "../types/reminder";


/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_UPCOMING_DAYS = 5;

const MAX_UPCOMING_DAYS = 90;


/*
 * Prevent duplicate simultaneous requests.
 *
 * Example:
 *
 * Component A -> getUpcomingReminders(30)
 * Component B -> getUpcomingReminders(30)
 *
 * Instead of:
 *
 * GET /Reminders/upcoming?Days=30
 * GET /Reminders/upcoming?Days=30
 *
 * both callers receive the SAME promise.
 */
const inFlightUpcomingRequests =
    new Map<
        number,
        Promise<Reminder[]>
    >();


/*
 * Very short-lived cache.
 *
 * This protects against rapid Details dialog mounting,
 * React StrictMode development behavior, and multiple
 * components requesting exactly the same data.
 *
 * It is intentionally short so reminder data stays fresh.
 */
const upcomingCache =
    new Map<
        number,
        {
            data: Reminder[];
            expiresAt: number;
        }
    >();


const UPCOMING_CACHE_TTL_MS =
    5000;


/* =========================================================
   UPDATE / CREATE REMINDER
========================================================= */

export async function updateReminder(
    data: UpdateReminderRequest
): Promise<Reminder | null> {

    const response =
        await api.patch<
            ReminderApiResponse<Reminder>
        >(
            "/Reminders",
            data
        );


    /*
     * Invalidate upcoming-reminder caches because
     * reminder data has changed.
     */

    upcomingCache.clear();


    return (
        response.data?.data ??
        null
    );
}


/* =========================================================
   UPCOMING REMINDERS
========================================================= */

export async function getUpcomingReminders(
    days = DEFAULT_UPCOMING_DAYS
): Promise<Reminder[]> {

    const safeDays =
        Math.min(
            Math.max(
                Math.floor(days),
                1
            ),
            MAX_UPCOMING_DAYS
        );


    /*
     * -------------------------------------------------------
     * 1. Return very recent cached result
     * -------------------------------------------------------
     */

    const cached =
        upcomingCache.get(
            safeDays
        );


    if (
        cached &&
        cached.expiresAt >
            Date.now()
    ) {

        return cached.data;
    }


    /*
     * -------------------------------------------------------
     * 2. Reuse an existing request
     * -------------------------------------------------------
     */

    const existingRequest =
        inFlightUpcomingRequests.get(
            safeDays
        );


    if (
        existingRequest
    ) {

        return existingRequest;
    }


    /*
     * -------------------------------------------------------
     * 3. Create ONE request
     * -------------------------------------------------------
     */

    const request =
        api.get<
            ReminderApiResponse<Reminder[]>
        >(
            "/Reminders/upcoming",
            {
                params: {
                    Days:
                        safeDays,
                },
            }
        )
        .then(
            response =>
                response.data?.data ??
                []
        )
        .then(
            data => {

                upcomingCache.set(
                    safeDays,
                    {
                        data,
                        expiresAt:
                            Date.now() +
                            UPCOMING_CACHE_TTL_MS,
                    }
                );


                return data;
            }
        )
        .finally(
            () => {

                inFlightUpcomingRequests.delete(
                    safeDays
                );

            }
        );


    inFlightUpcomingRequests.set(
        safeDays,
        request
    );


    return request;
}


/* =========================================================
   OVERDUE REMINDERS
========================================================= */

export async function getOverdueReminders():
    Promise<Reminder[]> {

    const response =
        await api.get<
            ReminderApiResponse<Reminder[]>
        >(
            "/Reminders/overdue"
        );


    return (
        response.data?.data ??
        []
    );
}


/* =========================================================
   DELETE REMINDER
========================================================= */

export async function deleteReminder(
    workItemId: string
): Promise<void> {

    await api.delete(
        `/Reminders/${workItemId}`
    );


    /*
     * The upcoming-reminder data is now stale.
     */

    upcomingCache.clear();
}