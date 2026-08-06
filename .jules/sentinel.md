## 2024-05-18 - API Token Leakage in Internal Telemetry and Responses
**Vulnerability:** Machine identity tokens were being emitted unredacted to internal telemetry buses (potentially logging or monitoring tools) and also exposed directly in the `/api/identity/list` endpoint which returns a list of active machines.
**Learning:** In applications mapping active objects to in-memory databases (like `MACHINE_DB`), internal state objects usually represent the entire object, including secrets or credentials. It's unsafe to stream or expose this entire object without a redaction/sanitization step.
**Prevention:** Destructure and explicitly omit sensitive secrets like `token` from objects whenever they are being emitted for telemetry, logging, or sent as non-authenticated API responses.

## 2026-08-04 - Prevent Credential Leakage in Telemetry Logs
**Vulnerability:** Invalid authorization tokens submitted by users were logged directly to the public telemetry bus without redaction, potentially leaking accidentally pasted passwords or API keys.
**Learning:** Even invalid or rejected inputs must be treated as sensitive and sanitized before logging, as users often paste incorrect credentials by mistake.
**Prevention:** Always mask or redact authentication tokens in logs and telemetry, whether they are valid or invalid.

## 2026-08-05 - Prevent SSRF and Path Traversal in Parsed External URLs
**Vulnerability:** The application was parsing external GitHub URLs provided by the user and injecting the resulting `owner` and `repo` path components directly into internal HTTP requests to the GitHub API without validation. This created a Server-Side Request Forgery (SSRF) and path traversal vulnerability.
**Learning:** External URL components, even when seemingly just path segments, must be strictly validated before being used to construct outbound backend requests. Unvalidated components can contain special characters (like `..`) that manipulate the request's intended destination.
**Prevention:** Always validate parsed URL path components using a strict allowlist regex (e.g., `/^[a-zA-Z0-9_.-]+$/`) and explicitly reject any path traversal sequences (`..`) before utilizing them in server-side requests.
