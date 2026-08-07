import api from "@/lib/api";
import type { Board } from "../types/board";

export type CreateBoardRequest = {
    projectId: string;
    name: string;
    description?: string;
};

export const getBoards = async (
    projectId: string
): Promise<Board[]> => {
    const res = await api.get("/Boards", {
        params: {
            projectId,
        },
    });

    return res.data.data.items;
};

export const getBoard = async (
    id: string
): Promise<Board> => {
    const res = await api.get(`/Boards/${id}`);

    return res.data.data;
};

export const createBoard = async (
    data: CreateBoardRequest
): Promise<Board> => {
    const res = await api.post(
        "/Boards",
        data
    );

    return res.data.data;
};