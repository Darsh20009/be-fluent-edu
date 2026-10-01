import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createThanarahCompletion, parseThanarahJson, ThanarahError } from '@/lib/thanarah';

const SYSTEM_PROMPT = `You are an English level assessment specialist. Your job is to generate adaptive multiple-choice questions to determine a student's English proficiency level (A1, A2, B1, B2, or C1).

Rules:
- Generate ONE question at a time in JSON format
- Questions must be multiple choice with exactly 4 options
- Start at A2 level, then adapt based on performance
- If the student answers correctly, increase difficulty; if wrong, decrease
- Mix grammar, vocabulary, and reading comprehension
- Questions must be clear and unambiguous
- ALWAYS respond with valid JSON only, no extra text

Response format for a question:
{
  "type": "question",
  "id": "q<number>",
  "text": "The question in English",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": "The correct option text",
  "level": "A1|A2|B1|B2|C1",
  "category": "grammar|vocabulary|reading"
}

Response format for final result (after 10 questions):
{
  "type": "result",
  "level": "A1|A2|B1|B2|C1",
  "score": <number of correct answers>,
  "total": 10,
  "percentage": <percentage>
}`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { action, history = [], isCorrect } = body;

    if (action === 'start') {
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: 'Start the assessment. Generate question 1 of 10 at A2 level.' }
      ];

      const raw = await createThanarahCompletion(messages, { temperature: 0.4, maxTokens: 800 });
      const question = parseThanarahJson(raw);

      return NextResponse.json({ success: true, question });
    }

    if (action === 'next') {
      const questionNum = history.length + 1;

      if (questionNum > 10) {
        return NextResponse.json({ error: 'Test already complete' }, { status: 400 });
      }

      const historyMessages = history.map((h: { question: string; answer: string; correct: boolean; level: string }, i: number) => [
        {
          role: 'assistant' as const,
          content: JSON.stringify({ type: 'question', text: h.question, level: h.level })
        },
        {
          role: 'user' as const,
          content: `Question ${i + 1}: Student answered "${h.answer}". ${h.correct ? 'CORRECT' : 'INCORRECT'}.`
        }
      ]).flat();

      const nextInstruction = questionNum === 10
        ? `Generate the final question (question ${questionNum} of 10). After this, prepare to give the result.`
        : `Generate question ${questionNum} of 10. Adapt difficulty based on performance so far. ${isCorrect ? 'Student got last question RIGHT - increase difficulty slightly.' : 'Student got last question WRONG - decrease difficulty slightly.'}`;

      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...historyMessages,
        { role: 'user' as const, content: nextInstruction }
      ];

      const raw = await createThanarahCompletion(messages, { temperature: 0.4, maxTokens: 800 });
      const question = parseThanarahJson(raw);

      return NextResponse.json({ success: true, question });
    }

    if (action === 'finish') {
      const { answers } = body;
      const correctCount = answers.filter((a: { correct: boolean }) => a.correct).length;
      const percentage = (correctCount / answers.length) * 100;

      let level = 'A1';
      if (percentage >= 90) level = 'C1';
      else if (percentage >= 75) level = 'B2';
      else if (percentage >= 60) level = 'B1';
      else if (percentage >= 40) level = 'A2';

      const historyMessages = answers.map((h: { question: string; answer: string; correct: boolean; level: string }) => [
        { role: 'assistant' as const, content: JSON.stringify({ type: 'question', text: h.question, level: h.level }) },
        { role: 'user' as const, content: `Student answered "${h.answer}". ${h.correct ? 'CORRECT' : 'INCORRECT'}.` }
      ]).flat();

      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...historyMessages,
        { role: 'user' as const, content: 'All 10 questions done. Return the final result JSON now.' }
      ];

      const raw = await createThanarahCompletion(messages, { temperature: 0.2, maxTokens: 400 });

      let aiResult;
      try {
        aiResult = parseThanarahJson<{ level?: string }>(raw);
      } catch {
        aiResult = null;
      }

      const finalLevel = aiResult?.level || level;

      if (session?.user?.id) {
        try {
          await prisma.placementTestAttempt.create({
            data: {
              studentId: session.user.id,
              testType: 'PLACEMENT',
              score: correctCount,
              percentage,
              levelResult: finalLevel,
              details: JSON.stringify(answers),
              completedAt: new Date()
            }
          });

          const existingProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            select: { levelInitial: true }
          });

          await prisma.studentProfile.update({
            where: { userId: session.user.id },
            data: {
              levelCurrent: finalLevel,
              levelInitial: existingProfile?.levelInitial || finalLevel,
              placementTestScore: correctCount,
              placementTestPercentage: Math.round(percentage)
            }
          });
        } catch {
          console.error('Placement test result could not be saved');
        }
      }

      return NextResponse.json({
        success: true,
        level: finalLevel,
        score: correctCount,
        total: answers.length,
        percentage: Math.round(percentage)
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof ThanarahError && error.code === 'MISSING_API_KEY') {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }
    console.error(
      'AI placement test request failed',
      error instanceof ThanarahError ? { code: error.code, status: error.status } : undefined,
    );
    return NextResponse.json({ error: 'AI placement test failed' }, { status: 502 });
  }
}
