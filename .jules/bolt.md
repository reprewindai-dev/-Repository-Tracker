## 2024-05-24 - React Polling Bottleneck
**Learning:** Continuous polling (like setting state inside `setInterval` every 4 seconds) causes the entire component tree to re-render, even when data from the backend hasn't actually changed. This was found in `fetchServerState` inside `src/App.tsx`.
**Action:** Used `JSON.stringify` comparison within the React state setter callback to conditionally skip the state update if the incoming data matches the existing state.
