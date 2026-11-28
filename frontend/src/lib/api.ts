import axios, { type AxiosError } from "axios";

import {
    useAuthStore,
} from "@/stores/auth.store";


const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL,

    headers: {
        "Content-Type":
            "application/json",
    },
});


/* =========================================================
   REQUEST INTERCEPTOR
   ========================================================= */

api.interceptors.request.use(
    (config) => {

        const token =
            useAuthStore
                .getState()
                .accessToken;


        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }


        /*
         * IMPORTANT:
         *
         * Attachment uploads use FormData.
         *
         * Do NOT send:
         *
         * Content-Type: application/json
         *
         * for FormData requests.
         *
         * The browser/Axios will automatically
         * generate:
         *
         * multipart/form-data;
         * boundary=...
         *
         * The boundary is required by ASP.NET
         * Core to correctly parse the uploaded file.
         */

        if (
            typeof FormData !==
                "undefined" &&
            config.data instanceof FormData
        ) {
            delete config.headers[
                "Content-Type"
            ];
        }


        return config;
    },

    (error) => {
        return Promise.reject(
            error
        );
    }
);


let refreshRequest: Promise<boolean> | null = null;


/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const config = error.config;
        const url = config?.url ?? "";
        const isAuthEndpoint =
            url.includes("/Auth/login") ||
            url.includes("/Auth/register") ||
            url.includes("/Auth/refresh");

        if (error.response?.status !== 401 || !config || isAuthEndpoint) {
            return Promise.reject(error);
        }

        const retryConfig = config as typeof config & { _retry?: boolean };

        if (retryConfig._retry) {
            return Promise.reject(error);
        }

        retryConfig._retry = true;

        try {
            refreshRequest ??= useAuthStore
                .getState()
                .refreshSession();

            await refreshRequest;

            const token = useAuthStore.getState().accessToken;

            if (!token) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            retryConfig.headers.Authorization = `Bearer ${token}`;
            return api(retryConfig);
        } catch (refreshError) {
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
        } finally {
            refreshRequest = null;
        }
    }
);


export default api;