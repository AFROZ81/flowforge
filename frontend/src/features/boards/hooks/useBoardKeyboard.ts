import {
    useCallback,
    useState,
} from "react";

type BoardKeyboardFocus =
    | {
          kind: "column";
          columnIndex: number;
      }
    | {
          kind: "card";
          columnIndex: number;
          cardIndex: number;
      }
    | null;

type BoardKeyboardActions = {
    onOpenWorkItem: (workItemId: string) => void;
    onEditWorkItem: (workItemId: string) => void;
    onOpenComments: (workItemId: string) => void;
    onOpenLabels: (workItemId: string) => void;
    onSetDueDate: (workItemId: string) => void;
    onToggleComplete: (workItemId: string, status: number) => void;
};

type UseBoardKeyboardProps = {
    columns: {
        id: string;
        workItems: {
            id: string;
            status: number;
        }[];
    }[];
    actions: BoardKeyboardActions;
};

export function useBoardKeyboard({
    columns,
    actions,
}: UseBoardKeyboardProps) {
    const [focus, setFocus] = useState<BoardKeyboardFocus>(null);

    const activeColumnCount = columns.length;

    /* ------------------------------------------------------------
       NAVIGATION
       ------------------------------------------------------------ */

    const setColumnFocus = useCallback(
        (index: number) => {
            if (index < 0 || index >= activeColumnCount) return;
            setFocus({ kind: "column", columnIndex: index });
        },
        [activeColumnCount]
    );

    const setCardFocus = useCallback(
        (columnIndex: number, cardIndex: number) => {
            if (columnIndex < 0 || columnIndex >= activeColumnCount) return;
            const column = columns[columnIndex];
            if (!column) return;

            const activeItems = column.workItems.filter(
                (item) => !item.id.endsWith("-archived")
            );

            if (cardIndex < 0 || cardIndex >= activeItems.length) return;

            setFocus({ kind: "card", columnIndex, cardIndex });
        },
        [activeColumnCount, columns]
    );

    const clearFocus = useCallback(() => setFocus(null), []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            /* Ignore keyboard events while the user is typing in an input,
               textarea, select or any contenteditable element. */
            const target = event.target as HTMLElement | null;
            const isEditable =
                target?.isContentEditable ||
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.tagName === "SELECT";

            if (isEditable) return;

            const isCardFocused = focus?.kind === "card";
            const isColumnFocused = focus?.kind === "column";

            /* ----------------------------------------------------
               GLOBAL ACTIONS (work when any board element focused)
               ---------------------------------------------------- */

            switch (event.key) {
                case "Escape": {
                    clearFocus();
                    return;
                }
            }

            /* ----------------------------------------------------
               COLUMN HEADER FOCUSED
               ---------------------------------------------------- */

            if (isColumnFocused) {
                const { columnIndex } = focus;

                switch (event.key) {
                    case "ArrowRight": {
                        event.preventDefault();
                        setColumnFocus(
                            (columnIndex + 1) % activeColumnCount
                        );
                        return;
                    }
                    case "ArrowLeft": {
                        event.preventDefault();
                        setColumnFocus(
                            (columnIndex - 1 + activeColumnCount) %
                                activeColumnCount
                        );
                        return;
                    }
                    case "ArrowDown": {
                        event.preventDefault();
                        const column = columns[columnIndex];
                        if (!column) return;
                        const activeItems = column.workItems.filter(
                            (item) => !item.id.endsWith("-archived")
                        );
                        if (activeItems.length > 0) {
                            setCardFocus(columnIndex, 0);
                        }
                        return;
                    }
                }

                return;
            }

            /* ----------------------------------------------------
               CARD FOCUSED
               ---------------------------------------------------- */

            if (isCardFocused) {
                const { columnIndex, cardIndex } = focus;
                const column = columns[columnIndex];
                if (!column) return;

                const activeItems = column.workItems.filter(
                    (item) => !item.id.endsWith("-archived")
                );

                switch (event.key) {
                    case "ArrowUp": {
                        event.preventDefault();
                        if (cardIndex > 0) {
                            setCardFocus(columnIndex, cardIndex - 1);
                        } else {
                            setColumnFocus(columnIndex);
                        }
                        return;
                    }
                    case "ArrowDown": {
                        event.preventDefault();
                        if (cardIndex < activeItems.length - 1) {
                            setCardFocus(columnIndex, cardIndex + 1);
                        }
                        return;
                    }
                    case "ArrowLeft":
                    case "ArrowRight": {
                        event.preventDefault();
                        setColumnFocus(columnIndex);
                        return;
                    }
                    case "Enter": {
                        event.preventDefault();
                        actions.onOpenWorkItem(
                            activeItems[cardIndex].id
                        );
                        return;
                    }
                    case "e":
                    case "E": {
                        event.preventDefault();
                        actions.onEditWorkItem(
                            activeItems[cardIndex].id
                        );
                        return;
                    }
                    case "c":
                    case "C": {
                        event.preventDefault();
                        actions.onOpenComments(
                            activeItems[cardIndex].id
                        );
                        return;
                    }
                    case "l":
                    case "L": {
                        event.preventDefault();
                        actions.onOpenLabels(
                            activeItems[cardIndex].id
                        );
                        return;
                    }
                    case "d":
                    case "D": {
                        event.preventDefault();
                        actions.onSetDueDate(
                            activeItems[cardIndex].id
                        );
                        return;
                    }
                    case " ": {
                        event.preventDefault();
                        const item = activeItems[cardIndex];
                        actions.onToggleComplete(
                            item.id,
                            item.status === 2 ? 1 : 2
                        );
                        return;
                    }
                }

                return;
            }
        },
        [
            focus,
            columns,
            activeColumnCount,
            setColumnFocus,
            setCardFocus,
            clearFocus,
            actions,
        ]
    );

    return {
        focus,
        setFocus,
        setColumnFocus,
        setCardFocus,
        clearFocus,
        handleKeyDown,
    };
}
