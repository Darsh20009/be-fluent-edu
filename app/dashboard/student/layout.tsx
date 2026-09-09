import styles from './student-foundation.module.css'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.foundation}>{children}</div>
}