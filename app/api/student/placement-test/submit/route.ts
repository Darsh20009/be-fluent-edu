import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get 20 random questions from the bank
    const allQuestions = await prisma.placementQuestion.findMany();
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

    const { answers } = await request.json(); // Map of questionId -> answer
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

    const percentage = (score / questions.length) * 100;
    let level = 'A1';
    if (percentage >= 90) level = 'C1';
    else if (percentage >= 75) level = 'B2';
    else if (percentage >= 60) level = 'B1';
    else if (percentage >= 40) level = 'A2';

    const attempt = await prisma.placementTestAttempt.create({
      data: {
        studentId: session.user.id,
        score,
        percentage,
        levelResult: level,
        details: JSON.stringify(details),
        completedAt: new Date()
      }
    });

    // Update student profile level
    await prisma.studentProfile.update({
      where: { userId: session.user.id },
      data: { 
        levelCurrent: level,
        placementTestScore: score,
        placementTestPercentage: Math.round(percentage)
      }
    });

    return NextResponse.json({ score, percentage, level });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
