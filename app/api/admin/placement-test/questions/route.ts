import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const defaultQuestions = [
  {
    question: "I ___ a student.",
    options: JSON.stringify(["am", "is", "are", "be"]),
    correctAnswer: "am",
    level: "A1",
    category: "Grammar"
  },
  {
    question: "She ___ to school every day.",
    options: JSON.stringify(["go", "goes", "going", "gone"]),
    correctAnswer: "goes",
    level: "A1",
    category: "Grammar"
  },
  {
    question: "They ___ watching TV right now.",
    options: JSON.stringify(["am", "is", "are", "was"]),
    correctAnswer: "are",
    level: "A1",
    category: "Grammar"
  },
  {
    question: "Have you ___ to London?",
    options: JSON.stringify(["be", "been", "being", "was"]),
    correctAnswer: "been",
    level: "A2",
    category: "Grammar"
  },
  {
    question: "If it rains, I ___ at home.",
    options: JSON.stringify(["stay", "will stay", "stayed", "would stay"]),
    correctAnswer: "will stay",
    level: "B1",
    category: "Grammar"
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('testType') || 'PLACEMENT';

    const count = await prisma.placementQuestion.count({ where: { testType } });
    if (count === 0 && testType === 'PLACEMENT') {
      await prisma.placementQuestion.createMany({
        data: defaultQuestions
      });
    }
    const questions = await prisma.placementQuestion.findMany({
      where: { testType }
    });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = await prisma.placementQuestion.create({
      data: {
        question: body.question,
        questionAr: body.questionAr,
        options: JSON.stringify(body.options),
        correctAnswer: body.correctAnswer,
        level: body.level,
        testType: body.testType || 'PLACEMENT',
        category: body.category
      }
    });
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
