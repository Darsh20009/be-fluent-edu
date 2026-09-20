# Phase 3 API Authorization Matrix

The middleware requires a usable authenticated session for every `/api/*`
route except the explicit public routes below. Route-level role and
permission checks remain the business authorization boundary.

| Route group | Current protection | Target protection | Role / permission | Legacy |
|---|---|---|---|---|
| `/api/auth/[...nextauth]` | NextAuth | Public provider endpoint; server resolves identity | None | KEEP |
| `/api/auth/otp/*` | New | Public request/verify with rate limits and generic responses | None | NEW |
| `/api/auth/register` | Public legacy | Public compatibility registration; canonical phone | None | ADAPT |
| `/api/auth/forgot-password` | Public and enumerable | Public generic OTP request | None | ADAPT |
| `/api/auth/reset-password` | User ID only | Authenticated self/admin management permission | ADMIN or `admin.manageUsers` | ADAPT |
| `/api/auth/view-password` | Public unsafe mutation | Disabled with 410 | None | DEPRECATE |
| `/api/admin/*` | Mixed direct checks and gaps | Authenticated ADMIN; STAFF only where explicit permission is added | ADMIN or route permission | ADAPT |
| `/api/teacher/*` | Mixed helper/direct checks | Active TEACHER or ADMIN plus ownership/business rule | TEACHER/ADMIN | ADAPT |
| `/api/student/*` | Mixed helper/direct checks | Active STUDENT plus ownership/business rule | STUDENT | ADAPT |
| `/api/sessions/teacher` | Direct session role check | Active TEACHER/ADMIN and ownership | TEACHER/ADMIN | ADAPT |
| `/api/sessions/student` | Direct session role check | Active STUDENT and membership | STUDENT, `student.joinSession` | ADAPT |
| `/api/live/*` | No route check | Active teacher session; server derives teacher profile | TEACHER/ADMIN | ADAPT |
| `/api/chat/*` | Mixed direct checks | Active authenticated session and participant ownership | Authenticated | ADAPT |
| `/api/assignments/student` | `requireStudent` | Active student and ownership | STUDENT, `student.submitHomework` | ADAPT |
| `/api/checkout` | `requireStudent` | Active student and server-owned identity | STUDENT | KEEP |
| `/api/cart` | `requireStudent` | Active student and server-owned identity | STUDENT | KEEP |
| `/api/lessons/*` | Mixed direct checks | Active session plus progress ownership | STUDENT/TEACHER as applicable | ADAPT |
| `/api/exercises/*` | Direct session check | Active session plus progress ownership | STUDENT | ADAPT |
| `/api/vocabulary/*` | Mixed direct checks | Active session plus student ownership | STUDENT | ADAPT |
| `/api/words/*` | Mixed direct checks | Active session plus student ownership | STUDENT | ADAPT |
| `/api/gamification/*` | Direct session check | Active session plus student ownership | STUDENT | ADAPT |
| `/api/conversation/*` | Direct session check | Active session plus student ownership | STUDENT | ADAPT |
| `/api/ai-assistant` | Direct session check | Active session; never client-controlled student ID | Authenticated | ADAPT |
| `/api/ai/placement-test` | Direct session check | Active student session and ownership | STUDENT | ADAPT |
| `/api/upload/*` | Mixed/gapped | Active session and server-owned target | Authenticated | ADAPT |
| `/api/packages` GET | Public | Public catalog read | None | KEEP |
| `/api/packages` mutation | Mixed | ADMIN/explicit commercial permission | ADMIN/STAFF | ADAPT |
| `/api/coupons/active` | Public | Public active-coupon read | None | KEEP |
| `/api/book-trial`, `/api/contact` | Public | Public rate-limited forms | None | KEEP |
| `/api/translate`, `/api/grammar-check` | Public | Public provider boundary with provider limits | None | KEEP |
| `/api/words/categories` | Public | Public catalog read | None | KEEP |

The matrix intentionally classifies legacy routes rather than silently
rewriting every handler in this phase. The middleware closes the broad
unauthenticated API gap; route-by-route ownership and permission migration
continues through the legacy compatibility boundary.