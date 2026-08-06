import api from "@/lib/api";

export const getProjectById = async (id: string) => {
    const res = await api.get(`/Projects/${id}`);
    return res.data.data;
};