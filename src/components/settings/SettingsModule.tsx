import React, { useRef, useState } from 'react';
import { 
  Settings, 
  CloudCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Building2, 
  ShieldCheck, 
  Database,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

export const SettingsModule: React.FC = () => {
  const { 
    companyLocations, 
    resetToDemoData, 
    exportStateToJson, 
    importStateFromJson,
    inventory,
    ledger,
    employees,
    auditLogs
  } = useErp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importStateFromJson(content);
      if (success) {
        setImportStatus('Enterprise state successfully restored!');
      } else {
        setImportStatus('Failed to import: file is corrupted or schema mismatched.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Cloud ERP System Settings & Data Sovereignty</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Multi-hub facility parameters, cloud state encryption, snapshot exports, and backup restorations.
        </p>
      </div>

      {importStatus && (
        <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-lg text-xs text-cyan-200">
          {importStatus}
        </div>
      )}

      {/* Cloud Architecture Status */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Cloud Instance Architecture</span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 font-medium">HEALTHY · LIVE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Primary Tenant</div>
            <div className="font-semibold text-slate-200 mt-0.5">Vanguard Global Industries Inc.</div>
            <div className="font-mono text-[10px] text-cyan-400 mt-1">TENANT-US-091</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Active Datacenter Tier</div>
            <div className="font-semibold text-slate-200 mt-0.5">Google Cloud Asia-SE / US-Central</div>
            <div className="font-mono text-[10px] text-emerald-400 mt-1">Zero-Downtime Replication</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Sync Mode</div>
            <div className="font-semibold text-slate-200 mt-0.5">Active-Active Dual Sync</div>
            <div className="font-mono text-[10px] text-slate-400 mt-1">Local Encrypted Cache</div>
          </div>
        </div>
      </div>

      {/* Global Warehouse Hubs */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Configured Logistics Warehouses & Hubs</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{companyLocations.length} Hubs Registered</span>
        </div>

        <div className="space-y-2">
          {companyLocations.map((loc) => (
            <div
              key={loc.id}
              className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-200 flex items-center gap-2">
                  <span>{loc.name}</span>
                  {loc.isHQ && (
                    <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                      GLOBAL HQ
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{loc.city}, {loc.country}</div>
              </div>
              <div className="font-mono text-cyan-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[11px]">
                {loc.code}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sovereignty, Backup & Disaster Recovery */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xs">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Data Sovereignty, Export & Disaster Recovery</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Export a complete, self-contained JSON image of all Inventory items, Financial Ledgers, Invoices, HR Profiles, and Audit Logs.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-semibold text-slate-100">Live Database Volume</div>
            <div className="text-[11px] text-slate-400">
              {inventory.length} Inventory items · {ledger.length} Ledger entries · {employees.length} Employees · {auditLogs.length} Audit events
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <button
            onClick={exportStateToJson}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Cloud Backup (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Restore Backup Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to the demo baseline?')) {
                resetToDemoData();
              }
            }}
            className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-medium rounded-lg flex items-center gap-2 transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Baseline Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
