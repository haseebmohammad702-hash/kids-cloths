import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Download,
  AlertTriangle,
  FileCheck,
  Building,
  UserPlus,
  ShieldAlert
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Department, Employee, LeaveRequest, PayrollRun } from '../../types/erp';
import { Modal } from '../common/Modal';

export const HrModule: React.FC = () => {
  const { 
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
    currentPersona,
    companyLocations
  } = useErp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'directory' | 'payroll' | 'leave' | 'departments'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Modals
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [activePaySlip, setActivePaySlip] = useState<{ emp: Employee; run: PayrollRun } | null>(null);

  // Onboard form state
  const [onboardForm, setOnboardForm] = useState({
    empId: `EMP-${1000 + employees.length + 1}`,
    fullName: '',
    email: '',
    phone: '+1 (312) 555-0100',
    department: 'Engineering & Cloud' as Department,
    title: '',
    employmentType: 'Full-time' as const,
    salary: 120000,
    monthlyPay: 10000,
    joinDate: new Date().toISOString().slice(0, 10),
    location: 'Chicago HQ',
    manager: 'David Chen',
    status: 'Active' as const,
    ptoBalanceDays: 20,
  });

  // Leave Request Form State
  const [leaveForm, setLeaveForm] = useState({
    empId: employees[0]?.empId || '',
    employeeName: employees[0]?.fullName || '',
    department: employees[0]?.department || 'Executive',
    leaveType: 'Annual PTO' as const,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    totalDays: 5,
    reason: 'Planned annual rest and recharge',
  });

  const departments: Department[] = [
    'Executive',
    'Operations & Logistics',
    'Finance & Legal',
    'Engineering & Cloud',
    'People Operations',
    'Sales & Marketing',
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch = 
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || e.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.fullName || !onboardForm.title) return;
    const monthly = Math.round(onboardForm.salary / 12);
    addEmployee({
      ...onboardForm,
      monthlyPay: monthly,
    });
    setIsOnboardModalOpen(false);
    setOnboardForm({
      empId: `EMP-${1000 + employees.length + 2}`,
      fullName: '',
      email: '',
      phone: '+1 (312) 555-0100',
      department: 'Engineering & Cloud',
      title: '',
      employmentType: 'Full-time',
      salary: 120000,
      monthlyPay: 10000,
      joinDate: new Date().toISOString().slice(0, 10),
      location: 'Chicago HQ',
      manager: 'David Chen',
      status: 'Active',
      ptoBalanceDays: 20,
    });
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLeaveRequest(leaveForm);
    setIsLeaveModalOpen(false);
  };

  const activePayroll = payrollRuns[0];

  return (
    <div className="space-y-6">
      {/* Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Human Resources & Workforce Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global talent directory, automated compensation runs, PTO tracking, and organization structure.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'directory'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Employee Directory ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'payroll'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Payroll Runs ({payrollRuns.length})
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'leave'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Leave & PTO ({leaveRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'departments'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Org Departments
          </button>
        </div>
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <input
                type="text"
                placeholder="Search by name, role, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 min-w-[220px]"
              />

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Onboard Employee</span>
            </button>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start gap-3">
                    {emp.avatar ? (
                      <img
                        src={emp.avatar}
                        alt={emp.fullName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                        {emp.fullName.split(' ').map((n) => n[0]).join('')}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-cyan-400">{emp.empId}</span>
                        <span className={`text-[10px] font-semibold ${
                          emp.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {emp.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-sm truncate">{emp.fullName}</h4>
                      <p className="text-xs text-slate-300 truncate">{emp.title}</p>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{emp.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{emp.location} · {emp.employmentType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate text-slate-300">{emp.email}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Annual Salary</div>
                      <div className="font-mono tabular-nums font-semibold text-slate-200">
                        {formatCurrency(emp.salary)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">PTO Available</div>
                      <div className="font-mono tabular-nums font-semibold text-cyan-400">
                        {emp.ptoBalanceDays} Days
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-slate-400">Hired {emp.joinDate}</span>
                  <div className="flex items-center gap-2">
                    {activePayroll && (
                      <button
                        onClick={() => setActivePaySlip({ emp, run: activePayroll })}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Pay Slip
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Remove employee ${emp.fullName} from directory?`)) {
                          deleteEmployee(emp.id);
                        }
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payroll Runs Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Active Period Banner */}
          {activePayroll && (
            <div className="p-5 rounded-xl border border-cyan-800/60 bg-cyan-950/20 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
                    <span>Active Payroll Disbursement Cycle</span>
                    <span aria-hidden="true">·</span>
                    <span>Status: {activePayroll.status.toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{activePayroll.periodName}</h3>
                  <p className="text-xs text-slate-400">
                    Scheduled disbursement for {activePayroll.employeeCount} active personnel on {activePayroll.payDate}
                  </p>
                </div>

                {activePayroll.status === 'Draft' ? (
                  <button
                    onClick={() => disbursePayrollRun(activePayroll.id)}
                    className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Disburse to General Ledger</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono">
                    Disbursed on {activePayroll.disbursedAt}
                  </div>
                )}
              </div>

              {/* Payroll Numerical Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Gross Payroll</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {formatCurrency(activePayroll.totalGross)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Tax Withholding (20%)</div>
                  <div className="text-base font-bold font-mono text-slate-300 mt-0.5">
                    {formatCurrency(activePayroll.totalTax)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Benefits & Pension (8%)</div>
                  <div className="text-base font-bold font-mono text-slate-300 mt-0.5">
                    {formatCurrency(activePayroll.totalBenefits)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Net Employee Payout</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    {formatCurrency(activePayroll.totalNet)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payroll Run History */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Historical Payroll Runs</h4>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-medium bg-slate-950/50 text-[11px]">
                    <th className="py-2.5 px-4">Pay Period</th>
                    <th className="py-2.5 px-3">Run Date</th>
                    <th className="py-2.5 px-3">Disbursed Date</th>
                    <th className="py-2.5 px-3 text-right">Headcount</th>
                    <th className="py-2.5 px-3 text-right">Gross Total</th>
                    <th className="py-2.5 px-3 text-right">Net Payout</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {payrollRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">{run.periodName}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{run.runDate}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{run.disbursedAt || 'Pending'}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">{run.employeeCount} Staff</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-100">
                        {formatCurrency(run.totalGross)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-400">
                        {formatCurrency(run.totalNet)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[11px] font-medium ${
                          run.status === 'Disbursed' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leave & Attendance Tab */}
      {activeTab === 'leave' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">
              Manage annual PTO, sick leaves, and parental time off with balance adjustments.
            </span>

            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Leave Request</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 font-medium bg-slate-950/50 text-[11px]">
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3 text-right">Days</th>
                  <th className="py-2.5 px-3">Reason / Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-100">{req.employeeName}</td>
                    <td className="py-3 px-3 text-slate-400">{req.department}</td>
                    <td className="py-3 px-3 font-medium text-cyan-300">{req.leaveType}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-100">
                      {req.totalDays}d
                    </td>
                    <td className="py-3 px-3 text-slate-400 italic truncate max-w-xs">{req.reason}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-medium ${
                        req.status === 'Approved'
                          ? 'text-emerald-400'
                          : req.status === 'Rejected'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => approveLeaveRequest(req.id)}
                            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[11px] font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectLeaveRequest(req.id)}
                            className="px-2 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded text-[11px] transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Org Departments Tab */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const deptStaff = employees.filter((e) => e.department === dept);
            const deptPayroll = deptStaff.reduce((acc, e) => acc + e.monthlyPay, 0);
            return (
              <div
                key={dept}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h4 className="font-bold text-slate-100 text-sm">{dept}</h4>
                  <span className="font-mono text-xs text-cyan-400">{deptStaff.length} Staff</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Monthly Payroll Cost:</span>
                    <span className="font-mono text-slate-200">{formatCurrency(deptPayroll)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual Budget Run:</span>
                    <span className="font-mono text-slate-200">{formatCurrency(deptPayroll * 12)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400">Team Members:</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {deptStaff.map((s) => (
                      <span key={s.id} className="text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {s.fullName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onboard Employee Modal */}
      <Modal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        title="Onboard New Employee"
        subtitle="Register employee profile, compensation, and reporting structure."
        maxWidth="lg"
      >
        <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={onboardForm.fullName}
                onChange={(e) => setOnboardForm({ ...onboardForm, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Work Email</label>
              <input
                type="email"
                placeholder="s.jenkins@vanguard-erp.io"
                value={onboardForm.email}
                onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Firmware Architect"
                value={onboardForm.title}
                onChange={(e) => setOnboardForm({ ...onboardForm, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Department</label>
              <select
                value={onboardForm.department}
                onChange={(e) => setOnboardForm({ ...onboardForm, department: e.target.value as Department })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Annual Salary ($)</label>
              <input
                type="number"
                min="30000"
                value={onboardForm.salary}
                onChange={(e) => setOnboardForm({ ...onboardForm, salary: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Location Hub</label>
              <input
                type="text"
                value={onboardForm.location}
                onChange={(e) => setOnboardForm({ ...onboardForm, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">PTO Days Allotted</label>
              <input
                type="number"
                min="5"
                value={onboardForm.ptoBalanceDays}
                onChange={(e) => setOnboardForm({ ...onboardForm, ptoBalanceDays: parseInt(e.target.value) || 20 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOnboardModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
            >
              Complete Onboarding
            </button>
          </div>
        </form>
      </Modal>

      {/* Leave Request Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Submit Employee Leave Request"
        subtitle="Request time off for annual vacation, sick leave, or parental care."
        maxWidth="md"
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Employee</label>
            <select
              value={leaveForm.empId}
              onChange={(e) => {
                const target = employees.find(emp => emp.empId === e.target.value);
                if (target) {
                  setLeaveForm({
                    ...leaveForm,
                    empId: target.empId,
                    employeeName: target.fullName,
                    department: target.department,
                  });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.empId}>
                  {emp.fullName} ({emp.title}) · {emp.ptoBalanceDays}d PTO remaining
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Leave Category</label>
              <select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Annual PTO">Annual PTO</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Parental">Parental Leave</option>
                <option value="Unpaid">Unpaid Personal</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Total Days</label>
              <input
                type="number"
                min="1"
                value={leaveForm.totalDays}
                onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">End Date</label>
              <input
                type="date"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Reason / Destination</label>
            <input
              type="text"
              placeholder="e.g. Scheduled annual holiday"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Itemized Pay Slip Modal */}
      {activePaySlip && (
        <Modal
          isOpen={!!activePaySlip}
          onClose={() => setActivePaySlip(null)}
          title={`Pay Slip: ${activePaySlip.emp.fullName}`}
          subtitle={`Disbursement for ${activePaySlip.run.periodName}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-white text-sm">{activePaySlip.emp.fullName}</div>
                  <div className="text-slate-400 text-[11px]">{activePaySlip.emp.title} · {activePaySlip.emp.department}</div>
                </div>
                <div className="font-mono text-[11px] text-cyan-400">{activePaySlip.emp.empId}</div>
              </div>

              <div className="border-t border-slate-800/80 pt-3 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Monthly Base:</span>
                  <span className="font-mono">{formatCurrency(activePaySlip.emp.monthlyPay)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Federal & State Tax Withholding (20%):</span>
                  <span className="font-mono">-{formatCurrency(activePaySlip.emp.monthlyPay * 0.20)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Health, Dental & 401(k) Benefits (8%):</span>
                  <span className="font-mono">-{formatCurrency(activePaySlip.emp.monthlyPay * 0.08)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-emerald-400 text-sm">
                  <span>Net Payout Disbursed:</span>
                  <span className="font-mono">{formatCurrency(activePaySlip.emp.monthlyPay * 0.72)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActivePaySlip(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
