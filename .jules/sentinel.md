## 2024-05-18 - API Token Leakage in Internal Telemetry and Responses
**Vulnerability:** Machine identity tokens were being emitted unredacted to internal telemetry buses (potentially logging or monitoring tools) and also exposed directly in the `/api/identity/list` endpoint which returns a list of active machines.
**Learning:** In applications mapping active objects to in-memory databases (like `MACHINE_DB`), internal state objects usually represent the entire object, including secrets or credentials. It's unsafe to stream or expose this entire object without a redaction/sanitization step.
**Prevention:** Destructure and explicitly omit sensitive secrets like `token` from objects whenever they are being emitted for telemetry, logging, or sent as non-authenticated API responses.

## 2026-08-04 - Prevent Credential Leakage in Telemetry Logs
**Vulnerability:** Invalid authorization tokens submitted by users were logged directly to the public telemetry bus without redaction, potentially leaking accidentally pasted passwords or API keys.
**Learning:** Even invalid or rejected inputs must be treated as sensitive and sanitized before logging, as users often paste incorrect credentials by mistake.
**Prevention:** Always mask or redact authentication tokens in logs and telemetry, whether they are valid or invalid.

## 2024-10-24 - SSRF and Path Traversal Risks from Unvalidated URL Parsing
**Vulnerability:** When parsing external URLs (like GitHub repository URLs) to construct internal API requests, the extracted `owner` and `repo` components were not strictly validated, allowing potential path traversal (e.g. using `..`) or SSRF via malformed input.
**Learning:** External user input parsed from URLs cannot be trusted, even if it looks like a standard format. It must be strictly validated before being used to construct internal filesystem paths or outgoing network requests.
**Prevention:** Always apply strict allowlist validation (e.g., regex `/^[a-zA-Z0-9_.-]+$/`) and explicitly reject dangerous sequences like `..` on all parsed path components before using them.
