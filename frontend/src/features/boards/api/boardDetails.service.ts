import api from "@/lib/api";

export const getBoardDetails = async (boardId: string) => {
    const res = await api.get(`/Boards/${boardId}/details`);
    return res.data.data;
};