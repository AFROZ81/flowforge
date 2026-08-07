export type BoardDetails = {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    isArchived: boolean;
    columns: BoardColumn[];
};

export type BoardColumn = {
    id: string;
    name: string;
    description?: string;
    displayOrder: number;
    workItems: BoardWorkItem[];
};

export type BoardWorkItem = {
    id: string;
    title: string;
    description?: string;
    priority: number;
    status: number;
    displayOrder: number;
    dueDate?: string;
    isArchived: boolean;
};