## 2024-07-18 - [Prevent Polling-Induced Re-Renders]
**Learning:** The `App` component polls the server for state updates every 4 seconds. This polling caused the child component (`Dashboard`) to re-render, continuously recalculating complex SVG pathing data and total settled revenue on every tick.
**Action:** Use `useMemo` hooks for complex derivations of properties or values that are passed down or regenerated on each render tick, especially in components subjected to polling where props only change structurally or partially.
