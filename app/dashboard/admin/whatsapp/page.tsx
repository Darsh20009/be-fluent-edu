import { Phase4Nav } from '@/app/phase4/nav'
import pageStyles from '@/app/phase4/phase4.module.css'
import { WhatsAppCRMWorkspace } from './WhatsAppCRMWorkspace'

export default function Page() {
  return (
    <main className={pageStyles.shell} dir="rtl">
      <div className={pageStyles.container}>
        <header className={pageStyles.header}>
          <div>
            <div className={pageStyles.eyebrow}>مساحة الإدارة</div>
            <h1 className={pageStyles.title}>مكتب واتساب</h1>
            <p className={pageStyles.muted}>إدارة الأرقام والربط والمحادثات من مساحة واحدة.</p>
          </div>
          <Phase4Nav area="admin" />
        </header>
        <WhatsAppCRMWorkspace />
      </div>
    </main>
  )
}