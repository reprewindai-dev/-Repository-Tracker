## 2024-05-24 - Prevent Unnecessary Re-renders During Polling
**Learning:** Polling loops in React that unconditionally update state from API responses trigger full DOM tree reconciliation, even when the data hasn't changed.
**Action:** When setting state for frequently polled data, implement functional state updates and perform a deep equality check (e.g., using `JSON.stringify` or a fast comparison library). This allows React to bail out of the render loop if the new data matches the existing state, significantly improving performance.
