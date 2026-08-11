export type WorkItemWatcher = {
    id: string;
    userId: string;
    fullName: string;
    email?: string | null;
    createdAt: string;
};

export type AddWorkItemWatcherRequest = {
    workItemId: string;
    userId: string;
};