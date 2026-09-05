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

## 2024-10-25 - Remove X-Powered-By Header in Express
**Vulnerability:** The application was exposing the `X-Powered-By: Express` header in HTTP responses. While a standard feature of Express, this leaks information about the backend technology stack.
**Learning:** Generic headers like `X-Powered-By` can assist attackers in profiling the server and targeting known vulnerabilities in specific framework versions. While often considered a low-severity issue, it's a quick and important defense-in-depth measure. Note that Express populates this header natively during response execution, so `res.removeHeader('X-Powered-By')` inside middleware is ineffective.
**Prevention:** Always explicitly disable the header at the application level using `app.disable('x-powered-by');` when initializing an Express instance.

## 2024-10-25 - Prevent DoS from Synchronous Cryptographic Operations
**Vulnerability:** The `/api/ops/issue-passports` endpoint used `crypto.generateKeyPairSync` in a loop, which blocked the main Node.js Event Loop, creating a severe Denial of Service (DoS) vulnerability that could freeze the entire application.
**Learning:** In Node.js Express route handlers, synchronous cryptographic operations block the single thread, preventing the server from handling any other requests while the operation completes.
**Prevention:** Always use asynchronous equivalents like `util.promisify(crypto.generateKeyPair)` to offload CPU-intensive crypto tasks and keep the Event Loop responsive.

## 2024-10-25 - Prevent Memory Exhaustion DoS in In-Memory State Objects
**Vulnerability:** Unbounded in-memory data structures like METERING_DB (Array) and MACHINE_DB (Map) were growing indefinitely, leading to a Denial of Service (DoS) vulnerability via memory exhaustion.
**Learning:** Applications using in-memory state objects that grow over time must implement background cleanup mechanisms to prune expired entries or truncate unbounded arrays, preventing resource exhaustion.
**Prevention:** Always include a background cleanup mechanism (e.g., setInterval with .unref()) to prune expired entries from Maps and cap Array lengths (e.g., array.length = MAX_SIZE for arrays populated via unshift).
