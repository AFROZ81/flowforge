import axios from "axios";

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


console.log(
    "API URL:",
    import.meta.env.VITE_API_URL
);


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


export default api;