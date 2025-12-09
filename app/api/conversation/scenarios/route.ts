import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { conversationScenarios } from '@/lib/conversation-scenarios'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const category = searchParams.get('category')

    let scenarios = await prisma.conversationScenario.findMany({
      where: {
        isPublished: true,
        ...(level && { level }),
        ...(category && { category })
      },
      orderBy: { order: 'asc' }
    })

    if (scenarios.length === 0) {
      const scenariosToCreate = conversationScenarios.map((scenario, index) => ({
        title: scenario.title,
        titleAr: scenario.titleAr,
        description: scenario.description,
        descriptionAr: scenario.descriptionAr,
        category: scenario.category,
        categoryAr: scenario.categoryAr,
        level: scenario.level,
        dialogueSteps: JSON.stringify(scenario.dialogueSteps),
        order: index,
        isPublished: true
      }))

      for (const scenario of scenariosToCreate) {
        await prisma.conversationScenario.create({ data: scenario })
      }

      scenarios = await prisma.conversationScenario.findMany({
        where: {
          isPublished: true,
          ...(level && { level }),
          ...(category && { category })
        },
        orderBy: { order: 'asc' }
      })
    }

    let progress: any[] = []
    if (session.user.role === 'STUDENT') {
      const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
      if (user) {
        progress = await prisma.conversationProgress.findMany({
          where: { studentId: user.id }
        })
      }
    }

    const scenariosWithProgress = scenarios.map((scenario: any) => ({
      ...scenario,
      dialogueSteps: JSON.parse(scenario.dialogueSteps),
      progress: progress.find(p => p.scenarioId === scenario.id) || null
    }))

    return NextResponse.json(scenariosWithProgress)
  } catch (error) {
    console.error('Error fetching scenarios:', error)
    return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 })
  }
}
