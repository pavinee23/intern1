'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Globe, Loader2, LogOut, RefreshCw, XCircle } from 'lucide-react';

type ApprovalLocale = 'ko' | 'en';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type BranchKey = 'korea' | 'thailand' | 'vietnam' | 'malaysia' | 'brunei';

interface LeaveRequest {
  vlrID: number;
  vlrNo: string;
  requestDate: string;
  employeeName: string;
  employeeId: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  contactPhone?: string | null;
  backupPerson?: string | null;
  approver: string;
  status: ApprovalStatus;
  notes?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
}

interface PurchaseRequest {
  prID: number;
  prNo: string;
  prDate: string;
  department: string;
  requested_by: string;
  requester_name?: string;
  purpose: string;
  total_amount: number;
  status: string;
  notes?: string | null;
}

type PurchaseClickAction = 'view' | 'approved' | 'rejected';
type LeaveClickAction = 'approved' | 'rejected';
type SuggestionClickAction = 'view';

interface ClickedPurchaseBill {
  prID: number;
  prNo: string;
  action: PurchaseClickAction;
  clickedAt: string;
  department: string;
  requester: string;
  totalAmount: number;
}

interface ClickedLeaveBill {
  vlrID: number;
  vlrNo: string;
  action: LeaveClickAction;
  clickedAt: string;
  employeeName: string;
  department: string;
}

interface ClickedSuggestionItem {
  id: number;
  subject: string;
  action: SuggestionClickAction;
  clickedAt: string;
  userName: string;
}

function normalizeStatus(value: string | null | undefined) {
  return String(value || '').trim().toLowerCase();
}

interface SuggestionRequest {
  id: number;
  category: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  user_name?: string | null;
}

interface ApprovedPdoRow {
  id: string;
  pdoNo: string;
  product: string;
  customerName: string;
  dueDate: string;
  priority: string;
  status: string;
}

const texts = {
  ko: {
    title: '승인 요청 검토',
    subtitle: '지점별 승인 요청 목록',
    backToExecutive: 'Executive로 돌아가기',
    language: '한국어',
    logout: '로그아웃',
    loading: '요청 목록을 불러오는 중...',
    noData: '대기 중인 승인 요청이 없습니다.',
    refresh: '새로고침',
    approve: '승인',
    reject: '반려',
    view: '보기',
    hide: '숨기기',
    processing: '처리 중...',
    employee: '직원',
    department: '부서',
    leaveType: '휴가 유형',
    period: '기간',
    totalDays: '일수',
    reason: '사유',
    requester: '요청자',
    requestDate: '요청일',
    pendingOnly: '대기 중 요청만 표시',
    branchPageTitle: '지점 페이지 바로가기',
    selectBranchHint: '아래에서 지점을 선택하면 해당 지점의 요청 목록을 표시합니다.',
    selectedBranchLabel: '선택 지점',
    selectBranchFirst: '지점을 선택하면 해당 국가의 요청만 표시됩니다.',
    purchaseSectionTitle: '구매 승인 요청 목록',
    leaveSectionTitle: '휴가 승인 요청 목록',
    suggestionSectionTitle: '의견 제안 요청 목록',
    noPurchaseData: '해당 지점의 구매 승인 요청이 없습니다.',
    noLeaveData: '해당 지점의 휴가 승인 요청이 없습니다.',
    noSuggestionData: '해당 지점의 의견 제안 요청이 없습니다.',
    purchaseNo: '문서번호',
    purchaseRequester: '요청자',
    purchasePurpose: '목적',
    purchaseNotes: '비고',
    amount: '금액',
    suggestionSubject: '제목',
    suggestionMessage: '내용',
    createdAt: '등록일',
    branches: {
      korea: '한국',
      thailand: '태국',
      vietnam: '베트남',
      malaysia: '말레이시아',
      brunei: '브루나이'
    },
    unauthorized: '로그인이 필요합니다.',
    actionSuccess: '요청 상태가 업데이트되었습니다.',
    actionError: '상태 업데이트에 실패했습니다.',
    purchaseActionSuccess: '구매요청 상태가 업데이트되었습니다.',
    purchaseActionError: '구매요청 상태 업데이트에 실패했습니다.',
    fetchError: '데이터를 불러오지 못했습니다.',
    clickedPurchaseSectionTitle: '클릭한 구매 요청 목록',
    clickedAt: '클릭 시각',
    lastAction: '최근 동작',
    noClickedPurchase: '아직 클릭한 구매 요청이 없습니다.'
    ,
    clickedLeaveSectionTitle: '클릭한 휴가 요청 목록',
    noClickedLeave: '아직 클릭한 휴가 요청이 없습니다.',
    leaveSummaryTitle: '지점별 휴가 승인 대기 현황',
    leaveSummaryPending: '대기 중',
    leaveSummaryView: '보기',
    clickedSuggestionSectionTitle: '클릭한 제안 요청 목록',
    noClickedSuggestion: '아직 클릭한 제안 요청이 없습니다.'
    ,
    approvedPdoSectionTitle: '승인 완료 PDO(생산지시서) 목록',
    approvedPdoButton: '승인 완료 PDO(생산지시서) 보기',
    approvedPdoHideButton: '승인 완료 PDO(생산지시서) 숨기기',
    approvedPdoByBranchTitle: '지점별 승인 완료 PDO(생산지시서)',
    approvedPdoNoData: '해당 지점의 승인 완료 PDO가 없습니다.',
    approvedPdoFetchError: 'PDO 목록을 불러오지 못했습니다.',
    pdoNo: 'PDO(생산지시서) 번호',
    product: '제품',
    customer: '고객',
    dueDate: '납기일'
  },
  en: {
    title: 'Approval Review',
    subtitle: 'Branch approval request lists',
    backToExecutive: 'Back to Executive',
    language: 'English',
    logout: 'Logout',
    loading: 'Loading requests...',
    noData: 'No pending approval requests.',
    refresh: 'Refresh',
    approve: 'Approve',
    reject: 'Reject',
    view: 'View',
    hide: 'Hide',
    processing: 'Processing...',
    employee: 'Employee',
    department: 'Department',
    leaveType: 'Leave Type',
    period: 'Period',
    totalDays: 'Total Days',
    reason: 'Reason',
    requester: 'Requester',
    requestDate: 'Request Date',
    pendingOnly: 'Showing pending requests only',
    branchPageTitle: 'Branch Page Shortcuts',
    selectBranchHint: 'Select a branch below to display its request lists.',
    selectedBranchLabel: 'Selected Branch',
    selectBranchFirst: 'Select a branch to display only that country requests.',
    purchaseSectionTitle: 'Purchase Approval Bills',
    leaveSectionTitle: 'Leave Approval Requests',
    suggestionSectionTitle: 'Suggestion Request Forms',
    noPurchaseData: 'No pending purchase approval bills for this branch.',
    noLeaveData: 'No pending leave approval requests for this branch.',
    noSuggestionData: 'No suggestion request forms for this branch.',
    purchaseNo: 'Document No.',
    purchaseRequester: 'Requester',
    purchasePurpose: 'Purpose',
    purchaseNotes: 'Notes',
    amount: 'Amount',
    suggestionSubject: 'Subject',
    suggestionMessage: 'Message',
    createdAt: 'Created At',
    branches: {
      korea: 'Korea',
      thailand: 'Thailand',
      vietnam: 'Vietnam',
      malaysia: 'Malaysia',
      brunei: 'Brunei'
    },
    unauthorized: 'Please log in first.',
    actionSuccess: 'Request status updated successfully.',
    actionError: 'Failed to update request status.',
    purchaseActionSuccess: 'Purchase request status updated successfully.',
    purchaseActionError: 'Failed to update purchase request status.',
    fetchError: 'Failed to load requests.',
    clickedPurchaseSectionTitle: 'Clicked Purchase Bills',
    clickedAt: 'Clicked At',
    lastAction: 'Last Action',
    noClickedPurchase: 'No purchase bills have been clicked yet.'
    ,
    clickedLeaveSectionTitle: 'Clicked Leave Requests',
    noClickedLeave: 'No leave requests have been clicked yet.',
    leaveSummaryTitle: 'Pending Leave Requests by Branch',
    leaveSummaryPending: 'Pending',
    leaveSummaryView: 'View',
    clickedSuggestionSectionTitle: 'Clicked Suggestion Requests',
    noClickedSuggestion: 'No suggestion requests have been clicked yet.'
    ,
    approvedPdoSectionTitle: 'Approved PDO (Production Order) Bills',
    approvedPdoButton: 'Show Approved PDO (Production Order)',
    approvedPdoHideButton: 'Hide Approved PDO (Production Order)',
    approvedPdoByBranchTitle: 'Approved PDO (Production Order) by Branch',
    approvedPdoNoData: 'No approved PDO bills for this branch.',
    approvedPdoFetchError: 'Failed to load PDO list.',
    pdoNo: 'PDO (Production Order) No.',
    product: 'Product',
    customer: 'Customer',
    dueDate: 'Due Date'
  }
} as const;

function formatDate(date: string, locale: ApprovalLocale) {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US');
}

async function parseJsonSafe(res: Response) {
  const raw = await res.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    const snippet = raw.replace(/\s+/g, ' ').slice(0, 160);
    throw new Error(`Invalid API response (${res.status}): ${snippet || 'empty response'}`);
  }
}

export default function ApprovalReviewPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pageLocale, setPageLocale] = useState<ApprovalLocale>('ko');
  const [leaveRows, setLeaveRows] = useState<LeaveRequest[]>([]);
  const [purchaseRows, setPurchaseRows] = useState<PurchaseRequest[]>([]);
  const [suggestionRows, setSuggestionRows] = useState<SuggestionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [processingPurchaseId, setProcessingPurchaseId] = useState<number | null>(null);
  const [openedPurchaseId, setOpenedPurchaseId] = useState<number | null>(null);
  const [openedSuggestionId, setOpenedSuggestionId] = useState<number | null>(null);
  const [clickedPurchaseBills, setClickedPurchaseBills] = useState<ClickedPurchaseBill[]>([]);
  const [clickedLeaveBills, setClickedLeaveBills] = useState<ClickedLeaveBill[]>([]);
  const [clickedSuggestionItems, setClickedSuggestionItems] = useState<ClickedSuggestionItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchKey | null>(null);
  const [showApprovedPdo, setShowApprovedPdo] = useState(false);
  const [approvedPdoRows, setApprovedPdoRows] = useState<ApprovedPdoRow[]>([]);
  const [loadingApprovedPdo, setLoadingApprovedPdo] = useState(false);
  const [approvedPdoError, setApprovedPdoError] = useState('');
  const [leaveSummary, setLeaveSummary] = useState<Record<BranchKey, number>>({ korea: 0, thailand: 0, vietnam: 0, malaysia: 0, brunei: 0 });
  const [leaveSummaryLoading, setLeaveSummaryLoading] = useState(false);

  const t = useMemo(() => texts[pageLocale], [pageLocale]);

  const branchOptions: BranchKey[] = ['korea', 'thailand', 'vietnam', 'malaysia', 'brunei'];
  const selectedBranchLabel = selectedBranch ? t.branches[selectedBranch] : '-';
  const filteredLeaveRows = useMemo(() => {
    return selectedBranch ? leaveRows : [];
  }, [leaveRows, selectedBranch]);

  const filteredPurchaseRows = useMemo(() => {
    return selectedBranch ? purchaseRows : [];
  }, [purchaseRows, selectedBranch]);

  const filteredSuggestionRows = useMemo(() => {
    return selectedBranch ? suggestionRows : [];
  }, [suggestionRows, selectedBranch]);

  useEffect(() => {
    try {
      const adminUser = localStorage.getItem('k_system_admin_user');
      if (!adminUser) {
        router.replace('/executive/approval-review-login');
        return;
      }

      const savedLocale = localStorage.getItem('executive-approval-locale') || localStorage.getItem('locale');
      if (savedLocale === 'ko' || savedLocale === 'en') {
        setPageLocale(savedLocale);
      }

      setMounted(true);

    // Load leave summary for all branches
    const loadLeaveSummary = async () => {
      setLeaveSummaryLoading(true);
      try {
        const branches: BranchKey[] = ['korea', 'thailand', 'vietnam', 'malaysia', 'brunei'];
        const results = await Promise.allSettled(
          branches.map(b =>
            fetch(`/api/vacation-leave-requests?status=pending&limit=100&branch=${encodeURIComponent(b)}`, { cache: 'no-store' })
              .then(r => r.json())
              .then(d => ({ branch: b, count: Array.isArray(d.rows) ? d.rows.length : 0 }))
              .catch(() => ({ branch: b, count: 0 }))
          )
        );
        const summary: Record<BranchKey, number> = { korea: 0, thailand: 0, vietnam: 0, malaysia: 0, brunei: 0 };
        results.forEach(r => { if (r.status === 'fulfilled') summary[r.value.branch] = r.value.count; });
        setLeaveSummary(summary);
      } catch { /* silent */ } finally {
        setLeaveSummaryLoading(false);
      }
    };
    loadLeaveSummary();

    } catch {
      router.replace('/executive/approval-review-login');
    }
  }, [router]);

  const loadRows = useCallback(async () => {
    if (!selectedBranch) {
      setLeaveRows([]);
      setPurchaseRows([]);
      setSuggestionRows([]);
      setOpenedPurchaseId(null);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [leaveRes, purchaseRes, suggestionRes] = await Promise.all([
        fetch(`/api/vacation-leave-requests?status=pending&limit=100&branch=${encodeURIComponent(selectedBranch)}`, { cache: 'no-store' }),
        fetch(`/api/purchase-requests?limit=100&branch=${encodeURIComponent(selectedBranch)}`, { cache: 'no-store' }),
        fetch(`/api/kenergy/user-feedback?category=Suggestion&branch=${encodeURIComponent(selectedBranch)}`, { cache: 'no-store' })
      ]);

      const [leaveData, purchaseData, suggestionData] = await Promise.all([
        parseJsonSafe(leaveRes),
        parseJsonSafe(purchaseRes),
        parseJsonSafe(suggestionRes)
      ]);

      if (!leaveRes.ok || !leaveData.success) {
        throw new Error(leaveData.error || t.fetchError);
      }

      if (!purchaseRes.ok || !purchaseData.success) {
        throw new Error(purchaseData.error || t.fetchError);
      }

      if (!suggestionRes.ok || !suggestionData.success) {
        throw new Error(suggestionData.error || t.fetchError);
      }

      setLeaveRows(Array.isArray(leaveData.rows) ? leaveData.rows : []);
      const allPurchaseRows: PurchaseRequest[] = Array.isArray(purchaseData.rows) ? purchaseData.rows : [];
      const purchaseRowsForApproval = allPurchaseRows.filter((pr) => {
        const status = normalizeStatus(pr.status);
        // Show only actionable requests. Approved/Rejected items must stay hidden from this list.
        return status === 'pending' || status === 'submitted' || status === 'draft';
      });
      setPurchaseRows(purchaseRowsForApproval);
      setSuggestionRows(Array.isArray(suggestionData.feedbacks) ? suggestionData.feedbacks : []);
    } catch (err: any) {
      setError(err.message || t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, t.fetchError]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    setShowApprovedPdo(false);
    setApprovedPdoRows([]);
    setApprovedPdoError('');
    setClickedPurchaseBills([]);
    setClickedLeaveBills([]);
    setClickedSuggestionItems([]);
    setOpenedSuggestionId(null);
  }, [selectedBranch]);

  const markPurchaseClicked = useCallback((row: PurchaseRequest, action: PurchaseClickAction) => {
    const next: ClickedPurchaseBill = {
      prID: row.prID,
      prNo: row.prNo,
      action,
      clickedAt: new Date().toISOString(),
      department: row.department || '-',
      requester: row.requested_by || row.requester_name || '-',
      totalAmount: Number(row.total_amount || 0)
    };

    setClickedPurchaseBills((prev) => {
      const others = prev.filter((item) => item.prID !== row.prID);
      return [next, ...others];
    });
  }, []);

  const markLeaveClicked = useCallback((row: LeaveRequest, action: LeaveClickAction) => {
    const next: ClickedLeaveBill = {
      vlrID: row.vlrID,
      vlrNo: row.vlrNo,
      action,
      clickedAt: new Date().toISOString(),
      employeeName: row.employeeName || '-',
      department: row.department || '-'
    };
    setClickedLeaveBills((prev) => {
      const others = prev.filter((item) => item.vlrID !== row.vlrID);
      return [next, ...others];
    });
  }, []);

  const markSuggestionClicked = useCallback((row: SuggestionRequest) => {
    const next: ClickedSuggestionItem = {
      id: row.id,
      subject: row.subject || '-',
      action: 'view',
      clickedAt: new Date().toISOString(),
      userName: row.user_name || '-'
    };
    setClickedSuggestionItems((prev) => {
      const others = prev.filter((item) => item.id !== row.id);
      return [next, ...others];
    });
  }, []);

  const loadApprovedPdoRows = useCallback(async (branchOverride?: BranchKey) => {
    const targetBranch = branchOverride || selectedBranch;
    if (!targetBranch) return;
    setLoadingApprovedPdo(true);
    setApprovedPdoError('');
    try {
      const branchNameMap: Record<BranchKey, string> = {
        korea: 'Korea',
        thailand: 'Thailand',
        vietnam: 'Vietnam',
        malaysia: 'Malaysia',
        brunei: 'Brunei'
      };

      const res = await fetch(
        `/api/korea/production-orders?branchKey=${encodeURIComponent(targetBranch)}&branch=${encodeURIComponent(branchNameMap[targetBranch])}`,
        { cache: 'no-store' }
      );
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        throw new Error(data.error || t.approvedPdoFetchError);
      }

      const rows = Array.isArray(data) ? data : Array.isArray(data.rows) ? data.rows : [];
      const approvedStatuses = new Set(['approved', 'completed', 'done']);
      const filtered = rows.filter((row: any) => approvedStatuses.has(normalizeStatus(row.status)));

      const mapped: ApprovedPdoRow[] = filtered.map((row: any) => ({
        id: String(row.id ?? row.poID ?? row.pdoID ?? ''),
        pdoNo: String(row.orderNumber ?? row.pdoNo ?? row.poNo ?? '-'),
        product: String(row.product ?? row.product_name ?? '-'),
        customerName: String(row.customerName ?? row.customer_name ?? '-'),
        dueDate: String(row.dueDate ?? row.due_date ?? ''),
        priority: String(row.priority ?? '-'),
        status: String(row.status ?? '-')
      }));

      setApprovedPdoRows(mapped);
      setShowApprovedPdo(true);
    } catch (err: any) {
      setApprovedPdoError(err?.message || t.approvedPdoFetchError);
      setShowApprovedPdo(true);
      setApprovedPdoRows([]);
    } finally {
      setLoadingApprovedPdo(false);
    }
  }, [selectedBranch, t.approvedPdoFetchError]);

  const toggleLanguage = () => {
    const nextLocale: ApprovalLocale = pageLocale === 'ko' ? 'en' : 'ko';
    setPageLocale(nextLocale);
    localStorage.setItem('executive-approval-locale', nextLocale);
  };

  const handleUpdateStatus = async (row: LeaveRequest, status: ApprovalStatus) => {
    setMessage('');
    setError('');
    setProcessingId(row.vlrID);

    try {
      const userRaw = localStorage.getItem('k_system_admin_user');
      const user = userRaw ? JSON.parse(userRaw) : null;

      const res = await fetch('/api/vacation-leave-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: row.vlrID,
          status,
          approved_by: user?.name || user?.username || 'approver',
          branch: selectedBranch || undefined
        })
      });

      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || t.actionError);
      }

      setLeaveRows((prev) => prev.filter((item) => item.vlrID !== row.vlrID));
      setMessage(t.actionSuccess);
    } catch (err: any) {
      setError(err.message || t.actionError);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePurchaseUpdateStatus = async (row: PurchaseRequest, status: 'approved' | 'rejected') => {
    setMessage('');
    setError('');
    setProcessingPurchaseId(row.prID);

    try {
      const userRaw = localStorage.getItem('k_system_admin_user');
      const user = userRaw ? JSON.parse(userRaw) : null;

      const res = await fetch('/api/purchase-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prID: row.prID,
          status,
          approved_by: user?.name || user?.username || 'approver',
          branch: selectedBranch || undefined
        })
      });

      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || t.purchaseActionError);
      }

      setPurchaseRows((prev) => {
        return prev.filter((item) => item.prID !== row.prID);
      });
      setOpenedPurchaseId((prev) => (prev === row.prID ? null : prev));
      setMessage(t.purchaseActionSuccess);
    } catch (err: any) {
      setError(err.message || t.purchaseActionError);
    } finally {
      setProcessingPurchaseId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('k_system_admin_user');
    localStorage.removeItem('k_system_admin_token');
    router.push('/executive/approval-review-login');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center text-sm text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-slate-100 p-2 sm:p-5">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <Link
            href="/executive"
            className="inline-flex items-center justify-center sm:justify-start gap-2 min-h-[44px] px-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t.backToExecutive}</span>
          </Link>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
            >
              <Globe className="w-4 h-4" />
              {t.language}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-indigo-100 p-4 sm:p-6 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-900">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
          <p className="text-xs text-indigo-600 mt-2">{t.pendingOnly}</p>
          <p className="text-xs text-gray-500 mt-1">{t.selectBranchHint}</p>
          <p className="text-xs text-gray-500 mt-1">{t.selectedBranchLabel}: {selectedBranchLabel}</p>

          {/* Leave summary by branch */}
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-amber-900">🗂 {t.leaveSummaryTitle}</p>
              {leaveSummaryLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {branchOptions.map(branch => {
                const count = leaveSummary[branch] ?? 0;
                return (
                  <button
                    key={`summary-${branch}`}
                    type="button"
                    onClick={() => setSelectedBranch(branch)}
                    className={`flex flex-col items-center rounded-xl border p-2 transition-all ${
                      selectedBranch === branch
                        ? 'border-amber-500 bg-amber-500 text-white'
                        : count > 0
                        ? 'border-amber-300 bg-white hover:bg-amber-100 text-amber-900'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    <span className={`text-2xl font-bold ${
                      selectedBranch === branch ? 'text-white' : count > 0 ? 'text-amber-600' : 'text-gray-300'
                    }`}>{count}</span>
                    <span className="text-xs mt-0.5">{t.branches[branch]}</span>
                    {count > 0 && selectedBranch !== branch && (
                      <span className="mt-1 inline-flex rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-xs">{t.leaveSummaryPending}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-indigo-700 mb-2">{t.branchPageTitle}</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {branchOptions.map((branch) => (
                <button
                  key={`page-${branch}`}
                  type="button"
                  onClick={() => setSelectedBranch(branch)}
                  className={`inline-flex whitespace-nowrap min-h-[44px] items-center rounded-xl px-3 text-sm font-medium border transition-colors ${
                    selectedBranch === branch
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-indigo-300 text-indigo-800 bg-indigo-100 hover:bg-indigo-200'
                  }`}
                >
                  {t.branches[branch]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  loadRows();
                }}
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 min-h-[44px] px-4 rounded-xl border border-indigo-700 bg-indigo-700 text-white hover:bg-indigo-800 text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                {t.refresh}
              </button>
              <button
                type="button"
                disabled={!selectedBranch || loadingApprovedPdo}
                onClick={() => {
                  if (showApprovedPdo) {
                    setShowApprovedPdo(false);
                    return;
                  }
                  loadApprovedPdoRows();
                }}
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 min-h-[44px] px-4 rounded-xl border border-sky-700 bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-60 text-sm font-medium"
              >
                {loadingApprovedPdo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.processing}
                  </>
                ) : showApprovedPdo ? t.approvedPdoHideButton : t.approvedPdoButton}
              </button>
            </div>
            <div className="mt-2">
              <p className="text-xs font-semibold text-sky-700 mb-2">{t.approvedPdoByBranchTitle}</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {branchOptions.map((branch) => (
                  <button
                    key={`approved-pdo-${branch}`}
                    type="button"
                    disabled={loadingApprovedPdo}
                    onClick={() => {
                      setSelectedBranch(branch);
                      loadApprovedPdoRows(branch);
                    }}
                    className={`inline-flex whitespace-nowrap min-h-[40px] items-center rounded-xl px-3 text-xs font-medium border transition-colors disabled:opacity-60 ${
                      selectedBranch === branch
                        ? 'bg-sky-700 border-sky-700 text-white'
                        : 'border-sky-300 text-sky-800 bg-sky-100 hover:bg-sky-200'
                    }`}
                  >
                    {t.branches[branch]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {message && <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{message}</div>}
          {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 flex items-center justify-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t.loading}</span>
          </div>
        ) : !selectedBranch ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center text-gray-500">
            {t.selectBranchFirst}
          </div>
        ) : (
          <div className="space-y-4">
            {showApprovedPdo && (
              <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-200 shadow-sm p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-sky-900 mb-3">{t.approvedPdoSectionTitle} - {selectedBranchLabel}</h2>

                {approvedPdoError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{approvedPdoError}</div>
                ) : approvedPdoRows.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-sky-300 bg-sky-50 p-4 text-sm text-sky-700">{t.approvedPdoNoData}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sky-200">
                          <th className="text-left py-2 pr-3 text-sky-700">{t.pdoNo}</th>
                          <th className="text-left py-2 pr-3 text-sky-700">{t.product}</th>
                          <th className="text-left py-2 pr-3 text-sky-700">{t.customer}</th>
                          <th className="text-left py-2 pr-3 text-sky-700">{t.dueDate}</th>
                          <th className="text-left py-2 pr-3 text-sky-700">Priority</th>
                          <th className="text-left py-2 pr-3 text-sky-700">Status</th>
                          <th className="text-left py-2 text-sky-700">{t.view}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedPdoRows.map((row) => (
                          <tr key={`${row.id}-${row.pdoNo}`} className="border-b border-sky-100">
                            <td className="py-2 pr-3 font-medium text-gray-900">{row.pdoNo}</td>
                            <td className="py-2 pr-3 text-gray-700">{row.product}</td>
                            <td className="py-2 pr-3 text-gray-700">{row.customerName || '-'}</td>
                            <td className="py-2 pr-3 text-gray-700">{formatDate(row.dueDate, pageLocale)}</td>
                            <td className="py-2 pr-3 text-gray-700">{row.priority}</td>
                            <td className="py-2 pr-3">
                              <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">
                                {row.status}
                              </span>
                            </td>
                            <td className="py-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const branchKeyForRow = selectedBranch || 'thailand'
                                  window.open(
                                    `/KR-Thailand/Admin-Login/production-orders/print?pdoID=${encodeURIComponent(row.id)}&pdoNo=${encodeURIComponent(row.pdoNo)}&branchKey=${encodeURIComponent(branchKeyForRow)}`,
                                    '_blank'
                                  )
                                }}
                                className="inline-flex items-center justify-center min-h-[36px] rounded-lg bg-slate-700 text-white px-3 text-xs font-medium hover:bg-slate-800"
                              >
                                {t.view}
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

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 shadow-sm p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-3">{t.purchaseSectionTitle} - {selectedBranchLabel}</h2>

              {filteredPurchaseRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4 text-sm text-blue-700">{t.noPurchaseData}</div>
              ) : (
                <div className="space-y-3">
                  {filteredPurchaseRows.map((row) => {
                    const purchaseBusy = processingPurchaseId === row.prID;

                    return (
                      <div key={row.prID} className="rounded-xl border border-blue-100 p-3 sm:p-4 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-900 break-words">{row.prNo}</p>
                          <span className="inline-flex rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-semibold">
                            {row.status || 'pending'}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-gray-500">{t.requestDate}: </span><span className="text-gray-900">{formatDate(row.prDate, pageLocale)}</span></p>
                          <p><span className="text-gray-500">{t.department}: </span><span className="text-gray-900">{row.department || '-'}</span></p>
                          <p><span className="text-gray-500">{t.purchaseRequester}: </span><span className="text-gray-900">{row.requested_by || row.requester_name || '-'}</span></p>
                          <p><span className="text-gray-500">{t.amount}: </span><span className="text-gray-900">{Number(row.total_amount || 0).toLocaleString(pageLocale === 'ko' ? 'ko-KR' : 'en-US')}</span></p>
                          <p className="sm:col-span-2"><span className="text-gray-500">{t.purchasePurpose}: </span><span className="text-gray-900">{row.purpose || '-'}</span></p>
                          {openedPurchaseId === row.prID && (
                            <p className="sm:col-span-2"><span className="text-gray-500">{t.purchaseNotes}: </span><span className="text-gray-900">{row.notes || '-'}</span></p>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              markPurchaseClicked(row, 'view');
                              setOpenedPurchaseId((prev) => (prev === row.prID ? null : row.prID));
                            }}
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-700"
                          >
                            {openedPurchaseId === row.prID ? t.hide : t.view}
                          </button>
                          <button
                            type="button"
                            disabled={purchaseBusy}
                            onClick={() => {
                              markPurchaseClicked(row, 'approved');
                              handlePurchaseUpdateStatus(row, 'approved');
                            }}
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {purchaseBusy ? t.processing : t.approve}
                          </button>
                          <button
                            type="button"
                            disabled={purchaseBusy}
                            onClick={() => {
                              markPurchaseClicked(row, 'rejected');
                              handlePurchaseUpdateStatus(row, 'rejected');
                            }}
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-60"
                          >
                            {purchaseBusy ? t.processing : t.reject}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-indigo-900 mb-2">{t.clickedPurchaseSectionTitle}</h3>
                {clickedPurchaseBills.length === 0 ? (
                  <div className="text-sm text-indigo-700">{t.noClickedPurchase}</div>
                ) : (
                  <div className="space-y-2">
                    {clickedPurchaseBills.map((item) => (
                      <div key={`clicked-pr-${item.prID}`} className="rounded-lg border border-indigo-100 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">{item.prNo}</p>
                          <span className="inline-flex rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-semibold">
                            {t.lastAction}: {item.action === 'view' ? t.view : item.action === 'approved' ? t.approve : t.reject}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-gray-500">{t.department}: </span><span className="text-gray-900">{item.department}</span></p>
                          <p><span className="text-gray-500">{t.purchaseRequester}: </span><span className="text-gray-900">{item.requester}</span></p>
                          <p><span className="text-gray-500">{t.amount}: </span><span className="text-gray-900">{item.totalAmount.toLocaleString(pageLocale === 'ko' ? 'ko-KR' : 'en-US')}</span></p>
                          <p><span className="text-gray-500">{t.clickedAt}: </span><span className="text-gray-900">{formatDate(item.clickedAt, pageLocale)}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200 shadow-sm p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold text-emerald-900 mb-3">{t.leaveSectionTitle} - {selectedBranchLabel}</h2>

              {filteredLeaveRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700">{t.noLeaveData}</div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredLeaveRows.map((row) => {
                    const disabled = processingId === row.vlrID;

                    return (
                      <div key={row.vlrID} className="rounded-xl border border-emerald-100 shadow-sm p-4 sm:p-5 bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900 break-words">{row.vlrNo}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t.requestDate}: {formatDate(row.requestDate, pageLocale)}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-amber-200 text-amber-900 px-2.5 py-1 text-xs font-semibold">
                            {row.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-gray-500">{t.employee}: </span><span className="text-gray-900">{row.employeeName} ({row.employeeId})</span></p>
                          <p><span className="text-gray-500">{t.department}: </span><span className="text-gray-900">{row.department}</span></p>
                          <p><span className="text-gray-500">{t.leaveType}: </span><span className="text-gray-900">{row.leaveType}</span></p>
                          <p><span className="text-gray-500">{t.totalDays}: </span><span className="text-gray-900">{row.totalDays}</span></p>
                          <p className="sm:col-span-2">
                            <span className="text-gray-500">{t.period}: </span>
                            <span className="text-gray-900">{formatDate(row.startDate, pageLocale)} - {formatDate(row.endDate, pageLocale)}</span>
                          </p>
                          <p className="sm:col-span-2"><span className="text-gray-500">{t.reason}: </span><span className="text-gray-900">{row.reason}</span></p>
                          <p className="sm:col-span-2"><span className="text-gray-500">{t.requester}: </span><span className="text-gray-900">{row.approver}</span></p>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              markLeaveClicked(row, 'approved');
                              handleUpdateStatus(row, 'approved');
                            }}
                            className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            {disabled ? t.processing : t.approve}
                          </button>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              markLeaveClicked(row, 'rejected');
                              handleUpdateStatus(row, 'rejected');
                            }}
                            className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-60"
                          >
                            {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            {disabled ? t.processing : t.reject}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-emerald-900 mb-2">{t.clickedLeaveSectionTitle}</h3>
                {clickedLeaveBills.length === 0 ? (
                  <div className="text-sm text-emerald-700">{t.noClickedLeave}</div>
                ) : (
                  <div className="space-y-2">
                    {clickedLeaveBills.map((item) => (
                      <div key={`clicked-vlr-${item.vlrID}`} className="rounded-lg border border-emerald-100 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">{item.vlrNo}</p>
                          <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">
                            {t.lastAction}: {item.action === 'approved' ? t.approve : t.reject}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-gray-500">{t.employee}: </span><span className="text-gray-900">{item.employeeName}</span></p>
                          <p><span className="text-gray-500">{t.department}: </span><span className="text-gray-900">{item.department}</span></p>
                          <p><span className="text-gray-500">{t.clickedAt}: </span><span className="text-gray-900">{formatDate(item.clickedAt, pageLocale)}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl border border-violet-200 shadow-sm p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold text-violet-900 mb-3">{t.suggestionSectionTitle} - {selectedBranchLabel}</h2>

              {filteredSuggestionRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50 p-4 text-sm text-violet-700">{t.noSuggestionData}</div>
              ) : (
                <div className="space-y-3">
                  {filteredSuggestionRows.map((row) => (
                    <div key={row.id} className="rounded-xl border border-violet-100 p-3 sm:p-4 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900 break-words">{row.subject || '-'}</p>
                        <button
                          type="button"
                          onClick={() => {
                            markSuggestionClicked(row);
                            setOpenedSuggestionId((prev) => (prev === row.id ? null : row.id));
                          }}
                          className="inline-flex items-center justify-center min-h-[36px] rounded-lg bg-violet-600 text-white px-3 text-xs font-medium hover:bg-violet-700"
                        >
                          {openedSuggestionId === row.id ? t.hide : t.view}
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p><span className="text-gray-500">{t.suggestionSubject}: </span><span className="text-gray-900">{row.subject || '-'}</span></p>
                        <p><span className="text-gray-500">{t.requester}: </span><span className="text-gray-900">{row.user_name || '-'}</span></p>
                        {openedSuggestionId === row.id && (
                          <p className="sm:col-span-2 break-words"><span className="text-gray-500">{t.suggestionMessage}: </span><span className="text-gray-900">{row.message || '-'}</span></p>
                        )}
                        <p><span className="text-gray-500">{t.createdAt}: </span><span className="text-gray-900">{formatDate(row.created_at, pageLocale)}</span></p>
                        <p><span className="text-gray-500">Status: </span><span className="text-gray-900">{row.status || '-'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-violet-900 mb-2">{t.clickedSuggestionSectionTitle}</h3>
                {clickedSuggestionItems.length === 0 ? (
                  <div className="text-sm text-violet-700">{t.noClickedSuggestion}</div>
                ) : (
                  <div className="space-y-2">
                    {clickedSuggestionItems.map((item) => (
                      <div key={`clicked-suggestion-${item.id}`} className="rounded-lg border border-violet-100 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">{item.subject}</p>
                          <span className="inline-flex rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-xs font-semibold">
                            {t.lastAction}: {t.view}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-gray-500">{t.requester}: </span><span className="text-gray-900">{item.userName}</span></p>
                          <p><span className="text-gray-500">{t.clickedAt}: </span><span className="text-gray-900">{formatDate(item.clickedAt, pageLocale)}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
