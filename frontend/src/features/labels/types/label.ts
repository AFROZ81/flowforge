export type Label = {
    id: string;
    organizationId: string;
    name: string;
    color: string;
    description?: string | null;
    createdAt: string;
    updatedAt?: string | null;
};

export type WorkItemLabel = {
    id: string;
    labelId: string;
    name: string;
    color: string;
    description?: string | null;
    assignedAt: string;
};

export type CreateLabelRequest = {
    name: string;
    color: string;
    description?: string | null;
};

export type UpdateLabelRequest = {
    labelId: string;
    name: string;
    color: string;
    description?: string | null;
};