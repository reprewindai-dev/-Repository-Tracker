
## 2024-05-24 - [Fix SSRF/Path Traversal in GitHub Repo Parsing]
**Vulnerability:** The `parseGitHubUrl` function did not properly validate input lengths and characters, allowing for possible Path Traversal and SSRF attacks when a user inputs a URL containing `..` to trick the GitHub API endpoint.
**Learning:** Naive splitting of strings without asserting the exact length of the resulting array or validating against directory traversal characters (e.g. `.` or `..`) can leave open vectors where user-provided input escapes intended request boundaries.
**Prevention:** Always restrict dynamically constructed paths to the exact expected structure (e.g. `parts.length === 2`), and validate segments using an explicit allowlist regex (like `/^[a-zA-Z0-9_.-]+$/`) while explicitly rejecting traversal strings.
