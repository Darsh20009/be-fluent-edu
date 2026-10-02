---
name: Employee account creation boundary
description: The user-selected roles and account types allowed in employee creation flows.
---

يستطيع ADMIN وTEACHER إنشاء حسابات TEACHER وSTAFF فقط. لا ينشئ TEACHER حساب ADMIN ولا يغيّر الأدوار أو الصلاحيات. يبدأ حساب STAFF بلا صلاحيات، ويمنح ADMIN صلاحياته لاحقاً.

**Why:** the user asked for this role and account-type boundary.

**How to apply:** Enforce the ADMIN/TEACHER allowlist on the server as well as in the form; keep permission assignment in the ADMIN-only workflow.