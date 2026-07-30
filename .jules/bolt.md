
## 2026-07-30 - [App Polling Optimization]
**Learning:** The React application utilizes a continuous 4-second polling mechanism to refresh the server state (fetchServerState in src/App.tsx). This resulted in continuous React re-renders since React's object/array comparison defaults to reference equality.
**Action:** Add JSON.stringify() before setting array states (setMachines, setMeteringEvents, setTelemetryLogs) to compare if the payload data actually changed. Further, wrap child components in React.memo() and wrap function props with useCallback to drastically reduce wasteful re-renders on every poll.
