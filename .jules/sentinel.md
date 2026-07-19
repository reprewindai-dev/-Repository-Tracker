## 2025-03-05 - [CRITICAL] Prevent Sensitive Token Leakage in Public APIs and Telemetry

**Vulnerability:** The application was exposing full in-memory `MachineIdentity` objects containing sensitive authentication tokens to public API endpoints (`/api/identity/list`) and to the `TELEMETRY_BUS` (which is publicly accessible via `/api/telemetry/bus`).
**Learning:** Returning full object representations or logging complete object states directly from in-memory maps often leads to unintentional credential exposure, especially in JavaScript where spreading or passing objects is common.
**Prevention:** Always destructure or explicitly map in-memory models to DTOs (Data Transfer Objects) that strip sensitive fields before returning them over an API or broadcasting them to event/telemetry buses.
