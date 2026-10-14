import React, { useState } from 'react';
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Boxes,
  Building,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { FACILITY_HERO } from '../../data/mockErpData';

export const ExecutiveDashboard: React.FC = () => {
  const { 
    inventory, 
    ledger, 
    invoices, 
    employees, 
    leaveRequests,
    payrollRuns,
    auditLogs,
    totalInventoryValuation,
    totalRevenue,
    totalExpenses,
    netIncome,
    cashOnHand,
    totalHeadcount,
    monthlyPayrollTotal,
    lowStockItemsCount,
    pendingLeaveCount,
    unpaidInvoicesTotal,
    reorderLowStock,
    approveLeaveRequest,
    disbursePayrollRun,
    setCurrentModule,
    selectedLocation
  } = useErp();

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical');
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');
  const activeDraftPayroll = payrollRuns.find(p => p.status === 'Draft');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-cyan-950/90 border border-cyan-800 rounded-lg text-xs text-cyan-200 flex items-center justify-between shadow-lg animate-in fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-cyan-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Banner / Facility Operational Overview */}
      <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-900 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[180px]">
          {/* Left Text Zone */}
          <div className="p-6 lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Enterprise Resource Platform</span>
                <span aria-hidden="true">·</span>
                <span>Location: {selectedLocation === 'ALL' ? 'Global Multi-Hub Operations' : selectedLocation}</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                Vanguard Cloud Operations Console
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xl">
                Unified enterprise coordination across supply chain warehouses, automated ledger accounting, and people operations with instant cross-system synchronization.
              </p>
            </div>

            {/* Quick module jumps */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <button
                onClick={() => setCurrentModule('inventory')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inventory Master ({inventory.length} SKUs)</span>
              </button>
              <button
                onClick={() => setCurrentModule('finance')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Finance & P&L Statement</span>
              </button>
              <button
                onClick={() => setCurrentModule('hr')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>People & Payroll ({totalHeadcount} Staff)</span>
              </button>
            </div>
          </div>

          {/* Right Image Graphic Zone */}
          <div className="lg:col-span-5 relative h-48 lg:h-auto min-h-[160px] overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-800">
            <img
              src={FACILITY_HERO}
              alt="High-tech automated logistics distribution center"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
              <div className="text-[11px] font-medium text-slate-300">Central Logistics & Automated Storage</div>
              <div className="text-[10px] text-slate-400">Chicago HQ High-Bay Terminal · Connected</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Enterprise KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net Income */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Net Operating Income</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            {formatCurrency(netIncome)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Gross Rev: <span className="font-mono text-slate-200">{formatCurrency(totalRevenue)}</span></span>
            <span className="text-emerald-400 font-mono">+18.4% YoY</span>
          </div>
        </div>

        {/* KPI 2: Treasury Cash */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Treasury & Liquid Cash</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            {formatCurrency(cashOnHand)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>AR Pending: <span className="font-mono text-amber-400">{formatCurrency(unpaidInvoicesTotal)}</span></span>
            <span className="text-slate-400 font-mono">18 Mo Runway</span>
          </div>
        </div>

        {/* KPI 3: Inventory Valuation */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Inventory Asset Valuation</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            {formatCurrency(totalInventoryValuation)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Active SKUs: <span className="font-mono text-slate-200">{inventory.length} items</span></span>
            <span className={lowStockItemsCount > 0 ? 'text-amber-400 font-mono' : 'text-emerald-400 font-mono'}>
              {lowStockItemsCount > 0 ? `${lowStockItemsCount} Low Stock` : 'Healthy'}
            </span>
          </div>
        </div>

        {/* KPI 4: Headcount & Payroll */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Workforce & Payroll Run</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            {totalHeadcount} <span className="text-xs font-normal text-slate-400 font-sans">Active Staff</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Monthly Run: <span className="font-mono text-slate-200">{formatCurrency(monthlyPayrollTotal)}</span></span>
            <span className={pendingLeaveCount > 0 ? 'text-cyan-400 font-mono' : 'text-slate-400 font-mono'}>
              {pendingLeaveCount} Pending Leave
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Module Operational Alert Bar (if action needed) */}
      {(lowStockItemsCount > 0 || activeDraftPayroll || pendingLeaveCount > 0) && (
        <div className="p-3.5 rounded-xl border border-amber-900/60 bg-amber-950/20 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Operational Alerts:</strong>{' '}
              {lowStockItemsCount > 0 && `${lowStockItemsCount} items below safety reorder threshold · `}
              {activeDraftPayroll && `October payroll ready for disbursement ($${activeDraftPayroll.totalGross.toLocaleString()}) · `}
              {pendingLeaveCount > 0 && `${pendingLeaveCount} employee leave requests awaiting approval`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeDraftPayroll && (
              <button
                onClick={() => {
                  disbursePayrollRun(activeDraftPayroll.id);
                  showNotification(`Disbursed ${activeDraftPayroll.periodName} ($${activeDraftPayroll.totalGross.toLocaleString()}). Ledger entry generated!`);
                }}
                className="px-2.5 py-1 bg-amber-500 text-slate-950 font-semibold rounded-md hover:bg-amber-400 transition-colors"
              >
                Disburse Payroll Now
              </button>
            )}
            {lowStockItems.length > 0 && (
              <button
                onClick={() => {
                  lowStockItems.forEach(item => reorderLowStock(item.id, item.reorderPoint * 2));
                  showNotification(`Generated replenishment POs for ${lowStockItems.length} low stock items!`);
                }}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
              >
                Auto-Replenish All Low Stock
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Two-Column Enterprise Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Real-time General Ledger Journal */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Live General Ledger Journal</h3>
              <p className="text-xs text-slate-400">Automated double-entry cross-module financial journal</p>
            </div>
            <button
              onClick={() => setCurrentModule('finance')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {ledger.slice(0, 5).map((entry) => {
              const isInflow = entry.type === 'Inflow';
              return (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                        isInflow ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {isInflow ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 truncate">{entry.description}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-400">[{entry.accountCode}] {entry.accountName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{entry.date}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-cyan-400">{entry.moduleSource}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div
                      className={`font-mono tabular-nums font-semibold ${
                        isInflow ? 'text-emerald-400' : 'text-slate-300'
                      }`}
                    >
                      {isInflow ? '+' : '-'}{formatCurrency(entry.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase">{entry.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Operational Urgent Queues */}
        <div className="lg:col-span-5 space-y-6">
          {/* Box 1: Low Stock Watchlist */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Stock Reorder Watchlist</span>
                </h3>
                <p className="text-xs text-slate-400">{lowStockItems.length} items requiring replenishment</p>
              </div>
              <button
                onClick={() => setCurrentModule('inventory')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Stock Master</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/60 rounded-lg">
                All inventory levels are currently above target safety thresholds.
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{item.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="font-mono text-cyan-400">{item.sku}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.warehouseLocation}</span>
                      </div>
                      <div className="text-[11px] font-mono mt-1">
                        Stock: <span className="text-amber-400 font-bold">{item.onHand}</span> / Min: {item.reorderPoint}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        reorderLowStock(item.id, item.reorderPoint * 2);
                        showNotification(`Issued replenishment order for ${item.name}!`);
                      }}
                      className="px-2.5 py-1.5 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 transition-colors text-[11px] font-medium shrink-0"
                    >
                      Reorder PO
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box 2: Pending Leave Approvals */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Pending Leave Requests</span>
                </h3>
                <p className="text-xs text-slate-400">{pendingLeaves.length} approvals pending manager review</p>
              </div>
              <button
                onClick={() => setCurrentModule('hr')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>HR Module</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/60 rounded-lg">
                No leave requests pending approval at this time.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingLeaves.slice(0, 2).map((lvr) => (
                  <div
                    key={lvr.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{lvr.employeeName}</div>
                      <div className="text-[11px] text-slate-400">
                        {lvr.leaveType} · {lvr.totalDays} Days ({lvr.startDate} to {lvr.endDate})
                      </div>
                      <div className="text-[11px] text-slate-400 italic mt-0.5">"{lvr.reason}"</div>
                    </div>

                    <button
                      onClick={() => {
                        approveLeaveRequest(lvr.id);
                        showNotification(`Approved leave for ${lvr.employeeName}`);
                      }}
                      className="px-2.5 py-1.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 transition-colors text-[11px] font-medium shrink-0"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Audit Trail Snapshot */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Enterprise Audit Log & Traceability</h3>
            <p className="text-xs text-slate-400">Cryptographically verifiable sequence of cloud state mutations</p>
          </div>
          <button
            onClick={() => setCurrentModule('audit')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Full Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 font-medium text-[11px]">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Module</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Entity Reference</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {auditLogs.slice(0, 4).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2 px-3 font-medium text-cyan-400">{log.module}</td>
                  <td className="py-2 px-3 font-medium text-slate-200">{log.action}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{log.entityId}</td>
                  <td className="py-2 px-3">{log.performedBy}</td>
                  <td className="py-2 px-3 text-slate-400 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
