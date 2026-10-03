---
name: Unlimited OTP delivery requests
description: The product rule for requesting or resending login and recovery codes.
---

Do not apply application-side request-count, resend-count, or cooldown limits to OTP delivery. Keep OTP expiry and verification-attempt protections separate from send limits.

**Why:** The user asked for no limit after send throttling blocked their verification flow.

**How to apply:** Keep login, registration, and recovery code requests free of app-side throttling; external WhatsApp or email provider limits may still apply.