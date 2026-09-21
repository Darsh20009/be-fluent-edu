import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import CommerceClient from './CommerceClient'

export const dynamic = 'force-dynamic'

export default function CommercePage() {
  return <main className={styles.shell}>
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Commercial operations</div>
          <h1 className={styles.title}>Subscriptions and groups</h1>
          <p className={styles.muted}>Manage packages, enrollment, group capacity, teachers, and schedules.</p>
        </div>
        <Phase4Nav area="admin" />
      </header>
      <CommerceClient />
    </div>
  </main>
}