# Database Migration Instructions - تعليمات ترحيل قاعدة البيانات

## English

### Important: Free Writing Feature Requires Database Migration

The **Free Writing** feature has been added to the codebase, but requires a database migration to work properly.

### What is Free Writing?
Free Writing allows students to write articles/essays without waiting for teachers to create writing tests. Students can:
- Choose from suggested topics or write their own custom title
- Submit their writing directly to their assigned teacher
- Receive grades and feedback

### Migration Required

A new table `FreeWriting` needs to be created in your AWS PostgreSQL database.

### Option 1: Using Prisma Migrate (Recommended)

Run this command in your terminal:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

This will apply the migration file located at:
`prisma/migrations/20251119192441_add_free_writing/migration.sql`

### Option 2: Manual SQL Execution

⚠️ **WARNING**: Manual SQL execution requires running ALL statements from the migration file, not just the FreeWriting table. The migration includes enum additions and schema updates that must be applied together.

**CRITICAL**: Only run manual SQL if your database schema is EXACTLY as defined in `prisma/schema.prisma`. Otherwise, use Option 1 (Prisma Migrate).

If you still prefer manual execution, you must run these statements IN ORDER:

```sql
-- Step 1: Add new enum value if it doesn't exist
DO $$ BEGIN
  ALTER TYPE "youspeak_exercisein"."EWalletProvider" ADD VALUE IF NOT EXISTS 'VODAFONE_CASH';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create FreeWriting table
CREATE TABLE IF NOT EXISTS "youspeak_exercisein"."FreeWriting" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "grade" DOUBLE PRECISION,
    "feedback" TEXT,
    "grammarErrors" TEXT,
    "submittedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(6),
    "teacherId" TEXT,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreeWriting_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add foreign keys
ALTER TABLE "youspeak_exercisein"."FreeWriting" 
  ADD CONSTRAINT "FreeWriting_studentId_fkey" 
  FOREIGN KEY ("studentId") REFERENCES "youspeak_exercisein"."User"("id") 
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "youspeak_exercisein"."FreeWriting" 
  ADD CONSTRAINT "FreeWriting_teacherId_fkey" 
  FOREIGN KEY ("teacherId") REFERENCES "youspeak_exercisein"."TeacherProfile"("id") 
  ON DELETE SET NULL ON UPDATE NO ACTION;
```

**Note**: If you encounter errors about existing enums or tables, the migration may have been partially applied. In that case, use `DROP TABLE` or `ALTER TYPE` commands carefully, or use Option 1 instead.

### Verify Migration

After running the migration, verify it was successful:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM youspeak_exercisein.\"FreeWriting\";"
```

Expected output: `0` (table exists but is empty)

### Restart Application

After migration, restart the application:

```bash
npm run dev
```

Or click the "Restart" button for the dev-server workflow.

### Access Free Writing

- **Students**: Navigate to `/dashboard/student/free-writing`
- **Teachers**: View student free writings in their dashboard under "Free Writings" tab (to be added)

---

## العربية

### مهم: ميزة الكتابة الحرة تتطلب ترحيل قاعدة البيانات

تمت إضافة ميزة **الكتابة الحرة** إلى الكود، ولكنها تتطلب ترحيل قاعدة البيانات للعمل بشكل صحيح.

### ما هي الكتابة الحرة؟
تتيح الكتابة الحرة للطلاب كتابة المقالات/المقالات دون انتظار المعلمين لإنشاء اختبارات الكتابة. يمكن للطلاب:
- الاختيار من المواضيع المقترحة أو كتابة عنوان خاص بهم
- إرسال كتاباتهم مباشرة إلى معلمهم المعين
- الحصول على الدرجات والملاحظات

### الترحيل المطلوب

يجب إنشاء جدول جديد `FreeWriting` في قاعدة بيانات AWS PostgreSQL.

### الخيار 1: استخدام Prisma Migrate (موصى به)

قم بتشغيل هذا الأمر في الطرفية:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

سيطبق هذا ملف الترحيل الموجود في:
`prisma/migrations/20251119192441_add_free_writing/migration.sql`

### الخيار 2: تنفيذ SQL يدوياً

⚠️ **تحذير**: تنفيذ SQL يدوياً يتطلب تشغيل جميع الأوامر من ملف الترحيل، وليس فقط جدول FreeWriting. يتضمن الترحيل إضافات enum وتحديثات schema يجب تطبيقها معاً.

**مهم جداً**: قم بتشغيل SQL يدوياً فقط إذا كان schema قاعدة البيانات الخاصة بك مطابقاً تماماً لما هو محدد في `prisma/schema.prisma`. خلاف ذلك، استخدم الخيار 1 (Prisma Migrate).

إذا كنت لا تزال تفضل التنفيذ اليدوي، يجب عليك تشغيل هذه الأوامر بالترتيب:

```sql
-- الخطوة 1: إضافة قيمة enum جديدة إذا لم تكن موجودة
DO $$ BEGIN
  ALTER TYPE "youspeak_exercisein"."EWalletProvider" ADD VALUE IF NOT EXISTS 'VODAFONE_CASH';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- الخطوة 2: إنشاء جدول FreeWriting
CREATE TABLE IF NOT EXISTS "youspeak_exercisein"."FreeWriting" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "grade" DOUBLE PRECISION,
    "feedback" TEXT,
    "grammarErrors" TEXT,
    "submittedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(6),
    "teacherId" TEXT,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreeWriting_pkey" PRIMARY KEY ("id")
);

-- الخطوة 3: إضافة foreign keys
ALTER TABLE "youspeak_exercisein"."FreeWriting" 
  ADD CONSTRAINT "FreeWriting_studentId_fkey" 
  FOREIGN KEY ("studentId") REFERENCES "youspeak_exercisein"."User"("id") 
  ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "youspeak_exercisein"."FreeWriting" 
  ADD CONSTRAINT "FreeWriting_teacherId_fkey" 
  FOREIGN KEY ("teacherId") REFERENCES "youspeak_exercisein"."TeacherProfile"("id") 
  ON DELETE SET NULL ON UPDATE NO ACTION;
```

**ملاحظة**: إذا واجهت أخطاء حول enums أو جداول موجودة، فقد يكون الترحيل قد تم تطبيقه جزئياً. في هذه الحالة، استخدم أوامر `DROP TABLE` أو `ALTER TYPE` بحذر، أو استخدم الخيار 1 بدلاً من ذلك.

### التحقق من الترحيل

بعد تشغيل الترحيل، تحقق من نجاحه:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM youspeak_exercisein.\"FreeWriting\";"
```

الناتج المتوقع: `0` (الجدول موجود ولكنه فارغ)

### إعادة تشغيل التطبيق

بعد الترحيل، أعد تشغيل التطبيق:

```bash
npm run dev
```

أو انقر فوق زر "إعادة التشغيل" لسير عمل dev-server.

### الوصول إلى الكتابة الحرة

- **للطلاب**: انتقل إلى `/dashboard/student/free-writing`
- **للمعلمين**: عرض كتابات الطلاب الحرة في لوحة التحكم تحت علامة تبويب "Free Writings" (سيتم إضافتها)

---

## Features Implemented / الميزات المنفذة

### 1. My Orders/Subscriptions Page - صفحة طلباتي/اشتراكاتي
✅ **Location**: `/dashboard/student/my-orders`

**Features**:
- View all subscription orders with status tracking
- Payment details and method display
- Invoice generation with company logo
- Status badges: Approved, Under Review, Pending, Rejected
- Track subscription periods (start/end dates)
- View assigned teacher information
- View uploaded receipt images
- Downloadable/printable invoices

**Statuses Available**:
- 🟢 **APPROVED/ACTIVE** - Subscription is active
- 🟡 **UNDER_REVIEW** - Payment being reviewed by admin
- 🔵 **PENDING** - Awaiting payment
- 🔴 **REJECTED** - Payment rejected
- ⚪ **EXPIRED** - Subscription period ended

### 2. Free Writing System - نظام الكتابة الحرة
⚠️ **Requires Migration** (see instructions above)

**Location**: `/dashboard/student/free-writing`

**Features**:
- Write articles with custom titles or choose suggested topics
- Submit directly to assigned teacher
- View submission history with grades and feedback
- Grammar error highlighting
- No need to wait for teacher to create writing tests

**API Endpoints Created**:
- `GET /api/student/free-writing` - Get student's free writings
- `POST /api/student/free-writing` - Submit new free writing
- `GET /api/teacher/free-writing` - Get teacher's students' free writings
- `PATCH /api/teacher/free-writing/[id]/grade` - Grade a free writing

## Notes
- The existing Sessions, Homework, and Chat systems are working correctly
- They require data to be created by teachers/admins
- Students must be activated and assigned to teachers to see their sessions/homework

## Support
For questions or issues, contact technical support or refer to the Replit documentation.
