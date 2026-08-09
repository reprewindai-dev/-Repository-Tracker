## 2024-05-18 - API Token Leakage in Internal Telemetry and Responses
**Vulnerability:** Machine identity tokens were being emitted unredacted to internal telemetry buses (potentially logging or monitoring tools) and also exposed directly in the `/api/identity/list` endpoint which returns a list of active machines.
**Learning:** In applications mapping active objects to in-memory databases (like `MACHINE_DB`), internal state objects usually represent the entire object, including secrets or credentials. It's unsafe to stream or expose this entire object without a redaction/sanitization step.
**Prevention:** Destructure and explicitly omit sensitive secrets like `token` from objects whenever they are being emitted for telemetry, logging, or sent as non-authenticated API responses.

## 2026-08-04 - Prevent Credential Leakage in Telemetry Logs
**Vulnerability:** Invalid authorization tokens submitted by users were logged directly to the public telemetry bus without redaction, potentially leaking accidentally pasted passwords or API keys.
**Learning:** Even invalid or rejected inputs must be treated as sensitive and sanitized before logging, as users often paste incorrect credentials by mistake.
**Prevention:** Always mask or redact authentication tokens in logs and telemetry, whether they are valid or invalid.

## 2024-05-19 - SSRF and Path Traversal in Parsed URLs
**Vulnerability:** External URLs (like GitHub URLs) were parsed and their components (`owner` and `repo`) were used directly to construct requests to internal/external backend services without structural validation. This could allow Server-Side Request Forgery (SSRF) or Path Traversal if a malicious URL contained `..` or unexpected characters.
**Learning:** When parsing external input to build backend requests, never trust that the structure represents what you expect (e.g. just because it was split by `/`).
**Prevention:** Strictly validate parsed path components using a regex allowlist (e.g., `/^[a-zA-Z0-9_.-]+$/`) and explicitly reject sequences like `.` and `..` before using them to construct API requests.
