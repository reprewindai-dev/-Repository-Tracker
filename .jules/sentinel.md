## 2024-05-18 - API Token Leakage in Internal Telemetry and Responses
**Vulnerability:** Machine identity tokens were being emitted unredacted to internal telemetry buses (potentially logging or monitoring tools) and also exposed directly in the `/api/identity/list` endpoint which returns a list of active machines.
**Learning:** In applications mapping active objects to in-memory databases (like `MACHINE_DB`), internal state objects usually represent the entire object, including secrets or credentials. It's unsafe to stream or expose this entire object without a redaction/sanitization step.
**Prevention:** Destructure and explicitly omit sensitive secrets like `token` from objects whenever they are being emitted for telemetry, logging, or sent as non-authenticated API responses.

## 2026-08-04 - Prevent Credential Leakage in Telemetry Logs
**Vulnerability:** Invalid authorization tokens submitted by users were logged directly to the public telemetry bus without redaction, potentially leaking accidentally pasted passwords or API keys.
**Learning:** Even invalid or rejected inputs must be treated as sensitive and sanitized before logging, as users often paste incorrect credentials by mistake.
**Prevention:** Always mask or redact authentication tokens in logs and telemetry, whether they are valid or invalid.

## 2025-02-27 - SSRF / Path Traversal Risk in External API Construction
**Vulnerability:** The parsed `owner` and `repo` paths from external user-supplied GitHub URLs were being interpolated directly into backend fetch requests (`https://api.github.com/repos/${owner}/${repo}...`) without any validation, creating a Server-Side Request Forgery (SSRF) and path traversal risk.
**Learning:** Even when parsing out specific components from a URL, the resulting components are still user-controlled input and must be strictly validated before being used to construct internal or external API requests.
**Prevention:** Strictly validate parsed path components against an allowlist regex (e.g., `/^[a-zA-Z0-9_.-]+$/`) and explicitly reject dangerous sequences like `..` before utilizing them.
