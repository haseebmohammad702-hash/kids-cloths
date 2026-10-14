import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  ArrowDownRight, 
  ArrowUpRight, 
  Download, 
  CheckCircle, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Building,
  CreditCard,
  PieChart
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { ExpenseCategory, Invoice, LedgerEntry, TransactionType, VendorBill } from '../../types/erp';
import { Modal } from '../common/Modal';

export const FinanceModule: React.FC = () => {
  const { 
    ledger, 
    invoices, 
    bills, 
    createLedgerEntry, 
    createInvoice, 
    markInvoicePaid, 
    createBill, 
    payBill, 
    totalRevenue, 
    totalExpenses, 
    netIncome, 
    cashOnHand,
    unpaidInvoicesTotal,
    inventory
  } = useErp();

  // Tab
  const [activeTab, setActiveTab] = useState<'ledger' | 'invoices' | 'bills' | 'pnl'>('ledger');

  // Modals
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // New Journal Entry Form
  const [journalForm, setJournalForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    referenceNo: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
    description: '',
    accountCode: '4010',
    accountName: 'Product Sales Revenue',
    type: 'Inflow' as TransactionType,
    category: 'Sales Revenue' as ExpenseCategory,
    amount: 5000,
    moduleSource: 'Finance' as const,
  });

  // New Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    customerEmail: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    items: [
      { description: 'Cloud Infrastructure Enterprise Support', quantity: 1, unitPrice: 15000, total: 15000 },
    ],
    taxRate: 0.08,
  });

  // New Bill Form
  const [billForm, setBillForm] = useState({
    billNumber: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
    vendorName: '',
    category: 'Cloud Infrastructure & R&D' as ExpenseCategory,
    amount: 12000,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    status: 'Approved' as const,
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Submit Journal
  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalForm.description || journalForm.amount <= 0) return;
    createLedgerEntry(journalForm);
    setIsJournalModalOpen(false);
    setJournalForm({
      date: new Date().toISOString().slice(0, 10),
      referenceNo: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '',
      accountCode: '4010',
      accountName: 'Product Sales Revenue',
      type: 'Inflow',
      category: 'Sales Revenue',
      amount: 5000,
      moduleSource: 'Finance',
    });
  };

  // Submit Invoice
  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.customerName || invoiceForm.items.length === 0) return;
    const subtotal = invoiceForm.items.reduce((acc, i) => acc + i.total, 0);
    createInvoice({
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: invoiceForm.customerName,
      customerEmail: invoiceForm.customerEmail || 'billing@client.com',
      issueDate: invoiceForm.issueDate,
      dueDate: invoiceForm.dueDate,
      items: invoiceForm.items,
      subtotal,
      taxRate: invoiceForm.taxRate,
      status: 'Sent',
    });
    setIsInvoiceModalOpen(false);
    setInvoiceForm({
      customerName: '',
      customerEmail: '',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      items: [{ description: 'Cloud Infrastructure Enterprise Support', quantity: 1, unitPrice: 15000, total: 15000 }],
      taxRate: 0.08,
    });
  };

  // Submit Bill
  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billForm.vendorName || billForm.amount <= 0) return;
    createBill(billForm);
    setIsBillModalOpen(false);
    setBillForm({
      billNumber: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorName: '',
      category: 'Cloud Infrastructure & R&D',
      amount: 12000,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      status: 'Approved',
    });
  };

  // P&L Breakdown computations
  const revenueEntries = ledger.filter(l => l.type === 'Inflow');
  const expenseEntries = ledger.filter(l => l.type === 'Outflow');

  const cogsEntries = expenseEntries.filter(e => e.category === 'Cost of Goods Sold (COGS)');
  const totalCogs = cogsEntries.reduce((acc, e) => acc + e.amount, 0);
  const grossProfit = totalRevenue - totalCogs;
  const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const payrollExpenses = expenseEntries.filter(e => e.category === 'Payroll & Benefits').reduce((acc, e) => acc + e.amount, 0);
  const cloudExpenses = expenseEntries.filter(e => e.category === 'Cloud Infrastructure & R&D').reduce((acc, e) => acc + e.amount, 0);
  const logisticsExpenses = expenseEntries.filter(e => e.category === 'Logistics & Warehousing').reduce((acc, e) => acc + e.amount, 0);
  const otherExpenses = expenseEntries.filter(e => !['Cost of Goods Sold (COGS)', 'Payroll & Benefits', 'Cloud Infrastructure & R&D', 'Logistics & Warehousing'].includes(e.category)).reduce((acc, e) => acc + e.amount, 0);

  const totalOperatingExpenses = payrollExpenses + cloudExpenses + logisticsExpenses + otherExpenses;
  const netOperatingProfit = grossProfit - totalOperatingExpenses;
  const netMarginPct = totalRevenue > 0 ? ((netOperatingProfit / totalRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>Finance & General Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Double-entry journals, accounts receivable, vendor accounts payable, and automated financial income statements.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'ledger'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            General Ledger ({ledger.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'invoices'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Invoices / AR ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'bills'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bills / AP ({bills.length})
          </button>
          <button
            onClick={() => setActiveTab('pnl')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'pnl'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income Statement (P&L)
          </button>
        </div>
      </div>

      {/* General Ledger Tab */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400">Total Inflows: </span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(totalRevenue)}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div>
                <span className="text-slate-400">Total Outflows: </span>
                <span className="font-mono font-bold text-rose-400">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsJournalModalOpen(true)}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Journal Entry</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 font-medium bg-slate-950/50 text-[11px]">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-3">Ref #</th>
                  <th className="py-2.5 px-3">Account Code & Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Module Source</th>
                  <th className="py-2.5 px-3 text-right">Debit / Credit</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {ledger.map((entry) => {
                  const isInflow = entry.type === 'Inflow';
                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">{entry.date}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-400">{entry.referenceNo}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] text-slate-400 mr-1.5">[{entry.accountCode}]</span>
                        <span className="font-semibold text-slate-200">{entry.accountName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{entry.category}</td>
                      <td className="py-2.5 px-3 text-slate-200 truncate max-w-sm">{entry.description}</td>
                      <td className="py-2.5 px-3 font-medium text-cyan-300">{entry.moduleSource}</td>
                      <td className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold ${
                        isInflow ? 'text-emerald-400' : 'text-slate-200'
                      }`}>
                        {isInflow ? `+${formatCurrency(entry.amount)}` : `-${formatCurrency(entry.amount)}`}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="text-[10px] font-mono text-emerald-400 font-medium">
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices (AR) Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Total Outstanding Receivables (AR): </span>
              <span className="font-mono font-bold text-amber-400">{formatCurrency(unpaidInvoicesTotal)}</span>
            </div>

            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Customer Invoice</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 font-medium bg-slate-950/50 text-[11px]">
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-3">Customer Account</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">Tax (8%)</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-semibold text-cyan-400">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{inv.issueDate}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">{inv.dueDate}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">{formatCurrency(inv.subtotal)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">{formatCurrency(inv.taxAmount)}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-white">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-medium ${
                        inv.status === 'Paid'
                          ? 'text-emerald-400'
                          : inv.status === 'Overdue'
                          ? 'text-rose-400'
                          : inv.status === 'Sent'
                          ? 'text-cyan-400'
                          : 'text-slate-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {inv.status !== 'Paid' ? (
                          <button
                            onClick={() => markInvoicePaid(inv.id)}
                            className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[11px] font-medium transition-colors"
                          >
                            Mark as Paid
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Paid {inv.paidDate}</span>
                        )}
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bills (AP) Tab */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">
              Procurement & Vendor Invoices payable to suppliers, logistics carriers, and cloud providers.
            </span>

            <button
              onClick={() => setIsBillModalOpen(true)}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Vendor Bill</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 font-medium bg-slate-950/50 text-[11px]">
                  <th className="py-2.5 px-4">Bill Reference</th>
                  <th className="py-2.5 px-3">Vendor / Supplier</th>
                  <th className="py-2.5 px-3">Expense Category</th>
                  <th className="py-2.5 px-3">PO Reference</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">{bill.billNumber}</td>
                    <td className="py-3 px-3 font-semibold text-white">{bill.vendorName}</td>
                    <td className="py-3 px-3 text-slate-400">{bill.category}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-cyan-400">{bill.relatedPoNumber || 'Direct Expense'}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">{bill.dueDate}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-100">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-medium ${
                        bill.status === 'Paid'
                          ? 'text-emerald-400'
                          : bill.status === 'Approved'
                          ? 'text-cyan-400'
                          : 'text-amber-400'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {bill.status !== 'Paid' ? (
                        <button
                          onClick={() => payBill(bill.id)}
                          className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded text-[11px] font-medium transition-colors"
                        >
                          Disburse Payment
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Disbursed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive P&L Statement */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs space-y-6">
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Consolidated Statement of Profit and Loss</h3>
                <p className="text-xs text-slate-400">Reporting Period: FY2026 Q4 (Current Active Ledger)</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Gross Margin: </span>
                  <span className="text-emerald-400 font-bold">{grossMarginPct}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Net Operating Margin: </span>
                  <span className="text-cyan-400 font-bold">{netMarginPct}%</span>
                </div>
              </div>
            </div>

            {/* Income Statement Table */}
            <div className="space-y-6 text-xs">
              {/* 1. Operating Revenue */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] text-cyan-400">
                  1. Operating Revenues
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Product Sales & Hardware Solutions (4010)</span>
                    <span className="font-mono tabular-nums text-slate-100">
                      {formatCurrency(ledger.filter(l => l.accountCode === '4010').reduce((acc, l) => acc + l.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Enterprise Architecture & Advisory Consulting (4020)</span>
                    <span className="font-mono tabular-nums text-slate-100">
                      {formatCurrency(ledger.filter(l => l.accountCode === '4020').reduce((acc, l) => acc + l.amount, 0))}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-100">
                    <span>Total Operating Gross Revenue</span>
                    <span className="font-mono tabular-nums text-emerald-400">{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* 2. Cost of Goods Sold */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] text-amber-400">
                  2. Cost of Goods Sold (COGS)
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Direct Materials & Component Procurement</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatCurrency(totalCogs)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-100">
                    <span>Gross Operating Profit</span>
                    <span className="font-mono tabular-nums text-cyan-400">{formatCurrency(grossProfit)}</span>
                  </div>
                </div>
              </div>

              {/* 3. Operating Expenses */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] text-rose-400">
                  3. Operating Expenses (OPEX)
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Employee Compensation, Payroll & Healthcare (6010)</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatCurrency(payrollExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Cloud Infrastructure, Datacenter Clusters & R&D (6020)</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatCurrency(cloudExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Warehousing Leases, Freight & Logistics (6030)</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatCurrency(logisticsExpenses)}</span>
                  </div>
                  {otherExpenses > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>General & Administrative Expenses</span>
                      <span className="font-mono tabular-nums text-slate-200">{formatCurrency(otherExpenses)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-100">
                    <span>Total Operating Expenses</span>
                    <span className="font-mono tabular-nums text-rose-400">{formatCurrency(totalOperatingExpenses)}</span>
                  </div>
                </div>
              </div>

              {/* 4. Bottom Line: Net Income */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/80 flex items-center justify-between text-sm font-bold">
                <div>
                  <div className="text-white text-base">Net Operating Income (EBITDA)</div>
                  <div className="text-xs font-normal text-slate-400 mt-0.5">Automated accounting reconciliation completed</div>
                </div>
                <div className="text-2xl font-mono tabular-nums text-emerald-400">
                  {formatCurrency(netOperatingProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Journal Entry Modal */}
      <Modal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        title="Post General Ledger Journal Entry"
        subtitle="Manually record a balanced double-entry accounting transaction."
        maxWidth="md"
      >
        <form onSubmit={handleJournalSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Transaction Type</label>
              <select
                value={journalForm.type}
                onChange={(e) => setJournalForm({ ...journalForm, type: e.target.value as TransactionType })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Inflow">Inflow (Debit Cash / Credit Revenue)</option>
                <option value="Outflow">Outflow (Debit Expense / Credit Cash)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Amount ($ USD)</label>
              <input
                type="number"
                min="1"
                value={journalForm.amount}
                onChange={(e) => setJournalForm({ ...journalForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Account Code</label>
              <select
                value={journalForm.accountCode}
                onChange={(e) => {
                  const code = e.target.value;
                  const names: Record<string, string> = {
                    '1010': 'Cash & Liquid Equivalents',
                    '4010': 'Product Sales Revenue',
                    '4020': 'Enterprise Consulting Revenue',
                    '6010': 'Payroll & Compensation',
                    '6020': 'Cloud Infrastructure & R&D',
                    '6030': 'Facilities & Logistics',
                  };
                  setJournalForm({
                    ...journalForm,
                    accountCode: code,
                    accountName: names[code] || 'General Account',
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              >
                <option value="4010">[4010] Product Sales Revenue</option>
                <option value="4020">[4020] Enterprise Consulting Revenue</option>
                <option value="6010">[6010] Payroll & Compensation</option>
                <option value="6020">[6020] Cloud Infrastructure & R&D</option>
                <option value="6030">[6030] Facilities & Logistics</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Expense/Revenue Category</label>
              <select
                value={journalForm.category}
                onChange={(e) => setJournalForm({ ...journalForm, category: e.target.value as ExpenseCategory })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Sales Revenue">Sales Revenue</option>
                <option value="Consulting Services">Consulting Services</option>
                <option value="Payroll & Benefits">Payroll & Benefits</option>
                <option value="Cloud Infrastructure & R&D">Cloud Infrastructure & R&D</option>
                <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                <option value="Office & Facilities">Office & Facilities</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description / Memo</label>
            <input
              type="text"
              placeholder="e.g. Q4 Cloud Hosting cluster reserve"
              value={journalForm.description}
              onChange={(e) => setJournalForm({ ...journalForm, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsJournalModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
            >
              Post to Ledger
            </button>
          </div>
        </form>
      </Modal>

      {/* New Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create Customer Invoice (AR)"
        subtitle="Issue an accounts receivable invoice to a client organization."
        maxWidth="lg"
      >
        <form onSubmit={handleInvoiceSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Customer Account</label>
              <input
                type="text"
                placeholder="Enterprise Client Corp"
                value={invoiceForm.customerName}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Billing Email</label>
              <input
                type="email"
                placeholder="ap@enterprise.com"
                value={invoiceForm.customerEmail}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Issue Date</label>
              <input
                type="date"
                value={invoiceForm.issueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Payment Due Date</label>
              <input
                type="date"
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-3">
            <div className="font-semibold text-slate-200">Line Items</div>
            {invoiceForm.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => {
                    const next = [...invoiceForm.items];
                    next[idx].description = e.target.value;
                    setInvoiceForm({ ...invoiceForm, items: next });
                  }}
                  placeholder="Service / Product line item"
                  className="col-span-6 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const next = [...invoiceForm.items];
                    const q = parseInt(e.target.value) || 1;
                    next[idx].quantity = q;
                    next[idx].total = q * next[idx].unitPrice;
                    setInvoiceForm({ ...invoiceForm, items: next });
                  }}
                  className="col-span-2 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                />
                <input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const next = [...invoiceForm.items];
                    const p = parseFloat(e.target.value) || 0;
                    next[idx].unitPrice = p;
                    next[idx].total = next[idx].quantity * p;
                    setInvoiceForm({ ...invoiceForm, items: next });
                  }}
                  className="col-span-4 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
            >
              Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Register Bill Modal */}
      <Modal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        title="Register Vendor Bill (AP)"
        subtitle="Log an accounts payable obligation for supplier services or components."
        maxWidth="md"
      >
        <form onSubmit={handleBillSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Vendor Name</label>
              <input
                type="text"
                placeholder="e.g. Kyocera SemiTech"
                value={billForm.vendorName}
                onChange={(e) => setBillForm({ ...billForm, vendorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Bill Amount ($)</label>
              <input
                type="number"
                min="1"
                value={billForm.amount}
                onChange={(e) => setBillForm({ ...billForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Category</label>
            <select
              value={billForm.category}
              onChange={(e) => setBillForm({ ...billForm, category: e.target.value as ExpenseCategory })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
            >
              <option value="Cost of Goods Sold (COGS)">Cost of Goods Sold (COGS)</option>
              <option value="Cloud Infrastructure & R&D">Cloud Infrastructure & R&D</option>
              <option value="Logistics & Warehousing">Logistics & Warehousing</option>
              <option value="Office & Facilities">Office & Facilities</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Issue Date</label>
              <input
                type="date"
                value={billForm.issueDate}
                onChange={(e) => setBillForm({ ...billForm, issueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={billForm.dueDate}
                onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBillModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
            >
              Register Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <Modal
          isOpen={!!viewInvoice}
          onClose={() => setViewInvoice(null)}
          title={`Invoice: ${viewInvoice.invoiceNumber}`}
          subtitle={`Issued to ${viewInvoice.customerName} on ${viewInvoice.issueDate}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-base font-bold text-white">Vanguard Global Industries, Inc.</div>
                  <div className="text-slate-400 text-[11px]">100 S. Wacker Drive, Suite 2400 · Chicago, IL 60606</div>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-xs font-semibold ${
                    viewInvoice.status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {viewInvoice.status.toUpperCase()}
                  </span>
                  <div className="text-slate-400 text-[11px]">Due: {viewInvoice.dueDate}</div>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <div className="text-slate-400 font-semibold mb-1">Billed To:</div>
                <div className="text-slate-200 font-medium">{viewInvoice.customerName}</div>
                <div className="text-slate-400">{viewInvoice.customerEmail}</div>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                      <th className="py-1">Description</th>
                      <th className="py-1 text-right">Qty</th>
                      <th className="py-1 text-right">Unit Price</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-200">
                    {viewInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2">{it.description}</td>
                        <td className="py-2 text-right font-mono">{it.quantity}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                        <td className="py-2 text-right font-mono font-semibold">{formatCurrency(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-800/80 pt-3 space-y-1.5 text-right font-mono">
                <div className="text-slate-400">Subtotal: {formatCurrency(viewInvoice.subtotal)}</div>
                <div className="text-slate-400">Tax (8%): {formatCurrency(viewInvoice.taxAmount)}</div>
                <div className="text-sm font-bold text-white pt-1 border-t border-slate-800">
                  Total Due: {formatCurrency(viewInvoice.totalAmount)}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {viewInvoice.status !== 'Paid' && (
                <button
                  onClick={() => {
                    markInvoicePaid(viewInvoice.id);
                    setViewInvoice(null);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-lg"
                >
                  Record Payment Received
                </button>
              )}
              <button
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
