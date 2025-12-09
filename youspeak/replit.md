# Youspeak - English Learning Platform

### Overview
Youspeak is a bilingual (Arabic/English) online English learning platform designed to provide an interactive and comprehensive environment for learning English. It offers live classes, advanced vocabulary building tools, homework management, and a complete learning management system. The platform integrates AI for grammar checking, features interactive vocabulary discovery, and provides robust student, teacher, and admin dashboards. The project aims to deliver an effective and user-friendly learning experience to a broad market.

### User Preferences
I prefer simple language. I want iterative development. Ask before making major changes. I prefer detailed explanations. Do not make changes to the folder Z. Do not make changes to the file Y.

### System Architecture
The platform utilizes a modern web stack: **Next.js 16 (App Router)** with **React 19**, **TypeScript**, and **Tailwind CSS v4** for a mobile-responsive frontend with dark mode support. The backend uses **Next.js API Routes** and a custom **Node.js server** for real-time functionalities.

**UI/UX Decisions:**
- Mobile-responsive design with Tailwind CSS v4 and dark mode.
- Professional beige gradient background for the homepage and splash screen.
- Redesigned hero section with gradient text effects and feature cards.
- Elegant package section with "BEST VALUE" highlighting.
- Modern logo container with gradient background, typewriter effect, and vertical text for splash screen.
- Icon-only navigation for cart and settings with a black color scheme.
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