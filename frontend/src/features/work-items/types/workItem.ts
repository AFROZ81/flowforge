export type WorkItem = {
    id: string;

    title: string;

    description?: string;

    priority: number;

    status: number;

    displayOrder: number;

    dueDate?: string;

    isArchived: boolean;
};