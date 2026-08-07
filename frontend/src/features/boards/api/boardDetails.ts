import api from "@/lib/api";

export const getBoard = async (id: string) => {
    const res = await api.get(`/Boards/${id}`);
    return res.data.data;
};