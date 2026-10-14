// Enterprise Resource Planning (ERP) Data Types

export type ERPModule = 'dashboard' | 'inventory' | 'finance' | 'hr' | 'audit' | 'settings';

export type UserRole = 
  | 'cfo' 
  | 'operations_director' 
  | 'hr_vp' 
  | 'financial_controller';

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  avatar: string;
  allowedModules: ERPModule[];
}

export interface CompanyLocation {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  isHQ: boolean;
}

// ----------------- INVENTORY TYPES -----------------
export type InventoryCategory = 
  | 'Hardware & Chips'
  | 'Optical Sensors'
  | 'Power Systems'
  | 'Networking'
  | 'Raw Materials'
  | 'Packaged Goods';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  warehouseLocation: string; // e.g. "WH-North America", "WH-Frankfurt", "WH-Singapore"
  onHand: number;
  reserved: number;
  reorderPoint: number;
  unitCost: number; // Cost of Goods
  sellingPrice: number;
  supplier: string;
  leadTimeDays: number;
  lastUpdated: string;
  status: 'In Stock' | 'Low Stock' | 'Critical';
}

export interface StockMovement {
  id: string;
  date: string;
  sku: string;
  itemName: string;
  type: 'Inbound PO' | 'Outbound Fulfillment' | 'Adjustment' | 'Transfer';
  quantity: number;
  warehouse: string;
  referenceNo: string;
  performedBy: string;
  unitCost: number;
  notes?: string;
}

// ----------------- FINANCE TYPES -----------------
export type TransactionType = 'Inflow' | 'Outflow';
export type ExpenseCategory = 
  | 'Sales Revenue'
  | 'Consulting Services'
  | 'Cost of Goods Sold (COGS)'
  | 'Payroll & Benefits'
  | 'Logistics & Warehousing'
  | 'Cloud Infrastructure & R&D'
  | 'Office & Facilities'
  | 'Tax & Regulatory';

export interface LedgerEntry {
  id: string;
  date: string;
  referenceNo: string;
  description: string;
  accountCode: string; // e.g. "1010", "4010", "6010"
  accountName: string;
  type: TransactionType;
  category: ExpenseCategory;
  amount: number;
  moduleSource: 'Inventory' | 'HR' | 'Finance' | 'Procurement';
  status: 'Posted' | 'Pending';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  items: {
    description: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxRate: number; // e.g. 0.08 for 8%
  taxAmount: number;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  paidDate?: string;
}

export interface VendorBill {
  id: string;
  billNumber: string;
  vendorName: string;
  category: ExpenseCategory;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'Pending Approval' | 'Approved' | 'Paid';
  relatedPoNumber?: string;
}

// ----------------- HR TYPES -----------------
export type Department = 
  | 'Executive'
  | 'Operations & Logistics'
  | 'Finance & Legal'
  | 'Engineering & Cloud'
  | 'People Operations'
  | 'Sales & Marketing';

export interface Employee {
  id: string;
  empId: string;
  fullName: string;
  email: string;
  phone: string;
  department: Department;
  title: string;
  employmentType: 'Full-time' | 'Contractor';
  salary: number; // Annual base
  monthlyPay: number;
  joinDate: string;
  location: string;
  manager: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  avatar?: string;
  ptoBalanceDays: number;
  ptoUsedDays: number;
}

export interface PayrollRun {
  id: string;
  periodName: string; // e.g. "October 2026 Cycle"
  runDate: string;
  payDate: string;
  totalGross: number;
  totalTax: number;
  totalBenefits: number;
  totalNet: number;
  employeeCount: number;
  status: 'Draft' | 'Approved' | 'Disbursed';
  disbursedAt?: string;
}

export interface LeaveRequest {
  id: string;
  empId: string;
  employeeName: string;
  department: Department;
  leaveType: 'Annual PTO' | 'Sick Leave' | 'Parental' | 'Unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedDate: string;
  approvedBy?: string;
}

// ----------------- AUDIT TRAIL -----------------
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  module: 'Inventory' | 'Finance' | 'HR' | 'System';
  action: string;
  entityId: string;
  performedBy: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}
