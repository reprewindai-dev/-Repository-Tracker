## 2024-05-18 - [Token Leak in Telemetry & List Endpoints]
**Vulnerability:** Machine identity tokens were being exposed in plaintext through the `/api/identity/list` endpoint and the telemetry bus (`/api/telemetry/bus`).
**Learning:** Returning raw in-memory databases (like `MACHINE_DB`) or indiscriminately logging raw payloads can inadvertently expose sensitive credentials that grant API access.
**Prevention:** Always sanitize or redact sensitive fields (like tokens or passwords) from objects before serializing them for diagnostic, listing, or telemetry endpoints.
