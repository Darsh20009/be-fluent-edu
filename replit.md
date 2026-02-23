# Be Fluent - English Learning Platform

### Overview
Be Fluent is a bilingual (Arabic/English) online English learning platform designed to provide an interactive and comprehensive environment for learning English. It offers live classes, advanced vocabulary building tools, homework management, and a complete learning management system. The platform features interactive vocabulary discovery, and provides robust student and admin dashboards (Admin has full teacher permissions).

### User Preferences
- Name: Be Fluent
- Colors: Primary Green (#10B981), Dark Gray (#1F2937), Off-white/Soft White (#F9FAFB)
- Language: Full Arabic support with English options.
- Features: Daily WhatsApp follow-up, 24/7 support.
- Mobile: PWA/Download options.

### System Architecture
The platform utilizes a modern web stack: **Next.js 16 (App Router)** with **React 19**, **TypeScript**, and **Tailwind CSS v4** for a mobile-responsive frontend with dark mode support. The backend uses **Next.js API Routes** and a custom **Node.js server** for real-time functionalities.

**UI/UX Decisions (Updated January 2026):**
- **New Creative Homepage Design:** Complete frontend redesign with modern, professional look inspired by Edugate style.
- **Hero Image Carousel:** Automatic sliding carousel with 4 Be Fluent branded images, navigation arrows, touch swipe support for mobile, and dot indicators.
- **No Loading/Splash Screen:** Removed loading screens for immediate content display.
- **Gradient Effects:** Beautiful green gradient backgrounds and text effects using #10B981 to #059669.
- **Animated Elements:** Floating decorative elements, pulse animations, and smooth hover transitions.
- **100% Mobile Responsive:** Full mobile support with touch gestures, responsive text sizes, and adaptive layouts.
- **Modern PWA Install Prompt:** Redesigned PWA installation dialog with Be Fluent branding, step-by-step iOS instructions, and gradient styling.
- **Feature Icons Section:** Quick visual overview of platform features with hover effects.
- **Path to Fluency Section:** Dark themed section showcasing the learning journey with numbered steps.
- **Pricing Cards:** Modern package display with "Most Popular" highlighting and gradient number badges.
- Solid white/gray backgrounds (no transparent backgrounds in sidebar, chat, messages, or support).
- Consistent gray-300 borders.

**Major Updates (February 2026):**
- **Professional Admin Dashboard:** Completely redesigned HomeTab with 6 stat cards (Total Students, Active Students, Revenue EGP, Sessions This Week, Pending Subscriptions, Teachers Count), CSS-based monthly revenue bar chart, dual activity feed (last 5 subscriptions + last 5 new users), platform health indicators (DB/Email), and quick action buttons. Polished AdminDashboardClient sidebar with notification bell animation, breadcrumbs, and backdrop-blur mobile drawer.
- **Professional Student Dashboard:** Redesigned StudentDashboardClient with profile card (initials avatar, level badge, XP progress bar, subscription status). Redesigned HomeTab with time-based Arabic greeting, stats row (next session, pending homework, weekly XP, streak), prominent placement test banner, teacher card, subscription progress card, quick nav cards.
- **Sessions Tab Redesign:** Live sessions with pulsing "Join Now" button, upcoming sessions with countdown timer (days/hours/minutes), past sessions with attendance status badges (attended/absent/pending).
- **Homework Tab Redesign:** Modern tabbed interface (Pending/Submitted), drag-and-drop file upload zone with file preview gallery (thumbnails for images, icons for others), MCQ with lettered radio buttons, video/image task instructions, submitted view with teacher grade badge and feedback.
- **Visual CMS (Page Editor):** Dynamic section-based editor for Hero, Stats, Features (dynamic add/remove), Contact, Learning Path (dynamic add/remove steps). Each section saves independently. Image upload for all image fields. Homepage (`app/page.tsx`) reads ALL CMS fields dynamically (background, bilingual titles, features, steps, contact links).
- **Placement Test Admin Page:** Fixed Next.js 15 params await issue. Added image/video upload for IMAGE and VIDEO_RECORDING question types (mediaUrl). Question count badges per test type tab. Enhanced question cards with type-specific color borders, badges, metadata. Polished settings panel and "Send Test Link" section.
- **Assignments System:** Real file uploads via /api/upload. Drag-and-drop upload zone with visual feedback, file previews (thumbnails), file size/type info. Assignment cards with attachment count badge. Submission review with download links. Teacher can delete assignments with confirmation. Student can upload multiple files.
- **Zero TypeScript Errors:** All TypeScript errors resolved. StudentDashboardClient Clock icon import added. All component files clean.

**Technical Implementations & Features:**
- **Authentication:** NextAuth.js with JWT for Admin and Student roles. Admin has full teacher permissions.
- **Role Merge (Updated January 2026):** Admin role now includes all Teacher permissions - Admin can manage sessions, grade assignments, and access teacher dashboard.
- **Placement Test:** Admin-only feature, removed from public navigation.
- **State Management:** React hooks and Context API.
- **Real-time Communication:** Socket.IO v4.8.1 for live chat.
- **Live Classes:** befluent-meet (Internal WebRTC System) featuring screen sharing, local recording with auto-cleanup, raised hands, and admin-exclusive controls. Secondary backup: ZegoCloud integration.
- **Vocabulary Learning:** "Discover Words" with swipe cards, animations, quizzes, and an advanced system including Daily Words, Flashcards (spaced repetition), Word Tests, and custom word additions.
- **Internationalization:** Full bilingual support (Arabic/English).
- **Database Schema:** Prisma ORM managing 13 core tables.
- **Dashboards:** Dedicated dashboards for Students and Admin (Admin includes all teacher features).
- **Payment System:** Subscription workflow with Egyptian payment methods, receipt upload, and admin approval.
- **Writing Test System:** Teachers create/grade tests; students submit typed or handwritten (image/PDF) responses.
- **Free Writing System:** Students write articles, receive grades/feedback with AI grammar highlighting.
- **Student Management:** Teacher dashboards for student progress and subscription details.
- **Targeted Assignments:** Teachers can select specific students for sessions and assignments.
- **Automatic Teacher-Student Linking:** Subscriptions automatically link to the earliest active teacher.
- **Lessons System:** Comprehensive lesson management with video, articles, interactive exercises (Multiple Choice, Fill-in-the-blank, Drag & Drop, Sentence Reading), and progress tracking.
- **Listening System:** Publicly accessible listening practice with audio/video content, speed control, transcripts, and interactive exercises (Multiple Choice, True/False, Fill-in-the-blank, Word Order).
- **Conversation Practice System:** Three modes (Interactive Conversations, Voice Recording, Text Conversations) using pre-made scripts and keyword matching for practice without external AI APIs.
- **Gamification System:** Duolingo-style XP, levels, streaks, and badges based on internal calculations for various learning activities.
- **Student Level Progress System:** Automatic tracking of student English proficiency (A1-C1) with performance metrics from words, exercises, lessons, and writings. Features include: progress visualization, level recommendations, auto-adjustment when 20+ activities completed, and personalized recommendations for improvement.

**Admin Dashboard (Updated February 2026):**
- Professional sidebar navigation with grouped menus and icons
- Quick stats displayed in the header bar
- CMS Page Editor tab for editing all page content without coding
- Real file upload support for assignments (video/image/file up to 50MB)
- Full placement test management with 4 question types (MCQ, written, video recording, image)
- Uploads stored in `/public/uploads/` directory

**System Design Choices:**
- Development server on port 5000 for Socket.IO.
- `lib/auth-helpers.ts` for authentication.
- Query optimization using `Promise.all`.
- Manuscript uploads stored as Base64.
- BigBlueButton for video conferencing.
- Modal-based session login for improved UX.
- File uploads: multipart/form-data → `/api/upload` → `/public/uploads/` (max 50MB)
- CMS: PageContent model (page/section/field/value) → `/api/admin/page-content`

### External Dependencies
- **Database:** PostgreSQL (hosted on AWS)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Real-time Communication:** Socket.IO
- **Video Conferencing:** befluent-meet & ZegoCloud
- **Translation Services:** Google Translate API
- **Communication:** WhatsApp API
- **Current Database:** MongoDB (for gamification, lessons, listening, conversation models)