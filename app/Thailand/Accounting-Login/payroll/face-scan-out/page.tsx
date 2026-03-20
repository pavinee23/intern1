"use client"

import React, { useState, useRef, useEffect } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

export default function FaceScanOutPage() {
  const { L } = useLang()
  const [scanning, setScanning] = useState(false)
  const [success, setSuccess] = useState(false)
  const [employee, setEmployee] = useState<any>(null)
  const [time, setTime] = useState('')
  const [workingHours, setWorkingHours] = useState('8:30')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setScanning(true)
    } catch (err) {
      alert(L('Cannot access camera', 'ไม่สามารถเข้าถึงกล้องได้'))
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setScanning(false)
  }

  const handleScan = () => {
    // Simulate face recognition
    setTimeout(() => {
      setEmployee({
        id: 'E001',
        name: 'สมชาย ใจดี',
        department: 'บัญชี',
        position: 'นักบัญชี',
        clockIn: '09:00:00'
      })
      setSuccess(true)
      stopCamera()

      // Auto reset after 5 seconds
      setTimeout(() => {
        setSuccess(false)
        setEmployee(null)
      }, 5000)
    }, 1500)
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <AccWindow title={L('บริษัท เค เอ็นเนอร์จี เซฟ จำกัด', 'K Energy Save Co., Ltd.')}>
      <div style={{ padding: 30, maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: 16,
          padding: '30px 40px',
          marginBottom: 30,
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(245,158,11,0.3)'
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            🏃 {L('Face Scan Clock-Out', 'สแกนหน้าเลิกงาน')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 12, opacity: 0.95 }}>
            {time}
          </div>
        </div>

        {!success ? (
          <>
            {/* Camera View */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: 30,
              marginBottom: 20,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{
                background: '#1f2937',
                borderRadius: 12,
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {scanning ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>
                    <div style={{ fontSize: 80, marginBottom: 20 }}>📷</div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                      {L('Click "Start Camera" to scan your face', 'กดปุ่ม "เปิดกล้อง" เพื่อเริ่มสแกนใบหน้า')}
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
                {!scanning ? (
                  <button
                    onClick={startCamera}
                    style={{
                      padding: '14px 32px',
                      fontSize: 16,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    📷 {L('Start Camera', 'เปิดกล้อง')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleScan}
                      style={{
                        padding: '14px 32px',
                        fontSize: 16,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      ✅ {L('Scan Face', 'สแกนใบหน้า')}
                    </button>
                    <button
                      onClick={stopCamera}
                      style={{
                        padding: '14px 32px',
                        fontSize: 16,
                        fontWeight: 700,
                        background: '#6b7280',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#4b5563'}
                      onMouseLeave={e => e.currentTarget.style.background = '#6b7280'}
                    >
                      ❌ {L('Cancel', 'ยกเลิก')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              background: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: 12,
              padding: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                💡 {L('Instructions', 'คำแนะนำ')}
              </div>
              <ul style={{ margin: 0, paddingLeft: 24, color: '#92400e', fontSize: 13, lineHeight: 1.8 }}>
                <li>{L('Position your face in the camera frame', 'จัดตำแหน่งใบหน้าให้อยู่ในกรอบกล้อง')}</li>
                <li>{L('Remove glasses and mask for better accuracy', 'ถอดแว่นและหน้ากากเพื่อความแม่นยำ')}</li>
                <li>{L('Ensure good lighting', 'ตรวจสอบว่ามีแสงสว่างเพียงพอ')}</li>
                <li>{L('System will calculate your working hours', 'ระบบจะคำนวณชั่วโมงทำงานให้อัตโนมัติ')}</li>
              </ul>
            </div>
          </>
        ) : (
          /* Success Message */
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: 16,
            padding: 50,
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(245,158,11,0.4)'
          }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>👋</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
              {L('Clock-Out Successful!', 'บันทึกเวลาเลิกงานสำเร็จ!')}
            </div>
            {employee && (
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 24,
                marginTop: 24,
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                  {L('Employee Information', 'ข้อมูลพนักงาน')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{employee.name}</div>
                <div style={{ fontSize: 16, opacity: 0.95 }}>
                  {L('ID', 'รหัส')}: {employee.id} | {L('Dept', 'แผนก')}: {employee.department}
                </div>
                <div style={{ fontSize: 16, opacity: 0.95 }}>{employee.position}</div>
                <div style={{
                  marginTop: 20,
                  padding: 16,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 8
                }}>
                  <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
                    ⏰ {L('Clock-In', 'เวลาเข้างาน')}: {employee.clockIn}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
                    🏃 {L('Clock-Out', 'เวลาเลิกงาน')}: {time.split(' ')[1]}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>
                    ⌚ {L('Total Hours', 'รวมชั่วโมงทำงาน')}: {workingHours} {L('hours', 'ชั่วโมง')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </AccWindow>
  )
}
