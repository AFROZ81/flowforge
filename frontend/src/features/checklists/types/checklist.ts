export type ChecklistItem = {
    id: string;
    title: string;
    order: number;
    isCompleted: boolean;
    completedAt?: string | null;
    completedBy?: string | null;
};

export type ChecklistProgress = {
    totalItems: number;
    completedItems: number;
    progressPercentage: number;
};

export type CreateChecklistRequest = {
    workItemId: string;
    title: string;
};

export type UpdateChecklistRequest = {
    checklistItemId: string;
    title: string;
};

export type ReorderChecklistItem = {
    checklistItemId: string;
    order: number;
};

export type ReorderChecklistRequest = {
    items: ReorderChecklistItem[];
};
