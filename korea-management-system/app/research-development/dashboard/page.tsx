'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import {
  FlaskConical,
  Lightbulb,
  TestTube2,
  ScrollText,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  Clock,
  TrendingUp,
  Workflow,
  Bell,
  MessageCircle,
  Send,
  X,
  Shield,
  Users,
  Paperclip,
  FileText,
  Download,
  Image as ImageIcon,
} from 'lucide-react';

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

interface Message {
  id: string;
  sender: string;
  role: 'admin' | 'user';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  department?: string;
  attachments?: FileAttachment[];
}

interface DepartmentMessages {
  department: string;
  departmentName: string;
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
  icon: string;
  color: string;
}

export default function ResearchDevelopmentDashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [departmentChats, setDepartmentChats] = useState<DepartmentMessages[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentMessages | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departmentConfigs = useMemo(() => ({
    'hr': { 
      name: locale === 'ko' ? 'HR & 회계 부서' : 'HR & Accounting',
      icon: '👥',
      color: 'bg-blue-500'
    },
    'production': { 
      name: locale === 'ko' ? '생산 & 물류 부서' : 'Production & Logistics',
      icon: '🏭',
      color: 'bg-orange-500'
    },
    'international-market': { 
      name: locale === 'ko' ? '해외 시장 부서' : 'International Market',
      icon: '🌍',
      color: 'bg-purple-500'
    },
    'domestic-market': { 
      name: locale === 'ko' ? '국내 시장 부서' : 'Domestic Market',
      icon: '🏪',
      color: 'bg-orange-500'
    },
    'quality-control': { 
      name: locale === 'ko' ? '품질 관리 부서' : 'Quality Control',
      icon: '✅',
      color: 'bg-yellow-500'
    },
    'after-sales': { 
      name: locale === 'ko' ? '애프터 서비스 부서' : 'After-Sales Service',
      icon: '🎧',
      color: 'bg-teal-500'
    },
    'maintenance': { 
      name: locale === 'ko' ? '유지보수 부서' : 'Maintenance',
      icon: '🔧',
      color: 'bg-indigo-500'
    },
    'customers': { 
      name: locale === 'ko' ? '고객 관리' : 'Customer Management',
      icon: '👥',
      color: 'bg-blue-500'
    },
    'research-development': { 
      name: locale === 'ko' ? '연구개발 부서' : 'Research & Development',
      icon: '🔬',
      color: 'bg-cyan-500'
    }
  }), [locale]);

  useEffect(() => {
    loadAllDepartmentChats();
    
    // Auto-refresh messages every 30 seconds
    const interval = setInterval(() => {
      loadAllDepartmentChats();
    }, 30000);
    
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAllDepartmentChats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadAllDepartmentChats = () => {
    const chats: DepartmentMessages[] = [];
    
    // Always show all departments, whether they have messages or not
    Object.entries(departmentConfigs).forEach(([deptKey, config]) => {
      const savedMessages = localStorage.getItem(`admin-chat-${deptKey}`);
      let messages: Message[] = [];
      let unreadCount = 0;
      let lastMessage: Message | undefined = undefined;
      
      if (savedMessages) {
        try {
          messages = JSON.parse(savedMessages);
          const userMessages = messages.filter(msg => msg.role === 'user');
          const unreadMessages = userMessages.filter(msg => msg.status !== 'read');
          unreadCount = unreadMessages.length;
          lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
        } catch (e) {
          console.error(`Error loading messages for ${deptKey}:`, e);
        }
      }
      
      // Always add the department card
      chats.push({
        department: deptKey,
        departmentName: config.name,
        messages: messages,
        unreadCount: unreadCount,
        lastMessage: lastMessage,
        icon: config.icon,
        color: config.color
      });
    });
    
    // Sort by unread count first, then by last message time
    chats.sort((a, b) => {
      // Departments with unread messages come first
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      
      // Then sort by last message time
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });
    
    setDepartmentChats(chats);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(locale === 'ko' ? '파일 크기는 5MB를 초과할 수 없습니다.' : 'File size cannot exceed 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment: FileAttachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target?.result as string
        };
        setReplyAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setReplyAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = () => {
    if (!selectedDepartment || (!replyText.trim() && replyAttachments.length === 0)) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: locale === 'ko' ? '시스템 관리자' : 'System Administrator',
      role: 'admin',
      text: replyText,
      timestamp: new Date().toISOString(),
      status: 'read',
      department: selectedDepartment.department,
      attachments: replyAttachments.length > 0 ? replyAttachments : undefined
    };

    const updatedMessages = [...selectedDepartment.messages, newMessage];
    localStorage.setItem(`admin-chat-${selectedDepartment.department}`, JSON.stringify(updatedMessages));
    
    setReplyText('');
    setReplyAttachments([]);
    loadAllDepartmentChats();
    
    // Update selected department with new message
    setSelectedDepartment({
      ...selectedDepartment,
      messages: updatedMessages,
      lastMessage: newMessage
    });
  };

  const markAsRead = (deptKey: string) => {
    const savedMessages = localStorage.getItem(`admin-chat-${deptKey}`);
    if (savedMessages) {
      try {
        const messages: Message[] = JSON.parse(savedMessages);
        const updatedMessages = messages.map(msg => ({
          ...msg,
          // Only mark user messages as read
          status: msg.role === 'user' ? 'read' as const : msg.status
        }));
        localStorage.setItem(`admin-chat-${deptKey}`, JSON.stringify(updatedMessages));
        loadAllDepartmentChats();
      } catch (e) {
        console.error('Error marking messages as read:', e);
      }
    }
  };

  const totalUnread = departmentChats.reduce((sum, dept) => sum + dept.unreadCount, 0);

  const kpiData = useMemo(() => [
    { name: locale === 'ko' ? '프로젝트 완료율' : 'Project Completion Rate', current: 85, target: 90, status: 'warning' },
    { name: locale === 'ko' ? '연구 투자 효율성' : 'R&D Investment Efficiency', current: 92, target: 85, status: 'good' },
    { name: locale === 'ko' ? '특허 출원 성공률' : 'Patent Application Success', current: 78, target: 80, status: 'warning' },
    { name: locale === 'ko' ? '혁신 프로젝트 비율' : 'Innovation Project Ratio', current: 65, target: 70, status: 'critical' },
    { name: locale === 'ko' ? '기술 이전 성공률' : 'Tech Transfer Success', current: 88, target: 85, status: 'good' },
  ], [locale]);

  const improvements = useMemo(() => [
    { 
      title: locale === 'ko' ? '프로토타입 테스트 프로세스 개선' : 'Improve Prototype Testing Process',
      priority: 'high' as const,
      status: locale === 'ko' ? '진행 중' : 'In Progress',
      deadline: '2026-03-15'
    },
    { 
      title: locale === 'ko' ? '연구 예산 관리 시스템 업데이트' : 'Update Research Budget Management',
      priority: 'medium' as const,
      status: locale === 'ko' ? '대기 중' : 'Pending',
      deadline: '2026-04-01'
    },
    { 
      title: locale === 'ko' ? '부서 간 협업 프로세스 강화' : 'Enhance Inter-department Collaboration',
      priority: 'high' as const,
      status: locale === 'ko' ? '진행 중' : 'In Progress',
      deadline: '2026-03-30'
    },
    { 
      title: locale === 'ko' ? '연구 데이터 관리 표준화' : 'Standardize Research Data Management',
      priority: 'low' as const,
      status: locale === 'ko' ? '계획 중' : 'Planning',
      deadline: '2026-05-15'
    },
  ], [locale]);

  const menuCards = [
    {
      icon: Lightbulb,
      title: t.activeProjects,
      description: t.activeProjectsDesc,
      href: '/research-development/active-projects',
      color: 'bg-blue-500',
      count: 14,
    },
    {
      icon: TestTube2,
      title: t.prototypeTesting,
      description: t.prototypeTestingDesc,
      href: '/research-development/prototype-testing',
      color: 'bg-green-500',
      count: 6,
    },
    {
      icon: ScrollText,
      title: t.patentManagement,
      description: t.patentManagementDesc,
      href: '/research-development/patents',
      color: 'bg-purple-500',
      count: 5,
    },
    {
      icon: DollarSign,
      title: t.researchBudget,
      description: t.researchBudgetDesc,
      href: '/research-development/budget',
      color: 'bg-orange-500',
      count: null,
    },
    {
      icon: Workflow,
      title: t.flowSystem,
      description: t.flowSystemDesc,
      href: 'https://flow.team/signin.act',
      color: 'bg-cyan-600',
      count: null,
      external: true
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-sky-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/')} className="text-cyan-600 hover:text-cyan-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t.rdDashboard}</h1>
                    <p className="text-sm text-gray-600">{t.rdDashboardDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick Messages Button - Scroll to Message Center */}
              <button
                onClick={() => {
                  const messageCenter = document.getElementById('message-center');
                  if (messageCenter) {
                    messageCenter.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="relative px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-2 border-2 border-purple-200"
              >
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  {locale === 'ko' ? '부서 메시지' : 'Messages'}
                </span>
                {totalUnread > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDepartment(null)}>
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div className={`${selectedDepartment.color} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg">
                  {selectedDepartment.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedDepartment.departmentName}</h3>
                  <p className="text-white/80 text-sm">
                    {selectedDepartment.messages.length} {locale === 'ko' ? '메시지' : 'messages'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin-support/${selectedDepartment.department}`}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-sm transition-colors"
                >
                  {locale === 'ko' ? '전체 대화 보기' : 'View Full Chat'}
                </Link>
                <button onClick={() => setSelectedDepartment(null)} className="text-white hover:bg-white/20 rounded p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {selectedDepartment.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.role === 'admin'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                        : 'bg-white text-gray-800 shadow-md'
                    } rounded-lg p-4`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.role === 'admin' ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                      <span className="font-semibold text-sm">{message.sender}</span>
                      <span className={`text-xs ${message.role === 'admin' ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((file, idx) => (
                          <div key={idx}>
                            {file.type.startsWith('image/') ? (
                              <div className="rounded-lg overflow-hidden">
                                <img 
                                  src={file.data} 
                                  alt={file.name}
                                  className="max-w-full h-auto max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(file.data, '_blank')}
                                />
                                <p className="text-xs mt-1 opacity-70">{file.name}</p>
                              </div>
                            ) : (
                              <a
                                href={file.data}
                                download={file.name}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                                  message.role === 'admin'
                                    ? 'border-white/30 hover:bg-white/10'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs opacity-70">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* Attachment Preview */}
              {replyAttachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {replyAttachments.map((file, idx) => (
                    <div key={idx} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <div className="relative">
                          <img 
                            src={file.data} 
                            alt={file.name}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            onClick={() => removeAttachment(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-700 max-w-[100px] truncate">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(idx)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                  title={locale === 'ko' ? '파일 첨부' : 'Attach files'}
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder={locale === 'ko' ? '답장을 입력하세요...' : 'Type your reply...'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() && replyAttachments.length === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    replyText.trim() || replyAttachments.length > 0
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  <span>{locale === 'ko' ? '전송' : 'Send'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* KPI & Improvements Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* KPI Standards */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500 text-white p-3 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {locale === 'ko' ? '부서 KPI 달성률' : 'Department KPI Performance'}
                </h3>
                <p className="text-sm text-gray-500">
                  {locale === 'ko' ? '연구개발 부서 핵심 성과 지표' : 'R&D Core Performance Indicators'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {kpiData.map((kpi, idx) => (
                <div key={idx} className="border-l-4 pl-4 py-2" style={{
                  borderColor: kpi.status === 'good' ? '#10b981' : kpi.status === 'warning' ? '#f59e0b' : '#ef4444'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{kpi.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${
                        kpi.status === 'good' ? 'text-green-600' : 
                        kpi.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {kpi.current}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {locale === 'ko' ? '목표' : 'Target'}: {kpi.target}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        kpi.status === 'good' ? 'bg-green-500' : 
                        kpi.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(kpi.current, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {locale === 'ko' ? '전체 평균 달성률' : 'Overall Average Achievement'}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(kpiData.reduce((sum, kpi) => sum + kpi.current, 0) / kpiData.length)}%
              </span>
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-500 text-white p-3 rounded-lg">
                <Workflow className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {locale === 'ko' ? '개선 필요 사항' : 'Improvement Areas'}
                </h3>
                <p className="text-sm text-gray-500">
                  {locale === 'ko' ? '진행 중인 개선 프로젝트' : 'Ongoing Improvement Projects'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {improvements.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.priority === 'high' ? (locale === 'ko' ? '높음' : 'High') :
                           item.priority === 'medium' ? (locale === 'ko' ? '중간' : 'Medium') :
                           (locale === 'ko' ? '낮음' : 'Low')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === (locale === 'ko' ? '진행 중' : 'In Progress') ? 'bg-green-100 text-green-700' :
                          item.status === (locale === 'ko' ? '대기 중' : 'Pending') ? 'bg-gray-100 text-gray-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {locale === 'ko' ? '마감일' : 'Deadline'}: {new Date(item.deadline).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{locale === 'ko' ? '총 개선 항목' : 'Total Items'}</span>
                <span className="font-bold text-gray-800">{improvements.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">{locale === 'ko' ? '높은 우선순위' : 'High Priority'}</span>
                <span className="font-bold text-red-600">
                  {improvements.filter(i => i.priority === 'high').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Messages Center */}
        <div id="message-center" className="mb-8 scroll-mt-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {locale === 'ko' ? '부서 메시지 센터' : 'Department Messages Center'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {locale === 'ko' ? '각 부서의 문의사항 및 메시지 관리' : 'Manage inquiries and messages from all departments'}
                  </p>
                </div>
              </div>
              {totalUnread > 0 && (
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                  <span className="text-white font-bold">{totalUnread}</span>
                  <span className="text-white/80 text-sm">{locale === 'ko' ? '새 메시지' : 'New'}</span>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentChats
                  .filter((dept) => dept.department !== 'research-development')
                  .map((dept) => (
                  <button
                    key={dept.department}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      if (dept.messages.length > 0) {
                        markAsRead(dept.department);
                      }
                    }}
                    className={`bg-gradient-to-br from-gray-50 to-white border-2 rounded-lg p-4 text-left transition-all group ${
                      dept.messages.length > 0 
                        ? 'border-gray-200 hover:border-purple-400 hover:shadow-lg' 
                        : 'border-gray-100 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`${dept.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                          {dept.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-sm transition-colors ${
                            dept.messages.length > 0 
                              ? 'text-gray-800 group-hover:text-purple-600' 
                              : 'text-gray-600 group-hover:text-blue-600'
                          }`}>
                            {dept.departmentName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {dept.messages.length === 0 
                              ? (locale === 'ko' ? '메시지 없음' : 'No messages')
                              : `${dept.messages.length} ${locale === 'ko' ? '메시지' : 'messages'}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <Bell className={`w-6 h-6 ${dept.unreadCount > 0 ? 'text-purple-600 animate-pulse' : dept.messages.length > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                          {dept.unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                              {dept.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {dept.lastMessage && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {locale === 'ko' ? '최근 활동' : 'Last activity'}: {new Date(dept.lastMessage.timestamp).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {menuCards.map((card, index) => {
            const Icon = card.icon;
            const isExternal = card.external;
            
            if (isExternal) {
              return (
                <a
                  key={index}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">{card.title}</h3>
                        {card.count !== null && (
                          <span className="bg-cyan-100 text-cyan-600 text-xs font-bold px-2 py-1 rounded-full">{card.count}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{card.description}</p>
                    </div>
                  </div>
                </a>
              );
            }
            
            return (
              <button
                key={index}
                onClick={() => router.push(card.href)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">{card.title}</h3>
                      {card.count !== null && (
                        <span className="bg-cyan-100 text-cyan-600 text-xs font-bold px-2 py-1 rounded-full">{card.count}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
