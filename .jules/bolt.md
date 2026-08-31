## 2024-05-25 - Prevent Unnecessary Re-renders on Polling
**Learning:** React component `App.tsx` has a 4-second polling mechanism using `useEffect` that continuously fetches state (`fetchServerState`). By default, setting state triggers a full-app re-render, even if the new state data is structurally identical to the current state. This causes continuous re-renders of the entire application and all child components (which are not wrapped in `React.memo()`), leading to a performance bottleneck.
**Action:** Always wrap state updates originating from polling mechanisms with a structural equality check (like `JSON.stringify` comparison or a deep equal check) to only trigger state updates (and thus re-renders) when the underlying data has actually changed.

## 2024-05-25 - React.memo() on Heavy Child Components
**Learning:** In React applications with polling or frequent parent component state updates (like hovering over charts updating local state in `Dashboard.tsx`), failing to memoize heavy child components (like `NetworkFlowMap.tsx` and `MonetizationGuard.tsx` which compute expensive SVG paths or hold complex local state) causes cascading re-renders. This leads to severe UI performance degradation during interactions. Also, to effectively use `React.memo()`, callbacks passed as props to these child components must be wrapped in `useCallback()` to ensure referential stability.
**Action:** Always wrap heavy child components in `React.memo()` and ensure that any functions passed to them as props are wrapped in `useCallback()` to prevent unnecessary re-renders when parent state changes.

## 2024-05-25 - useMemo for Derived Data in Render Body
**Learning:** In this React application, components like `Dashboard.tsx` recalculate derived arrays and objects (such as SVG chart dimensions using `.map()` and `.reduce()`) in the render body. Because these components are heavily memoized using `React.memo` and receive frequent state updates (e.g., via polling or local hover states), redefining these derived structures without `useMemo` breaks local reference stability, causing unnecessary re-renders on local state changes.
**Action:** Always compute derived arrays or objects inside `useMemo` hooks. Ensure all referenced local variables (like width, height, or padding) are included in the dependency array to satisfy exhaustive-deps rules and prevent stale closures.

## 2024-05-25 - useMemo for Derived Data in MonetizationGuard Render Body
**Learning:** In the `MonetizationGuard` component, calculations for variables like `totalUnmonetized` and `totalLeakUsd` using `.filter()` and `.reduce()` inside the render body were causing unnecessary recalculations on local state changes (e.g. toggling modals), despite the component itself being heavily memoized via `React.memo`.
**Action:** Always compute derived array structures and aggregated states in a component via `useMemo` hooks, specifying all references appropriately, even for localized calculations.

## 2025-03-05 - Unmemoized Arrays in Dependency Arrays Defeat Memoization
**Learning:** In `NetworkFlowMap.tsx`, the `useMemo` hook for `nodePosMap` included `[agentNodes, gatewayNodes, repoNodes]` in its dependency array. Because these arrays were derived on every render using `.filter()`, their references changed constantly (e.g. during local interactions like hover events). This defeated the memoization completely, causing the expensive Map recalculation to run on every render.
**Action:** Never pass arrays derived in the render body via `.filter()` directly into a `useMemo` dependency array without memoization. Move the derivation logic inside the `useMemo` hook itself, and only depend on the source state (e.g., `nodes`).
