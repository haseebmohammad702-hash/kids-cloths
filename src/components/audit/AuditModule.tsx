import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

export const AuditModule: React.FC = () => {
  const { auditLogs } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
    return matchesSearch && matchesModule && matchesSeverity;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `erp_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>System Audit Trail & Compliance Ledger</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically referenced event journal capturing mutations across Inventory, Finance, and Human Resources.
        </p>
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter by action, entity ID, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:border-cyan-500"
          >
            <option value="ALL">All Modules</option>
            <option value="Inventory">Inventory</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="System">System</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button
          onClick={handleExportJson}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors self-start lg:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit JSON</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 font-medium bg-slate-950/50 text-[11px]">
              <th className="py-2.5 px-4">Timestamp (UTC)</th>
              <th className="py-2.5 px-3">Module</th>
              <th className="py-2.5 px-3">Action Type</th>
              <th className="py-2.5 px-3">Entity Key</th>
              <th className="py-2.5 px-3">Authorized User</th>
              <th className="py-2.5 px-4">Audit Payload & Context</th>
              <th className="py-2.5 px-3 text-center">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No audit trail records found for current criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-cyan-400">{log.module}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">{log.action}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{log.entityId}</td>
                  <td className="py-3 px-3 text-slate-300 font-medium">{log.performedBy}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-md">{log.details}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] font-mono uppercase font-semibold ${
                      log.severity === 'critical'
                        ? 'text-rose-400'
                        : log.severity === 'warning'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
