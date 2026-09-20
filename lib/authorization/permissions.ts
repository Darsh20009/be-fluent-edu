export const ROLES = ['STUDENT', 'TEACHER', 'ADMIN', 'MANAGER', 'STAFF'] as const

export type Role = (typeof ROLES)[number]

/** Legacy ASSISTANT accounts are treated as STAFF until they are migrated. */
export function normalizeRole(role: string | null | undefined): Role | null {
  if (role === 'ASSISTANT') return 'STAFF'
  return ROLES.includes(role as Role) ? (role as Role) : null
}

export const PERMISSIONS = [
  'student.joinSession',
  'student.submitHomework',
  'student.joinSpeakingRoom',
  'teacher.editFeedback',
  'teacher.publishFeedback',
  'teacher.manageHomework',
  'staff.addStudentToGroup',
  'staff.moveStudent',
  'staff.changeStudentLevel',
  'staff.approveSubscription',
  'staff.manageWhatsApp',
  'staff.manageSystem',
  'admin.manageUsers',
  'admin.manageRoles',
  'admin.manageSystem',
  'admin.viewPeople',
  'admin.manageLevels',
  'admin.manageStaffPermissions',
  'admin.changeStudentLevel',
  'manager.manageUsers',
  'manager.viewPeople',
  'teacher.viewStudents',
  'teacher.recommendLevel',
  'student.editProfile',
  'student.editGoals',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const ALL_PERMISSIONS: readonly Permission[] = PERMISSIONS

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  STUDENT: [
    'student.joinSession',
    'student.submitHomework',
    'student.joinSpeakingRoom',
    'student.editProfile',
    'student.editGoals',
  ],
  TEACHER: [
    'student.joinSession',
    'student.joinSpeakingRoom',
    'teacher.editFeedback',
    'teacher.publishFeedback',
    'teacher.manageHomework',
    'teacher.viewStudents',
    'teacher.recommendLevel',
  ],
  STAFF: [
    'staff.addStudentToGroup',
    'staff.moveStudent',
    'staff.changeStudentLevel',
    'staff.approveSubscription',
    'staff.manageWhatsApp',
  ],
  MANAGER: [
    'staff.addStudentToGroup',
    'staff.moveStudent',
    'staff.changeStudentLevel',
    'staff.approveSubscription',
    'staff.manageWhatsApp',
    'staff.manageSystem',
    'manager.manageUsers',
    'admin.viewPeople',
    'admin.manageLevels',
    'admin.changeStudentLevel',
    'manager.viewPeople',
  ],
  ADMIN: ALL_PERMISSIONS,
  // The additional capabilities above are intentionally not inherited by
  // STAFF; their permissions must be granted explicitly in StaffPermission.
}
