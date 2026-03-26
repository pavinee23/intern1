'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';

type InvoiceData = {
  id: string;
  invoiceNumber?: string;
  customer?: string;
  customer_address?: string;
  issueDate?: string;
  dueDate?: string;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  paymentStatus?: string;
  notes?: string;
  salesContractNumber?: string;
  pdo_number?: string;
  pdo_branch?: string;
  linked_pdo_number?: string;
  linked_pdo_date?: string;
  linked_pdo_product?: string;
  linked_pdo_status?: string;
};

export default function InvoicePrintPage() {
  const params = useParams();
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const isKo = locale === 'ko';
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const res = await fetch(`/api/korea-invoices/${params.id}`);
        const json = await res.json();
        if (json.success && json.invoice) {
          setInvoice(json.invoice);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  useEffect(() => {
    // Auto-print when invoice loads
    if (invoice && !loading) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoice, loading]);

  const formatDate = (value?: string) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleDateString(isKo ? 'ko-KR' : 'en-US');
    } catch {
      return value;
    }
  };

  const formatMoney = (value?: number) => {
    return new Intl.NumberFormat(isKo ? 'ko-KR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">{isKo ? '로딩 중...' : 'Loading...'}</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">
          {isKo ? '인보이스를 찾을 수 없습니다.' : 'Invoice not found.'}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .print-container {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0;
            background: white;
            box-sizing: border-box;
          }

          .page-break {
            page-break-after: always;
          }
        }

        @media screen {
          .print-container {
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto;
            padding: 20mm;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
      `}</style>

      {/* Screen Only - Controls */}
      <div className="no-print fixed left-4 top-4 z-50 flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          {isKo ? '← 뒤로 가기' : '← Back'}
        </button>

        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setLocale('ko')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              locale === 'ko' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            한국어
          </button>
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              locale === 'en' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Print Content - A4 Formatted */}
      <div className="print-container">
        {/* Letterhead Header */}
        <div className="mb-8 border-b-4 border-orange-500 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900">
                {isKo ? '인보이스' : 'INVOICE'}
              </h1>
              <p className="mt-1 text-base text-gray-500">
                {isKo ? 'Tax Invoice' : '세금계산서'}
              </p>
            </div>
            <div className="text-right">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isKo ? '인보이스 번호' : 'Invoice No.'}
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {invoice.invoiceNumber || invoice.id}
              </div>
            </div>
          </div>
        </div>

        {/* From/To Section */}
        <div className="mb-6 grid grid-cols-2 gap-8">
          {/* Customer (Left) */}
          <div>
            <div className="mb-3 border-b-2 border-gray-200 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {isKo ? '고객 (Bill To)' : 'Bill To (고객)'}
              </h2>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-bold text-gray-900">{invoice.customer || '-'}</div>
              {invoice.customer_address && (
                <div className="text-sm leading-relaxed text-gray-700">
                  {invoice.customer_address}
                </div>
              )}
            </div>

            {/* PDO Information Box */}
            {invoice.linked_pdo_number && (
              <div className="mt-4 rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
                <div className="mb-2 text-xs font-bold uppercase text-blue-900">
                  {isKo ? '생산주문정보' : 'Production Order'}
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-baseline">
                    <span className="w-16 font-semibold text-gray-700">PDO:</span>
                    <span className="font-bold text-blue-900">{invoice.linked_pdo_number}</span>
                  </div>
                  {invoice.pdo_branch && (
                    <div className="flex items-baseline">
                      <span className="w-16 font-semibold text-gray-700">{isKo ? '지점' : 'Branch'}:</span>
                      <span className="text-gray-800">{invoice.pdo_branch}</span>
                    </div>
                  )}
                  {invoice.linked_pdo_product && (
                    <div className="flex items-baseline">
                      <span className="w-16 font-semibold text-gray-700">{isKo ? '제품' : 'Product'}:</span>
                      <span className="text-gray-800">{invoice.linked_pdo_product}</span>
                    </div>
                  )}
                  {invoice.linked_pdo_date && (
                    <div className="flex items-baseline">
                      <span className="w-16 font-semibold text-gray-700">{isKo ? '날짜' : 'Date'}:</span>
                      <span className="text-xs text-gray-600">{formatDate(invoice.linked_pdo_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Company (Right) */}
          <div>
            <div className="mb-3 border-b-2 border-gray-200 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {isKo ? '발행자 (From)' : 'From (발행자)'}
              </h2>
            </div>
            <div className="space-y-2">
              <div className="text-xl font-bold text-gray-900">Zera Co., Ltd.</div>
              <div className="text-base font-semibold text-gray-700">주식회사 제라</div>
              <div className="mt-2 text-xs text-gray-600">
                {isKo ? '대한민국 본사' : 'Korea Headquarters'}
              </div>
              <div className="mt-3 rounded bg-gray-100 px-3 py-2">
                <div className="text-xs font-bold text-gray-900">
                  Tax ID: 831-87-03154
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Dates */}
        <div className="mb-6 grid grid-cols-2 gap-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {isKo ? '발행일' : 'Issue Date'}
            </div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {formatDate(invoice.issueDate)}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {isKo ? '만기일' : 'Due Date'}
            </div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>

        {/* Amount Summary Table */}
        <div className="mb-6">
          <div className="overflow-hidden rounded-lg border-2 border-gray-300">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wide">
                    {isKo ? '항목' : 'Description'}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-bold uppercase tracking-wide">
                    {isKo ? '금액 (USD)' : 'Amount (USD)'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-base font-medium text-gray-700">
                    {isKo ? '공급가액' : 'Subtotal'}
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    $ {formatMoney(invoice.subtotal)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-6 py-4 text-base font-medium text-gray-700">
                    {isKo ? `부가세 (${invoice.taxRate || 0}%)` : `VAT (${invoice.taxRate || 0}%)`}
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    $ {formatMoney(invoice.taxAmount)}
                  </td>
                </tr>
                <tr className="bg-orange-500">
                  <td className="px-6 py-5 text-xl font-bold text-white">
                    {isKo ? '합계' : 'Total Amount'}
                  </td>
                  <td className="px-6 py-5 text-right text-2xl font-bold text-white">
                    $ {formatMoney(invoice.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bank Account Information */}
        <div className="mb-6 rounded-lg border-2 border-blue-400 bg-blue-50 p-5">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-blue-900">
            {isKo ? '은행 계좌 정보' : 'Bank Account Information'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Account 1 */}
            <div className="rounded-lg border border-blue-300 bg-white p-4 shadow-sm">
              <div className="mb-3 border-b border-gray-200 pb-2">
                <span className="text-xs font-bold uppercase text-blue-800">Account 1</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Bank:</span>
                  <span className="text-gray-900">KB Kookmin Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Account No:</span>
                  <span className="font-bold text-gray-900">676901-01-284982</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">SWIFT:</span>
                  <span className="text-gray-900">CZNBKRSEXXX</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Account Holder:</div>
                  <div className="text-xs text-gray-900">Zera Co., Ltd. (주식회사 세라님)</div>
                </div>
                <div className="text-xs text-gray-600">
                  Seongnam Hi-Tech Branch
                </div>
              </div>
            </div>

            {/* Account 2 */}
            <div className="rounded-lg border border-blue-300 bg-white p-4 shadow-sm">
              <div className="mb-3 border-b border-gray-200 pb-2">
                <span className="text-xs font-bold uppercase text-blue-800">Account 2</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Bank:</span>
                  <span className="text-gray-900">KB Kookmin Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Account No:</span>
                  <span className="font-bold text-gray-900">676968-11-015342</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">SWIFT:</span>
                  <span className="text-gray-900">CZNBKRSEXXX</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Account Holder:</div>
                  <div className="text-xs text-gray-900">Zera Co., Ltd. (주식회사 제라)</div>
                </div>
                <div className="text-xs text-gray-600">
                  Seongnam Hi-Tech Branch
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              {isKo ? '메모' : 'Notes'}
            </div>
            <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {invoice.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto border-t-2 border-gray-300 pt-4">
          <div className="text-center text-xs text-gray-500">
            <p className="font-bold text-gray-700">Zera Co., Ltd. (주식회사 제라)</p>
            <p className="mt-1">Tax ID: 831-87-03154</p>
            <p className="mt-2 italic">
              {isKo
                ? '본 인보이스는 전자 문서로 발행되었습니다.'
                : 'This invoice has been issued as an electronic document.'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
