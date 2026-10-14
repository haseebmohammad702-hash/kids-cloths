/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { InventoryModule } from './components/inventory/InventoryModule';
import { FinanceModule } from './components/finance/FinanceModule';
import { HrModule } from './components/hr/HrModule';
import { AuditModule } from './components/audit/AuditModule';
import { SettingsModule } from './components/settings/SettingsModule';

const MainContent: React.FC = () => {
  const { currentModule } = useErp();

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-950">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto">
          {currentModule === 'dashboard' && <ExecutiveDashboard />}
          {currentModule === 'inventory' && <InventoryModule />}
          {currentModule === 'finance' && <FinanceModule />}
          {currentModule === 'hr' && <HrModule />}
          {currentModule === 'audit' && <AuditModule />}
          {currentModule === 'settings' && <SettingsModule />}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
        <Sidebar />
        <MainContent />
      </div>
    </ErpProvider>
  );
}
