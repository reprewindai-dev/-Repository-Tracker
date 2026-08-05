## 2024-05-18 - API Token Leakage in Internal Telemetry and Responses
**Vulnerability:** Machine identity tokens were being emitted unredacted to internal telemetry buses (potentially logging or monitoring tools) and also exposed directly in the `/api/identity/list` endpoint which returns a list of active machines.
**Learning:** In applications mapping active objects to in-memory databases (like `MACHINE_DB`), internal state objects usually represent the entire object, including secrets or credentials. It's unsafe to stream or expose this entire object without a redaction/sanitization step.
**Prevention:** Destructure and explicitly omit sensitive secrets like `token` from objects whenever they are being emitted for telemetry, logging, or sent as non-authenticated API responses.

## 2026-08-04 - Prevent Credential Leakage in Telemetry Logs
**Vulnerability:** Invalid authorization tokens submitted by users were logged directly to the public telemetry bus without redaction, potentially leaking accidentally pasted passwords or API keys.
**Learning:** Even invalid or rejected inputs must be treated as sensitive and sanitized before logging, as users often paste incorrect credentials by mistake.
**Prevention:** Always mask or redact authentication tokens in logs and telemetry, whether they are valid or invalid.

## 2026-08-05 - Prevent Server-Side Request Forgery (SSRF) / Path Traversal in GitHub URL Parser
**Vulnerability:** The application extracts 'owner' and 'repo' components from user-supplied GitHub URLs and interpolates them directly into internal HTTP requests (fetch) to api.github.com.
**Learning:** When attackers provide path traversal payloads (e.g., '..'), the resulting constructed URL can resolve to unintended backend endpoints, bypassing security checks or accessing data outside the intended scope.
**Prevention:** Strictly validate all parsed URL path components using a regex that permits only safe characters (e.g., '/^[a-zA-Z0-9_.-]+$/') and explicitly deny path traversal sequences like '..' before using them in internal requests.
