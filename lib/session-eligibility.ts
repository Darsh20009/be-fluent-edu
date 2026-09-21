import { prisma } from '@/lib/prisma'

export async function findIneligibleSessionStudents(groupId: string, userIds: string[]) {
  const uniqueIds = [...new Set(userIds)]
  if (uniqueIds.length === 0) return []
  const [members, enrollments] = await Promise.all([
    prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: uniqueIds },
        status: 'ACTIVE',
        role: 'STUDENT',
        user: { role: 'STUDENT', isActive: true },
      },
      select: { userId: true },
    }),
    prisma.enrollment.findMany({
      where: { groupId, studentId: { in: uniqueIds }, status: 'ACTIVE' },
      select: { studentId: true },
    }),
  ])
  const memberIds = new Set(members.map((member) => member.userId))
  const enrolledIds = new Set(enrollments.map((enrollment) => enrollment.studentId))
  return uniqueIds.filter((id) => !memberIds.has(id) || !enrolledIds.has(id))
}