# Be Fluent - English Learning Platform

### Overview
Be Fluent is a bilingual (Arabic/English) online English learning platform designed to provide an interactive and comprehensive environment for learning English. It offers live classes, advanced vocabulary building tools, homework management, and a complete learning management system. The platform integrates AI for grammar checking, features interactive vocabulary discovery, and provides robust student, teacher, and admin dashboards.

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

**Technical Implementations & Features:**
- **Authentication:** NextAuth.js with JWT for Admin, Teacher, and Student roles.
- **State Management:** React hooks and Context API.
- **Real-time Communication:** Socket.IO v4.8.1 for live chat.
- **Live Classes:** BigBlueButton integration for video conferencing, recording, and attendance.
- **AI Integration:** Puter AI (free, unlimited) for AI Assistant and Video Learning questions. No API key required.
- **Advanced AI Assistant:** FREE AI chatbot with voice capabilities:
  - Uses Puter.ai (GPT-4o-mini) for intelligent conversations - completely FREE
  - Text-to-Speech using browser Web Speech API - AI can speak responses
  - Speech-to-Text using browser Web Speech API - students can talk to AI
  - Conversation history saved in localStorage
  - Auto-speak feature for AI responses
  - Bilingual support (Arabic/English) for teaching
- **Vocabulary Learning:** "Discover Words" with swipe cards, animations, quizzes, and an advanced system including Daily Words, Flashcards (spaced repetition), Word Tests, and custom word additions.
- **Internationalization:** Full bilingual support (Arabic/English).
- **Database Schema:** Prisma ORM managing 13 core tables.
- **Dashboards:** Dedicated dashboards for Students, Teachers, and Admins.
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

**System Design Choices:**
- Development server on port 5000 for Socket.IO.
- `lib/auth-helpers.ts` for authentication.
- Query optimization using `Promise.all`.
- Manuscript uploads stored as Base64.
- BigBlueButton for video conferencing.
- Modal-based session login for improved UX.

### External Dependencies
- **Database:** PostgreSQL (hosted on AWS)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Real-time Communication:** Socket.IO
- **Video Conferencing:** BigBlueButton
- **AI Services:** Puter AI (free, client-side, no API key required)
- **Translation Services:** Google Translate API
- **Communication:** WhatsApp API
- **Current Database:** MongoDB (for gamification, lessons, listening, conversation models)