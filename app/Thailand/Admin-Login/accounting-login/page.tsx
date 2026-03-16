"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type User = {
  username?: string
  fullname?: string
  name?: string
  typeID?: number
  site?: string
}

export default function AccountingLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [mounted, setMounted] = useState(false)

  const L = (en: string, th: string) => (mounted && locale === 'th') ? th : en

  useEffect(() => {
    setMounted(true)
    // Load language
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch {}

    // Load user
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const user = JSON.parse(raw)
        setCurrentUser(user)
      }
    } catch (e) {
      console.error('Failed to load user:', e)
    }

    // Listen for language changes
    const handleLangChange = (e: any) => {
      const newLang = e.detail
      if (newLang === 'en' || newLang === 'th') setLocale(newLang)
    }
    const handleLocaleChange = (e: any) => {
      if (e.detail?.locale === 'en' || e.detail?.locale === 'th') {
        setLocale(e.detail.locale)
      }
    }
    window.addEventListener('k-system-lang', handleLangChange)
    window.addEventListener('locale-changed', handleLocaleChange)
    return () => {
      window.removeEventListener('k-system-lang', handleLangChange)
      window.removeEventListener('locale-changed', handleLocaleChange)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check user permission first
    const allowedTypes = [0, 1, 18]
    if (!currentUser || !allowedTypes.includes(currentUser.typeID || -1)) {
      setError('no_permission')
      setLoading(false)
      return
    }

    // Check credentials
    if (username === 'ksystem' && password === 'Ksave2025Admin') {
      // Redirect to phpMyAdmin
      window.open('http://127.0.0.1:8081/phpmyadmin/', '_blank')
      router.back()
    } else {
      setError('invalid_credentials')
    }
    setLoading(false)
  }

  return (
    <AdminLayout title="Accounting System Login" titleTh="ล็อกอินระบบงบดุล">
      <div className={styles.contentCard} style={{ maxWidth: 500, margin: '40px auto' }}>
        <div className={styles.cardHeader} style={{ textAlign: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h2 className={styles.cardTitle}>{L('Accounting System Login', 'ล็อกอินระบบงบดุล')}</h2>
          <p className={styles.cardSubtitle}>{L('Login to access accounting system', 'เข้าสู่ระบบงบดุล')}</p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '12px 16px',
                  marginBottom: '16px',
                  borderRadius: 8,
                  color: '#7f1d1d',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  fontSize: 14
                }}>
                  ⚠ {error === 'no_permission'
                    ? L('You do not have permission to access the accounting system (Admin, M_Accounting and Executive only)', 'คุณไม่มีสิทธิ์เข้าถึงระบบงบดุล (เฉพาะ Admin, M_Accounting และ Executive)')
                    : error === 'invalid_credentials'
                    ? L('Invalid username or password', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
                    : error}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Username', 'ชื่อผู้ใช้')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder={L('Enter username', 'กรอกชื่อผู้ใช้')}
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Password', 'รหัสผ่าน')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.formInput}
                  placeholder={L('Enter password', 'กรอกรหัสผ่าน')}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.btnPrimary} ${styles.btnLarge}`}
                  style={{ flex: 1 }}
                >
                  {loading ? L('Logging in...', 'กำลังเข้าสู่ระบบ...') : L('Login', 'เข้าสู่ระบบ')}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={`${styles.btnSecondary} ${styles.btnOutline}`}
                >
                  {L('Cancel', 'ยกเลิก')}
                </button>
              </div>
            </form>
        </div>
      </div>
    </AdminLayout>
  )
}
