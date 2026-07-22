## 2024-05-18 - [Token Leak in Telemetry & List Endpoints]
**Vulnerability:** Machine identity tokens were being exposed in plaintext through the `/api/identity/list` endpoint and the telemetry bus (`/api/telemetry/bus`).
**Learning:** Returning raw in-memory databases (like `MACHINE_DB`) or indiscriminately logging raw payloads can inadvertently expose sensitive credentials that grant API access.
**Prevention:** Always sanitize or redact sensitive fields (like tokens or passwords) from objects before serializing them for diagnostic, listing, or telemetry endpoints.

## 2024-05-24 - [Path Traversal to SSRF in GitHub URL Parsing]
**Vulnerability:** The `parseGitHubUrl` function did not properly validate the `owner` and `repo` parsed from a user-supplied GitHub URL. This allowed an attacker to input `https://github.com/../user`, which parsed `..` as the owner. When this was later used to construct `https://api.github.com/repos/${owner}/${repo}`, it resulted in `https://api.github.com/repos/../user`, which normalizes to `https://api.github.com/user`, leading to an SSRF that bypassed intended API endpoints and leaked credentials.
**Learning:** Naively splitting user input to construct URLs without strict character validation allows for Path Traversal attacks. When combined with server-side API requests, this trivially escalates to Server-Side Request Forgery (SSRF).
**Prevention:** Always use strict Regex validation (`/^[A-Za-z0-9\-]+$/`) on URL components parsed from user input before interpolating them into server-side HTTP requests, ensuring they cannot contain traversal characters (`..`, `/`, `%2e`, etc).
