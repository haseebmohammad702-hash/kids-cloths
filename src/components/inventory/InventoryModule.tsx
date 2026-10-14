import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RefreshCw, 
  Download, 
  AlertCircle, 
  Edit2, 
  Trash2,
  Boxes,
  Truck,
  CheckCircle,
  Building
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { InventoryCategory, InventoryItem } from '../../types/erp';
import { Modal } from '../common/Modal';

export const InventoryModule: React.FC = () => {
  const { 
    inventory, 
    stockMovements, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem, 
    receiveInventoryStock, 
    fulfillSalesOrder, 
    reorderLowStock,
    currentPersona,
    companyLocations
  } = useErp();

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'master' | 'movements' | 'reorder'>('master');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  // Form State for Add Item
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    category: 'Hardware & Chips' as InventoryCategory,
    warehouseLocation: companyLocations[0]?.code || 'WH-North America',
    onHand: 100,
    reserved: 0,
    reorderPoint: 50,
    unitCost: 100,
    sellingPrice: 220,
    supplier: 'Kyocera SemiTech Ltd',
    leadTimeDays: 14,
  });

  // Receive Stock Form
  const [receiveForm, setReceiveForm] = useState({
    itemId: '',
    quantity: 50,
    poNumber: '',
    supplier: '',
    notes: '',
  });

  // Fulfill Stock Form
  const [fulfillForm, setFulfillForm] = useState({
    itemId: '',
    quantity: 10,
    soNumber: '',
    customer: '',
    unitPrice: 0,
  });

  // Filter items
  const filteredItems = inventory.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesWarehouse = selectedWarehouse === 'ALL' || item.warehouseLocation === selectedWarehouse;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
  });

  const categories: InventoryCategory[] = [
    'Hardware & Chips',
    'Optical Sensors',
    'Power Systems',
    'Networking',
    'Raw Materials',
    'Packaged Goods',
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCsv = () => {
    const headers = ['SKU', 'Name', 'Category', 'Warehouse', 'On Hand', 'Reserved', 'Reorder Point', 'Unit Cost', 'Selling Price', 'Total Valuation', 'Status'];
    const rows = filteredItems.map(i => [
      i.sku,
      `"${i.name}"`,
      i.category,
      i.warehouseLocation,
      i.onHand,
      i.reserved,
      i.reorderPoint,
      i.unitCost,
      i.sellingPrice,
      i.onHand * i.unitCost,
      i.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openReceiveModal = (item?: InventoryItem) => {
    const target = item || filteredItems[0];
    if (!target) return;
    setReceiveForm({
      itemId: target.id,
      quantity: target.reorderPoint,
      poNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: target.supplier,
      notes: 'Standard replenishment batch',
    });
    setIsReceiveModalOpen(true);
  };

  const openFulfillModal = (item?: InventoryItem) => {
    const target = item || filteredItems[0];
    if (!target) return;
    setFulfillForm({
      itemId: target.id,
      quantity: Math.min(5, target.onHand),
      soNumber: `SO-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: 'Hyperion Systems Inc',
      unitPrice: target.sellingPrice,
    });
    setIsFulfillModalOpen(true);
  };

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveForm.itemId || receiveForm.quantity <= 0) return;
    receiveInventoryStock(
      receiveForm.itemId,
      receiveForm.quantity,
      receiveForm.poNumber || `PO-${Date.now().toString().slice(-4)}`,
      receiveForm.supplier,
      receiveForm.notes
    );
    setIsReceiveModalOpen(false);
  };

  const handleFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillForm.itemId || fulfillForm.quantity <= 0) return;
    fulfillSalesOrder(
      fulfillForm.itemId,
      fulfillForm.quantity,
      fulfillForm.soNumber || `SO-${Date.now().toString().slice(-4)}`,
      fulfillForm.customer || 'Enterprise Customer',
      fulfillForm.unitPrice
    );
    setIsFulfillModalOpen(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.sku || !newItem.name) return;
    addInventoryItem(newItem);
    setIsAddModalOpen(false);
    setNewItem({
      sku: '',
      name: '',
      category: 'Hardware & Chips',
      warehouseLocation: companyLocations[0]?.code || 'WH-North America',
      onHand: 100,
      reserved: 0,
      reorderPoint: 50,
      unitCost: 100,
      sellingPrice: 220,
      supplier: 'Kyocera SemiTech Ltd',
      leadTimeDays: 14,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    updateInventoryItem(activeItem.id, activeItem);
    setIsEditModalOpen(false);
    setActiveItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <span>Inventory Master & Supply Chain</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock valuation, multi-hub warehouse control, and automated reconciliation with Financial Ledger.
          </p>
        </div>

        {/* Tab switcher (Interactive buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('master')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'master'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stock Master ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'movements'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Movement Ledger ({stockMovements.length})
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'reorder'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Low Stock Watchlist
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'master' && (
        <div className="space-y-4">
          {/* Action and Filter Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1 text-xs">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search SKU, item name, supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Warehouse Filter */}
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="ALL">All Warehouses</option>
                {companyLocations.map((loc) => (
                  <option key={loc.id} value={loc.code}>{loc.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-hidden focus:border-cyan-500"
              >
                <option value="ALL">All Health</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 text-xs shrink-0">
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Download CSV export"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => openReceiveModal()}
                className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Receive PO</span>
              </button>

              <button
                onClick={() => openFulfillModal()}
                className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ArrowUpFromLine className="w-3.5 h-3.5" />
                <span>Fulfill Order</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add SKU</span>
              </button>
            </div>
          </div>

          {/* Stock Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-medium bg-slate-950/50 text-[11px]">
                    <th className="py-2.5 px-4">SKU / Item Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Warehouse</th>
                    <th className="py-2.5 px-3 text-right">On Hand</th>
                    <th className="py-2.5 px-3 text-right">Available</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Selling Price</th>
                    <th className="py-2.5 px-3 text-right">Valuation</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No inventory items match the current search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const totalValuation = item.onHand * item.unitCost;
                      const available = Math.max(0, item.onHand - item.reserved);
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{item.name}</div>
                            <div className="font-mono text-[11px] text-cyan-400">{item.sku}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{item.category}</td>
                          <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{item.warehouseLocation}</td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-100">
                            {item.onHand}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                            {available}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                            {formatCurrency(item.unitCost)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                            {formatCurrency(item.sellingPrice)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-200">
                            {formatCurrency(totalValuation)}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`text-[11px] font-medium ${
                              item.status === 'Critical' 
                                ? 'text-rose-400' 
                                : item.status === 'Low Stock' 
                                ? 'text-amber-400' 
                                : 'text-emerald-400'
                            }`}>
                              {item.status}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">Min: {item.reorderPoint}</div>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openReceiveModal(item)}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                                title="Receive PO for this item"
                              >
                                <ArrowDownToLine className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openFulfillModal(item)}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                                title="Fulfill order for this item"
                              >
                                <ArrowUpFromLine className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveItem(item);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                                title="Edit SKU"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete SKU ${item.sku} from inventory?`)) {
                                    deleteInventoryItem(item.id);
                                  }
                                }}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Delete SKU"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Showing chronologically recorded inbound receipts, sales dispatches, and warehouse cycle counts.
            </span>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 font-medium bg-slate-950/50 text-[11px]">
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">SKU & Item Name</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3">Warehouse Hub</th>
                  <th className="py-2.5 px-3 font-mono">Reference #</th>
                  <th className="py-2.5 px-3">Logged By</th>
                  <th className="py-2.5 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {stockMovements.map((mov) => {
                  const isInbound = mov.quantity > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">{mov.date}</td>
                      <td className="py-2.5 px-3 font-medium">
                        <span className={isInbound ? 'text-emerald-400' : 'text-cyan-400'}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{mov.itemName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{mov.sku}</div>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold ${
                        isInbound ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {isInbound ? `+${mov.quantity}` : mov.quantity}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">{mov.warehouse}</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-400">{mov.referenceNo}</td>
                      <td className="py-2.5 px-3 text-slate-300">{mov.performedBy}</td>
                      <td className="py-2.5 px-4 text-slate-400 truncate max-w-xs">{mov.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reorder Watchlist Tab */}
      {activeTab === 'reorder' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Automated Safety Replenishment Engine</div>
                <div className="text-slate-400 mt-0.5">
                  Items below safety reorder threshold. Clicking reorder automatically generates a Purchase Order and accounts payable bill.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const lowItems = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical');
                lowItems.forEach(i => reorderLowStock(i.id, i.reorderPoint * 2));
              }}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition-colors shadow-xs"
            >
              Batch Reorder All Low Items
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory
              .filter((i) => i.status === 'Low Stock' || i.status === 'Critical')
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-cyan-400">{item.sku}</span>
                      <span className={`text-[11px] font-semibold ${
                        item.status === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-200 text-sm mt-1">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.supplier} · {item.leadTimeDays}d lead time</p>

                    <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Stock:</span>
                        <span className="font-mono font-bold text-rose-400">{item.onHand} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reorder Threshold:</span>
                        <span className="font-mono text-slate-300">{item.reorderPoint} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. Replenishment Cost:</span>
                        <span className="font-mono text-slate-200">{formatCurrency(item.unitCost * item.reorderPoint * 2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => reorderLowStock(item.id, item.reorderPoint * 2)}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Issue PO (+{item.reorderPoint * 2} units)</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add SKU Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Inventory SKU"
        subtitle="Create an item record in the central inventory catalog."
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">SKU Code</label>
              <input
                type="text"
                placeholder="e.g. SKU-SOC-102"
                value={newItem.sku}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Item Title</label>
              <input
                type="text"
                placeholder="Product description"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as InventoryCategory })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Warehouse Facility</label>
              <select
                value={newItem.warehouseLocation}
                onChange={(e) => setNewItem({ ...newItem, warehouseLocation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500"
              >
                {companyLocations.map((l) => (
                  <option key={l.id} value={l.code}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Initial On Hand</label>
              <input
                type="number"
                min="0"
                value={newItem.onHand}
                onChange={(e) => setNewItem({ ...newItem, onHand: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Reorder Point</label>
              <input
                type="number"
                min="1"
                value={newItem.reorderPoint}
                onChange={(e) => setNewItem({ ...newItem, reorderPoint: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                value={newItem.leadTimeDays}
                onChange={(e) => setNewItem({ ...newItem, leadTimeDays: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit Cost (COGS $)</label>
              <input
                type="number"
                min="1"
                value={newItem.unitCost}
                onChange={(e) => setNewItem({ ...newItem, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Selling Price ($)</label>
              <input
                type="number"
                min="1"
                value={newItem.sellingPrice}
                onChange={(e) => setNewItem({ ...newItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Primary Supplier</label>
            <input
              type="text"
              placeholder="Supplier or manufacturer"
              value={newItem.supplier}
              onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-cyan-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
            >
              Save SKU Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Receive Stock Modal */}
      <Modal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        title="Receive Inbound Purchase Order (PO)"
        subtitle="Increases on-hand stock and automatically creates an Accounts Payable invoice."
        maxWidth="md"
      >
        <form onSubmit={handleReceiveSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Item</label>
            <select
              value={receiveForm.itemId}
              onChange={(e) => {
                const target = inventory.find(i => i.id === e.target.value);
                setReceiveForm({
                  ...receiveForm,
                  itemId: e.target.value,
                  supplier: target?.supplier || '',
                });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              required
            >
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sku} — {i.name} (Current: {i.onHand})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Quantity Received</label>
              <input
                type="number"
                min="1"
                value={receiveForm.quantity}
                onChange={(e) => setReceiveForm({ ...receiveForm, quantity: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">PO Reference #</label>
              <input
                type="text"
                value={receiveForm.poNumber}
                onChange={(e) => setReceiveForm({ ...receiveForm, poNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Supplier Name</label>
            <input
              type="text"
              value={receiveForm.supplier}
              onChange={(e) => setReceiveForm({ ...receiveForm, supplier: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Notes / Bill of Lading</label>
            <input
              type="text"
              value={receiveForm.notes}
              onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
              placeholder="e.g. Received via carrier track #..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReceiveModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400"
            >
              Confirm Inbound Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Fulfill Sales Order Modal */}
      <Modal
        isOpen={isFulfillModalOpen}
        onClose={() => setIsFulfillModalOpen(false)}
        title="Fulfill Outbound Sales Order (SO)"
        subtitle="Decrements stock from warehouse and issues a receivable invoice to the client."
        maxWidth="md"
      >
        <form onSubmit={handleFulfillSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Item</label>
            <select
              value={fulfillForm.itemId}
              onChange={(e) => {
                const target = inventory.find(i => i.id === e.target.value);
                setFulfillForm({
                  ...fulfillForm,
                  itemId: e.target.value,
                  unitPrice: target?.sellingPrice || 0,
                });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              required
            >
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.sku} — {i.name} (Available: {i.onHand - i.reserved})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Dispatch Quantity</label>
              <input
                type="number"
                min="1"
                value={fulfillForm.quantity}
                onChange={(e) => setFulfillForm({ ...fulfillForm, quantity: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit Selling Price ($)</label>
              <input
                type="number"
                min="1"
                value={fulfillForm.unitPrice}
                onChange={(e) => setFulfillForm({ ...fulfillForm, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Sales Order #</label>
              <input
                type="text"
                value={fulfillForm.soNumber}
                onChange={(e) => setFulfillForm({ ...fulfillForm, soNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Customer Name</label>
              <input
                type="text"
                value={fulfillForm.customer}
                onChange={(e) => setFulfillForm({ ...fulfillForm, customer: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFulfillModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
            >
              Fulfill & Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit SKU Modal */}
      {activeItem && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit SKU: ${activeItem.sku}`}
          subtitle="Modify pricing, min safety levels, or warehouse assignment."
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Item Title</label>
              <input
                type="text"
                value={activeItem.name}
                onChange={(e) => setActiveItem({ ...activeItem, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">On Hand Stock</label>
                <input
                  type="number"
                  min="0"
                  value={activeItem.onHand}
                  onChange={(e) => setActiveItem({ ...activeItem, onHand: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Reorder Point</label>
                <input
                  type="number"
                  min="1"
                  value={activeItem.reorderPoint}
                  onChange={(e) => setActiveItem({ ...activeItem, reorderPoint: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Unit Cost ($)</label>
                <input
                  type="number"
                  value={activeItem.unitCost}
                  onChange={(e) => setActiveItem({ ...activeItem, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Selling Price ($)</label>
                <input
                  type="number"
                  value={activeItem.sellingPrice}
                  onChange={(e) => setActiveItem({ ...activeItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
