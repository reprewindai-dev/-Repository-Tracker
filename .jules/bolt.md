## 2024-05-24 - React Dashboard Re-Renders
**Learning:** Interactive chart hovering causes frequent React state updates, leading to expensive recalculation of layout metrics and total aggregations.
**Action:** Use `React.useMemo` to memoize expensive chart data processing and aggregations, separating them from high-frequency interactive state like tooltips.