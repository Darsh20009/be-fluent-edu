'use client'

import { useEffect, useState } from 'react'
import styles from '@/app/phase4/phase4.module.css'

type Student = { id: string; name: string; email: string; status: string }

export default function TeacherStudentsClient() {
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState('')
  useEffect(() => { fetch('/api/teacher/students').then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body?.error?.message || 'Unable to load students'); return body }).then((body) => setStudents(body.students || body.items || [])).catch((reason: Error) => setError(reason.message)) }, [])
  if (error) return <div className={styles.error}>{error}</div>
  return <section className={styles.card}>{students.length === 0 ? <div className={styles.empty}>No assigned students are available yet.</div> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.name}</td><td>{student.email}</td><td><span className={styles.badge}>{student.status}</span></td></tr>)}</tbody></table></div>}</section>
}