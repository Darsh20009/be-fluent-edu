---
name: Effect-driven fetch state
description: A React linting constraint for asynchronous component data loading and retries.
---

For data loaded on mount or when a retry key changes, keep the asynchronous request function inside the effect, update state after awaited work, and ignore results after cleanup. Set the pending state from the retry event rather than synchronously inside a fetch helper called by the effect.

**Why:** During dashboard integration, the project's `react-hooks/set-state-in-effect` lint rule continued flagging loading-state updates after they were moved behind the first `await` in a helper called from an effect. Defining the async fetch within the effect passed lint and allowed stale results to be cancelled.

**How to apply:** When an effect starts a data request, define its async work locally, guard state updates with a cleanup flag or abort signal, and trigger retries through state changes from event handlers.