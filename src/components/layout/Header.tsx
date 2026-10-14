import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  Plus, 
  Download, 
  RotateCcw,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { USER_PERSONAS } from '../../data/mockErpData';
import { Modal } from '../common/Modal';

export const Header: React.FC = () => {
  const { 
    currentModule, 
    setCurrentModule,
    currentPersona, 
    setCurrentPersona,
    selectedLocation,
    setSelectedLocation,
    companyLocations,
    resetToDemoData,
    exportStateToJson,
    inventory,
    fulfillSalesOrder,
    receiveInventoryStock
  } = useErp();

  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState<'sale' | 'po'>('sale');
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const [qty, setQty] = useState<number>(5);
  const [partnerName, setPartnerName] = useState<string>('Apex Systems Corp');

  const moduleTitles: Record<string, string> = {
    dashboard: 'Executive Overview',
    inventory: 'Inventory & Supply Chain',
    finance: 'Finance & Treasury',
    hr: 'Human Resources & People',
    audit: 'System Audit Ledger',
    settings: 'Cloud Settings & Backup',
  };

  const handleExecuteQuickAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || qty <= 0) return;

    const item = inventory.find(i => i.id === selectedItemId);
    if (!item) return;

    if (quickActionType === 'sale') {
      fulfillSalesOrder(
        selectedItemId,
        qty,
        `SO-${Math.floor(1000 + Math.random() * 9000)}`,
        partnerName || 'Enterprise Client',
        item.sellingPrice
      );
    } else {
      receiveInventoryStock(
        selectedItemId,
        qty,
        `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        item.supplier,
        'Quick PO Inbound via Top Bar'
      );
    }

    setIsQuickActionOpen(false);
  };

  return (
    <>
      <header className="h-16 px-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-8 shrink-0 backdrop-blur-md">
        {/* Zone 1: Breadcrumb Trail (Single line) */}
        <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap shrink-0">
          <span className="font-semibold text-slate-200">Vanguard Cloud</span>
          <span aria-hidden="true">/</span>
          <span className="text-cyan-400 font-medium">{moduleTitles[currentModule]}</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-400">FY2026 Q4</span>
        </div>

        {/* Zone 2: Operating Location Hub & Role Switcher */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          {/* Location Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Hub:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Global Facilities</option>
              {companyLocations.map((loc) => (
                <option key={loc.id} value={loc.code} className="bg-slate-900 text-slate-200">
                  {loc.name} ({loc.country})
                </option>
              ))}
            </select>
          </div>

          {/* Role Persona Switcher (RBAC) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Persona:</span>
            <select
              value={currentPersona.id}
              onChange={(e) => {
                const found = USER_PERSONAS.find((p) => p.id === e.target.value);
                if (found) {
                  setCurrentPersona(found);
                  // If current module not allowed, fall back to dashboard
                  if (!found.allowedModules.includes(currentModule)) {
                    setCurrentModule('dashboard');
                  }
                }
              }}
              className="bg-transparent text-slate-200 font-medium focus:outline-hidden cursor-pointer"
            >
              {USER_PERSONAS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name} ({p.title.split('&')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone 3: Primary Action & Quick Tooling */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsQuickActionOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Transaction</span>
          </button>
        </div>
      </header>

      {/* Quick Transaction Cross-Module Modal */}
      <Modal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        title="Execute Cross-Module Enterprise Transaction"
        subtitle="Perform an action that synchronizes stock, finance ledger, and audit history simultaneously."
        maxWidth="lg"
      >
        <form onSubmit={handleExecuteQuickAction} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Transaction Workflow</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuickActionType('sale')}
                className={`py-2 px-3 rounded-lg border text-left transition-colors ${
                  quickActionType === 'sale'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-200">Outbound Sales Order</div>
                <div className="text-[11px] text-slate-400">Decrements inventory & issues invoice</div>
              </button>
              <button
                type="button"
                onClick={() => setQuickActionType('po')}
                className={`py-2 px-3 rounded-lg border text-left transition-colors ${
                  quickActionType === 'po'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-200">Inbound PO Receipt</div>
                <div className="text-[11px] text-slate-400">Increments inventory & creates AP bill</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Inventory SKU</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-cyan-500"
              required
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.sku} — {item.name} (Stock: {item.onHand} | Loc: {item.warehouseLocation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Quantity (Units)</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-hidden focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {quickActionType === 'sale' ? 'Customer Account' : 'Supplier / Vendor'}
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-hidden focus:border-cyan-500"
                placeholder={quickActionType === 'sale' ? 'Client Name' : 'Supplier Name'}
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Cross-Module Synchronization:</div>
            {quickActionType === 'sale' ? (
              <div>
                • Inventory: stock will reduce by <span className="text-amber-400 font-mono font-medium">{qty} units</span>.<br/>
                • Finance: a receivable invoice will automatically generate in Accounts Receivable.<br/>
                • Audit: action timestamped and logged under user <span className="text-cyan-400">{currentPersona.name}</span>.
              </div>
            ) : (
              <div>
                • Inventory: stock will increase by <span className="text-emerald-400 font-mono font-medium">+{qty} units</span>.<br/>
                • Finance: an AP bill will be registered under Cost of Goods Sold.<br/>
                • Audit: inbound receipt logged in global compliance audit.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickActionOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400 transition-colors"
            >
              {quickActionType === 'sale' ? 'Dispatch & Invoice' : 'Receive & Post Bill'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
