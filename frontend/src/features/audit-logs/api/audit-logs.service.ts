import api from "@/lib/api";
import { fromIstDateInput } from "@/lib/datetime";

export type AuditLogEntry = {
    id: string;
    type: string;
    actorId: string | null;
    actorName: string;
    actorIpAddress: string;
    targetEntityId: string | null;
    targetEntityType: string;
    action: string;
    description: string;
    oldValuesJson: string;
    newValuesJson: string;
    metadataJson: string;
    isSensitive: boolean;
    createdAt: string;
};

export type AuditLogPage = {
    items: AuditLogEntry[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export type AuditLogStatistics = {
    totalEntries: number;
    sensitiveEntries: number;
    todayEntries: number;
    byType: Record<string, number>;
    byActor: Record<string, number>;
};

export type AuditLogFilters = {
    page: number;
    pageSize: number;
    search?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
    isSensitive?: boolean;
};

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readProperty(object: JsonObject, key: string): unknown {
    const pascalCaseKey = key[0].toUpperCase() + key.slice(1);
    return object[key] !== undefined ? object[key] : object[pascalCaseKey];
}

function readResponseObject(value: unknown, description: string): JsonObject {
    if (!isJsonObject(value)) {
        throw new Error(`The ${description} response was not an object.`);
    }

    if (Array.isArray(readProperty(value, "items"))) {
        return value;
    }

    const wrappedData = readProperty(value, "data");
    if (isJsonObject(wrappedData)) {
        return wrappedData;
    }

    return value;
}

function readString(object: JsonObject, key: string): string {
    const value = readProperty(object, key);
    if (typeof value !== "string") {
        throw new Error(`The audit log response is missing "${key}".`);
    }

    return value;
}

function readNullableString(object: JsonObject, key: string): string | null {
    const value = readProperty(object, key);
    if (value !== null && typeof value !== "string") {
        throw new Error(`The audit log response has an invalid "${key}".`);
    }

    return value;
}

function readNumber(object: JsonObject, key: string): number {
    const value = readProperty(object, key);
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(`The audit log response is missing "${key}".`);
    }

    return value;
}

function readDictionary(object: JsonObject, key: string): Record<string, number> {
    const value = readProperty(object, key);
    if (!isJsonObject(value)) {
        throw new Error(`The audit statistics response is missing "${key}".`);
    }

    return Object.fromEntries(
        Object.entries(value).map(([name, count]) => {
            if (typeof count !== "number" || !Number.isFinite(count)) {
                throw new Error(`The audit statistics response has an invalid "${key}" count.`);
            }

            return [name, count];
        })
    );
}

function normalizeAuditLog(value: unknown): AuditLogEntry {
    if (!isJsonObject(value)) {
        throw new Error("The audit log response contains an invalid event.");
    }

    const isSensitive = readProperty(value, "isSensitive");
    if (typeof isSensitive !== "boolean") {
        throw new Error('The audit log response is missing "isSensitive".');
    }

    return {
        id: readString(value, "id"),
        type: readString(value, "type"),
        actorId: readNullableString(value, "actorId"),
        actorName: readString(value, "actorName"),
        actorIpAddress: readString(value, "actorIpAddress"),
        targetEntityId: readNullableString(value, "targetEntityId"),
        targetEntityType: readString(value, "targetEntityType"),
        action: readString(value, "action"),
        description: readString(value, "description"),
        oldValuesJson: readString(value, "oldValuesJson"),
        newValuesJson: readString(value, "newValuesJson"),
        metadataJson: readString(value, "metadataJson"),
        isSensitive,
        createdAt: readString(value, "createdAt"),
    };
}

function normalizeAuditLogPage(value: unknown): AuditLogPage {
    const response = readResponseObject(value, "audit log");
    const items = readProperty(response, "items");
    if (!Array.isArray(items)) {
        throw new Error('The audit log response is missing the "items" list.');
    }

    return {
        items: items.map(normalizeAuditLog),
        totalCount: readNumber(response, "totalCount"),
        page: readNumber(response, "page"),
        pageSize: readNumber(response, "pageSize"),
        totalPages: readNumber(response, "totalPages"),
    };
}

function normalizeAuditLogStatistics(value: unknown): AuditLogStatistics {
    const response = readResponseObject(value, "audit statistics");

    return {
        totalEntries: readNumber(response, "totalEntries"),
        sensitiveEntries: readNumber(response, "sensitiveEntries"),
        todayEntries: readNumber(response, "todayEntries"),
        byType: readDictionary(response, "byType"),
        byActor: readDictionary(response, "byActor"),
    };
}

async function getAuditLogs(filters: AuditLogFilters): Promise<AuditLogPage> {
    const response = await api.get<unknown>("/AuditLogs", {
        params: {
            ...filters,
            fromDate: filters.fromDate
                ? fromIstDateInput(filters.fromDate) ?? undefined
                : undefined,
            toDate: filters.toDate
                ? fromIstDateInput(filters.toDate) ?? undefined
                : undefined,
        },
    });

    return normalizeAuditLogPage(response.data);
}

async function getAuditLogStatistics(): Promise<AuditLogStatistics> {
    const response = await api.get<unknown>(
        "/AuditLogs/statistics"
    );

    return normalizeAuditLogStatistics(response.data);
}

export const auditLogsService = {
    getAuditLogs,
    getAuditLogStatistics,
};
