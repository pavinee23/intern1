'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Zap, Activity, AlertTriangle, CheckCircle, XCircle, BarChart3, TrendingUp, Plus, Search, Eye, Download, Calendar, User, Building, Save, Upload, X, Table2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '../components/AdminLayout';

interface PhaseData {
  L1: number;
  L2: number;
  L3: number;
  N: number;
}

interface AnalysisData {
  id: string;
  branch: string;
  location: string;
  equipment: string;
  datetime: string;
  measurementPeriod: string;
  technician: string;
  voltage: string;
  frequency: number;
  powerFactor: number;
  thd: number;
  current: PhaseData;
  balance: 'Good' | 'Fair' | 'Poor';
  result: 'Recommended' | 'Not Recommended' | 'Further Analysis Required';
  recommendation: string;
  notes: string;
  recommendedProduct?: string;
  // Engineer approval
  engineerName: string;
  engineerLicense: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvalDate: string;
  approverName: string;
}

// Helper functions
const generateDocumentNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 999) + 1;
  return `TH-PIA-${year}-${month}${day}-${String(random).padStart(3, '0')}`;
};

const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function ThailandPreInstallationAnalysis() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'th'>('th');
  const [view, setView] = useState<'form' | 'upload' | 'list'>('form');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedCSVData, setUploadedCSVData] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('thailand');

  const [formData, setFormData] = useState<AnalysisData>({
    id: generateDocumentNumber(),
    branch: 'Thailand',
    location: '',
    equipment: 'Fluke 438-II Motor Analyzer',
    datetime: getCurrentDateTime(),
    measurementPeriod: '7 days',
    technician: '',
    voltage: '380',
    frequency: 50.0,
    powerFactor: 0.85,
    thd: 0,
    current: { L1: 156.3, L2: 142.9, L3: 168.7, N: 22.1 },
    balance: 'Fair',
    result: 'Recommended',
    recommendation: 'Large current difference between L3 and L2 phases. UPS system inspection and load redistribution required.',
    notes: 'Harmonics and phase imbalance due to UPS system, review after improvement',
    recommendedProduct: 'KSAVER 150KVA',
    engineerName: '',
    engineerLicense: '',
    approvalStatus: 'Pending',
    approvalDate: getCurrentDateTime(),
    approverName: '',
  });

  const branches = [
    { id: 'thailand', name: lang === 'th' ? 'ไทย' : 'Thailand', countryCode: 'TH' as const },
    { id: 'vietnam', name: lang === 'th' ? 'เวียดนาม' : 'Vietnam', countryCode: 'VN' as const },
    { id: 'brunei', name: lang === 'th' ? 'บรูไน' : 'Brunei', countryCode: 'BN' as const },
    { id: 'korea', name: lang === 'th' ? 'เกาหลี' : 'Korea', countryCode: 'KR' as const },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('k_system_lang');
    if (savedLang === 'th' || savedLang === 'en') setLang(savedLang);

    // Load saved analyses
    const savedData = localStorage.getItem('thailand_pre_installation_analyses');
    if (savedData) {
      setAnalyses(JSON.parse(savedData));
    }
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'th' ? 'en' : 'th';
    setLang(newLang);
    localStorage.setItem('k_system_lang', newLang);
  };

  // Power consumption data for 7 days
  const powerData = [
    { time: '20/02 00:00', peak: 12.3, avgDay: 12.3, night: 12.3 },
    { time: '20/02 04:00', peak: 15.1, avgDay: 15.1, night: 15.1 },
    { time: '20/02 08:00', peak: 89.2, avgDay: 89.2, night: 25.4 },
    { time: '20/02 12:00', peak: 165.8, avgDay: 138.5, night: 35.2 },
    { time: '20/02 16:00', peak: 171.3, avgDay: 142.7, night: 28.9 },
    { time: '20/02 20:00', peak: 68.9, avgDay: 68.9, night: 22.1 },
    { time: '21/02 00:00', peak: 13.7, avgDay: 13.7, night: 13.7 },
    { time: '21/02 04:00', peak: 16.2, avgDay: 16.2, night: 16.2 },
    { time: '21/02 08:00', peak: 92.1, avgDay: 92.1, night: 26.8 },
    { time: '21/02 12:00', peak: 158.4, avgDay: 131.2, night: 38.7 },
    { time: '21/02 16:00', peak: 167.9, avgDay: 139.8, night: 31.5 },
    { time: '21/02 20:00', peak: 71.3, avgDay: 71.3, night: 24.6 },
    { time: '22/02 00:00', peak: 11.5, avgDay: 11.5, night: 11.5 },
    { time: '22/02 04:00', peak: 14.8, avgDay: 14.8, night: 14.8 },
    { time: '22/02 08:00', peak: 95.7, avgDay: 95.7, night: 28.3 },
    { time: '22/02 12:00', peak: 170.2, avgDay: 141.8, night: 39.4 },
    { time: '22/02 16:00', peak: 175.1, avgDay: 146.2, night: 32.8 },
    { time: '22/02 20:00', peak: 69.4, avgDay: 69.4, night: 23.7 },
  ];

  // Current data for phases
  const currentData = [
    { time: '20/02 00:00', phaseA: 25.3, phaseB: 22.1, phaseC: 28.7 },
    { time: '20/02 04:00', phaseA: 30.1, phaseB: 27.2, phaseC: 32.6 },
    { time: '20/02 08:00', phaseA: 145.2, phaseB: 138.9, phaseC: 156.3 },
    { time: '20/02 12:00', phaseA: 268.7, phaseB: 251.4, phaseC: 282.1 },
    { time: '20/02 16:00', phaseA: 275.9, phaseB: 258.2, phaseC: 289.7 },
    { time: '20/02 20:00', phaseA: 112.4, phaseB: 105.8, phaseC: 118.9 },
    { time: '21/02 00:00', phaseA: 27.1, phaseB: 24.6, phaseC: 30.2 },
    { time: '21/02 04:00', phaseA: 31.8, phaseB: 28.9, phaseC: 34.1 },
    { time: '21/02 08:00', phaseA: 148.9, phaseB: 142.1, phaseC: 159.7 },
    { time: '21/02 12:00', phaseA: 261.3, phaseB: 244.7, phaseC: 275.8 },
    { time: '21/02 16:00', phaseA: 272.1, phaseB: 255.6, phaseC: 286.4 },
    { time: '21/02 20:00', phaseA: 115.7, phaseB: 108.9, phaseC: 122.3 },
  ];

  const calculateBalance = (current: PhaseData): 'Good' | 'Fair' | 'Poor' => {
    const max = Math.max(current.L1, current.L2, current.L3);
    const min = Math.min(current.L1, current.L2, current.L3);
    const imbalance = ((max - min) / max) * 100;

    if (imbalance < 10) return 'Good';
    if (imbalance < 20) return 'Fair';
    return 'Poor';
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('current.')) {
      const currentField = field.split('.')[1] as keyof PhaseData;
      const newCurrent = { ...formData.current, [currentField]: Number(value) };
      const balance = calculateBalance(newCurrent);
      setFormData({
        ...formData,
        current: newCurrent,
        balance
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = () => {
    const newAnalyses = [...analyses, formData];
    setAnalyses(newAnalyses);
    localStorage.setItem('thailand_pre_installation_analyses', JSON.stringify(newAnalyses));

    // Reset form
    setFormData({
      id: generateDocumentNumber(),
      branch: 'Thailand',
      location: '',
      equipment: 'Fluke 438-II Motor Analyzer',
      datetime: getCurrentDateTime(),
      measurementPeriod: '7 days',
      technician: '',
      voltage: '380',
      frequency: 50.0,
      powerFactor: 0.85,
      thd: 0,
      current: { L1: 0, L2: 0, L3: 0, N: 0 },
      balance: 'Good',
      result: 'Recommended',
      recommendation: '',
      notes: '',
      engineerName: '',
      engineerLicense: '',
      approvalStatus: 'Pending',
      approvalDate: getCurrentDateTime(),
      approverName: '',
    });

    alert(lang === 'th' ? 'บันทึกข้อมูลเรียบร้อยแล้ว' : 'Data saved successfully');
  };

  const t = {
    title: lang === 'th' ? 'การวิเคราะห์ก่อนติดตั้ง KSAVE' : 'Pre-Installation Current Analysis',
    subtitle: lang === 'th' ? 'วิเคราะห์กระแสไฟฟ้าและคุณภาพไฟฟ้าก่อนติดตั้ง' : 'Current and Power Quality Analysis Before Installation',
    documentNo: lang === 'th' ? 'เลขที่เอกสาร' : 'Document No',
    location: lang === 'th' ? 'สถานที่' : 'Location',
    equipment: lang === 'th' ? 'อุปกรณ์ที่ใช้' : 'Equipment Used',
    datetime: lang === 'th' ? 'วันที่และเวลา' : 'Date & Time',
    technician: lang === 'th' ? 'ช่างเทคนิค' : 'Technician',
    voltage: lang === 'th' ? 'แรงดันไฟฟ้า (V)' : 'Voltage (V)',
    frequency: lang === 'th' ? 'ความถี่ (Hz)' : 'Frequency (Hz)',
    powerFactor: lang === 'th' ? 'ตัวประกอบกำลัง' : 'Power Factor',
    thd: lang === 'th' ? 'THD (%)' : 'THD (%)',
    currentMeasurement: lang === 'th' ? 'การวัดกระแสไฟฟ้า' : 'Current Measurement',
    phase: lang === 'th' ? 'เฟส' : 'Phase',
    current: lang === 'th' ? 'กระแส (A)' : 'Current (A)',
    balance: lang === 'th' ? 'ความสมดุล' : 'Balance',
    result: lang === 'th' ? 'ผลการประเมิน' : 'Result',
    recommendation: lang === 'th' ? 'คำแนะนำ' : 'Recommendation',
    notes: lang === 'th' ? 'หมายเหตุ' : 'Notes',
    save: lang === 'th' ? 'บันทึก' : 'Save',
    cancel: lang === 'th' ? 'ยกเลิก' : 'Cancel',
    form: lang === 'th' ? 'แบบฟอร์ม' : 'Form',
    list: lang === 'th' ? 'รายการ' : 'List',
    powerGraph: lang === 'th' ? 'กราฟพลังงาน 7 วัน' : '7-Day Power Graph',
    currentGraph: lang === 'th' ? 'กราฟกระแสไฟฟ้า' : 'Current Graph',
    engineerApproval: lang === 'th' ? 'การอนุมัติและรับรองโดยวิศวกร' : 'Engineer Certification & Approval',
    engineerName: lang === 'th' ? 'ชื่อวิศวกร / ผู้รับรอง' : 'Engineer / Certifier Name',
    engineerLicense: lang === 'th' ? 'เลขที่ใบอนุญาตวิศวกร' : 'Engineer License No.',
    approvalStatus: lang === 'th' ? 'สถานะการอนุมัติ' : 'Approval Status',
    approverName: lang === 'th' ? 'ชื่อผู้อนุมัติ' : 'Approver Name',
    approvalDate: lang === 'th' ? 'วันที่อนุมัติ' : 'Approval Date',
    signaturePlaceholder: lang === 'th' ? 'ลายเซ็นวิศวกร' : 'Engineer Signature',
    back: lang === 'th' ? 'กลับ' : 'Back',
  };

  const getBalanceColor = (balance: string) => {
    if (balance === 'Good') return 'text-green-600 bg-green-100';
    if (balance === 'Fair') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getResultColor = (result: string) => {
    if (result === 'Recommended') return 'text-green-600 bg-green-100';
    if (result === 'Not Recommended') return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/Thailand/Admin-Login/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.back}</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
                  <p className="text-gray-600 mt-1">{t.subtitle}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setView('form')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    view === 'form'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  {t.form}
                </button>
                <button
                  onClick={() => setView('upload')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    view === 'upload'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  {lang === 'th' ? 'อัพโหลด' : 'Upload'}
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    view === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Search className="w-5 h-5 inline mr-2" />
                  {t.list} ({analyses.length})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload View */}
        {view === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-green-600" />
                {lang === 'th' ? 'อัพโหลดข้อมูลกระแสไฟฟ้าก่อนติดตั้ง' : 'Upload Pre-Installation Current Data'}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {lang === 'th'
                  ? 'อัพโหลดไฟล์ข้อมูลกระแสไฟฟ้าที่เทสไว้ก่อนการติดตั้งเป็นเวลา 7 วัน (CSV / Excel / PDF)'
                  : 'Upload 7-day pre-installation current test data files (CSV / Excel / PDF)'}
              </p>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  setUploadError(null);
                  setUploadSuccess(null);
                  const files = Array.from(e.dataTransfer.files);
                  const allowed = files.filter(f => f.name.match(/\.(csv|xlsx|xls|pdf)$/i));
                  if (allowed.length < files.length) setUploadError(lang === 'th' ? 'รองรับเฉพาะไฟล์ CSV, Excel และ PDF เท่านั้น' : 'Only CSV, Excel and PDF files are supported');
                  if (allowed.length > 0) {
                    setUploadedFiles(prev => [...prev, ...allowed]);
                    setUploadSuccess(lang === 'th' ? `อัพโหลด ${allowed.length} ไฟล์เรียบร้อยแล้ว` : `${allowed.length} file(s) uploaded successfully`);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    setUploadError(null);
                    setUploadSuccess(null);
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setUploadedFiles(prev => [...prev, ...files]);
                      setUploadSuccess(lang === 'th' ? `อัพโหลด ${files.length} ไฟล์เรียบร้อยแล้ว` : `${files.length} file(s) uploaded successfully`);
                    }
                  }}
                />
                <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  {lang === 'th' ? 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์' : 'Drag & drop files here, or click to select'}
                </p>
                <p className="text-sm text-gray-400">{lang === 'th' ? 'รองรับ CSV, Excel (.xlsx), PDF' : 'Supports CSV, Excel (.xlsx), PDF'}</p>
              </div>

              {/* Alerts */}
              {uploadError && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />{uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />{uploadSuccess}
                </div>
              )}
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Table2 className="w-5 h-5 mr-2 text-blue-600" />
                  {lang === 'th' ? `ไฟล์ที่อัพโหลด (${uploadedFiles.length} ไฟล์)` : `Uploaded Files (${uploadedFiles.length})`}
                </h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => {
                    const ext = file.name.split('.').pop()?.toLowerCase();
                    const iconColor = ext === 'pdf' ? 'text-red-500' : ext === 'csv' ? 'text-green-600' : 'text-blue-600';
                    const bgColor = ext === 'pdf' ? 'bg-red-50' : ext === 'csv' ? 'bg-green-50' : 'bg-blue-50';
                    const borderColor = ext === 'pdf' ? 'border-red-200' : ext === 'csv' ? 'border-green-200' : 'border-blue-200';
                    return (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${bgColor} ${borderColor}`}>
                        <div className="flex items-center gap-3">
                          <FileText className={`w-5 h-5 ${iconColor}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB · {ext?.toUpperCase()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-gray-200 rounded-lg transition"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Instructions */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-2">
                    {lang === 'th' ? '📋 รูปแบบไฟล์ที่แนะนำสำหรับข้อมูล 7 วัน:' : '📋 Recommended format for 7-day data:'}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="text-xs text-blue-700 border-collapse w-full">
                      <thead>
                        <tr className="bg-blue-100">
                          <th className="border border-blue-300 px-3 py-1">Timestamp</th>
                          <th className="border border-blue-300 px-3 py-1">Phase A (L1) A</th>
                          <th className="border border-blue-300 px-3 py-1">Phase B (L2) A</th>
                          <th className="border border-blue-300 px-3 py-1">Phase C (L3) A</th>
                          <th className="border border-blue-300 px-3 py-1">Voltage (V)</th>
                          <th className="border border-blue-300 px-3 py-1">PF</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-blue-200 px-3 py-1">2026-02-18 00:00</td>
                          <td className="border border-blue-200 px-3 py-1">25.3</td>
                          <td className="border border-blue-200 px-3 py-1">22.1</td>
                          <td className="border border-blue-200 px-3 py-1">28.7</td>
                          <td className="border border-blue-200 px-3 py-1">380</td>
                          <td className="border border-blue-200 px-3 py-1">0.85</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="border border-blue-200 px-3 py-1 text-blue-500" colSpan={6}>... (ข้อมูลทุก 15 นาที / every 15 min)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => { setUploadedFiles([]); setUploadSuccess(null); setUploadError(null); }}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    {lang === 'th' ? 'ล้างทั้งหมด' : 'Clear All'}
                  </button>
                  <button
                    onClick={() => {
                      setUploadSuccess(lang === 'th' ? `บันทึก ${uploadedFiles.length} ไฟล์ลงในระบบเรียบร้อยแล้ว` : `${uploadedFiles.length} file(s) saved to system`);
                    }}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {lang === 'th' ? 'บันทึกลงระบบ' : 'Save to System'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form View */}
        {view === 'form' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                {lang === 'th' ? 'ข้อมูลพื้นฐาน' : 'Basic Information'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.documentNo}
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.datetime}
                  </label>
                  <input
                    type="text"
                    value={formData.datetime}
                    onChange={(e) => handleInputChange('datetime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.location}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={lang === 'th' ? 'เช่น กรุงเทพฯ - ห้อง UPS' : 'e.g. Bangkok - UPS Room'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.technician}
                  </label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => handleInputChange('technician', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={lang === 'th' ? 'ชื่อช่างเทคนิค' : 'Technician Name'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.equipment}
                  </label>
                  <select
                    value={formData.equipment}
                    onChange={(e) => handleInputChange('equipment', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Fluke 438-II Motor Analyzer</option>
                    <option>Fluke 345 Power Quality Clamp Meter</option>
                    <option>Hioki PW3198 Power Quality Analyzer</option>
                    <option>Other Equipment</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Electrical Parameters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-yellow-600" />
                {lang === 'th' ? 'พารามิเตอร์ไฟฟ้า' : 'Electrical Parameters'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.voltage}
                  </label>
                  <input
                    type="text"
                    value={formData.voltage}
                    onChange={(e) => handleInputChange('voltage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.frequency}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.powerFactor}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.powerFactor}
                    onChange={(e) => handleInputChange('powerFactor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.thd}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.thd}
                    onChange={(e) => handleInputChange('thd', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Current Measurement */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-purple-600" />
                {t.currentMeasurement}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    L1 {t.current}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current.L1}
                    onChange={(e) => handleInputChange('current.L1', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    L2 {t.current}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current.L2}
                    onChange={(e) => handleInputChange('current.L2', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    L3 {t.current}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current.L3}
                    onChange={(e) => handleInputChange('current.L3', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N {t.current}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current.N}
                    onChange={(e) => handleInputChange('current.N', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.balance}
                  </label>
                  <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${getBalanceColor(formData.balance)}`}>
                    {formData.balance}
                  </span>
                </div>
              </div>

              {/* Current Measurement Table */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-purple-600" />
                  {lang === 'th' ? 'ตารางการวัดกระแสไฟฟ้า' : 'Current Measurement Table'}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm bg-white rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="text-left p-3 font-bold text-gray-700">
                          {lang === 'th' ? 'เฟส' : 'Phase'}
                        </th>
                        <th className="text-right p-3 font-bold text-gray-700">
                          {lang === 'th' ? 'กระแส (A)' : 'Current (A)'}
                        </th>
                        <th className="text-right p-3 font-bold text-gray-700">
                          {lang === 'th' ? '% ของค่าสูงสุด' : '% of Max'}
                        </th>
                        <th className="text-center p-3 font-bold text-gray-700">
                          {lang === 'th' ? 'สถานะ' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const maxCurrent = Math.max(formData.current.L1, formData.current.L2, formData.current.L3);
                        const phases = [
                          { name: 'L1', value: formData.current.L1, color: 'text-orange-600' },
                          { name: 'L2', value: formData.current.L2, color: 'text-blue-600' },
                          { name: 'L3', value: formData.current.L3, color: 'text-purple-600' },
                          { name: 'N', value: formData.current.N, color: 'text-gray-600' }
                        ];

                        return phases.map((phase, idx) => {
                          const percentage = maxCurrent > 0 ? ((phase.value / maxCurrent) * 100).toFixed(1) : '0.0';
                          const isBalanced = phase.name !== 'N' && Math.abs((phase.value / maxCurrent) * 100 - 100) < 10;

                          return (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className={`p-3 font-semibold ${phase.color}`}>
                                {lang === 'th' ? 'เฟส' : 'Phase'} {phase.name}
                              </td>
                              <td className="p-3 text-right text-gray-800 font-medium">
                                {phase.value.toFixed(1)} A
                              </td>
                              <td className="p-3 text-right text-gray-600">
                                {phase.name !== 'N' ? `${percentage}%` : '-'}
                              </td>
                              <td className="p-3 text-center">
                                {phase.name !== 'N' && (
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                    isBalanced ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {isBalanced ? '✓' : '⚠'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Balance Analysis */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="text-xs text-gray-600">
                    <strong>{lang === 'th' ? 'การวิเคราะห์ความสมดุล:' : 'Balance Analysis:'}</strong>
                    {(() => {
                      const max = Math.max(formData.current.L1, formData.current.L2, formData.current.L3);
                      const min = Math.min(formData.current.L1, formData.current.L2, formData.current.L3);
                      const imbalance = max > 0 ? (((max - min) / max) * 100).toFixed(1) : '0.0';
                      return (
                        <span className="ml-2">
                          {lang === 'th'
                            ? `ความไม่สมดุล ${imbalance}% (ค่าที่ดี: < 10%)`
                            : `Imbalance ${imbalance}% (Good: < 10%)`
                          }
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Power Graph */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-green-600" />
                {t.powerGraph}
              </h2>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={powerData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, 200]}
                      label={{ value: 'kW', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: '15px' }} />
                    <Line type="monotone" dataKey="peak" stroke="#EF4444" strokeWidth={2.5} name="Peak Power" />
                    <Line type="monotone" dataKey="avgDay" stroke="#10B981" strokeWidth={2.5} name="Average Daytime" />
                    <Line type="monotone" dataKey="night" stroke="#3B82F6" strokeWidth={2.5} name="Night Base Load" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Power Metrics Table */}
              <div className="mt-4 bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                <div className="bg-green-100 rounded-t-lg px-4 py-2 -mx-4 -mt-4 mb-4">
                  <h5 className="font-bold text-green-800">
                    {lang === 'th' ? 'ตัวชี้วัดพลังงาน' : 'Power Metrics'}
                  </h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">
                          {lang === 'th' ? 'รายการ' : 'Item'}
                        </th>
                        <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">
                          {lang === 'th' ? 'ค่าที่วัดได้' : 'Measured Value'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'ความต้องการพลังงานสูงสุด' : 'Peak Power Demand'}
                        </td>
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? '≈ 175 kW (ในช่วงเวลาทำงาน)' : '≈ 175 kW (during operational hours)'}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'โหลดพื้นฐานกลางคืน' : 'Nighttime Base Load'}
                        </td>
                        <td className="p-3 text-gray-800">≈ 10 - 17 kW</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'การใช้พลังงานเฉลี่ยกลางวัน' : 'Average Daytime Consumption'}
                        </td>
                        <td className="p-3 text-gray-800">≈ 77 - 146 kW</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'ค่าตัวประกอบโหลด' : 'Load Factor'}
                        </td>
                        <td className="p-3 text-gray-800">≈ 68.4 %</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'ช่วงเวลาพีค' : 'Peak Hours'}
                        </td>
                        <td className="p-3 text-gray-800">
                          {lang === 'th'
                            ? '12:00-17:00 โดยมีการใช้สูงสุด 156-175 kW'
                            : '12:00-17:00 with highest consumption 156-175 kW'
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Current Graph */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-indigo-600" />
                {t.currentGraph}
              </h2>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, 300]}
                      label={{ value: 'A', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: '15px' }} />
                    <Line type="monotone" dataKey="phaseA" stroke="#F59E0B" strokeWidth={2.5} name="Phase A (L1)" />
                    <Line type="monotone" dataKey="phaseB" stroke="#3B82F6" strokeWidth={2.5} name="Phase B (L2)" />
                    <Line type="monotone" dataKey="phaseC" stroke="#8B5CF6" strokeWidth={2.5} name="Phase C (L3)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Current Metrics Table */}
              <div className="mt-4 bg-white rounded-lg p-4 border border-indigo-200 shadow-sm">
                <div className="bg-indigo-100 rounded-t-lg px-4 py-2 -mx-4 -mt-4 mb-4">
                  <h5 className="font-bold text-indigo-800">
                    {lang === 'th' ? 'ตารางค่ากระแสไฟฟ้า' : 'Current Metrics Table'}
                  </h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">
                          {lang === 'th' ? 'รายการ' : 'Item'}
                        </th>
                        <th className="text-right p-3 font-bold text-orange-600 bg-gray-100">
                          {lang === 'th' ? 'เฟส A (L1)' : 'Phase A (L1)'}
                        </th>
                        <th className="text-right p-3 font-bold text-blue-600 bg-gray-100">
                          {lang === 'th' ? 'เฟส B (L2)' : 'Phase B (L2)'}
                        </th>
                        <th className="text-right p-3 font-bold text-purple-600 bg-gray-100">
                          {lang === 'th' ? 'เฟส C (L3)' : 'Phase C (L3)'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const peakA = Math.max(...currentData.map(d => d.phaseA));
                        const peakB = Math.max(...currentData.map(d => d.phaseB));
                        const peakC = Math.max(...currentData.map(d => d.phaseC));
                        const nightRows = currentData.filter(d => d.time.includes('00:00') || d.time.includes('04:00'));
                        const nightA = (nightRows.reduce((s, d) => s + d.phaseA, 0) / nightRows.length);
                        const nightB = (nightRows.reduce((s, d) => s + d.phaseB, 0) / nightRows.length);
                        const nightC = (nightRows.reduce((s, d) => s + d.phaseC, 0) / nightRows.length);
                        const dayRows = currentData.filter(d => d.time.includes('08:00') || d.time.includes('12:00') || d.time.includes('16:00'));
                        const dayA = (dayRows.reduce((s, d) => s + d.phaseA, 0) / dayRows.length);
                        const dayB = (dayRows.reduce((s, d) => s + d.phaseB, 0) / dayRows.length);
                        const dayC = (dayRows.reduce((s, d) => s + d.phaseC, 0) / dayRows.length);
                        const avgA = (currentData.reduce((s, d) => s + d.phaseA, 0) / currentData.length);
                        const avgB = (currentData.reduce((s, d) => s + d.phaseB, 0) / currentData.length);
                        const avgC = (currentData.reduce((s, d) => s + d.phaseC, 0) / currentData.length);
                        const peakImbalance = (((Math.max(peakA, peakB, peakC) - Math.min(peakA, peakB, peakC)) / Math.max(peakA, peakB, peakC)) * 100);
                        const rows = [
                          {
                            label: lang === 'th' ? '⚡ ค่ากระแสสูงสุด (Peak)' : '⚡ Peak Current',
                            a: peakA, b: peakB, c: peakC,
                          },
                          {
                            label: lang === 'th' ? '☀️ ค่าเฉลี่ยช่วงกลางวัน (08:00–16:00)' : '☀️ Avg Daytime (08:00–16:00)',
                            a: dayA, b: dayB, c: dayC,
                          },
                          {
                            label: lang === 'th' ? '🌙 ค่าพื้นฐานกลางคืน (00:00–04:00)' : '🌙 Nighttime Base (00:00–04:00)',
                            a: nightA, b: nightB, c: nightC,
                          },
                          {
                            label: lang === 'th' ? '📊 ค่าเฉลี่ยรวม' : '📊 Overall Average',
                            a: avgA, b: avgB, c: avgC,
                          },
                        ];
                        return rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-indigo-50">
                            <td className="p-3 text-gray-800">{row.label}</td>
                            <td className="p-3 text-right font-medium text-orange-700">{row.a.toFixed(1)} A</td>
                            <td className="p-3 text-right font-medium text-blue-700">{row.b.toFixed(1)} A</td>
                            <td className="p-3 text-right font-medium text-purple-700">{row.c.toFixed(1)} A</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Phase Imbalance */}
                <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-xs text-gray-600">
                    <strong>{lang === 'th' ? 'ความไม่สมดุลของเฟส (Peak):' : 'Phase Imbalance (Peak):'}</strong>
                    {' '}
                    {(() => {
                      const peakA = Math.max(...currentData.map(d => d.phaseA));
                      const peakB = Math.max(...currentData.map(d => d.phaseB));
                      const peakC = Math.max(...currentData.map(d => d.phaseC));
                      const imb = (((Math.max(peakA, peakB, peakC) - Math.min(peakA, peakB, peakC)) / Math.max(peakA, peakB, peakC)) * 100).toFixed(1);
                      const isGood = parseFloat(imb) < 10;
                      return (
                        <span className={`ml-1 font-semibold ${isGood ? 'text-green-700' : 'text-yellow-700'}`}>
                          {imb}% {isGood ? '✓' : '⚠'} ({lang === 'th' ? `ค่าที่ดี: < 10%` : 'Good: < 10%'})
                        </span>
                      );
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Result & Recommendation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                {lang === 'th' ? 'ผลการประเมินและคำแนะนำ' : 'Result & Recommendation'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.result}
                  </label>
                  <select
                    value={formData.result}
                    onChange={(e) => handleInputChange('result', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Recommended">Recommended</option>
                    <option value="Not Recommended">Not Recommended</option>
                    <option value="Further Analysis Required">Further Analysis Required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.recommendation}
                  </label>
                  <textarea
                    value={formData.recommendation}
                    onChange={(e) => handleInputChange('recommendation', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={lang === 'th' ? 'คำแนะนำและข้อเสนอแนะ' : 'Recommendations and suggestions'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.notes}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={lang === 'th' ? 'หมายเหตุเพิ่มเติม' : 'Additional notes'}
                  />
                </div>

                {/* Engineer Approval Section */}
                <div className="border-t-2 border-dashed border-gray-300 pt-5 mt-2">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {t.engineerApproval}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Engineer Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.engineerName} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.engineerName}
                        onChange={(e) => handleInputChange('engineerName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={lang === 'th' ? 'ชื่อ-นามสกุล วิศวกร' : 'Full name of engineer'}
                      />
                    </div>

                    {/* Engineer License */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.engineerLicense}
                      </label>
                      <input
                        type="text"
                        value={formData.engineerLicense}
                        onChange={(e) => handleInputChange('engineerLicense', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={lang === 'th' ? 'เช่น กว. 12345' : 'e.g. ENG-12345'}
                      />
                    </div>

                    {/* Approver Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.approverName}
                      </label>
                      <input
                        type="text"
                        value={formData.approverName}
                        onChange={(e) => handleInputChange('approverName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={lang === 'th' ? 'ชื่อผู้อนุมัติ / หัวหน้าวิศวกร' : 'Approver / Chief Engineer'}
                      />
                    </div>

                    {/* Approval Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.approvalDate}
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.approvalDate.replace(' ', 'T')}
                        onChange={(e) => handleInputChange('approvalDate', e.target.value.replace('T', ' '))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Approval Status */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.approvalStatus}
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {(['Pending', 'Approved', 'Rejected'] as const).map((status) => {
                          const colors = {
                            Pending:  { ring: 'ring-yellow-400', bg: 'bg-yellow-50 border-yellow-400 text-yellow-800',  icon: '⏳' },
                            Approved: { ring: 'ring-green-500',  bg: 'bg-green-50 border-green-500 text-green-800',    icon: '✅' },
                            Rejected: { ring: 'ring-red-500',    bg: 'bg-red-50 border-red-500 text-red-800',          icon: '❌' },
                          };
                          const label = {
                            Pending:  lang === 'th' ? 'รออนุมัติ' : 'Pending',
                            Approved: lang === 'th' ? 'อนุมัติแล้ว' : 'Approved',
                            Rejected: lang === 'th' ? 'ไม่อนุมัติ' : 'Rejected',
                          };
                          const isSelected = formData.approvalStatus === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleInputChange('approvalStatus', status)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-semibold transition-all ${
                                isSelected ? colors[status].bg + ' ' + colors[status].ring + ' ring-2' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span>{colors[status].icon}</span>
                              {label[status]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Signature Box */}
                  <div className="mt-5 grid grid-cols-2 gap-6">
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center bg-blue-50 min-h-[100px] flex flex-col items-center justify-center">
                      <User className="w-8 h-8 text-blue-300 mb-2" />
                      <p className="text-xs text-blue-500 font-medium">{t.signaturePlaceholder}</p>
                      {formData.engineerName && (
                        <p className="text-sm font-semibold text-blue-800 mt-2 border-t border-blue-200 pt-2 w-full">
                          {formData.engineerName}
                        </p>
                      )}
                      {formData.engineerLicense && (
                        <p className="text-xs text-blue-600">{formData.engineerLicense}</p>
                      )}
                    </div>
                    <div className="border-2 border-dashed border-green-300 rounded-xl p-4 text-center bg-green-50 min-h-[100px] flex flex-col items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-300 mb-2" />
                      <p className="text-xs text-green-500 font-medium">{lang === 'th' ? 'ลายเซ็นผู้อนุมัติ' : 'Approver Signature'}</p>
                      {formData.approverName && (
                        <p className="text-sm font-semibold text-green-800 mt-2 border-t border-green-200 pt-2 w-full">
                          {formData.approverName}
                        </p>
                      )}
                      {formData.approvalDate && (
                        <p className="text-xs text-green-600">{formData.approvalDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => router.push('/Thailand/Admin-Login/dashboard')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {t.save}
              </button>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {lang === 'th' ? 'รายการการวิเคราะห์' : 'Analysis Records'}
            </h2>

            {analyses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{lang === 'th' ? 'ยังไม่มีข้อมูลการวิเคราะห์' : 'No analysis records yet'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.documentNo}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.location}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.datetime}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.balance}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.result}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {lang === 'th' ? 'การจัดการ' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyses.map((analysis, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{analysis.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{analysis.location}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{analysis.datetime}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getBalanceColor(analysis.balance)}`}>
                            {analysis.balance}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getResultColor(analysis.result)}`}>
                            {analysis.result}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 hover:text-blue-800 mx-1">
                            <Eye className="w-5 h-5 inline" />
                          </button>
                          <button className="text-green-600 hover:text-green-800 mx-1">
                            <Download className="w-5 h-5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
