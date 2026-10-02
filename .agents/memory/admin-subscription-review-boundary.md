---
name: Subscription review boundary
description: Preserve the distinction between actionable payment review and the broader commerce workspace.
---

The legacy in-shell subscription tab is the current UI for receipt review, approving or rejecting a payment, assigning a teacher, and adjusting lesson balance. The dedicated commerce workspace covers broader subscription, package, enrollment, group, and schedule data, but does not yet provide the same payment-review workflow.

**Why:** These surfaces use different lifecycle behavior and authorization paths. Routing pending-payment actions to the commerce page would send admins to a screen that cannot complete the review.

**How to apply:** Keep pending-payment alerts directed to the receipt-review tab. Consolidate labels and navigation where helpful, but retain both surfaces until the commerce workflow reaches and is verified against feature parity.