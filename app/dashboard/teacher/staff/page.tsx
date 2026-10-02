import { getServerLanguage } from '@/lib/server-locale'
import { localeDirection, localeText } from '@/lib/locale'
import EmployeeAccountForm from '../EmployeeAccountForm'

export const dynamic = 'force-dynamic'

export default async function TeacherStaffPage() {
  const language = await getServerLanguage()
  return (
    <main dir={localeDirection(language)}>
      <header className="mb-5">
        <p className="text-xs font-semibold text-[#718078]">{localeText(language, 'مساحة المعلم', 'Teacher workspace')}</p>
        <h1 className="mt-1 text-2xl font-bold text-[#26332e]">{localeText(language, 'حسابات الموظفين', 'Employee accounts')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68756e]">
          {localeText(language, 'أنشئ حساب معلم أو موظف. يمنح المدير صلاحيات حساب الموظف لاحقاً من لوحة الإدارة.', 'Create a teacher or staff account. An administrator assigns staff permissions later from the admin dashboard.')}
        </p>
      </header>
      <EmployeeAccountForm />
    </main>
  )
}