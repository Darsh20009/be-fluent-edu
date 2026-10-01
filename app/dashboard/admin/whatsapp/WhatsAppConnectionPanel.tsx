'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import styles from './WhatsAppConnectionPanel.module.css'

type WhatsAppAccount = {
  id: string
  phoneNumber: string
  provider: string
  status: string
  authPersistenceStatus: string
  isOtpSender: boolean
}

async function readJson(response: Response) {
  return response.json().catch(() => ({}))
}

export function WhatsAppConnectionPanel() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([])
  const [qrByAccount, setQrByAccount] = useState<Record<string, string | null>>({})
  const [busyAccount, setBusyAccount] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const refreshAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/whatsapp/accounts', { cache: 'no-store' })
      const data = await readJson(response)
      if (!response.ok) throw new Error(data.error?.message || 'Could not load WhatsApp accounts.')
      setAccounts(Array.isArray(data.items) ? data.items : [])
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load WhatsApp accounts.')
    }
  }, [])

  useEffect(() => {
    void refreshAccounts()
    const timer = setInterval(() => void refreshAccounts(), 5000)
    return () => clearInterval(timer)
  }, [refreshAccounts])

  useEffect(() => {
    const pending = accounts.filter((account) =>
      ['CONNECTING', 'QR_REQUIRED', 'RECONNECTING'].includes(account.status))
    if (!pending.length) return

    const poll = async () => {
      for (const account of pending) {
        try {
          const response = await fetch(`/api/admin/whatsapp/accounts/${account.id}/qr`, { cache: 'no-store' })
          const data = await readJson(response)
          if (!response.ok) continue
          setQrByAccount((current) => ({ ...current, [account.id]: data.qrImage || null }))
          setAccounts((current) => {
            if (!data.status || current.find((item) => item.id === account.id)?.status === data.status) return current
            return current.map((item) =>
              item.id === account.id ? { ...item, status: data.status } : item)
          })
        } catch {
          // A later poll will retry without exposing QR payloads or credentials.
        }
      }
    }

    void poll()
    const timer = setInterval(() => void poll(), 2500)
    return () => clearInterval(timer)
  }, [accounts])

  async function accountAction(account: WhatsAppAccount, action: string) {
    if (action === 'LOGOUT' && account.status !== 'CONNECTED') {
      const confirmed = window.confirm('This clears the saved WhatsApp link for this account and requires scanning a new QR code. CRM history will remain.')
      if (!confirmed) return
    }
    setBusyAccount(account.id)
    setNotice('')
    try {
      const response = await fetch(`/api/admin/whatsapp/accounts/${account.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await readJson(response)
      if (!response.ok) throw new Error(data.error?.message || 'WhatsApp action failed.')
      if (action === 'SET_OTP_SENDER') {
        setAccounts((current) => current.map((item) => ({
          ...item,
          isOtpSender: item.id === account.id,
        })))
        setNotice('This number is now selected for authentication codes.')
      } else {
        setAccounts((current) => current.map((item) => item.id === account.id
          ? { ...item, status: data.provider?.status || data.status || item.status }
          : item))
        if (action === 'LOGOUT') setQrByAccount((current) => ({ ...current, [account.id]: null }))
        setNotice(action === 'LOGOUT'
          ? 'WhatsApp link cleared. Connect again and scan a new QR code.'
          : 'Connection started. Scan the QR code when it appears.')
      }
      void refreshAccounts()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'WhatsApp action failed.')
    } finally {
      setBusyAccount(null)
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="whatsapp-connection-heading">
      <div className={styles.heading}>
        <div>
          <h2 id="whatsapp-connection-heading">Baileys connection</h2>
          <p>Connect a QR-linked WhatsApp number and select the sender for login codes.</p>
        </div>
        <button className={styles.refresh} type="button" onClick={() => void refreshAccounts()}>
          Refresh
        </button>
      </div>

      {notice && <p className={styles.notice} role="status">{notice}</p>}
      {accounts.length === 0 ? (
        <p className={styles.empty}>No WhatsApp accounts yet. Add an account in the CRM section below.</p>
      ) : (
        <div className={styles.accounts}>
          {accounts.map((account) => (
            <article className={styles.account} key={account.id}>
              <div className={styles.accountInfo}>
                <div>
                  <strong>{account.phoneNumber}</strong>
                  <p className={styles.meta}>
                    {account.status} · {account.authPersistenceStatus}
                    {account.isOtpSender ? ' · OTP sender' : ''}
                  </p>
                </div>
                <div className={styles.actions}>
                  {account.status === 'CONNECTED' ? (
                    <button
                      className={styles.secondary}
                      type="button"
                      disabled={busyAccount === account.id}
                      onClick={() => void accountAction(account, 'LOGOUT')}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <>
                      <button
                        className={styles.primary}
                        type="button"
                        disabled={busyAccount === account.id}
                        onClick={() => void accountAction(account, account.status === 'ERROR' ? 'RECONNECT' : 'CONNECT')}
                      >
                        {account.status === 'ERROR' ? 'Reconnect' : 'Connect'}
                      </button>
                      {['ERROR', 'QR_REQUIRED'].includes(account.status) && (
                        <button
                          className={styles.secondary}
                          type="button"
                          disabled={busyAccount === account.id}
                          onClick={() => void accountAction(account, 'LOGOUT')}
                        >
                          {account.status === 'ERROR' ? 'Reset session' : 'Cancel QR'}
                        </button>
                      )}
                    </>
                  )}
                  {account.status === 'CONNECTED' && !account.isOtpSender && (
                    <button
                      className={styles.secondary}
                      type="button"
                      disabled={busyAccount === account.id}
                      onClick={() => void accountAction(account, 'SET_OTP_SENDER')}
                    >
                      Use for OTP
                    </button>
                  )}
                </div>
              </div>
              {qrByAccount[account.id] && account.status !== 'CONNECTED' && (
                <div className={styles.qrBlock}>
                  <Image
                    src={qrByAccount[account.id] || ''}
                    alt={`WhatsApp linking QR for ${account.phoneNumber}`}
                    width={220}
                    height={220}
                    unoptimized
                  />
                  <p>Scan this code with the WhatsApp account you want to connect.</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}