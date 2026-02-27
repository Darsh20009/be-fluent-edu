import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('testType') || 'PLACEMENT';

    const allQuestions = await prisma.placementQuestion.findMany({
      where: { testType }
    });
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 20);

    return NextResponse.json(selected);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { answers, testType = 'PLACEMENT' } = body;
    let score = 0;
    const details = [];

    const questions = await prisma.placementQuestion.findMany({
      where: { id: { in: Object.keys(answers) } }
    });

    for (const q of questions) {
      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) score++;
      details.push({ questionId: q.id, answer: answers[q.id], correct: isCorrect });
    }

    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    let level = 'A1';
    if (percentage >= 90) level = 'C1';
    else if (percentage >= 75) level = 'B2';
    else if (percentage >= 60) level = 'B1';
    else if (percentage >= 40) level = 'A2';

    const attempt = await prisma.placementTestAttempt.create({
      data: {
        studentId: session.user.id,
        testType,
        score,
        percentage,
        levelResult: level,
        details: JSON.stringify(details),
        completedAt: new Date()
      }
    });

    // Only update profile level if it's a placement test
    if (testType === 'PLACEMENT') {
      const existingProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id },
        select: { levelInitial: true }
      });

      await prisma.studentProfile.update({
        where: { userId: session.user.id },
        data: { 
          levelCurrent: level,
          levelInitial: existingProfile?.levelInitial || level,
          placementTestScore: score,
          placementTestPercentage: Math.round(percentage)
        }
      });
    }

    return NextResponse.json({ score, percentage, level });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
