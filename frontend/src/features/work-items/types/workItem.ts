export type WorkItem = {
    id: string;
    boardId?: string;
    columnId?: string;

    title: string;
    description?: string | null;

    status: string | number;
    priority: string | number;

    assigneeId?: string | null;

    estimate?: number;
    order?: number;
    displayOrder?: number;

    dueDate?: string | null;

    archived?: boolean;
    isArchived?: boolean;

    createdAt?: string;
    updatedAt?: string;
};