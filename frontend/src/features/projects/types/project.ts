export type Project = {
    id: string;
    name: string;
    key: string;
    description: string;
    color: string;
    icon: string;
    archived?: boolean;
};

export type ProjectResponse = {
    success: boolean;
    message: string;
    data: {
        items: Project[];
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasPrevious: boolean;
        hasNext: boolean;
    };
};