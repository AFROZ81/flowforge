import { useQuery } from "@tanstack/react-query";

import { getLabels } from "../api/label.service";

export const LABELS_QUERY_KEY = ["labels"];

export const useLabels = () => {
    return useQuery({
        queryKey: LABELS_QUERY_KEY,
        queryFn: getLabels,
    });
};