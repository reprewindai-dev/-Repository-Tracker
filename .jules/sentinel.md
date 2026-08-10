## 2024-05-18 - API Token Leakage in Internal Telemetry and Responses
**Vulnerability:** Machine identity tokens were being emitted unredacted to internal telemetry buses (potentially logging or monitoring tools) and also exposed directly in the `/api/identity/list` endpoint which returns a list of active machines.
**Learning:** In applications mapping active objects to in-memory databases (like `MACHINE_DB`), internal state objects usually represent the entire object, including secrets or credentials. It's unsafe to stream or expose this entire object without a redaction/sanitization step.
**Prevention:** Destructure and explicitly omit sensitive secrets like `token` from objects whenever they are being emitted for telemetry, logging, or sent as non-authenticated API responses.

## 2026-08-04 - Prevent Credential Leakage in Telemetry Logs
**Vulnerability:** Invalid authorization tokens submitted by users were logged directly to the public telemetry bus without redaction, potentially leaking accidentally pasted passwords or API keys.
**Learning:** Even invalid or rejected inputs must be treated as sensitive and sanitized before logging, as users often paste incorrect credentials by mistake.
**Prevention:** Always mask or redact authentication tokens in logs and telemetry, whether they are valid or invalid.

## 2024-10-25 - Fix SSRF and Path Traversal in GitHub URL Parsing
**Vulnerability:** The application parsed GitHub URLs (`parseGitHubUrl`) by simply splitting the path and using the components (`owner` and `repo`) to make internal REST API requests to GitHub, without validation. This posed a risk of Server-Side Request Forgery (SSRF) and path traversal (using `..`) if malicious or crafted URLs were passed.
**Learning:** URL paths extracted from client-provided URLs and used in backend server requests must be strictly validated. Naively extracting segments allows attackers to manipulate internal request paths.
**Prevention:** Always use regex allowlists (e.g., `/^[a-zA-Z0-9_.-]+$/`) and explicitly check for sequence attacks (e.g., rejecting `..`) when constructing internal backend requests from parsed path components.
