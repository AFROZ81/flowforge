import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
    HttpTransportType,
    LogLevel,
} from "@microsoft/signalr";

import { useAuthStore } from "@/stores/auth.store";

import type {
    PresenceState,
    PresenceStatus,
} from "../types/presence";


/* =========================================================
   TYPES
   ========================================================= */

export type OnlineUser = {
    userId: string;
    fullName: string;
};


export type RealtimeNotification = {
    id: string;
    type: string;
    title: string;
    message: string;
    workItemId?: string | null;
    isRead: boolean;
    createdAt: string;
};


export type BoardViewer = {
    userId: string;
    userName: string;
};


/*
 * SignalR can return either camelCase or PascalCase
 * properties depending on the backend serializer.
 */
type RawBoardViewer = {
    userId?: string;
    UserId?: string;

    userName?: string;
    UserName?: string;
};


type BoardPresencePayload = {
    boardId?: string;
    BoardId?: string;

    users?: RawBoardViewer[];
    Users?: RawBoardViewer[];
};


type PresenceUserPayload = {
    userId?: string;
    UserId?: string;
};


type PresenceContextValue = {

    /* =====================================================
       GLOBAL PRESENCE
       ===================================================== */

    presence: PresenceState;

    onlineUserIds: string[];

    onlineUsers: OnlineUser[];

    isOnline: (
        userId?: string | null
    ) => boolean;

    refreshPresence: () => Promise<void>;


    /* =====================================================
       REALTIME NOTIFICATIONS
       ===================================================== */

    lastNotification:
        RealtimeNotification | null;


    /* =====================================================
       BOARD PRESENCE
       ===================================================== */

    boardViewers: BoardViewer[];

    joinBoard: (
        boardId: string
    ) => Promise<void>;

    leaveBoard: (
        boardId: string
    ) => Promise<void>;

    isBoardConnected: boolean;
};


/* =========================================================
   CONTEXT
   ========================================================= */

const PresenceContext =
    createContext<
        PresenceContextValue | undefined
    >(undefined);


type Props = {
    children: ReactNode;
};


/* =========================================================
   API / SIGNALR URLS
   ========================================================= */

const API_BASE_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:5045/api";


const SIGNALR_BASE_URL =
    API_BASE_URL.replace(
        /\/api\/?$/,
        ""
    );


const HUB_URL =
    `${SIGNALR_BASE_URL}/hubs/notifications`;


const PRESENCE_URL =
    `${API_BASE_URL}/Presence/online-users`;


console.log(
    "Presence API URL:",
    PRESENCE_URL
);


console.log(
    "Presence SignalR URL:",
    HUB_URL
);


/* =========================================================
   HELPERS
   ========================================================= */

function normalizeUserId(
    userId?: string | null
): string | null {

    if (
        typeof userId !== "string"
    ) {
        return null;
    }


    const normalized =
        userId
            .trim()
            .toLowerCase();


    return normalized || null;
}


/* =========================================================
   REALTIME NOTIFICATION NORMALIZER
   ========================================================= */

function normalizeRealtimeNotification(
    payload: unknown
): RealtimeNotification | null {

    if (
        typeof payload !== "object" ||
        payload === null
    ) {
        return null;
    }


    const root =
        payload as Record<
            string,
            unknown
        >;


    const candidate =
        (
            typeof root.notification ===
                "object" &&
            root.notification !== null
        )
            ? root.notification
            : (
                  typeof root.Notification ===
                      "object" &&
                  root.Notification !== null
              )
            ? root.Notification
            : (
                  typeof root.data ===
                      "object" &&
                  root.data !== null
              )
            ? root.data
            : (
                  typeof root.Data ===
                      "object" &&
                  root.Data !== null
              )
            ? root.Data
            : payload;


    if (
        typeof candidate !==
            "object" ||
        candidate === null
    ) {
        return null;
    }


    const value =
        candidate as Record<
            string,
            unknown
        >;


    const id =
        typeof value.id ===
            "string"
            ? value.id
            : typeof value.Id ===
                "string"
            ? value.Id
            : null;


    if (!id) {
        return null;
    }


    const title =
        typeof value.title ===
            "string"
            ? value.title
            : typeof value.Title ===
                "string"
            ? value.Title
            : "Notification";


    const message =
        typeof value.message ===
            "string"
            ? value.message
            : typeof value.Message ===
                "string"
            ? value.Message
            : "";


    const type =
        typeof value.type ===
            "string"
            ? value.type
            : typeof value.Type ===
                "string"
            ? value.Type
            : "";


    const createdAt =
        typeof value.createdAt ===
            "string"
            ? value.createdAt
            : typeof value.CreatedAt ===
                "string"
            ? value.CreatedAt
            : new Date().toISOString();


    const workItemId =
        typeof value.workItemId ===
            "string"
            ? value.workItemId
            : typeof value.WorkItemId ===
                "string"
            ? value.WorkItemId
            : null;


    const isRead =
        typeof value.isRead ===
            "boolean"
            ? value.isRead
            : typeof value.IsRead ===
                "boolean"
            ? value.IsRead
            : false;


    return {
        id,
        type,
        title,
        message,
        workItemId,
        isRead,
        createdAt,
    };
}


/* =========================================================
   PROVIDER
   ========================================================= */

export default function PresenceProvider({
    children,
}: Props) {

    /* =====================================================
       AUTHENTICATION
       ===================================================== */

    /*
     * These selectors make PresenceProvider reactively
     * respond when login/logout changes authentication.
     */
    const isAuthenticated =
        useAuthStore(
            state =>
                state.isAuthenticated
        );


    const accessToken =
        useAuthStore(
            state =>
                state.accessToken
        );


    const authenticatedUserId =
        useAuthStore(
            state =>
                state.user?.id ?? null
        );


    /* =====================================================
       GLOBAL PRESENCE
       ===================================================== */

    const [presence, setPresence] =
        useState<PresenceState>({});


    const [
        onlineUsers,
        setOnlineUsers,
    ] = useState<OnlineUser[]>([]);


    /* =====================================================
       REALTIME NOTIFICATIONS
       ===================================================== */

    const [
        lastNotification,
        setLastNotification,
    ] = useState<
        RealtimeNotification | null
    >(null);


    /* =====================================================
       BOARD PRESENCE
       ===================================================== */

    const [
        boardViewers,
        setBoardViewers,
    ] = useState<BoardViewer[]>([]);


    const [
        isBoardConnected,
        setIsBoardConnected,
    ] = useState(false);


    /* =====================================================
       SIGNALR CONNECTION
       ===================================================== */

    const connectionRef =
        useRef<HubConnection | null>(
            null
        );


    const connectionStartRef =
        useRef<
            Promise<void> | null
        >(null);


    const isMountedRef =
        useRef(false);


    const cleanupTimerRef =
        useRef<
            ReturnType<typeof setTimeout> | null
        >(null);


    const requestedBoardIdRef =
        useRef<string | null>(null);


    /*
     * Keep the latest authentication token available
     * without forcing SignalR callbacks to recreate.
     */
    const accessTokenRef =
        useRef<string | null>(
            accessToken
        );


    useEffect(() => {

        accessTokenRef.current =
            accessToken;

    }, [
        accessToken,
    ]);


    /* =====================================================
       UPDATE USER STATUS
       ===================================================== */

    const updateUserStatus =
        useCallback(
            (
                userId: string,
                status: PresenceStatus
            ) => {

                const normalizedId =
                    normalizeUserId(
                        userId
                    );


                if (
                    !normalizedId
                ) {
                    return;
                }


                setPresence(
                    current => ({
                        ...current,

                        [normalizedId]:
                            status,
                    })
                );


                if (
                    status === "offline"
                ) {

                    setOnlineUsers(
                        current =>
                            current.filter(
                                (user: OnlineUser) =>
                                    normalizeUserId(
                                        user.userId
                                    ) !==
                                    normalizedId
                            )
                    );
                }
            },
            []
        );


    /* =====================================================
       LOAD CURRENT ONLINE USERS
       ===================================================== */

    const refreshPresence =
        useCallback(
            async () => {

                const token =
                    accessTokenRef.current;


                if (
                    !token ||
                    !isAuthenticated
                ) {

                    return;
                }


                try {

                    const response =
                        await fetch(
                            PRESENCE_URL,
                            {
                                method:
                                    "GET",

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,

                                    Accept:
                                        "application/json",
                                },
                            }
                        );


                    if (
                        !response.ok
                    ) {

                        console.error(
                            "Presence: failed to load online users:",
                            response.status,
                            response.statusText
                        );

                        return;
                    }


                    const result: unknown =
                        await response.json();


                    const rawUsers: unknown[] =
                        Array.isArray(
                            result
                        )
                            ? result
                            : (
                                  typeof result ===
                                      "object" &&
                                  result !== null &&
                                  Array.isArray(
                                      (
                                          result as {
                                              data?: unknown;
                                          }
                                      ).data
                                  )
                              )
                            ? (
                                  result as {
                                      data: unknown[];
                                  }
                              ).data
                            : [];


                    const normalizedUsers: OnlineUser[] =
                        rawUsers.reduce<OnlineUser[]>(
                            (
                                users,
                                rawUser
                            ) => {

                                if (
                                    typeof rawUser !==
                                        "object" ||
                                    rawUser === null
                                ) {
                                    return users;
                                }


                                const user =
                                    rawUser as {
                                        userId?: unknown;
                                        UserId?: unknown;
                                        fullName?: unknown;
                                        FullName?: unknown;
                                    };


                                const rawUserId =
                                    user.userId ??
                                    user.UserId;


                                const normalizedId =
                                    normalizeUserId(
                                        typeof rawUserId ===
                                            "string"
                                            ? rawUserId
                                            : null
                                    );


                                if (
                                    !normalizedId
                                ) {
                                    return users;
                                }


                                const rawFullName =
                                    user.fullName ??
                                    user.FullName;


                                const fullName =
                                    typeof rawFullName ===
                                        "string" &&
                                    rawFullName.trim()
                                        .length > 0
                                        ? rawFullName.trim()
                                        : "Unknown User";


                                users.push({
                                    userId:
                                        normalizedId,

                                    fullName,
                                });


                                return users;

                            },
                            []
                        );


                    const uniqueUsers =
                        Array.from(
                            new Map<
                                string,
                                OnlineUser
                            >(
                                normalizedUsers.map(
                                    (user: OnlineUser) => [
                                        user.userId,
                                        user,
                                    ]
                                )
                            ).values()
                        );


                    if (
                        !isMountedRef.current
                    ) {
                        return;
                    }


                    setOnlineUsers(
                        uniqueUsers
                    );


                    const nextPresence:
                        PresenceState =
                        {};


                    uniqueUsers.forEach(
                        (user: OnlineUser) => {

                            nextPresence[
                                user.userId
                            ] = "online";

                        }
                    );


                    setPresence(
                        nextPresence
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "Presence: error loading online users:",
                        error
                    );
                }
            },
            [
                isAuthenticated,
            ]
        );


    /* =====================================================
       JOIN BOARD
       ===================================================== */

    const joinBoard =
        useCallback(
            async (
                boardId: string
            ) => {

                if (!boardId) {
                    return;
                }


                requestedBoardIdRef.current =
                    boardId;


                const connection =
                    connectionRef.current;


                if (
                    !connection ||
                    connection.state !==
                        HubConnectionState.Connected
                ) {

                    console.log(
                        "Presence: board join queued:",
                        boardId
                    );

                    return;
                }


                try {

                    console.log(
                        "Presence: joining board:",
                        boardId
                    );


                    await connection.invoke(
                        "JoinBoard",
                        boardId
                    );


                    console.log(
                        "Presence: joined board:",
                        boardId
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "Presence: failed to join board:",
                        error
                    );
                }
            },
            []
        );


    /* =====================================================
       LEAVE BOARD
       ===================================================== */

    const leaveBoard =
        useCallback(
            async (
                boardId: string
            ) => {

                if (!boardId) {
                    return;
                }


                if (
                    requestedBoardIdRef.current ===
                    boardId
                ) {

                    requestedBoardIdRef.current =
                        null;
                }


                const connection =
                    connectionRef.current;


                setBoardViewers([]);


                if (
                    !connection ||
                    connection.state !==
                        HubConnectionState.Connected
                ) {

                    return;
                }


                try {

                    console.log(
                        "Presence: leaving board:",
                        boardId
                    );


                    await connection.invoke(
                        "LeaveBoard",
                        boardId
                    );


                    console.log(
                        "Presence: left board:",
                        boardId
                    );

                } catch (
                    error
                ) {

                    console.error(
                        "Presence: failed to leave board:",
                        error
                    );
                }
            },
            []
        );


    /* =====================================================
       SIGNALR CONNECTION
       ===================================================== */

    useEffect(() => {

        /*
         * ---------------------------------------------------
         * LOGGED OUT
         * ---------------------------------------------------
         */

        if (
            !isAuthenticated ||
            !accessToken
        ) {

            console.log(
                "Presence: waiting for authenticated session..."
            );


            isMountedRef.current =
                false;


            if (
                cleanupTimerRef.current
            ) {

                clearTimeout(
                    cleanupTimerRef.current
                );

                cleanupTimerRef.current =
                    null;
            }


            const connection =
                connectionRef.current;


            if (
                connection
            ) {

                if (
                    connection.state ===
                    HubConnectionState.Connected
                ) {

                    void connection
                        .stop()
                        .catch(
                            () => {}
                        );

                } else if (
                    connection.state ===
                    HubConnectionState.Connecting
                ) {

                    const startPromise =
                        connectionStartRef.current;


                    if (
                        startPromise
                    ) {

                        void startPromise
                            .finally(
                                () => {

                                    if (
                                        connectionRef.current ===
                                        connection
                                    ) {

                                        void connection
                                            .stop()
                                            .catch(
                                                () => {}
                                            );

                                        connectionRef.current =
                                            null;
                                    }
                                }
                            );
                    }

                } else {

                    connectionRef.current =
                        null;
                }
            }


            connectionStartRef.current =
                null;


            setOnlineUsers([]);

            setPresence({});

            setBoardViewers([]);

            setIsBoardConnected(
                false
            );


            return;
        }


        /* =================================================
           AUTHENTICATED
           ================================================= */

        isMountedRef.current =
            true;


        if (
            cleanupTimerRef.current
        ) {

            clearTimeout(
                cleanupTimerRef.current
            );

            cleanupTimerRef.current =
                null;
        }


        const start =
            async () => {

                /*
                 * Always use the token from the current
                 * authentication state.
                 */
                const token =
                    accessTokenRef.current;


                if (!token) {

                    console.warn(
                        "Presence: authenticated but JWT is unavailable."
                    );

                    return;
                }


                /* =============================================
                   REUSE EXISTING CONNECTION
                   ============================================= */

                const existingConnection =
                    connectionRef.current;


                if (
                    existingConnection &&
                    (
                        existingConnection.state ===
                            HubConnectionState.Connecting ||
                        existingConnection.state ===
                            HubConnectionState.Connected ||
                        existingConnection.state ===
                            HubConnectionState.Reconnecting
                    )
                ) {

                    console.log(
                        "Presence: SignalR connection already exists."
                    );


                    if (
                        existingConnection.state ===
                        HubConnectionState.Connected
                    ) {

                        setIsBoardConnected(
                            true
                        );


                        await refreshPresence();


                        const boardId =
                            requestedBoardIdRef.current;


                        if (
                            boardId
                        ) {

                            try {

                                await existingConnection.invoke(
                                    "JoinBoard",
                                    boardId
                                );

                            } catch (
                                error
                            ) {

                                console.error(
                                    "Presence: failed to join existing board:",
                                    error
                                );
                            }
                        }
                    }


                    return;
                }


                /* =============================================
                   CREATE CONNECTION
                   ============================================= */

                console.log(
                    "Presence: creating SignalR connection..."
                );


                const connection =
                    new HubConnectionBuilder()
                        .withUrl(
                            HUB_URL,
                            {
                                accessTokenFactory:
                                    () =>
                                        accessTokenRef.current ??
                                        "",

                                transport:
                                    HttpTransportType.WebSockets,

                                skipNegotiation:
                                    true,
                            }
                        )
                        .withAutomaticReconnect(
                            [
                                0,
                                2000,
                                5000,
                                10000,
                            ]
                        )
                        .configureLogging(
                            LogLevel.Warning
                        )
                        .build();


                connectionRef.current =
                    connection;


                /* =============================================
                   REALTIME NOTIFICATIONS
                   ============================================= */

                connection.on(
                    "NotificationReceived",
                    payload => {

                        if (
                            !isMountedRef.current
                        ) {
                            return;
                        }


                        const notification =
                            normalizeRealtimeNotification(
                                payload
                            );


                        if (
                            !notification
                        ) {

                            console.warn(
                                "Notifications: invalid notification payload:",
                                payload
                            );

                            return;
                        }


                        setLastNotification(
                            notification
                        );


                        window.dispatchEvent(
                            new CustomEvent(
                                "flowforge:notification-received",
                                {
                                    detail:
                                        notification,
                                }
                            )
                        );
                    }
                );


                /* =============================================
                   USER ONLINE
                   ============================================= */

                connection.on(
                    "UserOnline",
                    (
                        payload: PresenceUserPayload | string
                    ) => {

                        if (
                            !isMountedRef.current
                        ) {
                            return;
                        }


                        const userId =
                            typeof payload ===
                            "string"
                                ? payload
                                : payload.userId ??
                                  payload.UserId;


                        if (
                            !userId
                        ) {
                            return;
                        }


                        updateUserStatus(
                            userId,
                            "online"
                        );


                        void refreshPresence();
                    }
                );


                /* =============================================
                   USER OFFLINE
                   ============================================= */

                connection.on(
                    "UserOffline",
                    (
                        payload: PresenceUserPayload | string
                    ) => {

                        if (
                            !isMountedRef.current
                        ) {
                            return;
                        }


                        const userId =
                            typeof payload ===
                            "string"
                                ? payload
                                : payload.userId ??
                                  payload.UserId;


                        if (
                            !userId
                        ) {
                            return;
                        }


                        updateUserStatus(
                            userId,
                            "offline"
                        );
                    }
                );


                /* =============================================
                   BOARD PRESENCE
                   ============================================= */

                connection.on(
                    "BoardPresenceChanged",
                    (
                        payload: BoardPresencePayload
                    ) => {

                        if (
                            !isMountedRef.current
                        ) {
                            return;
                        }


                        const eventBoardId =
                            payload.boardId ??
                            payload.BoardId;


                        const currentBoardId =
                            requestedBoardIdRef.current;


                        if (
                            !eventBoardId ||
                            !currentBoardId ||
                            eventBoardId.toLowerCase() !==
                                currentBoardId.toLowerCase()
                        ) {

                            return;
                        }


                        const users: RawBoardViewer[] =
                            payload.users ??
                            payload.Users ??
                            [];


                        const normalizedUsers =
                            users
                                .map(
                                    (
                                        user: RawBoardViewer
                                    ): BoardViewer | null => {

                                        const userId =
                                            user.userId ??
                                            user.UserId;


                                        const userName =
                                            user.userName ??
                                            user.UserName ??
                                            "Unknown User";


                                        if (
                                            !userId
                                        ) {
                                            return null;
                                        }


                                        return {
                                            userId,
                                            userName,
                                        };
                                    }
                                )
                                .filter(
                                    (
                                        user
                                    ): user is BoardViewer =>
                                        user !== null
                                );


                        console.log(
                            "Presence: board viewers:",
                            normalizedUsers
                        );


                        setBoardViewers(
                            normalizedUsers
                        );
                    }
                );


                /* =============================================
                   RECONNECTED
                   ============================================= */

                connection.onreconnected(
                    async () => {

                        if (
                            !isMountedRef.current
                        ) {
                            return;
                        }


                        console.log(
                            "Presence: SignalR reconnected."
                        );


                        setIsBoardConnected(
                            true
                        );


                        await refreshPresence();


                        window.dispatchEvent(
                            new Event(
                                "flowforge:notifications-refresh"
                            )
                        );


                        const boardId =
                            requestedBoardIdRef.current;


                        if (
                            boardId
                        ) {

                            try {

                                await connection.invoke(
                                    "JoinBoard",
                                    boardId
                                );


                                console.log(
                                    "Presence: rejoined board:",
                                    boardId
                                );

                            } catch (
                                error
                            ) {

                                console.error(
                                    "Presence: failed to rejoin board:",
                                    error
                                );
                            }
                        }
                    }
                );


                /* =============================================
                   RECONNECTING
                   ============================================= */

                connection.onreconnecting(
                    () => {

                        if (
                            !isMountedRef.current
                        ) {
                            return;
                        }


                        console.warn(
                            "Presence: SignalR reconnecting..."
                        );


                        setIsBoardConnected(
                            false
                        );
                    }
                );


                /* =============================================
                   CLOSED
                   ============================================= */

                connection.onclose(
                    () => {

                        console.warn(
                            "Presence: SignalR connection closed."
                        );


                        if (
                            !isMountedRef.current
                        ) {
                            return;
                        }


                        setIsBoardConnected(
                            false
                        );


                        setBoardViewers(
                            []
                        );
                    }
                );


                /* =============================================
                   START CONNECTION
                   ============================================= */

                try {

                    console.log(
                        "Presence: connecting to SignalR..."
                    );


                    const startPromise =
                        connection.start();


                    connectionStartRef.current =
                        startPromise;


                    await startPromise;


                    if (
                        connectionStartRef.current ===
                        startPromise
                    ) {

                        connectionStartRef.current =
                            null;
                    }


                    if (
                        !isMountedRef.current
                    ) {

                        return;
                    }


                    if (
                        connectionRef.current !==
                        connection
                    ) {

                        return;
                    }


                    console.log(
                        "Presence: SignalR connected."
                    );


                    setIsBoardConnected(
                        true
                    );


                    /*
                     * Immediately refresh online users
                     * after SignalR connects.
                     *
                     * This is what removes the need for
                     * a browser refresh after login.
                     */
                    await refreshPresence();


                    if (
                        !isMountedRef.current ||
                        connectionRef.current !==
                            connection
                    ) {

                        return;
                    }


                    /* =========================================
                       JOIN QUEUED BOARD
                       ========================================= */

                    const boardId =
                        requestedBoardIdRef.current;


                    if (
                        boardId
                    ) {

                        try {

                            console.log(
                                "Presence: joining queued board:",
                                boardId
                            );


                            await connection.invoke(
                                "JoinBoard",
                                boardId
                            );


                            console.log(
                                "Presence: joined queued board:",
                                boardId
                            );

                        } catch (
                            error
                        ) {

                            console.error(
                                "Presence: failed to join queued board:",
                                error
                            );
                        }
                    }

                } catch (
                    error
                ) {

                    connectionStartRef.current =
                        null;


                    if (
                        connectionRef.current !==
                        connection
                    ) {

                        return;
                    }


                    console.error(
                        "Presence: SignalR connection failed:",
                        error
                    );


                    setIsBoardConnected(
                        false
                    );


                    if (
                        connectionRef.current ===
                        connection
                    ) {

                        connectionRef.current =
                            null;
                    }
                }
            };


        void start();


        /* =====================================================
           CLEANUP
           ===================================================== */

        return () => {

            isMountedRef.current =
                false;


            if (
                cleanupTimerRef.current
            ) {

                clearTimeout(
                    cleanupTimerRef.current
                );
            }


            /*
             * Delay cleanup slightly.
             *
             * This protects us from React StrictMode's:
             *
             * mount → cleanup → mount
             *
             * sequence.
             */
            cleanupTimerRef.current =
                setTimeout(
                    () => {

                        cleanupTimerRef.current =
                            null;


                        /*
                         * A new authenticated mount has
                         * already taken ownership.
                         */
                        if (
                            isMountedRef.current
                        ) {

                            return;
                        }


                        const connection =
                            connectionRef.current;


                        if (
                            !connection
                        ) {

                            return;
                        }


                        /* =====================================
                           CONNECTING
                           ===================================== */

                        if (
                            connection.state ===
                            HubConnectionState.Connecting
                        ) {

                            const startPromise =
                                connectionStartRef.current;


                            if (
                                startPromise
                            ) {

                                void startPromise
                                    .then(
                                        async () => {

                                            if (
                                                isMountedRef.current
                                            ) {

                                                return;
                                            }


                                            if (
                                                connectionRef.current !==
                                                connection
                                            ) {

                                                return;
                                            }


                                            try {

                                                await connection.stop();

                                            } catch {
                                                /*
                                                 * Cleanup only.
                                                 */
                                            }


                                            if (
                                                connectionRef.current ===
                                                connection
                                            ) {

                                                connectionRef.current =
                                                    null;
                                            }

                                        }
                                    )
                                    .catch(
                                        () => {

                                            if (
                                                connectionRef.current ===
                                                connection
                                            ) {

                                                connectionRef.current =
                                                    null;
                                            }
                                        }
                                    );
                            }


                            return;
                        }


                        /* =====================================
                           CONNECTED / RECONNECTING
                           ===================================== */

                        if (
                            connection.state ===
                                HubConnectionState.Connected ||
                            connection.state ===
                                HubConnectionState.Reconnecting
                        ) {

                            void connection
                                .stop()
                                .catch(
                                    () => {}
                                )
                                .finally(
                                    () => {

                                        if (
                                            connectionRef.current ===
                                            connection
                                        ) {

                                            connectionRef.current =
                                                null;
                                        }

                                    }
                                );

                        } else {

                            if (
                                connectionRef.current ===
                                connection
                            ) {

                                connectionRef.current =
                                    null;
                            }
                        }


                        requestedBoardIdRef.current =
                            null;


                        setOnlineUsers([]);

                        setPresence({});

                        setBoardViewers([]);

                        setIsBoardConnected(
                            false
                        );

                    },
                    250
                );
        };

    }, [
        isAuthenticated,
        accessToken,
        authenticatedUserId,
        refreshPresence,
        updateUserStatus,
    ]);


    /* =========================================================
       ONLINE USER IDS
       ========================================================= */

    const onlineUserIds =
        useMemo(
            () =>
                onlineUsers.map(
                    (user: OnlineUser) =>
                        user.userId
                ),
            [onlineUsers]
        );


    /* =========================================================
       IS ONLINE
       ========================================================= */

    const isOnline =
        useCallback(
            (
                userId?:
                    | string
                    | null
            ) => {

                const normalizedId =
                    normalizeUserId(
                        userId
                    );


                if (
                    !normalizedId
                ) {

                    return false;
                }


                return (
                    presence[
                        normalizedId
                    ] ===
                    "online"
                );
            },
            [presence]
        );


    /* =========================================================
       CONTEXT VALUE
       ========================================================= */

    const value =
        useMemo<PresenceContextValue>(
            () => ({
                presence,

                onlineUserIds,

                onlineUsers,

                isOnline,

                refreshPresence,

                lastNotification,

                boardViewers,

                joinBoard,

                leaveBoard,

                isBoardConnected,
            }),
            [
                presence,
                onlineUserIds,
                onlineUsers,
                isOnline,
                refreshPresence,
                lastNotification,
                boardViewers,
                joinBoard,
                leaveBoard,
                isBoardConnected,
            ]
        );


    return (
        <PresenceContext.Provider
            value={value}
        >
            {children}
        </PresenceContext.Provider>
    );
}


/* =========================================================
   CONTEXT HOOK
   ========================================================= */

export function usePresenceContext() {

    const context =
        useContext(
            PresenceContext
        );


    if (!context) {

        throw new Error(
            "usePresenceContext must be used inside PresenceProvider"
        );
    }


    return context;
}