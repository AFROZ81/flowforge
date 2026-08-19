import api from "@/lib/api";

import type {
    Attachment,
} from "../types/attachment";

/**
 * Get all attachments belonging to a work item.
 */
export const getAttachmentsByWorkItem =
    async (
        workItemId: string
    ): Promise<Attachment[]> => {
        const response =
            await api.get(
                `/Attachments/workitem/${workItemId}`
            );

        return response.data.data ?? [];
    };


/**
 * Upload a single attachment.
 */
export const uploadAttachment =
    async (
        workItemId: string,
        file: File,
        onProgress?: (
            percentage: number
        ) => void
    ) => {
        const formData =
            new FormData();

        formData.append(
            "WorkItemId",
            workItemId
        );

        formData.append(
            "File",
            file
        );

        const response =
            await api.post(
                "/Attachments",
                formData,
                {
                    onUploadProgress:
                        (progressEvent) => {
                            if (
                                !progressEvent.total
                            ) {
                                return;
                            }

                            const percentage =
                                Math.round(
                                    (
                                        progressEvent.loaded /
                                        progressEvent.total
                                    ) *
                                    100
                                );

                            onProgress?.(
                                percentage
                            );
                        },
                }
            );

        return response.data.data;
    };


/**
 * Get attachment metadata.
 */
export const getAttachment =
    async (
        id: string
    ): Promise<Attachment> => {
        const response =
            await api.get(
                `/Attachments/${id}`
            );

        return response.data.data;
    };


/**
 * Download an attachment.
 */
export const downloadAttachment =
    async (
        id: string,
        fileName: string
    ) => {
        const response =
            await api.get(
                `/Attachments/${id}/download`,
                {
                    responseType: "blob",
                }
            );

        const contentType =
            typeof response.headers[
                "content-type"
            ] === "string"
                ? response.headers[
                      "content-type"
                  ]
                : "application/octet-stream";

        const blob =
            new Blob(
                [
                    response.data,
                ],
                {
                    type: contentType,
                }
            );

        const url =
            window.URL.createObjectURL(
                blob
            );

        const anchor =
            document.createElement(
                "a"
            );

        anchor.href =
            url;

        anchor.download =
            fileName;

        document.body.appendChild(
            anchor
        );

        anchor.click();

        anchor.remove();

        window.URL.revokeObjectURL(
            url
        );
    };


/**
 * Delete an attachment.
 */
export const deleteAttachment =
    async (
        id: string
    ) => {
        const response =
            await api.delete(
                `/Attachments/${id}`
            );

        return response.data;
    };