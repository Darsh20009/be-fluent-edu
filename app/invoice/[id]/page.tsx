import InvoicePageClient from './InvoicePageClient'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <InvoicePageClient
      subscriptionId={id}
    />
  )
}
