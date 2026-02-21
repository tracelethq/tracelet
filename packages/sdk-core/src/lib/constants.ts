export const DEFAULT_INGEST_BASE_URL = "http://localhost:3003";
export const DEFAULT_INGEST_PATH = "/api/ingest";

export const env={
    LOCAL: "local",
}

export const LOG_START_PREFIX="[Tracelet]";

export const LogMessages = {
    INGEST_SKIPPED_IN_LOCAL_ENVIRONMENT: "Ingest skipped in local environment",
    DOCS_JSON_SYNCED_TO_SERVER: "Docs Json synced to server",
    ERROR_SYNCING_DOCS_JSON_TO_SERVER: "Error syncing docs Json to server",
    TRACELET_API_KEY_NOT_SET: "TRACELET_API_KEY is not set. Set the env var or pass options.apiKey for ingest to authenticate.",
    TRACELET_API_KEY_NOT_SET_ERROR: "TRACELET_API_KEY is not set",
}