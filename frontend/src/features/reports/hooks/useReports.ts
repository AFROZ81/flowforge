import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    reportsService,
} from "../api/reports.service";

import type {
    AssigneeSummary,
    LabelUsage,
    ProductivityTrend,
    ProjectSummary,
    WorkItemSummary,
} from "../types/reports.types";


interface ReportsState {
    workItems: WorkItemSummary | null;
    projects: ProjectSummary[];
    assignees: AssigneeSummary[];
    labels: LabelUsage[];
    productivity: ProductivityTrend[];
}


const EMPTY_STATE: ReportsState = {
    workItems: null,
    projects: [],
    assignees: [],
    labels: [],
    productivity: [],
};


export function useReports(
    productivityDays: number
) {

    const [
        state,
        setState,
    ] = useState<ReportsState>(
        EMPTY_STATE
    );


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    /*
     * Prevent duplicate requests when React StrictMode
     * mounts the component twice in development.
     */

    const requestId =
        useRef(0);


    const loadReports =
        useCallback(
            async () => {

                const currentRequest =
                    ++requestId.current;


                setLoading(true);
                setError(null);


                try {

                    const [
                        workItems,
                        projects,
                        assignees,
                        labels,
                        productivity,
                    ] =
                        await Promise.all([
                            reportsService
                                .getWorkItemSummary(),

                            reportsService
                                .getProjectSummary(),

                            reportsService
                                .getAssigneeSummary(),

                            reportsService
                                .getLabelUsage(),

                            reportsService
                                .getProductivityTrends(
                                    productivityDays
                                ),
                        ]);


                    /*
                     * Ignore stale responses.
                     */

                    if (
                        currentRequest !==
                        requestId.current
                    ) {
                        return;
                    }


                    setState({
                        workItems,
                        projects,
                        assignees,
                        labels,
                        productivity,
                    });

                } catch (err) {

                    console.error(
                        "Reports: failed to load",
                        err
                    );


                    if (
                        currentRequest ===
                        requestId.current
                    ) {

                        setError(
                            "Unable to load reports. Please try again."
                        );
                    }

                } finally {

                    if (
                        currentRequest ===
                        requestId.current
                    ) {

                        setLoading(false);
                    }
                }

            },
            [
                productivityDays,
            ]
        );


    useEffect(
        () => {

            void loadReports();

        },
        [
            loadReports,
        ]
    );


    const refresh =
        useCallback(
            async () => {

                await loadReports();

            },
            [
                loadReports,
            ]
        );


    return {
        ...state,
        loading,
        error,
        refresh,
    };
}