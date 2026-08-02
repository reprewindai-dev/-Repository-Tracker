## 2024-05-13 - [Frontend Rendering Bottleneck]
**Learning:** The React application uses a 4-second polling mechanism in the main App component (`fetchServerState`). State updates from polling check for actual data changes via `JSON.stringify` comparison before setting state to prevent performance bottlenecks from continuous re-renders. Note: Child components are currently NOT wrapped in `React.memo()`, and function props are NOT memoized with `useCallback()`.
**Action:** Identify expensive child components and wrap them in React.memo(), or optimize the state fetching mechanism.
