## 2024-05-24 - [SSRF/Path Traversal in URL Parsing]
**Vulnerability:** The server parsed GitHub URLs by splitting on '/' without validating the components, leading to potential path traversal and Server-Side Request Forgery (SSRF) when those components were used in backend fetch requests to the GitHub API.
**Learning:** Even URLs parsed with a basic string `.split()` can inject arbitrary paths (`..`) or invalid characters if fed into API request endpoints directly.
**Prevention:** Always validate extracted dynamic parts of a URL using strict regular expressions to allow only known-good characters before using them in server-side requests.
