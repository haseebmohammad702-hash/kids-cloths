import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  ShieldCheck, 
  Settings, 
  Boxes, 
  ArrowRightLeft, 
  TrendingUp, 
  FileText,
  CloudCheck
} from 'lucide-react';
import { ERPModule } from '../../types/erp';
import { useErp } from '../../context/ErpContext';

export const Sidebar: React.FC = () => {
  const { 
    currentModule, 
    setCurrentModule, 
    currentPersona, 
    lowStockItemsCount, 
    pendingLeaveCount,
    unpaidInvoicesTotal 
  } = useErp();

  const navItems = [
    {
      id: 'dashboard' as ERPModule,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null,
      description: 'KPIs, cashflow & operations',
    },
    {
      id: 'inventory' as ERPModule,
      label: 'Inventory & Logistics',
      icon: Package,
      badge: lowStockItemsCount > 0 ? `${lowStockItemsCount} low` : null,
      badgeColor: 'text-amber-400',
      description: 'Stock master, POs & fulfillment',
    },
    {
      id: 'finance' as ERPModule,
      label: 'Finance & Accounting',
      icon: Receipt,
      badge: unpaidInvoicesTotal > 0 ? `$${Math.round(unpaidInvoicesTotal / 1000)}k pending` : null,
      badgeColor: 'text-cyan-400',
      description: 'General ledger, P&L & invoices',
    },
    {
      id: 'hr' as ERPModule,
      label: 'Human Resources',
      icon: Users,
      badge: pendingLeaveCount > 0 ? `${pendingLeaveCount} req` : null,
      badgeColor: 'text-emerald-400',
      description: 'Directory, payroll & leave ops',
    },
    {
      id: 'audit' as ERPModule,
      label: 'System Audit Trail',
      icon: ShieldCheck,
      badge: null,
      description: 'Immutable ledger of actions',
    },
    {
      id: 'settings' as ERPModule,
      label: 'Cloud Settings & Backup',
      icon: Settings,
      badge: null,
      description: 'Entities, export & restore',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen shrink-0 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-xs">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              Vanguard ERP
            </h1>
            <p className="text-[11px] text-slate-400 tracking-wide">Enterprise Cloud</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
        <div className="px-3 pb-2 text-[11px] font-medium text-slate-400 tracking-wider">
          CORE MODULES
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          const isAllowed = currentPersona.allowedModules.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isAllowed) {
                  setCurrentModule(item.id);
                }
              }}
              disabled={!isAllowed}
              title={!isAllowed ? `Restricted for role: ${currentPersona.title}` : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group ${
                isActive
                  ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-800/60 shadow-xs'
                  : isAllowed
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : isAllowed ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && isAllowed && (
                <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-800 ${item.badgeColor || 'text-slate-300'}`}>
                  {item.badge}
                </span>
              )}

              {!isAllowed && (
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5">
                  Locked
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Cross-Module Status / Active Persona */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CloudCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cloud Sync</span>
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">Real-time</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800/60 flex items-center gap-2.5">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate">{currentPersona.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentPersona.title}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
