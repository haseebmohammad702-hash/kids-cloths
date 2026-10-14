import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ERPModule, 
  UserPersona, 
  CompanyLocation, 
  InventoryItem, 
  StockMovement, 
  LedgerEntry, 
  Invoice, 
  VendorBill, 
  Employee, 
  PayrollRun, 
  LeaveRequest, 
  AuditLogEntry 
} from '../types/erp';
import {
  USER_PERSONAS,
  COMPANY_LOCATIONS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_LEDGER,
  INITIAL_INVOICES,
  INITIAL_BILLS,
  INITIAL_EMPLOYEES,
  INITIAL_PAYROLL_RUNS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockErpData';

interface ErpContextType {
  // Navigation & Session
  currentModule: ERPModule;
  setCurrentModule: (mod: ERPModule) => void;
  currentPersona: UserPersona;
  setCurrentPersona: (persona: UserPersona) => void;
  selectedLocation: string; // 'ALL' or location code
  setSelectedLocation: (loc: string) => void;
  companyLocations: CompanyLocation[];

  // Inventory
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  receiveInventoryStock: (itemId: string, qty: number, poNumber: string, supplier: string, notes?: string) => void;
  fulfillSalesOrder: (itemId: string, qty: number, soNumber: string, customer: string, unitPrice: number) => void;
  reorderLowStock: (itemId: string, reorderQty: number) => void;

  // Finance
  ledger: LedgerEntry[];
  invoices: Invoice[];
  bills: VendorBill[];
  createLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'status'>) => void;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'taxAmount' | 'totalAmount'>) => void;
  markInvoicePaid: (invoiceId: string) => void;
  createBill: (bill: Omit<VendorBill, 'id'>) => void;
  payBill: (billId: string) => void;

  // HR
  employees: Employee[];
  payrollRuns: PayrollRun[];
  leaveRequests: LeaveRequest[];
  addEmployee: (emp: Omit<Employee, 'id' | 'ptoUsedDays'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  disbursePayrollRun: (runId: string) => void;
  createLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'status' | 'requestedDate'>) => void;
  approveLeaveRequest: (requestId: string) => void;
  rejectLeaveRequest: (requestId: string) => void;

  // Audit
  auditLogs: AuditLogEntry[];
  addAuditLog: (module: 'Inventory' | 'Finance' | 'HR' | 'System', action: string, entityId: string, details: string, severity?: 'info' | 'warning' | 'critical') => void;

  // Aggregate Metrics
  totalInventoryValuation: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  cashOnHand: number;
  totalHeadcount: number;
  monthlyPayrollTotal: number;
  lowStockItemsCount: number;
  pendingLeaveCount: number;
  unpaidInvoicesTotal: number;

  // Data Management
  resetToDemoData: () => void;
  exportStateToJson: () => void;
  importStateFromJson: (jsonStr: string) => boolean;
}

const LOCAL_STORAGE_KEY = 'vanguard_erp_cloud_state_v1';

const ErpContext = createContext<ErpContextType | undefined>(undefined);

export const ErpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation & Persona
  const [currentModule, setCurrentModule] = useState<ERPModule>('dashboard');
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(USER_PERSONAS[0]);
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [companyLocations] = useState<CompanyLocation[]>(COMPANY_LOCATIONS);

  // Core Data States
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).inventory || INITIAL_INVENTORY;
    } catch {
      // fallback
    }
    return INITIAL_INVENTORY;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).stockMovements || INITIAL_STOCK_MOVEMENTS;
    } catch {}
    return INITIAL_STOCK_MOVEMENTS;
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).ledger || INITIAL_LEDGER;
    } catch {}
    return INITIAL_LEDGER;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).invoices || INITIAL_INVOICES;
    } catch {}
    return INITIAL_INVOICES;
  });

  const [bills, setBills] = useState<VendorBill[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).bills || INITIAL_BILLS;
    } catch {}
    return INITIAL_BILLS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).employees || INITIAL_EMPLOYEES;
    } catch {}
    return INITIAL_EMPLOYEES;
  });

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).payrollRuns || INITIAL_PAYROLL_RUNS;
    } catch {}
    return INITIAL_PAYROLL_RUNS;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).leaveRequests || INITIAL_LEAVE_REQUESTS;
    } catch {}
    return INITIAL_LEAVE_REQUESTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved).auditLogs || INITIAL_AUDIT_LOGS;
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      const fullState = {
        inventory,
        stockMovements,
        ledger,
        invoices,
        bills,
        employees,
        payrollRuns,
        leaveRequests,
        auditLogs,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullState));
    } catch (e) {
      console.warn('Unable to persist ERP state to LocalStorage', e);
    }
  }, [inventory, stockMovements, ledger, invoices, bills, employees, payrollRuns, leaveRequests, auditLogs]);

  // Helper to add audit logs
  const addAuditLog = (
    module: 'Inventory' | 'Finance' | 'HR' | 'System',
    action: string,
    entityId: string,
    details: string,
    severity: 'info' | 'warning' | 'critical' = 'info'
  ) => {
    const now = new Date();
    const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      module,
      action,
      entityId,
      performedBy: currentPersona.name,
      details,
      severity,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // ----------------- INVENTORY METHODS -----------------
  const calculateItemStatus = (onHand: number, reorderPoint: number): 'In Stock' | 'Low Stock' | 'Critical' => {
    if (onHand <= reorderPoint * 0.4) return 'Critical';
    if (onHand <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status'>) => {
    const id = `item-${Date.now()}`;
    const status = calculateItemStatus(itemData.onHand, itemData.reorderPoint);
    const today = new Date().toISOString().slice(0, 10);
    const newItem: InventoryItem = {
      ...itemData,
      id,
      lastUpdated: today,
      status,
    };
    setInventory((prev) => [newItem, ...prev]);
    addAuditLog('Inventory', 'Created SKU Master', newItem.sku, `Added ${newItem.name} at ${newItem.warehouseLocation}`);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates, lastUpdated: new Date().toISOString().slice(0, 10) };
          updated.status = calculateItemStatus(updated.onHand, updated.reorderPoint);
          return updated;
        }
        return item;
      })
    );
    addAuditLog('Inventory', 'Updated SKU Master', id, `Updated SKU metadata`);
  };

  const deleteInventoryItem = (id: string) => {
    const target = inventory.find((i) => i.id === id);
    if (!target) return;
    setInventory((prev) => prev.filter((i) => i.id !== id));
    addAuditLog('Inventory', 'Deleted SKU Master', target.sku, `Removed ${target.name} from inventory`, 'warning');
  };

  // Cross-module: Receiving Inventory
  const receiveInventoryStock = (itemId: string, qty: number, poNumber: string, supplier: string, notes?: string) => {
    const target = inventory.find((i) => i.id === itemId);
    if (!target || qty <= 0) return;

    const newOnHand = target.onHand + qty;
    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5);

    // 1. Update item stock
    setInventory((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              onHand: newOnHand,
              status: calculateItemStatus(newOnHand, i.reorderPoint),
              lastUpdated: today,
            }
          : i
      )
    );

    // 2. Add Stock Movement
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: `${today} ${nowTime}`,
      sku: target.sku,
      itemName: target.name,
      type: 'Inbound PO',
      quantity: qty,
      warehouse: target.warehouseLocation,
      referenceNo: poNumber,
      performedBy: currentPersona.name,
      unitCost: target.unitCost,
      notes: notes || `Inbound PO received from ${supplier}`,
    };
    setStockMovements((prev) => [movement, ...prev]);

    // 3. Automated Finance Entry: Create Bill in Accounts Payable
    const totalCost = qty * target.unitCost;
    const newBill: VendorBill = {
      id: `bill-${Date.now()}`,
      billNumber: `BILL-${poNumber}`,
      vendorName: supplier || target.supplier,
      category: 'Cost of Goods Sold (COGS)',
      amount: totalCost,
      issueDate: today,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'Approved',
      relatedPoNumber: poNumber,
    };
    setBills((prev) => [newBill, ...prev]);

    // 4. Automated Ledger Entry (Inventory Asset Debit)
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: today,
      referenceNo: poNumber,
      description: `Inbound PO: ${qty}x ${target.name} from ${supplier}`,
      accountCode: '1300',
      accountName: 'Inventory Asset Acquisition',
      type: 'Outflow',
      category: 'Cost of Goods Sold (COGS)',
      amount: totalCost,
      moduleSource: 'Inventory',
      status: 'Posted',
    };
    setLedger((prev) => [ledgerEntry, ...prev]);

    // 5. Audit Log
    addAuditLog(
      'Inventory',
      'Stock Received (Inbound PO)',
      target.sku,
      `Received +${qty} units into ${target.warehouseLocation}. Generated Bill ${newBill.billNumber} ($${totalCost.toLocaleString()})`
    );
  };

  // Cross-module: Fulfilling Sales Order
  const fulfillSalesOrder = (
    itemId: string,
    qty: number,
    soNumber: string,
    customer: string,
    unitPrice: number
  ) => {
    const target = inventory.find((i) => i.id === itemId);
    if (!target || qty <= 0) return;
    if (target.onHand < qty) {
      alert(`Insufficient stock. Current on-hand is ${target.onHand}, requested ${qty}.`);
      return;
    }

    const newOnHand = target.onHand - qty;
    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5);

    // 1. Decrement Stock
    setInventory((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              onHand: newOnHand,
              status: calculateItemStatus(newOnHand, i.reorderPoint),
              lastUpdated: today,
            }
          : i
      )
    );

    // 2. Add Stock Movement
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: `${today} ${nowTime}`,
      sku: target.sku,
      itemName: target.name,
      type: 'Outbound Fulfillment',
      quantity: -qty,
      warehouse: target.warehouseLocation,
      referenceNo: soNumber,
      performedBy: currentPersona.name,
      unitCost: target.unitCost,
      notes: `Fulfillment for ${customer}`,
    };
    setStockMovements((prev) => [movement, ...prev]);

    // 3. Automated Finance Entry: Create Invoice
    const subtotal = qty * unitPrice;
    const taxRate = 0.08;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${soNumber}`,
      customerName: customer,
      customerEmail: `billing@${customer.toLowerCase().replace(/[^a-z]/g, '') || 'client'}.com`,
      issueDate: today,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      items: [
        {
          description: target.name,
          sku: target.sku,
          quantity: qty,
          unitPrice: unitPrice,
          total: subtotal,
        },
      ],
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: 'Sent',
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // 4. Audit Log
    addAuditLog(
      'Inventory',
      'Outbound Fulfillment Dispatched',
      target.sku,
      `Fulfilled ${qty} units to ${customer}. Generated Invoice ${newInvoice.invoiceNumber} ($${totalAmount.toLocaleString()})`
    );
  };

  const reorderLowStock = (itemId: string, reorderQty: number) => {
    const target = inventory.find((i) => i.id === itemId);
    if (!target) return;
    const poNumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    receiveInventoryStock(itemId, reorderQty, poNumber, target.supplier, `Automated Replenishment Trigger`);
  };

  // ----------------- FINANCE METHODS -----------------
  const createLedgerEntry = (entryData: Omit<LedgerEntry, 'id' | 'status'>) => {
    const newEntry: LedgerEntry = {
      ...entryData,
      id: `led-${Date.now()}`,
      status: 'Posted',
    };
    setLedger((prev) => [newEntry, ...prev]);
    addAuditLog('Finance', 'Manual Ledger Journal Entry', newEntry.referenceNo, `${newEntry.type} $${newEntry.amount.toLocaleString()} - ${newEntry.description}`);
  };

  const createInvoice = (invData: Omit<Invoice, 'id' | 'taxAmount' | 'totalAmount'>) => {
    const taxAmount = Math.round(invData.subtotal * invData.taxRate * 100) / 100;
    const totalAmount = invData.subtotal + taxAmount;
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      taxAmount,
      totalAmount,
    };
    setInvoices((prev) => [newInv, ...prev]);
    addAuditLog('Finance', 'Created Accounts Receivable Invoice', newInv.invoiceNumber, `Billed ${newInv.customerName} for $${totalAmount.toLocaleString()}`);
  };

  const markInvoicePaid = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.status === 'Paid') return;

    const today = new Date().toISOString().slice(0, 10);
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: 'Paid', paidDate: today } : i))
    );

    // Post to General Ledger as Inflow
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: today,
      referenceNo: inv.invoiceNumber,
      description: `Payment received for ${inv.invoiceNumber} (${inv.customerName})`,
      accountCode: '4010',
      accountName: 'Product Sales Revenue',
      type: 'Inflow',
      category: 'Sales Revenue',
      amount: inv.totalAmount,
      moduleSource: 'Finance',
      status: 'Posted',
    };
    setLedger((prev) => [ledgerEntry, ...prev]);

    addAuditLog(
      'Finance',
      'Invoice Settled & Reconciled',
      inv.invoiceNumber,
      `Received $${inv.totalAmount.toLocaleString()} from ${inv.customerName}. Reconciled into Cash & Equivalents.`
    );
  };

  const createBill = (billData: Omit<VendorBill, 'id'>) => {
    const newBill: VendorBill = {
      ...billData,
      id: `bill-${Date.now()}`,
    };
    setBills((prev) => [newBill, ...prev]);
    addAuditLog('Finance', 'Vendor Bill Registered', newBill.billNumber, `Registered $${newBill.amount.toLocaleString()} from ${newBill.vendorName}`);
  };

  const payBill = (billId: string) => {
    const target = bills.find((b) => b.id === billId);
    if (!target || target.status === 'Paid') return;

    const today = new Date().toISOString().slice(0, 10);
    setBills((prev) => prev.map((b) => (b.id === billId ? { ...b, status: 'Paid' } : b)));

    // Post outflow ledger entry
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: today,
      referenceNo: target.billNumber,
      description: `Disbursed payment to vendor ${target.vendorName}`,
      accountCode: '2010',
      accountName: 'Accounts Payable Disbursement',
      type: 'Outflow',
      category: target.category,
      amount: target.amount,
      moduleSource: 'Procurement',
      status: 'Posted',
    };
    setLedger((prev) => [ledgerEntry, ...prev]);

    addAuditLog('Finance', 'Vendor Bill Disbursed', target.billNumber, `Paid $${target.amount.toLocaleString()} to ${target.vendorName}`);
  };

  // ----------------- HR METHODS -----------------
  const addEmployee = (empData: Omit<Employee, 'id' | 'ptoUsedDays'>) => {
    const id = `emp-${Date.now()}`;
    const newEmp: Employee = {
      ...empData,
      id,
      ptoUsedDays: 0,
    };
    setEmployees((prev) => [newEmp, ...prev]);
    addAuditLog('HR', 'New Employee Onboarded', newEmp.empId, `${newEmp.fullName} onboarded as ${newEmp.title} in ${newEmp.department}`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    addAuditLog('HR', 'Employee Record Updated', id, `Updated employee profile details`);
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id);
    if (!target) return;
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('HR', 'Employee Offboarded', target.empId, `Removed ${target.fullName} from directory`, 'warning');
  };

  // Cross-module: Disbursing HR Payroll
  const disbursePayrollRun = (runId: string) => {
    const run = payrollRuns.find((r) => r.id === runId);
    if (!run || run.status === 'Disbursed') return;

    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5);

    setPayrollRuns((prev) =>
      prev.map((r) => (r.id === runId ? { ...r, status: 'Disbursed', disbursedAt: `${today} ${nowTime}` } : r))
    );

    // Cross-module entry into Finance General Ledger
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: today,
      referenceNo: `PAY-${run.periodName.slice(0, 7)}`,
      description: `Disbursed ${run.periodName} across ${run.employeeCount} active team members`,
      accountCode: '6010',
      accountName: 'Payroll & Employee Compensation',
      type: 'Outflow',
      category: 'Payroll & Benefits',
      amount: run.totalGross,
      moduleSource: 'HR',
      status: 'Posted',
    };
    setLedger((prev) => [ledgerEntry, ...prev]);

    addAuditLog(
      'HR',
      'Payroll Disbursed & Posted to Ledger',
      run.id,
      `Disbursed gross $${run.totalGross.toLocaleString()} (Net $${run.totalNet.toLocaleString()}). Created Finance Ledger entry ${ledgerEntry.referenceNo}.`
    );
  };

  const createLeaveRequest = (reqData: Omit<LeaveRequest, 'id' | 'status' | 'requestedDate'>) => {
    const today = new Date().toISOString().slice(0, 10);
    const newReq: LeaveRequest = {
      ...reqData,
      id: `lvr-${Date.now()}`,
      status: 'Pending',
      requestedDate: today,
    };
    setLeaveRequests((prev) => [newReq, ...prev]);
    addAuditLog('HR', 'Leave Request Submitted', newReq.empId, `${newReq.employeeName} submitted ${newReq.totalDays}d ${newReq.leaveType}`);
  };

  const approveLeaveRequest = (requestId: string) => {
    const req = leaveRequests.find((r) => r.id === requestId);
    if (!req) return;

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Approved', approvedBy: currentPersona.name } : r))
    );

    // Update employee PTO balance
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.empId === req.empId) {
          return {
            ...e,
            ptoBalanceDays: Math.max(0, e.ptoBalanceDays - req.totalDays),
            ptoUsedDays: e.ptoUsedDays + req.totalDays,
          };
        }
        return e;
      })
    );

    addAuditLog('HR', 'Leave Request Approved', req.empId, `Approved ${req.totalDays} days ${req.leaveType} for ${req.employeeName}`);
  };

  const rejectLeaveRequest = (requestId: string) => {
    const req = leaveRequests.find((r) => r.id === requestId);
    if (!req) return;

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Rejected', approvedBy: currentPersona.name } : r))
    );

    addAuditLog('HR', 'Leave Request Declined', req.empId, `Declined ${req.leaveType} for ${req.employeeName}`, 'warning');
  };

  // ----------------- AGGREGATE FINANCIAL & OPERATIONAL CALCULATIONS -----------------
  // Filter by location if selected
  const filteredInventory = selectedLocation === 'ALL' 
    ? inventory 
    : inventory.filter(i => i.warehouseLocation === selectedLocation);

  const totalInventoryValuation = filteredInventory.reduce((acc, item) => acc + item.onHand * item.unitCost, 0);

  const totalRevenue = ledger
    .filter((l) => l.type === 'Inflow')
    .reduce((acc, l) => acc + l.amount, 0);

  const totalExpenses = ledger
    .filter((l) => l.type === 'Outflow')
    .reduce((acc, l) => acc + l.amount, 0);

  const netIncome = totalRevenue - totalExpenses;

  // Base capital balance $2,450,000 + inflows - outflows
  const cashOnHand = 2450000 + (totalRevenue - totalExpenses);

  const totalHeadcount = employees.filter((e) => e.status === 'Active' || e.status === 'On Leave').length;

  const monthlyPayrollTotal = employees
    .filter((e) => e.status === 'Active')
    .reduce((acc, e) => acc + e.monthlyPay, 0);

  const lowStockItemsCount = filteredInventory.filter(
    (i) => i.status === 'Low Stock' || i.status === 'Critical'
  ).length;

  const pendingLeaveCount = leaveRequests.filter((l) => l.status === 'Pending').length;

  const unpaidInvoicesTotal = invoices
    .filter((i) => i.status === 'Sent' || i.status === 'Overdue')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  // ----------------- BACKUP & RESTORE -----------------
  const resetToDemoData = () => {
    setInventory(INITIAL_INVENTORY);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setLedger(INITIAL_LEDGER);
    setInvoices(INITIAL_INVOICES);
    setBills(INITIAL_BILLS);
    setEmployees(INITIAL_EMPLOYEES);
    setPayrollRuns(INITIAL_PAYROLL_RUNS);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    addAuditLog('System', 'Enterprise Reset', 'SYSTEM-01', 'Restored complete ERP state to demo baseline', 'warning');
  };

  const exportStateToJson = () => {
    const fullState = {
      exportTimestamp: new Date().toISOString(),
      inventory,
      stockMovements,
      ledger,
      invoices,
      bills,
      employees,
      payrollRuns,
      leaveRequests,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vanguard_erp_cloud_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog('System', 'Cloud Backup Exported', 'BACKUP-01', 'Exported encrypted system JSON image');
  };

  const importStateFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.inventory && parsed.ledger && parsed.employees) {
        setInventory(parsed.inventory);
        if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
        setLedger(parsed.ledger);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.bills) setBills(parsed.bills);
        setEmployees(parsed.employees);
        if (parsed.payrollRuns) setPayrollRuns(parsed.payrollRuns);
        if (parsed.leaveRequests) setLeaveRequests(parsed.leaveRequests);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        addAuditLog('System', 'Cloud Backup Restored', 'RESTORE-01', 'Restored ERP state from external file');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <ErpContext.Provider
      value={{
        currentModule,
        setCurrentModule,
        currentPersona,
        setCurrentPersona,
        selectedLocation,
        setSelectedLocation,
        companyLocations,
        inventory: filteredInventory,
        stockMovements,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        receiveInventoryStock,
        fulfillSalesOrder,
        reorderLowStock,
        ledger,
        invoices,
        bills,
        createLedgerEntry,
        createInvoice,
        markInvoicePaid,
        createBill,
        payBill,
        employees,
        payrollRuns,
        leaveRequests,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        disbursePayrollRun,
        createLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        auditLogs,
        addAuditLog,
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
        resetToDemoData,
        exportStateToJson,
        importStateFromJson,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
