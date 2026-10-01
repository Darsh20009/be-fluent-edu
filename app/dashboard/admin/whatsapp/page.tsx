import { AdminWhatsApp } from '@/app/dashboard/SpeakingClient'
import { WhatsAppConnectionPanel } from './WhatsAppConnectionPanel'

export default function Page() {
  return (
    <>
      <WhatsAppConnectionPanel />
      <AdminWhatsApp />
    </>
  )
}