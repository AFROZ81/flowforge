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

export type BoardViewer = {
    userId: string;
    userName: string;
};

type PresenceContextValue = {
    /* Global presence */

    presence: PresenceState;

    /*
     * Kept for compatibility with existing components.
     */
    onlineUserIds: string[];

    /*
     * Full online user information.
     */
    onlineUsers: OnlineUser[];

    isOnline: (
        userId?: string | null
    ) => boolean;

    refreshPresence: () => Promise<void>;


    /* Board presence */

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


function getAccessToken(): string | null {

    const token =
        useAuthStore
            .getState()
            .accessToken;

    if (
        typeof token !== "string"
    ) {
        return null;
    }

    return token
        .replace(
            /^Bearer\s+/i,
            ""
        )
        .trim() || null;
}


/* =========================================================
   PROVIDER
   ========================================================= */

export default function PresenceProvider({
    children,
}: Props) {

    /* =====================================================
       GLOBAL PRESENCE
       ===================================================== */

    const [presence, setPresence] =
        useState<PresenceState>({});


    /*
     * Full information about currently
     * online users.
     */
    const [
        onlineUsers,
        setOnlineUsers,
    ] = useState<OnlineUser[]>([]);


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


    /*
     * SignalR connection.
     */
    const connectionRef =
        useRef<HubConnection | null>(
            null
        );


    /*
     * Board currently being viewed.
     */
    const requestedBoardIdRef =
        useRef<string | null>(null);


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


                /*
                 * Remove the user from the
                 * detailed online-user list
                 * when they go offline.
                 */
                if (
                    status === "offline"
                ) {

                    setOnlineUsers(
                        (
                            current: OnlineUser[]
                        ) =>
                            current.filter(
                                (
                                    user: OnlineUser
                                ) =>
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

                try {

                    const token =
                        getAccessToken();


                    if (!token) {

                        console.warn(
                            "Presence: no authenticated JWT found."
                        );

                        return;
                    }


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


                    /*
                     * Backend response:
                     *
                     * [
                     *   {
                     *     userId: "...",
                     *     fullName: "John Doe"
                     *   }
                     * ]
                     */


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


                    /*
                     * Explicitly construct OnlineUser[].
                     *
                     * This avoids TypeScript inferring
                     * the map/filter chain as unknown[].
                     */
                    const normalizedUsers: OnlineUser[] =
                        rawUsers.reduce(
                            (
                                users: OnlineUser[],
                                rawUser: unknown
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


                    /*
                     * Remove duplicate users.
                     */
                    const uniqueUsers: OnlineUser[] =
                        Array.from(
                            new Map<
                                string,
                                OnlineUser
                            >(
                                normalizedUsers.map(
                                    (
                                        user: OnlineUser
                                    ) => [
                                        user.userId,
                                        user,
                                    ]
                                )
                            ).values()
                        );


                    setOnlineUsers(
                        uniqueUsers
                    );


                    /*
                     * Keep the existing presence
                     * state working for OnlineIndicator
                     * and other components.
                     */
                    const nextPresence:
                        PresenceState =
                        {};


                    uniqueUsers.forEach(
                        (
                            user: OnlineUser
                        ) => {

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
            []
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

        let disposed = false;


        const start =
            async () => {

                const token =
                    getAccessToken();


                if (!token) {

                    console.warn(
                        "Presence: cannot connect to SignalR because no authenticated JWT exists."
                    );

                    return;
                }


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
                                        getAccessToken() ??
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


                /* =================================================
                   GLOBAL USER ONLINE
                   ================================================= */

                connection.on(
                    "UserOnline",
                    (
                        payload:
                            | string
                            | {
                                  userId?: string;
                                  UserId?: string;
                              }
                    ) => {

                        const userId =
                            typeof payload ===
                            "string"
                                ? payload
                                : payload?.userId ??
                                  payload?.UserId;


                        if (!userId) {
                            return;
                        }


                        updateUserStatus(
                            userId,
                            "online"
                        );


                        /*
                         * Refresh so the new user's
                         * name is available.
                         */
                        refreshPresence();
                    }
                );


                /* =================================================
                   GLOBAL USER OFFLINE
                   ================================================= */

                connection.on(
                    "UserOffline",
                    (
                        payload:
                            | string
                            | {
                                  userId?: string;
                                  UserId?: string;
                              }
                    ) => {

                        const userId =
                            typeof payload ===
                            "string"
                                ? payload
                                : payload?.userId ??
                                  payload?.UserId;


                        if (!userId) {
                            return;
                        }


                        updateUserStatus(
                            userId,
                            "offline"
                        );
                    }
                );


                /* =================================================
                   BOARD PRESENCE
                   ================================================= */

                connection.on(
                    "BoardPresenceChanged",
                    (
                        payload: {
                            boardId?: string;
                            BoardId?: string;

                            users?: Array<{
                                userId?: string;
                                UserId?: string;

                                userName?: string;
                                UserName?: string;
                            }>;

                            Users?: Array<{
                                userId?: string;
                                UserId?: string;

                                userName?: string;
                                UserName?: string;
                            }>;
                        }
                    ) => {

                        const eventBoardId =
                            payload?.boardId ??
                            payload?.BoardId;


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


                        const users =
                            payload?.users ??
                            payload?.Users ??
                            [];


                        const normalizedUsers =
                            users
                                .map(
                                    user => {

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


                /* =================================================
                   RECONNECTED
                   ================================================= */

                connection.onreconnected(
                    async () => {

                        console.log(
                            "Presence: SignalR reconnected."
                        );


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

                                await connection.invoke(
                                    "JoinBoard",
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


                /* =================================================
                   RECONNECTING
                   ================================================= */

                connection.onreconnecting(
                    () => {

                        console.warn(
                            "Presence: SignalR reconnecting..."
                        );


                        setIsBoardConnected(
                            false
                        );
                    }
                );


                /* =================================================
                   CLOSED
                   ================================================= */

                connection.onclose(
                    () => {

                        console.warn(
                            "Presence: SignalR connection closed."
                        );


                        setIsBoardConnected(
                            false
                        );
                    }
                );


                /* =================================================
                   START
                   ================================================= */

                try {

                    console.log(
                        "Presence: connecting to SignalR..."
                    );


                    await connection.start();


                    if (
                        disposed
                    ) {

                        await connection.stop();

                        return;
                    }


                    console.log(
                        "Presence: SignalR connected."
                    );


                    setIsBoardConnected(
                        true
                    );


                    /*
                     * Load initial online users
                     * with their names.
                     */
                    await refreshPresence();


                    /*
                     * Join queued board.
                     */
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

                    console.error(
                        "Presence: SignalR connection failed:",
                        error
                    );

                    setIsBoardConnected(
                        false
                    );
                }
            };


        start();


        /* =====================================================
           CLEANUP
           ===================================================== */

        return () => {

            disposed = true;


            requestedBoardIdRef.current =
                null;


            setBoardViewers([]);


            setIsBoardConnected(
                false
            );


            if (
                connectionRef.current &&
                connectionRef.current.state !==
                    HubConnectionState.Disconnected
            ) {

                connectionRef.current
                    .stop()
                    .catch(
                        () => {}
                    );
            }


            connectionRef.current =
                null;
        };

    }, [
        refreshPresence,
        updateUserStatus,
    ]);


    /* =====================================================
       ONLINE USER IDS
       ===================================================== */

    const onlineUserIds =
        useMemo(
            () =>
                onlineUsers.map(
                    (
                        user: OnlineUser
                    ) =>
                        user.userId
                ),
            [onlineUsers]
        );


    /* =====================================================
       IS ONLINE
       ===================================================== */

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


    /* =====================================================
       CONTEXT VALUE
       ===================================================== */

    const value =
        useMemo<PresenceContextValue>(
            () => ({
                presence,

                onlineUserIds,

                onlineUsers,

                isOnline,

                refreshPresence,

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