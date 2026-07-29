## 2024-05-18 - [Token Leak in Telemetry & List Endpoints]
**Vulnerability:** Machine identity tokens were being exposed in plaintext through the `/api/identity/list` endpoint and the telemetry bus (`/api/telemetry/bus`).
**Learning:** Returning raw in-memory databases (like `MACHINE_DB`) or indiscriminately logging raw payloads can inadvertently expose sensitive credentials that grant API access.
**Prevention:** Always sanitize or redact sensitive fields (like tokens or passwords) from objects before serializing them for diagnostic, listing, or telemetry endpoints.

## 2024-05-24 - [Path Traversal to SSRF in GitHub URL Parsing]
**Vulnerability:** The `parseGitHubUrl` function did not properly validate the `owner` and `repo` parsed from a user-supplied GitHub URL. This allowed an attacker to input `https://github.com/../user`, which parsed `..` as the owner. When this was later used to construct `https://api.github.com/repos/${owner}/${repo}`, it resulted in `https://api.github.com/repos/../user`, which normalizes to `https://api.github.com/user`, leading to an SSRF that bypassed intended API endpoints and leaked credentials.
**Learning:** Naively splitting user input to construct URLs without strict character validation allows for Path Traversal attacks. When combined with server-side API requests, this trivially escalates to Server-Side Request Forgery (SSRF).
**Prevention:** Always use strict Regex validation (`/^[A-Za-z0-9\-]+$/`) on URL components parsed from user input before interpolating them into server-side HTTP requests, ensuring they cannot contain traversal characters (`..`, `/`, `%2e`, etc).

## 2024-05-30 - [Missing Auth on Metering]
**Vulnerability:** The `/api/metering/record` endpoint was completely unauthenticated, allowing any client to create metering events on behalf of other installations or workspaces without verifying machine identity.
**Learning:** Even internal endpoints or capabilities mapped via a "gateway" need direct endpoint validation if they are exposed directly.
**Prevention:** Always enforce machine token validation on all value-boundary or state-modifying endpoints (especially metering/billing).

## 2024-06-05 - [Authorization Bypass (IDOR) in Metering Endpoint]
**Vulnerability:** The `/api/metering/record` endpoint verified the presence of an authentication token but did not verify authorization—meaning the `installation_id` in the request body was never checked against the `installation_id` bound to the provided `x-veklom-machine-token`. This allowed any valid machine to impersonate and generate billing events for another machine's installation ID.
**Learning:** Authentication (proving identity) is not the same as authorization (proving access to a specific resource). Simply checking if a token is valid is insufficient if the endpoint modifies or accesses resource state tied to a specific ID passed in the payload.
**Prevention:** Always ensure that authorization checks explicitly verify that the authenticated entity has permission to act on the specific resources specified in the request payload (e.g., matching the token's ID to the payload's ID).
