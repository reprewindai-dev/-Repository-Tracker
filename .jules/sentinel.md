## 2024-05-18 - [Token Leak in Telemetry & List Endpoints]
**Vulnerability:** Machine identity tokens were being exposed in plaintext through the `/api/identity/list` endpoint and the telemetry bus (`/api/telemetry/bus`).
**Learning:** Returning raw in-memory databases (like `MACHINE_DB`) or indiscriminately logging raw payloads can inadvertently expose sensitive credentials that grant API access.
**Prevention:** Always sanitize or redact sensitive fields (like tokens or passwords) from objects before serializing them for diagnostic, listing, or telemetry endpoints.
## 2023-10-27 - Path Traversal / SSRF in GitHub Proxy Endpoints
**Vulnerability:** The backend `parseGitHubUrl` function did not validate the parsed `owner` and `repo` before sending those parameters to the GitHub API via `fetch`. This allowed Path Traversal payloads (like `..`) to be used in URLs, resulting in SSRF.
**Learning:** Even when hitting a third-party API like GitHub's REST API, the user-supplied paths and URL components must be strictly validated before constructing request URLs to prevent an attacker from escaping the intended base endpoint (`/repos/${owner}/${repo}`).
**Prevention:** Strict regex allowlist validation (`/^[a-zA-Z0-9_.-]+$/`) on path parameter components to explicitly prevent traversal operators like `..`.
