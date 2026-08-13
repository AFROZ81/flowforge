import {
    useMemo,
    useState,
} from "react";

import {
    createPortal,
} from "react-dom";

import {
    toast,
} from "sonner";

import {
    Button,
} from "@/components/ui/button";

import {
    useOrganizationUsers,
} from "@/features/work-items/hooks/useOrganizationUsers";

import OnlineIndicator from "@/features/presence/components/OnlineIndicator";

import {
    useWorkItemWatchers,
} from "../hooks/useWorkItemWatchers";

import {
    useAddWorkItemWatcher,
} from "../hooks/useAddWorkItemWatcher";

import {
    useRemoveWorkItemWatcher,
} from "../hooks/useRemoveWorkItemWatcher";

type Props = {
    workItemId: string;
    workItemTitle?: string;
};

export default function WorkItemWatchers({
    workItemId,
    workItemTitle,
}: Props) {
    const [
        isOpen,
        setIsOpen,
    ] = useState(false);

    const [
        addOpen,
        setAddOpen,
    ] = useState(false);

    const [
        selectedUserId,
        setSelectedUserId,
    ] = useState("");

    const {
        data: watchers = [],
        isLoading,
        isError,
    } = useWorkItemWatchers(
        workItemId
    );

    const {
        data: users = [],
        isLoading: usersLoading,
    } = useOrganizationUsers();

    const addMutation =
        useAddWorkItemWatcher();

    const removeMutation =
        useRemoveWorkItemWatcher();

    /*
     * ========================================
     * AVAILABLE USERS
     * ========================================
     */

    const availableUsers =
        useMemo(() => {
            const watcherIds =
                new Set(
                    watchers.map(
                        (watcher) =>
                            watcher.userId
                    )
                );

            return users.filter(
                (user) =>
                    !watcherIds.has(
                        user.id
                    )
            );
        }, [
            users,
            watchers,
        ]);

    /*
     * ========================================
     * CLOSE DIALOG
     * ========================================
     */

    const closeDialog = () => {
        setIsOpen(false);
        setAddOpen(false);
        setSelectedUserId("");
    };

    /*
     * ========================================
     * ADD WATCHER
     * ========================================
     */

    const handleAdd =
        async () => {
            if (
                !selectedUserId ||
                addMutation.isPending
            ) {
                return;
            }

            try {
                await addMutation.mutateAsync({
                    workItemId,
                    userId:
                        selectedUserId,
                });

                toast.success(
                    "Watcher added."
                );

                setSelectedUserId("");
                setAddOpen(false);
            } catch (error) {
                console.error(
                    error
                );

                toast.error(
                    "Failed to add watcher."
                );
            }
        };

    /*
     * ========================================
     * REMOVE WATCHER
     * ========================================
     */

    const handleRemove =
        async (
            watcherId: string
        ) => {
            if (
                removeMutation.isPending
            ) {
                return;
            }

            try {
                await removeMutation.mutateAsync({
                    watcherId,
                    workItemId,
                });

                toast.success(
                    "Watcher removed."
                );
            } catch (error) {
                console.error(
                    error
                );

                toast.error(
                    "Failed to remove watcher."
                );
            }
        };

    /*
     * ========================================
     * WATCHERS DIALOG
     *
     * Rendered through a portal so the
     * parent draggable card does not affect
     * fixed positioning.
     * ========================================
     */

    const watchersDialog =
        isOpen &&
        typeof document !== "undefined"
            ? createPortal(
                  <div
                      className="
                          fixed
                          inset-0
                          z-[100]
                          flex
                          items-center
                          justify-center
                          bg-black/40
                          p-4
                      "
                      onMouseDown={(
                          event
                      ) => {
                          if (
                              event.target ===
                              event.currentTarget
                          ) {
                              closeDialog();
                          }
                      }}
                  >
                      <div
                          className="
                              w-full
                              max-w-md
                              rounded-xl
                              border
                              bg-background
                              shadow-xl
                          "
                          onMouseDown={(
                              event
                          ) =>
                              event.stopPropagation()
                          }
                      >
                          {/* =================================
                              HEADER
                          ================================== */}

                          <div
                              className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-4
                                  border-b
                                  px-4
                                  py-3
                              "
                          >
                              <div>
                                  <h2
                                      className="
                                          text-sm
                                          font-semibold
                                      "
                                  >
                                      Watchers
                                  </h2>

                                  <p
                                      className="
                                          mt-0.5
                                          text-xs
                                          text-muted-foreground
                                      "
                                  >
                                      {workItemTitle
                                          ? `People watching "${workItemTitle}"`
                                          : "People watching this work item."}
                                  </p>
                              </div>

                              <button
                                  type="button"
                                  onClick={
                                      closeDialog
                                  }
                                  className="
                                      flex
                                      h-7
                                      w-7
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-md
                                      text-muted-foreground
                                      transition-colors
                                      hover:bg-muted
                                      hover:text-foreground
                                  "
                                  aria-label="Close"
                              >
                                  <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                  >
                                      <path d="M18 6 6 18" />
                                      <path d="m6 6 12 12" />
                                  </svg>
                              </button>
                          </div>

                          {/* =================================
                              BODY
                          ================================== */}

                          <div className="p-4">

                              {/* COUNT */}

                              <div
                                  className="
                                      mb-3
                                      flex
                                      items-center
                                      gap-2
                                  "
                              >
                                  <span
                                      className="
                                          text-xs
                                          font-semibold
                                      "
                                  >
                                      Watchers
                                  </span>

                                  <span
                                      className="
                                          rounded-full
                                          bg-muted
                                          px-1.5
                                          py-0.5
                                          text-[10px]
                                          font-medium
                                      "
                                  >
                                      {
                                          watchers.length
                                      }
                                  </span>
                              </div>

                              {/* LOADING */}

                              {isLoading && (
                                  <div
                                      className="
                                          rounded-lg
                                          border
                                          border-dashed
                                          p-6
                                          text-center
                                          text-xs
                                          text-muted-foreground
                                      "
                                  >
                                      Loading
                                      watchers...
                                  </div>
                              )}

                              {/* ERROR */}

                              {isError && (
                                  <div
                                      className="
                                          rounded-lg
                                          border
                                          border-dashed
                                          p-6
                                          text-center
                                          text-xs
                                          text-red-500
                                      "
                                  >
                                      Failed to
                                      load
                                      watchers.
                                  </div>
                              )}

                              {/* EMPTY */}

                              {!isLoading &&
                                  !isError &&
                                  watchers.length ===
                                      0 && (
                                      <div
                                          className="
                                              rounded-lg
                                              border
                                              border-dashed
                                              p-6
                                              text-center
                                              text-xs
                                              text-muted-foreground
                                          "
                                      >
                                          No
                                          watchers
                                          yet.
                                      </div>
                                  )}

                              {/* =================================
                                  WATCHER LIST
                              ================================== */}

                              {!isLoading &&
                                  !isError &&
                                  watchers.length >
                                      0 && (
                                      <div
                                          className="
                                              max-h-64
                                              space-y-2
                                              overflow-y-auto
                                              pr-1
                                          "
                                      >
                                          {watchers.map(
                                              (
                                                  watcher
                                              ) => (
                                                  <div
                                                      key={
                                                          watcher.id
                                                      }
                                                      className="
                                                          flex
                                                          items-center
                                                          justify-between
                                                          gap-3
                                                          rounded-lg
                                                          border
                                                          px-3
                                                          py-2.5
                                                      "
                                                  >
                                                      <div
                                                          className="
                                                              flex
                                                              min-w-0
                                                              items-center
                                                              gap-3
                                                          "
                                                      >
                                                          {/* AVATAR */}

                                                          <div
                                                              className="
                                                                  flex
                                                                  h-8
                                                                  w-8
                                                                  shrink-0
                                                                  items-center
                                                                  justify-center
                                                                  rounded-full
                                                                  bg-muted
                                                                  text-xs
                                                                  font-medium
                                                              "
                                                          >
                                                              {watcher.fullName
                                                                  ?.charAt(
                                                                      0
                                                                  )
                                                                  .toUpperCase() ||
                                                                  "?"}
                                                          </div>

                                                          {/* USER */}

                                                          <div
                                                              className="
                                                                  min-w-0
                                                              "
                                                          >
                                                              <div
                                                                  className="
                                                                      flex
                                                                      min-w-0
                                                                      items-center
                                                                      gap-1.5
                                                                  "
                                                              >
                                                                  <p
                                                                      className="
                                                                          min-w-0
                                                                          truncate
                                                                          text-xs
                                                                          font-medium
                                                                      "
                                                                  >
                                                                      {
                                                                          watcher.fullName
                                                                      }
                                                                  </p>

                                                                  {/* ONLINE STATUS */}

                                                                  <OnlineIndicator
                                                                      userId={
                                                                          watcher.userId
                                                                      }
                                                                  />
                                                              </div>

                                                              {watcher.email && (
                                                                  <p
                                                                      className="
                                                                          truncate
                                                                          text-[10px]
                                                                          text-muted-foreground
                                                                      "
                                                                  >
                                                                      {
                                                                          watcher.email
                                                                      }
                                                                  </p>
                                                              )}
                                                          </div>
                                                      </div>

                                                      {/* REMOVE */}

                                                      <Button
                                                          type="button"
                                                          variant="ghost"
                                                          size="sm"
                                                          className="
                                                              shrink-0
                                                              px-2
                                                              text-xs
                                                              text-red-600
                                                              hover:bg-red-50
                                                              hover:text-red-700
                                                          "
                                                          onClick={() =>
                                                              handleRemove(
                                                                  watcher.id
                                                              )
                                                          }
                                                          disabled={
                                                              removeMutation.isPending
                                                          }
                                                      >
                                                          {removeMutation.isPending
                                                              ? "..."
                                                              : "Remove"}
                                                      </Button>
                                                  </div>
                                              )
                                          )}
                                      </div>
                                  )}

                              {/* =================================
                                  ADD WATCHER
                              ================================== */}

                              {!isLoading &&
                                  !isError &&
                                  availableUsers.length >
                                      0 && (
                                      <div className="mt-3">
                                          {!addOpen ? (
                                              <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  className="
                                                      w-full
                                                  "
                                                  onClick={() =>
                                                      setAddOpen(
                                                          true
                                                      )
                                                  }
                                              >
                                                  + Add
                                                  Watcher
                                              </Button>
                                          ) : (
                                              <div
                                                  className="
                                                      rounded-lg
                                                      border
                                                      bg-muted/20
                                                      p-3
                                                  "
                                              >
                                                  <div
                                                      className="
                                                          flex
                                                          flex-col
                                                          gap-2
                                                      "
                                                  >
                                                      <select
                                                          value={
                                                              selectedUserId
                                                          }
                                                          onChange={(
                                                              event
                                                          ) =>
                                                              setSelectedUserId(
                                                                  event
                                                                      .target
                                                                      .value
                                                              )
                                                          }
                                                          disabled={
                                                              usersLoading ||
                                                              addMutation.isPending
                                                          }
                                                          className="
                                                              h-9
                                                              w-full
                                                              rounded-md
                                                              border
                                                              bg-background
                                                              px-3
                                                              text-xs
                                                              outline-none
                                                              focus:ring-2
                                                              focus:ring-ring
                                                          "
                                                      >
                                                          <option value="">
                                                              Select a
                                                              user...
                                                          </option>

                                                          {availableUsers.map(
                                                              (
                                                                  user
                                                              ) => (
                                                                  <option
                                                                      key={
                                                                          user.id
                                                                      }
                                                                      value={
                                                                          user.id
                                                                      }
                                                                  >
                                                                      {
                                                                          user.fullName
                                                                      }
                                                                      {user.email
                                                                          ? ` (${user.email})`
                                                                          : ""}
                                                                  </option>
                                                              )
                                                          )}
                                                      </select>

                                                      <div
                                                          className="
                                                              flex
                                                              justify-end
                                                              gap-2
                                                          "
                                                      >
                                                          <Button
                                                              type="button"
                                                              variant="ghost"
                                                              size="sm"
                                                              onClick={() => {
                                                                  setAddOpen(
                                                                      false
                                                                  );

                                                                  setSelectedUserId(
                                                                      ""
                                                                  );
                                                              }}
                                                          >
                                                              Cancel
                                                          </Button>

                                                          <Button
                                                              type="button"
                                                              size="sm"
                                                              onClick={
                                                                  handleAdd
                                                              }
                                                              disabled={
                                                                  !selectedUserId ||
                                                                  addMutation.isPending
                                                              }
                                                          >
                                                              {addMutation.isPending
                                                                  ? "Adding..."
                                                                  : "Add Watcher"}
                                                          </Button>
                                                      </div>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  )}

                              {/* ALL USERS WATCHING */}

                              {!isLoading &&
                                  !isError &&
                                  availableUsers.length ===
                                      0 &&
                                  users.length > 0 && (
                                      <p
                                          className="
                                              mt-3
                                              text-center
                                              text-[11px]
                                              text-muted-foreground
                                          "
                                      >
                                          All
                                          organization
                                          users are
                                          already
                                          watching this
                                          work item.
                                      </p>
                                  )}
                          </div>
                      </div>
                  </div>,
                  document.body
              )
            : null;

    return (
        <>
            {/* ========================================
                CARD TRIGGER
            ======================================== */}

            <button
                type="button"
                onClick={(
                    event
                ) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOpen(true);
                }}
                className="
                    inline-flex
                    items-center
                    gap-1.5
                    text-xs
                    text-muted-foreground
                    transition-colors
                    hover:text-foreground
                "
            >
                {/* EYE ICON */}

                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path
                        d="
                            M2.5 12s3.5-6
                            9.5-6
                            9.5 6
                            9.5 6
                            -3.5 6
                            -9.5 6
                            -9.5-6
                            -9.5-6Z
                        "
                    />

                    <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                    />
                </svg>

                <span>
                    Watchers
                </span>

                <span
                    className="
                        rounded-full
                        bg-muted
                        px-1.5
                        py-0.5
                        text-[10px]
                        font-medium
                    "
                >
                    {watchers.length}
                </span>
            </button>

            {/* PORTALED DIALOG */}

            {watchersDialog}
        </>
    );
}