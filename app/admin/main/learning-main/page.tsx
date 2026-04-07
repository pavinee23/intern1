"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, GraduationCap, Home, LogOut, ShieldCheck, User } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useLocale } from '@/lib/LocaleContext'

export default function LearningMainPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name?: string; username?: string } | null>(null)

  const L = (texts: { en: string; ko: string; th: string; vn: string; ms: string; cn: string }) => {
    return texts[locale] || texts.en
  }

  useEffect(() => {
    setMounted(true)
    try {
      const token = localStorage.getItem('k_system_admin_token')
      const userData = localStorage.getItem('k_system_admin_user')

      if (!token || !userData) {
        router.replace('/admin/main/learning-login')
        return
      }

      setCurrentUser(JSON.parse(userData))
    } catch {
      router.replace('/admin/main/learning-login')
    }
  }, [router])

  const handleLogout = () => {
    try {
      localStorage.removeItem('k_system_admin_token')
      localStorage.removeItem('k_system_admin_user')
    } catch {}
    router.push('/admin/main/learning-login')
  }

  if (!mounted) return null

  const menuCards = [
    {
      title: L({ en: 'Work Manuals - Korea Branch', ko: '업무 매뉴얼 - 한국 지사', th: 'คู่มือการทำงาน - สาขาเกาหลี', vn: 'Hướng dẫn công việc - Chi nhánh Hàn Quốc', ms: 'Manual kerja - Cawangan Korea', cn: '工作手册 - 韩国分支' }),
      description: L({ en: 'Department manuals and login buttons for Korea branch', ko: '한국 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขาเกาหลี', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Hàn Quốc', ms: 'Manual jabatan dan butang log masuk untuk cawangan Korea', cn: '韩国分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#korea-hq',
      icon: Home,
      color: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
    },
    {
      title: L({ en: 'Work Manuals - Thailand Branch', ko: '업무 매뉴얼 - 태국 지사', th: 'คู่มือการทำงาน - สาขาไทย', vn: 'Hướng dẫn công việc - Chi nhánh Thái Lan', ms: 'Manual kerja - Cawangan Thailand', cn: '工作手册 - 泰国分支' }),
      description: L({ en: 'Department manuals and login buttons for Thailand branch', ko: '태국 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขาไทย', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Thái Lan', ms: 'Manual jabatan dan butang log masuk untuk cawangan Thailand', cn: '泰国分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#thailand-branch',
      icon: ShieldCheck,
      color: 'linear-gradient(135deg, #475569 0%, #1f2937 100%)'
    },
    {
      title: L({ en: 'Work Manuals - Vietnam Branch', ko: '업무 매뉴얼 - 베트남 지사', th: 'คู่มือการทำงาน - สาขาเวียดนาม', vn: 'Hướng dẫn công việc - Chi nhánh Việt Nam', ms: 'Manual kerja - Cawangan Vietnam', cn: '工作手册 - 越南分支' }),
      description: L({ en: 'Department manuals and login buttons for Vietnam branch', ko: '베트남 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขาเวียดนาม', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Việt Nam', ms: 'Manual jabatan dan butang log masuk untuk cawangan Vietnam', cn: '越南分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#vietnam-branch',
      icon: GraduationCap,
      color: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
    },
    {
      title: L({ en: 'Work Manuals - Malaysia Branch', ko: '업무 매뉴얼 - 말레이시아 지사', th: 'คู่มือการทำงาน - สาขามาเลเซีย', vn: 'Hướng dẫn công việc - Chi nhánh Malaysia', ms: 'Manual kerja - Cawangan Malaysia', cn: '工作手册 - 马来西亚分支' }),
      description: L({ en: 'Department manuals and login buttons for Malaysia branch', ko: '말레이시아 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขามาเลเซีย', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Malaysia', ms: 'Manual jabatan dan butang log masuk untuk cawangan Malaysia', cn: '马来西亚分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#malaysia-branch',
      icon: BookOpen,
      color: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)'
    },
    {
      title: L({ en: 'Work Manuals - Brunei Branch', ko: '업무 매뉴얼 - 브루나이 지사', th: 'คู่มือการทำงาน - สาขาบรูไน', vn: 'Hướng dẫn công việc - Chi nhánh Brunei', ms: 'Manual kerja - Cawangan Brunei', cn: '工作手册 - 文莱分支' }),
      description: L({ en: 'Department manuals and login buttons for Brunei branch', ko: '브루나이 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขาบรูไน', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Brunei', ms: 'Manual jabatan dan butang log masuk untuk cawangan Brunei', cn: '文莱分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#brunei-branch',
      icon: Home,
      color: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'
    },
    {
      title: L({ en: 'System Manuals - Korea Branch', ko: '시스템 매뉴얼 - 한국 지사', th: 'คู่มือการใช้ระบบ - สาขาเกาหลี', vn: 'Hướng dẫn hệ thống - Chi nhánh Hàn Quốc', ms: 'Manual sistem - Cawangan Korea', cn: '系统手册 - 韩国分支' }),
      description: L({ en: 'Role-based system login menu for Korea branch', ko: '한국 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขาเกาหลี', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Hàn Quốc', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Korea', cn: '韩国分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#korea-hq',
      icon: ShieldCheck,
      color: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)'
    },
    {
      title: L({ en: 'System Manuals - Thailand Branch', ko: '시스템 매뉴얼 - 태국 지사', th: 'คู่มือการใช้ระบบ - สาขาไทย', vn: 'Hướng dẫn hệ thống - Chi nhánh Thái Lan', ms: 'Manual sistem - Cawangan Thailand', cn: '系统手册 - 泰国分支' }),
      description: L({ en: 'Role-based system login menu for Thailand branch', ko: '태국 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขาไทย', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Thái Lan', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Thailand', cn: '泰国分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#thailand-branch',
      icon: ShieldCheck,
      color: 'linear-gradient(135deg, #475569 0%, #1f2937 100%)'
    },
    {
      title: L({ en: 'System Manuals - Vietnam Branch', ko: '시스템 매뉴얼 - 베트남 지사', th: 'คู่มือการใช้ระบบ - สาขาเวียดนาม', vn: 'Hướng dẫn hệ thống - Chi nhánh Việt Nam', ms: 'Manual sistem - Cawangan Vietnam', cn: '系统手册 - 越南分支' }),
      description: L({ en: 'Role-based system login menu for Vietnam branch', ko: '베트남 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขาเวียดนาม', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Việt Nam', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Vietnam', cn: '越南分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#vietnam-branch',
      icon: ShieldCheck,
      color: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)'
    },
    {
      title: L({ en: 'System Manuals - Malaysia Branch', ko: '시스템 매뉴얼 - 말레이시아 지사', th: 'คู่มือการใช้ระบบ - สาขามาเลเซีย', vn: 'Hướng dẫn hệ thống - Chi nhánh Malaysia', ms: 'Manual sistem - Cawangan Malaysia', cn: '系统手册 - 马来西亚分支' }),
      description: L({ en: 'Role-based system login menu for Malaysia branch', ko: '말레이시아 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขามาเลเซีย', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Malaysia', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Malaysia', cn: '马来西亚分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#malaysia-branch',
      icon: ShieldCheck,
      color: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
    },
    {
      title: L({ en: 'System Manuals - Brunei Branch', ko: '시스템 매뉴얼 - 브루나이 지사', th: 'คู่มือการใช้ระบบ - สาขาบรูไน', vn: 'Hướng dẫn hệ thống - Chi nhánh Brunei', ms: 'Manual sistem - Cawangan Brunei', cn: '系统手册 - 文莱分支' }),
      description: L({ en: 'Role-based system login menu for Brunei branch', ko: '브루나이 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขาบรูไน', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Brunei', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Brunei', cn: '文莱分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#brunei-branch',
      icon: ShieldCheck,
      color: 'linear-gradient(135deg, #be123c 0%, #881337 100%)'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #eef2ff 0%, #e2e8f0 100%)' }}>
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1f2937' }}>{L({ en: 'Learning & Training Main Menu', ko: '학습 및 교육 메인 메뉴', th: 'เมนูหลักการเรียนรู้และการฝึกอบรม', vn: 'Menu chính Học tập & Đào tạo', ms: 'Menu Utama Pembelajaran & Latihan', cn: '学习与培训主菜单' })}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{L({ en: 'K Energy Save - Learning Access Portal', ko: 'K Energy Save - 학습 접근 포털', th: 'K Energy Save - พอร์ทัลเข้าถึงการเรียนรู้', vn: 'K Energy Save - Cổng truy cập học tập', ms: 'K Energy Save - Portal Akses Pembelajaran', cn: 'K Energy Save - 学习访问门户' })}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageSwitcher allowedCodes={['th', 'vn', 'ms', 'ko', 'en', 'cn']} showBruneiAlias />
            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                color: '#374151',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <LogOut size={14} /> {L({ en: 'Logout', ko: '로그아웃', th: 'ออกจากระบบ', vn: 'Đăng xuất', ms: 'Log keluar', cn: '退出登录' })}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <User size={18} color="#6366f1" />
          <span style={{ color: '#374151', fontWeight: 600 }}>
            {L({ en: 'Welcome', ko: '환영합니다', th: 'ยินดีต้อนรับ', vn: 'Chào mừng', ms: 'Selamat datang', cn: '欢迎' })}: {currentUser?.name || currentUser?.username || L({ en: 'Learning User', ko: '학습 사용자', th: 'ผู้ใช้การเรียนรู้', vn: 'Người dùng học tập', ms: 'Pengguna pembelajaran', cn: '学习用户' })}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {menuCards.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 14,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={22} color="#fff" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{item.description}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
