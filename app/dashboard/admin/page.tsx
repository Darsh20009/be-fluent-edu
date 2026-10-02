import { requireAdminPageAccess } from './page-access'

export default async function AdminDashboardPage() {
  await requireAdminPageAccess()
  return null
}
