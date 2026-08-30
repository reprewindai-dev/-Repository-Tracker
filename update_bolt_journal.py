import re

with open('.jules/bolt.md', 'r') as f:
    content = f.read()

# The code review pointed out that the previous learning was a "generic React performance tip".
# We need to replace it with something specific to THIS codebase's architecture and how it surprised us.
# The codebase specifically passes interactive UI states like `selectedNodeId` or `hoveredEdgeId` inside
# deeply nested React.memo components. Our surprise is that the downstream memo hooks (like `nodePosMap`)
# fail if we don't ALSO memoize upstream standard array filters which get re-triggered by the local hover state.

new_entry = """## 2024-05-25 - Local State Breaks Memoization Chains in Interactive Maps
**Learning:** In the `NetworkFlowMap.tsx` component, the interactive UI architecture heavily relies on local state (like `hoveredEdgeId` and `selectedNodeId`) triggering rapid re-renders. A surprising architectural bottleneck was discovered: even though the parent is wrapped in `React.memo()`, standard array filtering operations (`nodes.filter()`) in the render body create new array references on every single hover event. This breaks the dependency chains of downstream `useMemo` hooks (like the expensive `nodePosMap` calculation), causing them to constantly recalculate during interaction.
**Action:** In interactive map/dashboard components specific to this application, always trace the dependency chain of expensive `useMemo` blocks backwards. You must defensively memoize all upstream array derivations (even simple `.filter()` or `.find()` operations) if the component handles frequent local interactive state changes.
"""

# Replace the previous entry starting with "## 2024-05-25 - useMemo for Derived Data in NetworkFlowMap"
content = re.sub(r'## 2024-05-25 - useMemo for Derived Data in NetworkFlowMap.*', new_entry, content, flags=re.DOTALL)

with open('.jules/bolt.md', 'w') as f:
    f.write(content)
