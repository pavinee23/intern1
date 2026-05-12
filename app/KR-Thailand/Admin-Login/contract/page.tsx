"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import CreatedBy from '../components/CreatedBy'
import styles from '../admin-theme.module.css'
import { pdf } from '@react-pdf/renderer';
<<<<<<< HEAD
import EmploymentAgreementPDF from './employment/EmploymentPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

import ContractPDF from './ContractPDF';
import dynamic from 'next/dynamic';
import { blob } from 'stream/consumers'

const DynamicContractPDF = dynamic(() => import('./ContractPDF'), { ssr: false });
const EmploymentPDF = dynamic(() => import('./employment/EmploymentPDF'), { ssr: false });

type PaymentInstallment = {
  installmentNo: number
  dueDate: string
  amount: number
  status: 'pending' | 'paid'
  
}
=======
import { PDFDownloadLink } from '@react-pdf/renderer';
import ContractPDF from './ContractPDF';
import EmploymentAgreementPDF from './employment/EmploymentPDF';
import SalesrepresentativePDF from './SalesrepresentativePDF/SalesrepresentativePDF';


type PaymentInstallment = {
  installmentNo: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid';
};
>>>>>>> c1ca4cd (update)

export default function ContractPage() {
  const router = useRouter()
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [locale, setLocale] = useState<'en' | 'th'>(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'th' ? 'th' : 'en'
    } catch { return 'th' }
  })

  
  

  useEffect(() => {
      const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  const getAuthHeaders = (): Record<string, string> => {
    try {
      const t = localStorage.getItem('k_system_admin_token') || ''
      return t ? { Authorization: `Bearer ${t}` } : {}
    } catch {
      return {}
    }
  }

  const refreshContractNo = () => {
    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const rand = String(Math.floor(Math.random() * 9000) + 1000)
    setContractNo(`CT-${yy}${mm}${dd}-${rand}`)
  }

  

  // Form state
  const [address1, setAddress1] = useState(''); 
  const [address2, setAddress2] = useState(''); 
  const [area, setArea] = useState('');
  const [commission, setCommission] = useState(0);
  const [probation, setProbation] = useState(0);
  const [contractType, setContractType] = useState<string>('');
  const [contractNo, setContractNo] = useState('')
  const [contractDate, setContractDate] = useState(() => new Date().toISOString().split('T')[0])
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [name, setName] = useState(''); // ตัวแปรเดียวที่ใช้คุมชื่อทั้งสัญญา 
  const [customerPhone, setCustomerPhone] = useState('')
<<<<<<< HEAD
  const [customerAddress1, setCustomerAddress1] = useState(''); 
  const [customerAddress2, setCustomerAddress2] = useState('');
=======
>>>>>>> c1ca4cd (update)

  // ==========================================
// ตัวแปร State สำหรับ "สัญญาจ้างงาน (Employment)"
// ==========================================
<<<<<<< HEAD
   const [employeeName, setEmployeeName] = useState(''); // ชื่อลูกจ้าง
   const [position, setPosition] = useState('');         // ตำแหน่งงาน
   const [salary, setSalary] = useState('');             // เงินเดือน
   const [hiringDate, setHiringDate] = useState('');     // วันที่เริ่มงาน
   const [responsibilityDetail, setResponsibilityDetail] = useState(''); // ขอบเขตงาน
=======
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('');         // ตำแหน่งงาน
    const [salary, setSalary] = useState('');             // เงินเดือน
    const [hiringDate, setHiringDate] = useState('');     // วันที่เริ่มงาน
    const [responsibilityDetail, setResponsibilityDetail] = useState(''); // ขอบเขตงาน
>>>>>>> c1ca4cd (update)

  // Contract Type (ประเภทสัญญา)
  const [contractTypes, setContractTypes] = useState<{
    id: string
    nameEn: string
    nameTh: string
  }[]>([

    {
      id: 'rent',
      nameEn: 'Rent Contract',
      nameTh: 'สัญญาเช่า'
    },

    {
      id: 'company',
      nameEn: 'Sales and Installation Agreement (Company/Limited Partnership)',
      nameTh: 'สัญญาซื้อขายและติดตั้ง (บริษัท/ห้างหุ้นส่วน)'
    },
    {
      id: 'dealer',
      nameEn: 'Salesrepresentative',
      nameTh: 'สัญญาแต่งตั้งตัวแทนจำหน่าย'
    },
    {
      id: 'employment',
      nameEn: 'Employment Contract',
      nameTh: 'สัญญาจ้างงาน'
    }
  ])

  // Sales order import
  const [salesOrders, setSalesOrders] = useState<any[]>([])
  const [loadingSalesOrders, setLoadingSalesOrders] = useState(false)
  const [selectedSOId, setSelectedSOId] = useState<string>('')

  // Pre-installation import
  const [showPreInstModal, setShowPreInstModal] = useState(false)
  const [preInstList, setPreInstList] = useState<any[]>([])
  const [preInstLoading, setPreInstLoading] = useState(false)
  const [usedPreInstIds, setUsedPreInstIds] = useState<Set<number>>(new Set())

  // Contract content
  const [taxId, setTaxId] = useState<string>('');
  const [contractContent, setContractContent] = useState('')
  const [contractDuration, setContractDuration] = useState<number>(12)
  const [durationUnit, setDurationUnit] = useState<'days' | 'months' | 'years'>('months')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')

  // Payment terms
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [installmentCount, setInstallmentCount] = useState<number>(1)
  const [installmentAmount, setInstallmentAmount] = useState<number>(0)
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentInstallment[]>([])

  // Warranty & maintenance
  const [warrantyPeriod, setWarrantyPeriod] = useState<number>(12)
  const [warrantyUnit, setWarrantyUnit] = useState<'days' | 'months' | 'years'>('months')
  const [maintenanceScope, setMaintenanceScope] = useState('')

  // Notes
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Track imported pre-installation ID
  const [importedPreInstID, setImportedPreInstID] = useState<number | null>(null)

  // Contract Type (ประเภทสัญญา)
  const [selectedContractType, setSelectedContractType] = useState('')

   // 🤝 Dealer Agreement States (เพิ่มต่อจาก useState เดิมได้เลย)
  const [responsibleArea, setResponsibleArea] = useState('');
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [probationPeriod, setProbationPeriod] = useState<number>(0);
<<<<<<< HEAD
=======
  // สัญญาเช่าและติดตั้ง (Rental and Installation) States
  const [propertyDetails, setPropertyDetails] = useState('');
  const [monthlyRent, setMonthlyRent] = useState(''); 
>>>>>>> c1ca4cd (update)

  // Load initial data
  useEffect(() => {
    refreshContractNo()
    loadCustomers()
  }, [])

  // Calculate end date when start date or duration changes
  useEffect(() => {
    if (startDate && contractDuration) {
      const start = new Date(startDate)
      let end = new Date(start)

      if (durationUnit === 'days') {
        end.setDate(end.getDate() + contractDuration)
      } else if (durationUnit === 'months') {
        end.setMonth(end.getMonth() + contractDuration)
      } else if (durationUnit === 'years') {
        end.setFullYear(end.getFullYear() + contractDuration)
      }

      setEndDate(end.toISOString().split('T')[0])
    }
  }, [startDate, contractDuration, durationUnit])

  // Calculate installment amount when total or count changes
  useEffect(() => {
    if (totalAmount > 0 && installmentCount > 0) {
      setInstallmentAmount(Math.round((totalAmount / installmentCount) * 100) / 100)
    }
  }, [totalAmount, installmentCount])

  // Generate payment schedule when installment changes
  useEffect(() => {
    if (installmentCount > 0 && installmentAmount > 0 && startDate) {
      const schedule: PaymentInstallment[] = []
      const start = new Date(startDate)

      for (let i = 0; i < installmentCount; i++) {
        const dueDate = new Date(start)
        dueDate.setMonth(dueDate.getMonth() + i)

        schedule.push({
          installmentNo: i + 1,
          dueDate: dueDate.toISOString().split('T')[0],
          amount: i === installmentCount - 1
            ? Math.round((totalAmount - (installmentAmount * (installmentCount - 1))) * 100) / 100
            : installmentAmount,
          status: 'pending'
        })
      }

      setPaymentSchedule(schedule)
    }
  }, [installmentCount, installmentAmount, startDate, totalAmount])

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.customers)) {
        setCustomers(j.customers)
      }
    } catch (err) {
      console.error('Failed to load customers:', err)
    }
  }
  const loadSalesOrders = async () => {
    setLoadingSalesOrders(true)
    try {
      const res = await fetch('/api/sales-orders', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.orders)) {
        setSalesOrders(j.orders)
      }
    } catch (err) {
      console.error('Failed to load sales orders:', err)
    } finally {
      setLoadingSalesOrders(false)
    }
  }

  const importSalesOrder = async () => {
    if (!selectedSOId) {
      alert(L('Please select a sales order to import', 'กรุณาเลือกใบสั่งขายที่จะนำเข้า'))
      return
    }

    // Try to find in already loaded list first
    const so = salesOrders.find(s => String(s.orderID || s.orderNo) === String(selectedSOId))
    let order: any = so
    if (!order) {
      try {
        const res = await fetch(`/api/sales-orders/${selectedSOId}`, { headers: getAuthHeaders() })
        const j = await res.json()
        if (j && j.success) order = j.order
      } catch (err) {
        console.error('Failed to fetch sales order:', err)
      }
    }

    if (!order) {
      alert(L('Failed to import sales order', 'นำเข้าใบสั่งขายไม่สำเร็จ'))
      return
    }

    setName(order.customer_name || order.customer || '')
    setCustomerPhone(order.customer_phone || order.phone || '')
<<<<<<< HEAD
    setCustomerAddress1(order.customer_address || order.address || order.site_address || '')
=======
>>>>>>> c1ca4cd (update)
    setTotalAmount(Number(order.total_amount || order.amount || 0))
    if (order.preInstID || order.pre_inst_id) setImportedPreInstID(Number(order.preInstID || order.pre_inst_id))
    // Prefill contract content if the order carries pre-installation data
    if (order.preInstallation || order.pre_inst || order.pre_inst_no) {
      setContractContent(generateLegalContent(order.preInstallation || order.pre_inst || order))
    }

    window.dispatchEvent(new CustomEvent('k-system-toast', { detail: { message: L('Sales order imported', 'นำเข้าใบสั่งขายแล้ว'), type: 'success' } }))
  }
  // Load pre-installations (excluding those already used in contracts)
  const loadPreInstallations = async () => {
    setPreInstLoading(true)
    try {
      // First, get contracts to find used pre-installation IDs
      const contractsRes = await fetch('/api/contracts', { headers: getAuthHeaders() })
      const contractsJson = await contractsRes.json()
      const usedIds = new Set<number>()
      if (contractsJson && contractsJson.success && Array.isArray(contractsJson.contracts)) {
        contractsJson.contracts.forEach((c: any) => {
          if (c.preInstID) usedIds.add(Number(c.preInstID))
          if (c.pre_inst_id) usedIds.add(Number(c.pre_inst_id))
        })
      }
      setUsedPreInstIds(usedIds)

      // Then get pre-installations
      const res = await fetch('/api/pre-installation', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.preInstallations)) {
        // Filter out already used
        const available = j.preInstallations.filter((pi: any) => {
          const id = pi.preInstID || pi.id
          return !usedIds.has(Number(id))
        })
        setPreInstList(available)
      }
    } catch (err) {
      console.error('Failed to load pre-installations:', err)
    } finally {
      setPreInstLoading(false)
    }
  }

  // Select a pre-installation and import into contract form
  const selectPreInstallation = (pi: any) => {
    try {
      const preInstNo = pi.preInstNo || pi.pre_inst_no || ''
      setImportedPreInstID(Number(pi.preInstID || pi.id || null))
      setName(pi.customer_name || pi.customerName || '')
      setCustomerPhone(pi.phone || pi.tel || '')
<<<<<<< HEAD
      setCustomerAddress2(pi.site_address || pi.siteAddress || pi.site_name || '')
=======
>>>>>>> c1ca4cd (update)
      // Prefill contract content based on pre-installation
      setContractContent(generateLegalContent(pi))
    } catch (e) {
      console.error('selectPreInstallation error', e)
    } finally {
      setShowPreInstModal(false)
    }
  }

  // Generate comprehensive legal contract content
  const generateLegalContent = (pi: any) => {
    const customerName = pi.customer_name || pi.customerName || '[ชื่อลูกค้า]'
    const siteName = pi.site_name || pi.siteName || '[สถานที่ติดตั้ง]'
    const siteAddress = pi.site_address || pi.siteAddress || '[ที่อยู่ตามบัตรประชาชน]'
    const systemSize = pi.system_size || pi.systemSize || '[กำลังไฟฟ้า]'
    const preInstNo = pi.preInstNo || pi.pre_inst_no || ''

    if (locale === 'th') {
      return `สัญญาซื้อขายและติดตั้งระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์
อ้างอิงเอกสารสำรวจ: ${preInstNo}

บทนำ
คู่สัญญาตกลงตามรายละเอียดต่อไปนี้โดยมีเจตนาให้เกิดผลผูกพันตามกฎหมาย

1. คู่สัญญา
ผู้ขาย: บริษัท เคเซฟ เอนเนอร์จี จำกัด
ผู้ซื้อ: ${customerName}
สถานที่ติดตั้ง: ${siteName}
ที่อยู่: ${siteAddress}

2. คำนิยาม
คำที่ใช้ในสัญญานี้มีความหมายตามที่กำหนดไว้ต่อไปนี้ เว้นแต่บริบทจะระบุไว้เป็นอย่างอื่น:
- "สินค้า" หมายถึง อุปกรณ์ระบบพลังงานแสงอาทิตย์ทั้งหมดที่ระบุในสัญญานี้
- "การติดตั้ง" หมายถึง งานติดตั้ง ทดสอบ และส่งมอบระบบให้แก่ผู้ซื้อ

3. วัตถุประสงค์ของสัญญา
ผู้ขายตกลงจำหน่ายและติดตั้งระบบพลังงานแสงอาทิตย์ขนาด ${systemSize} พร้อมอุปกรณ์ที่เกี่ยวข้อง และผู้ซื้อยอมชำระค่าตามที่ระบุ

4. ราคาและการชำระเงิน
- ราคารวมภาษีมูลค่าเพิ่ม (ถ้ามี)
- การชำระเป็นไปตามตารางงวดที่แนบท้ายสัญญานี้
- การโอนสิทธิและความรับผิดชอบแก่ผู้ซื้อจะเกิดขึ้นเมื่อผู้ขายได้รับยอดชำระตามที่ระบุ

5. การส่งมอบและการติดตั้ง
- ผู้ขายต้องติดตั้งและทดสอบระบบภายในระยะเวลาที่กำหนดนับจากวันชำระเงินงวดแรก
- ผู้ซื้อต้องจัดเตรียมสถานที่ให้พร้อมและรับผิดชอบต่อการขออนุญาตที่จำเป็นทั้งหมด

6. การรับประกันและข้อจำกัดความรับผิด
- การรับประกันชิ้นส่วนและงานติดตั้งเป็นไปตามที่ระบุ โดยทั่วไป: แผงโซลาร์ 25 ปี (ประสิทธิภาพ), อินเวอร์เตอร์ 5-10 ปี, งานติดตั้ง 2 ปี
- การรับประกันไม่ครอบคลุมความเสียหายจากภัยธรรมชาติ ภัยสงคราม การใช้งานผิดประเภท หรืองานที่ไม่ได้รับอนุญาต
- ความรับผิดชอบทั้งหมดของผู้ขายในสัญญานี้จำกัดเพียงการชดเชยความเสียหายโดยตรงที่เกิดขึ้นจริงและไม่เกินมูลค่ารวมของสัญญา ข้อยกเว้นสำหรับการละเมิดโดยเจตนาหรือการประพฤติผิดอย่างร้ายแรงตามกฎหมาย

7. การยกเลิกและการบอกเลิกสัญญา
- หากผู้ซื้อยกเลิกโดยไม่มีเหตุอันสมควร ผู้ขายมีสิทธิเรียกค่าเสียหายตามที่กำหนดในสัญญาหรือหักค่าดำเนินการ
- หากผู้ขายฝ่าฝืนเงื่อนไขสำคัญและไม่สามารถแก้ไขภายในระยะเวลาเหมาะสม ผู้ซื้อมีสิทธิยกเลิกและเรียกค่าสินไหมทดแทน

8. กรณีไม่อาจปฏิบัติ (Force Majeure)
- คู่สัญญาไม่ต้องรับผิดหากไม่สามารถปฏิบัติตามภาระหน้าที่อันเนื่องมาจากเหตุสุดวิสัย เช่น ภัยธรรมชาติ สงคราม เครื่องจักรเสียหายที่ไม่อาจควบคุมได้ เป็นต้น โดยต้องแจ้งฝ่ายตรงข้ามเป็นลายลักษณ์อักษรภายในระยะเวลาที่เหมาะสม

9. การคุ้มครองข้อมูลและความลับ
- คู่สัญญาตกลงรักษาข้อมูลความลับที่ได้รับจากอีกฝ่ายและไม่เปิดเผยต่อบุคคลภายนอก เว้นแต่จำเป็นตามกฎหมาย

10. การโอนสิทธิและหน้าที่
- ห้ามโอนหรือมอบหมายสิทธิหรือภาระผูกพันภายใต้สัญญานี้ให้บุคคลภายนอกโดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากอีกฝ่าย

11. กฎหมายที่ใช้บังคับและการระงับข้อพิพาท
- สัญญานี้อยู่ภายใต้กฎหมายไทย
- ข้อพิพาทให้พยายามไกล่เกลี่ย หากไม่สำเร็จ ให้ยื่นต่อศาลไทยที่มีเขตอำนาจ

12. ข้อกำหนดทั่วไป
- สัญญานี้เป็นข้อตกลงฉบับสมบูรณ์ระหว่างคู่สัญญา
- หากข้อใดข้อหนึ่งเป็นโมฆะหรือยกเว้นได้ ข้อที่เหลือยังคงมีผลบังคับ

ลงชื่อ

ผู้ขาย: ______________________    วันที่: __________
ผู้ซื้อ: ______________________    วันที่: __________
`
    } else {
      return `SOLAR POWER SYSTEM PURCHASE AND INSTALLATION AGREEMENT
Reference: ${preInstNo}

INTRODUCTION
The Parties enter into this Agreement to set out the terms and conditions under which the Seller will supply and install the Solar Power System described herein.

1. PARTIES
Seller: K-Save Energy Co., Ltd.
Buyer: ${customerName}
Installation Site: ${siteName}
Address: ${siteAddress}

2. DEFINITIONS
Capitalized terms used in this Agreement shall have the meanings set out in this Agreement. "Goods" means the solar equipment described; "Works" means the installation, testing and commissioning works.

3. SCOPE
The Seller shall supply and install a solar power generation system of ${systemSize} and related equipment and services as described.

4. PRICE AND PAYMENT
4.1 The Price is inclusive of VAT unless stated otherwise.
4.2 Payment shall be made in accordance with the installment schedule attached to this Agreement.
4.3 Title and risk transfer provisions are as set out in this Agreement and applicable law.

5. DELIVERY AND INSTALLATION
The Seller shall deliver and complete installation within the agreed timeframe, subject to Buyer’s site readiness and obtaining necessary permits.

6. WARRANTY AND LIMITATION OF LIABILITY
6.1 Warranties are provided as specified: Panels – 25-year performance warranty; Inverter – 5-10 years; Installation workmanship – 2 years.
6.2 The Seller’s aggregate liability under or in connection with this Agreement shall be limited to direct damages and in no event shall exceed the total contract price, except for liability resulting from fraud, willful misconduct or gross negligence.

7. TERMINATION
Either Party may terminate this Agreement for material breach if the breach is not remedied within a reasonable period after notice. Buyer cancellation may incur fees as specified herein.

8. FORCE MAJEURE
Neither Party shall be liable for failure to perform any obligation if prevented by force majeure; the affected Party shall notify the other promptly.

9. CONFIDENTIALITY
Each Party shall keep confidential any confidential information disclosed by the other and shall not disclose it to third parties without prior written consent unless required by law.

10. ASSIGNMENT
Neither Party may assign its rights or obligations under this Agreement without the prior written consent of the other Party.

11. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be governed by the laws of Thailand. Disputes shall be resolved through amicable negotiation and, failing that, by the competent Thai courts.

12. GENERAL
This Agreement constitutes the entire agreement between the Parties. If any provision is held invalid, the remaining provisions shall remain in full force and effect.

IN WITNESS WHEREOF the parties have executed this Agreement:

Seller: ______________________    Date: __________
Buyer: ______________________    Date: __________
`
    }
  }

  // 1. เตรียมข้อมูลสำหรับสัญญาจ้างงาน
  const dataForEmployment = {
<<<<<<< HEAD
    date: contractDate || "ไม่ได้ระบุ",
    companyName: "บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด",
    employerName: "นายแพทริค จาง",
    employeeName: employeeName || "ไม่ได้ระบุ",
    position: position || "ไม่ได้ระบุ",
    salary: salary || "ไม่ได้ระบุ",
    hiringDate: hiringDate || "ไม่ได้ระบุ",
    responsibilityDetail: responsibilityDetail || "ไม่ได้ระบุ"
=======
    date: contractDate || "................",
    companyName: "L{ บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด K-Save Energy Co., Ltd. }",
    employerName: ".......................",
    name : name || "................",
    taxId: taxId || "................",
    address1: address1 || "................",
    address2: address2 || "................",
    position: position || "................",
    phone: phone || ".............",
    salary: salary || "................",
    hiringDate: hiringDate || "....................",
    responsibilityDetail: responsibilityDetail || "................"
>>>>>>> c1ca4cd (update)
  };

  // 2. เตรียมข้อมูลสำหรับสัญญาซื้อขาย
  const dataForSales = {
<<<<<<< HEAD
    customerName: customerName || "ไม่ได้ระบุ",
    contractNo: contractNo || "ไม่ได้ระบุ",
    contractDate: contractDate || "ไม่ได้ระบุ",
    totalAmount: totalAmount || "ไม่ได้ระบุ"
=======
    customerName: name || "................",
    contractNo: contractNo || "................",
    contractDate: contractDate || "................",
    totalAmount: totalAmount || "................"
>>>>>>> c1ca4cd (update)
  };

  // =================================================================
  // ฟังก์ชันที่ 1: บันทึกข้อมูล (handleSubmit)
  // =================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractNo) {
      alert(L('Please enter contract number', 'กรุณากรอกเลขที่สัญญา'));
      return;
    }
<<<<<<< HEAD
    if (!customerName) {
=======
    if (!name) {
>>>>>>> c1ca4cd (update)
      alert(L('Please select or enter customer', 'กรุณาเลือกหรือกรอกข้อมูลลูกค้า'));
      return;
    }

    setLoading(true);
    const payload = {
      contractNo, contractDate,
      cusID: selectedCustomer?.cusID || selectedCustomer?.id || null,
<<<<<<< HEAD
      customerName, customerPhone, customerAddress1, customerAddress2,
=======
      name, customerPhone,  
>>>>>>> c1ca4cd (update)
      contractContent, contractDuration, durationUnit, startDate, endDate,
      totalAmount, installmentCount, installmentAmount, paymentSchedule,
      warrantyPeriod, warrantyUnit, maintenanceScope, notes,
      preInstID: importedPreInstID,
      createdBy: localStorage.getItem('k_system_admin_user') || 'thailand admin'
    };

    try {
      const headers: any = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch('/api/contracts', { method: 'POST', headers, body: JSON.stringify(payload) });
      const j = await res.json();
      if (j && j.success) {
        window.dispatchEvent(new CustomEvent('k-system-toast', { detail: { message: L('Contract saved!', 'บันทึกสัญญาแล้ว!'), type: 'success' } }));
        router.push('/KR-Thailand/Admin-Login/contract/list');
      } else {
        alert(L('Save failed', 'บันทึกไม่สำเร็จ') + ': ' + (j?.error || ''));
      }
    } catch (err) {
      console.error(err);
      alert(L('Network error', 'เกิดข้อผิดพลาด'));
    } finally {
      setLoading(false);
    }
  }; // 👈 จบแค่นี้ครับ! ห้ามมี else ต่อท้าย finally เด็ดขาด

<<<<<<< HEAD

 // =================================================================
  // ฟังก์ชันดาวน์โหลด PDF (รวมข้อมูลและโค้ดดาวน์โหลดไว้ใน Try เดียวกัน)
  // =================================================================
  const handleDownloadPDF = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      let blob;                      // ประกาศเผื่อไว้ก่อน เพื่อให้โค้ดด้านล่างมองเห็น
      let fileName = 'Document.pdf'; // ประกาศเผื่อไว้ก่อน

      // --- แยกทางแยกตามประเภทสัญญา ---
      if (contractType === 'employment') {
        const dataForEmployment = {
          date: contractDate || "ไม่ได้ระบุ",
          companyName: "บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด",
          employerName: "นายแพทริค จาง",
          employeeName: employeeName || "ไม่ได้ระบุ",
          position: position || "ไม่ได้ระบุ",
          salary: salary || "ไม่ได้ระบุ",
          hiringDate: hiringDate || "ไม่ได้ระบุ",
          responsibilityDetail: responsibilityDetail || "ไม่ได้ระบุ"
        };
        blob = await pdf(<EmploymentAgreementPDF data={dataForEmployment} />).toBlob();
        fileName = `Employment_Contract_${employeeName || 'Draft'}.pdf`;

      } else if (contractType === 'sales' || contractType === 'company') {
        const dataForSales = {
          customerName: customerName || "ไม่ได้ระบุ",
          contractNo: contractNo || "ไม่ได้ระบุ",
          contractDate: contractDate || "ไม่ได้ระบุ",
          totalAmount: totalAmount || "ไม่ได้ระบุ"
        };
        blob = await pdf(<ContractPDF data={dataForSales} />).toBlob();
        fileName = `Contract_${contractNo || 'Draft'}.pdf`;

      } else {
        alert("กรุณาเลือกประเภทสัญญาก่อนดาวน์โหลดครับ");
        return; // สั่งหยุด ไม่ต้องทำโค้ดดาวน์โหลดด้านล่างต่อ
      }

      // --- โค้ดส่วนดาวน์โหลดไฟล์ลงเครื่อง ---
      if (blob) { // เช็คชัวร์ๆ ว่าสร้าง blob สำเร็จ ค่อยให้โหลด
=======
 // =================================================================
  // ฟังก์ชันดาวน์โหลด PDF (รวมข้อมูลและโค้ดดาวน์โหลดไว้ใน Try เดียวกัน)
  // =================================================================
const handleDownloadPDF = async () => {
  console.log("ค่าที่ฟังก์ชันเห็นคือ: ->", contractType, "<-");
    try {
      const { pdf } = await import('@react-pdf/renderer');
      let blob: any;
      let fileName = 'Document.pdf';

      // 1. สัญญาจ้างงาน
      if (contractType === 'employment') {
        const dataForEmployment = {
          date: contractDate || "................",
          companyName: "บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด K-Save Energy Co., Ltd.",
          name: name || "................",
          taxId: taxId || "................",
          address1: address1 || "................",
          address2: address2 || "................",
          position: position || "................",
          phone: phone || ".............",
          salary: salary || "................",
          hiringDate: hiringDate || "....................",
          responsibilityDetail: responsibilityDetail || "................"
        };
        blob = await pdf(<EmploymentAgreementPDF data={dataForEmployment} lang={locale === 'en' ? 'EN' : 'TH'} />).toBlob();
        fileName = `Employment_Contract_${name || 'Draft'}.pdf`;

      // 2. สัญญาซื้อขาย
      } else if (contractType === 'sales' || contractType === 'company') {
        const dataForSales = {
          date: contractDate || "................",
          name: name || "................",
          taxId: taxId || "................",
          address1: address1 || "................",
          phone: phone || ".............",
        };
        blob = await pdf(<ContractPDF data={dataForSales} lang={locale === 'en' ? 'EN' : 'TH'} />).toBlob();
        fileName = `Contract_${name || 'Draft'}.pdf`;

      // 3. สัญญาเช่า (ตรงนี้ที่พี่ติด Alert ในรูป image_edb757.png)
      } else if (contractType === 'rent' || contractType === 'rental') {
        const dataForRental = {
          date: contractDate || "................",
          name: name || "................",
          taxId: taxId || "................",
          address1: address1 || "................",
          phone: phone || ".............",
        };
       

      // 4. สัญญานายหน้า
      // เพิ่ม || contractType === 'dealer' เข้าไปให้ตรงกับ id ที่พี่ตั้ง
        } else if (contractType === 'dealer' || contractType === 'broker' || contractType === 'dealer') {
          const dataForBroker = {
            date: contractDate || "................",
            name: name || "................",
            taxId: taxId || "................",
            address1: address1 || "................",
            phone: phone || ".............",
          };

  // เรียกใช้ Tag ให้ตรงกับที่ import (ใช้ r เล็ก)
        blob = await pdf(<SalesrepresentativePDF data={dataForBroker} lang={locale === 'en' ? 'EN' : 'TH'} />).toBlob();
        fileName = `Sales_Representative_Agreement_${name || 'Draft'}.pdf`;
    

      } else {
        alert("กรุณาเลือกประเภทสัญญาก่อนดาวน์โหลดครับ");
        return;      
      }

      if (blob) {
>>>>>>> c1ca4cd (update)
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
<<<<<<< HEAD

    } catch (error) {
      console.error("PDF Error:", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF (เช็ค Console F12)");
    }
    
=======
    } catch (error) {
      console.error("PDF Error:", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
    }
>>>>>>> c1ca4cd (update)
  };
  
  // =================================================================
  // ฟังก์ชันจัดการตอนเลือกชื่อลูกค้าจาก Dropdown
  // =================================================================
  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      // ถ้าไม่ได้เลือกใครเลย ให้ล้างค่าที่กรอกไว้
<<<<<<< HEAD
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress1('');
=======
     setPhone('');      
     setAddress1('');   
     setAddress2('');
     setTaxId('');
>>>>>>> c1ca4cd (update)
      return;
    }
    
    // ค้นหาข้อมูลลูกค้าจากตัวเลือก
    const selected = customers.find((c: any) => c.cusID === val || c.id === val);
    if (selected) {
      // เติมข้อมูลลูกค้าลงในช่องอัตโนมัติ
<<<<<<< HEAD
      setCustomerName(selected.fullname || selected.name || '');
      setCustomerPhone(selected.phone || selected.telephone || '');
      setCustomerAddress1(selected.address || selected.address1 || '');
    }
  };


=======
      setName(selected.fullname || selected.name || '');
      setPhone(selected.phone || selected.telephone || '');
      setAddress1(selected.address1 || selected.address1 || '');
    }
  };

>>>>>>> c1ca4cd (update)
  // =================================================================
  // ฟังก์ชันจัดรูปแบบเงิน (ต้องอยู่เหนือ return และอยู่ใน Component)
  // =================================================================
  const fmtCurrency = (n: number) => n.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

<<<<<<< HEAD

=======
>>>>>>> c1ca4cd (update)
  // ====== เริ่มต้นส่วนแสดงผลหน้าจอ (UI) ======
  return (
    <AdminLayout title="Contract" titleTh="สัญญา">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="M9 15l3 3 3-3" />
            </svg>
            {L('Create Contract', 'สร้างสัญญา')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Create sales and purchase contract for customers', 'สร้างสัญญาสำหรับลูกค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <CreatedBy />
          <form onSubmit={handleSubmit}>

            {/* ==========================================
                1. ข้อมูลทั่วไป (General) - โชว์ครบทุกช่องแล้วครับ!
            ========================================== */}
            <div style={{ marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#334155' }}>
                📋 {L('General Information', 'ข้อมูลทั่วไป')}
              </h3>

              {/* Import & Contract No. */}
              <div className={styles.formGroup} style={{ flex: 2 }}></div>
              <div className={styles.formRow} style={{ marginBottom: 16 }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Contract No.', 'เลขที่สัญญา')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={contractNo}
                      onChange={e => setContractNo(e.target.value)}
                      className={styles.formInput}
                      placeholder="CT-260124-0001"
                      required
                      style={{ flex: 1 }}
                    />
                    <button type="button" onClick={refreshContractNo} className={styles.btnOutline}>
                      {L('Refresh', 'รีเฟรช')}
                    </button>
                    {/* ปุ่ม Import (กดแล้วไม่รีเฟรชหน้าแล้ว!) */}
                    <button type="button" onClick={() => { loadPreInstallations(); setShowPreInstModal(true) }} className={styles.btnOutline} style={{ padding: '10px 16px', background: '#f0f9ff', borderColor: '#bae6fd' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      </svg>
                      {L('Import', 'นำเข้า')}
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Contract Date', 'วันที่ทำสัญญา')}</label>
                  <input
                    type="date"
                    value={contractDate}
                    onChange={e => setContractDate(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Customer Info (เพิ่มเบอร์โทรและที่อยู่กลับมาแล้ว) */}
              <div className={styles.formRow} style={{ marginBottom: 16 }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Select Customer', 'เลือกลูกค้า')}</label>
                  <select onChange={handleCustomerSelect} className={styles.formSelect}>
                    <option value="">{L('-- Select or enter manually --', '-- เลือกหรือกรอกเอง --')}</option>
                    {customers.map(c => (
                      <option key={c.cusID || c.id} value={c.cusID || c.id}>
                        {c.fullname || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
                  {/* ชื่อ-นามสกุล, เบอร์โทรศัพท์ */}
              <div className={styles.formRow} style={{ marginBottom: 16 }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Name', 'ชื่อ-นามสกุล')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input value={name} onChange={e => setName(e.target.value)} className={styles.formInput} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Phone', 'เบอร์โทรศัพท์')}</label>
                  <input value={phone}
                   onChange={e => setPhone(e.target.value)}
                    className={styles.formInput} placeholder="08x-xxx-xxxx" />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ width: '100%' }}>
<<<<<<< HEAD
                  <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                  <input value={customerAddress1} onChange={e => setCustomerAddress1(e.target.value)} className={styles.formInput} placeholder="Customer address" />
=======
                  <label className={styles.formLabel}>{L('Address', 'ที่อยู่ตามบัตรประชาชน')}</label>
                  <input value={address1} onChange={e => setAddress1(e.target.value)} className={styles.formInput} placeholder={L('Local Customer address', 'ที่อยู่ตามบัตรประชาชน')} />
>>>>>>> c1ca4cd (update)
                </div>
              </div>
              {/* หาบรรทัดนี้ในโค้ดพี่ (ประมาณบรรทัดที่ 70 กว่าๆ) */}
              <div className={styles.formGroup} style={{ width: '100%' }}>
<<<<<<< HEAD
                <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                <input value={customerAddress2} onChange={e => setCustomerAddress2(e.target.value)} className={styles.formInput} placeholder="Customer address" />
=======
                <label className={styles.formLabel}>{L('Address', 'ที่อยู่ตามบัตรประชาชน')} </label>
                <input value={address2} onChange={e => setAddress2(e.target.value)} className={styles.formInput} placeholder={L('Customer address', 'ที่อยู่ตามบัตรประชาชน')} />
>>>>>>> c1ca4cd (update)
              </div>

              {/* พิมพ์ต่อท้ายตรงนี้เลยพี่! */}
              <div className={styles.formGroup} style={{ width: '100%', marginTop: 16 }}>
                <label className={styles.formLabel}>{L('Tax ID / ID Card', 'เลขประจำตัวผู้เสียภาษี')}</label>
                <input
                  value={taxId}
                  onChange={e => setTaxId(e.target.value.replace(/[^0-9]/g, '').slice(0, 13))}
                  className={styles.formInput}
                  placeholder="x-xxxx-xxxxx-xx-x"
                />
              </div>
            </div>

            {/* ==========================================
                2. เลือกประเภทสัญญา (Dropdown)
            ========================================== */}
            <div style={{ marginBottom: 20, padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#1d4ed8' }}>
                📌 {L('Select Contract Type', 'เลือกประเภทสัญญา')} <span style={{ color: '#dc2626' }}>*</span>
              </h3>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as any)}
                className={styles.formInput}
                style={{ width: '100%', maxWidth: 400, fontWeight: 'bold' }}
                required
              >
                <option value="" disabled>-- {L('Please select contract type', 'กรุณาเลือกประเภทสัญญา')} --</option>
                {contractTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {locale === 'th' ? type.nameTh : type.nameEn}
                  </option>
                ))}
                
                
              </select>
            </div>

            {/* ==========================================
                3. ข้อมูลเฉพาะเจาะจง (เด้งตามประเภทที่เลือกเป๊ะๆ)
            ========================================== */}
            {contractType && (
              <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: 20, animation: 'fadeIn 0.5s' }}>

                {/* 🛒 โชว์เฉพาะตอนเลือก สัญญาซื้อขาย (สมมติว่าพี่ใช้ตัวแปรเดิมในการเช็ค Dropdown) */}
{(contractType === 'company' || contractType === 'sales') && (
  <div style={{ marginTop: 20, animation: 'fadeIn 0.5s' }}>

    {/* 1. กล่อง Contract Terms (สีฟ้า) */}
    <div style={{ marginBottom: 20, padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#1e3a8a' }}>
        📝 {L('Contract Terms', 'เงื่อนไขสัญญา')}
      </h3>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{L('Contract Content / Terms', 'รายละเอียดสัญญา / เงื่อนไข')}</label>
        <textarea 
          className={styles.formInput} rows={3} placeholder={L('Enter contract terms and conditions...', 'กรอกรายละเอียดและเงื่อนไขสัญญา...')}
          value={contractContent} 
          onChange={(e) => setContractContent(e.target.value)} 
        />
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{L('Contract Duration', 'ระยะเวลาสัญญา')}</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              type="number" className={styles.formInput} placeholder="12" style={{ flex: 1 }}
              value={contractDuration} 
              onChange={(e) => setContractDuration(Number(e.target.value))} 
            />
            <select 
              className={styles.formInput} style={{ flex: 1 }}
              value={durationUnit} 
              onChange={(e) => setDurationUnit(e.target.value as 'days' | 'months' | 'years')}
            >
              <option value="days">{L('Days', 'วัน')}</option>
              <option value="months">{L('Months', 'เดือน')}</option>
              <option value="years">{L('Years', 'ปี')}</option>
            </select>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{L('Start Date', 'วันที่เริ่มสัญญา')}</label>
          <input 
            type="date" className={styles.formInput}
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{L('End Date', 'วันที่สิ้นสุดสัญญา')}</label>
          <input 
            type="date" className={styles.formInput}
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>
      </div>
    </div>

    {/* 2. กล่อง Payment Terms (สีเขียว) */}
    <div style={{ marginBottom: 20, padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#166534' }}>
        💳 {L('Payment Terms', 'เงื่อนไขการชำระเงิน')}
      </h3>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{L('Total Amount (฿)', 'ยอดรวมทั้งหมด (บาท)')}</label>
          <input 
            type="number" className={styles.formInput} placeholder="0"
            value={totalAmount === 0 ? '' : totalAmount} 
            onChange={(e) => setTotalAmount(Number(e.target.value))} 
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{L('Number of Installments', 'จำนวนงวด')}</label>
          <input 
            type="number" className={styles.formInput} placeholder="1"
            value={installmentCount === 0 ? '' : installmentCount} 
            onChange={(e) => setInstallmentCount(Number(e.target.value))} 
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{L('Amount per Installment (฿)', 'จำนวนเงินต่องวด (บาท)')}</label>
          <input 
            type="number" className={styles.formInput} placeholder="0"
            value={installmentAmount === 0 ? '' : installmentAmount} 
            onChange={(e) => setInstallmentAmount(Number(e.target.value))} 
          />
        </div>
      </div>
    </div>

    {/* 3. กล่อง Warranty & Maintenance (สีเหลือง) */}
    <div style={{ marginBottom: 20, padding: 16, background: '#fef9c3', borderRadius: 8, border: '1px solid #fef08a' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#854d0e' }}>
        🛠️ {L('Warranty & Maintenance', 'การรับประกันและบำรุงรักษา')}
      </h3>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{L('Warranty Period', 'ระยะเวลารับประกัน')}</label>
        <div style={{ display: 'flex', gap: 10, maxWidth: 300 }}>
          <input 
            type="number" className={styles.formInput} placeholder="12" style={{ flex: 1 }}
            value={warrantyPeriod} 
            onChange={(e) => setWarrantyPeriod(Number(e.target.value))} 
          />
          <select 
            className={styles.formInput} style={{ flex: 1 }}
            value={warrantyUnit} 
            onChange={(e) => setWarrantyUnit(e.target.value as 'days' | 'months' | 'years')}
          >
            <option value="days">{L('Days', 'วัน')}</option>
            <option value="months">{L('Months', 'เดือน')}</option>
            <option value="years">{L('Years', 'ปี')}</option>
          </select>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{L('Maintenance Scope', 'ขอบเขตการบำรุงรักษา')}</label>
        <textarea 
          className={styles.formInput} rows={3} placeholder={L('Describe the scope of maintenance and support...', 'อธิบายขอบเขตการบำรุงรักษา...')}
          value={maintenanceScope} 
          onChange={(e) => setMaintenanceScope(e.target.value)} 
        />
      </div>
    </div>

  </div>
)}
                 { /* 🤝 โชว์เฉพาะตอนเลือก สัญญาแต่งตั้งตัวแทนจำหน่าย (dealer) */}
                 {contractType === 'dealer' && (
                  <div style={{ marginBottom: 20, padding: 16, background: '#f5f3ff', borderRadius: 8, border: '1px solid #ddd6fe' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#6d28d9' }}>
                      🤝 {L('Appointment Details', 'รายละเอียดสัญญาตัวแทนจำหน่าย')}
                    </h3>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{L('Responsible Area', 'เขตพื้นที่รับผิดชอบ')}</label>
                      <input type="text" className={styles.formInput} placeholder="เช่น ทั่วประเทศไทย หรือ เฉพาะภาคเหนือ" />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>{L('Commission Percentage', 'เปอร์เซ็นต์ค่าคอมมิชชั่น')}</label>
                        <input type="number" className={styles.formInput} placeholder="%" />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>{L('Probation Period (Months)', 'ระยะเวลาทดลองงาน (เดือน)')}</label>
                        <input type="number" className={styles.formInput} />
                      </div>
                    </div>
                  </div>
              
                )}
              

               {/* 💼 โชว์เฉพาะตอนเลือก สัญญาจ้างงาน (employment) */}
{contractType === 'employment' && (
  <div style={{ marginBottom: 20, padding: 16, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
    <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#0369a1' }}>
      💼 {L('Employment Details', 'รายละเอียดสัญญาจ้างงาน')}
    </h3>
<<<<<<< HEAD
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{L('Employee Name', 'ชื่อลูกจ้าง')}</label>
        <input type="text" className={styles.formInput} value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="ระบุชื่อ-นามสกุลลูกจ้าง" />
      </div>
=======
    
>>>>>>> c1ca4cd (update)
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{L('Position', 'ตำแหน่งงาน')}</label>
        <input type="text" className={styles.formInput} value={position} onChange={(e) => setPosition(e.target.value)} placeholder="เช่น โปรแกรมเมอร์" />
      </div>
<<<<<<< HEAD
    </div>

=======
>>>>>>> c1ca4cd (update)
    <div className={styles.formRow} style={{ marginTop: 12 }}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{L('Salary (Baht/Month)', 'เงินเดือน (บาท/เดือน)')}</label>
        <input type="number" className={styles.formInput} value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="0.00" />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{L('Hiring Date', 'วันที่เริ่มงาน')}</label>
        <input type="date" className={styles.formInput} value={hiringDate} onChange={(e) => setHiringDate(e.target.value)} />
      </div>
    </div>

    <div className={styles.formGroup} style={{ marginTop: 12 }}>
      <label className={styles.formLabel}>{L('Responsibility Detail', 'ขอบเขตงานโดยละเอียด')}</label>
      <textarea className={styles.formInput} rows={3} value={responsibilityDetail} onChange={(e) => setResponsibilityDetail(e.target.value)} placeholder="ระบุรายละเอียดหน้าที่รับผิดชอบ..." />
    </div>
  </div>
)}

                {/* 🏠 โชว์เฉพาะตอนเลือก สัญญาเช่า (rent) */}
                {contractType === 'rent' && 
                  <div style={{ marginBottom: 20, padding: 16, background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#c2410c' }}>
                      🏠 {L('Rent Details', 'รายละเอียดสัญญาเช่า')}
                    </h3>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{L('Property Details', 'รายละเอียดที่พัก')}</label>
                      <textarea className={styles.formInput} rows={2} value={propertyDetails} onChange={(e) => setPropertyDetails(e.target.value)} placeholder="ระบุรายละเอียดที่พัก" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{L('Monthly Rent (Baht)', 'ค่าเช่ารายเดือน (บาท)')}</label>  
                      <input type="number" className={styles.formInput} value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="0.00" />
                    </div>
                  </div>
                }

                {/* หมายเหตุ (มีทุกสัญญา) */}
                <div style={{ marginBottom: 20 }}>
                  <label className={styles.formLabel}>{L('Notes / Remarks', 'หมายเหตุ')}</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className={styles.formInput} rows={2} />
                </div>

<<<<<<< HEAD
            {/* ปุ่มสำหรับดาวน์โหลด PDF ✅ */}


      <button
      type="button"
      onClick={handleDownloadPDF}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-block text-center"
    >
      📥 ดาวน์โหลด PDF
    </button>
=======
           
            {/* ปุ่มสำหรับดาวน์โหลด PDF ✅ */} 
            <button
            type="button"
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-block text-center"
          >
            📥 ดาวน์โหลด PDF
              </button>
>>>>>>> c1ca4cd (update)
    
                {/* ปุ่ม Save */}
                <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                  <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                    {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save Contract', 'บันทึกสัญญา')}
                  </button>
                  <button type="button" onClick={() => router.push('/KR-Thailand/Admin-Login/contract/list')} className={`${styles.btn} ${styles.btnSecondary}`}>
                    {L('Cancel', 'ยกเลิก')}
                  </button>
                </div>
              </div>
            )}

            {!contractType && (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b', background: '#f1f5f9', borderRadius: 8 }}>
                ↑ กรุณาเลือกประเภทสัญญาด้านบน เพื่อกรอกข้อมูลเพิ่มเติม ↑
              </div>
            )}

          </form>
        </div>
      </div>

      {/* ==========================================
          MODAL Import (ใส่ type="button" ป้องกันหน้า Refresh แล้ว) 
      ========================================== */}
      {showPreInstModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowPreInstModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 800, maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{L('Select Pre-installation', 'เลือกแบบก่อนติดตั้ง')}</h3>
              <button onClick={() => setShowPreInstModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24 }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
              {preInstLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>กำลังโหลด...</div>
              ) : preInstList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>ไม่มีข้อมูล</div>
              ) : (
                <table className={styles.table} style={{ fontSize: 14 }}>
                  <thead>
                    <tr><th>เลขที่</th><th>ลูกค้า</th><th style={{ width: 100 }}>เลือก</th></tr>
                  </thead>
                  <tbody>
                    {preInstList.map((pi: any) => (
                      <tr key={pi.preInstID || pi.id}>
                        <td>{pi.preInstNo || pi.pre_inst_no}</td>
                        <td>{pi.customer_name || pi.customerName}</td>
                        <td>
                          {/* พระเอกของเรา! type="button" */}
                          <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            style={{ padding: '6px 12px', fontSize: 13 }}
                            onClick={() => { selectPreInstallation(pi); setShowPreInstModal(false); }}
                          >
                            เลือก
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

