/**
 * KC Bra / KCP&P Shop - Reports & Invoice History Component
 * Full Financial Analytics & Retroactive Invoice Management (View, Edit & Delete)
 */

const ReportsComponent = (() => {

    let dateFilter = 'ALL';
    let currentEditInvoice = null;
    let editItems = [];

    function init() {
        render();
    }

    function render() {
        const container = document.getElementById('view-reports');
        if (!container) return;

        const invoices = db.getInvoices();

        let filtered = invoices;
        const todayStr = new Date().toISOString().split('T')[0];
        const currentMonthStr = todayStr.substring(0, 7);

        if (dateFilter === 'TODAY') {
            filtered = invoices.filter(inv => inv.dateTime.startsWith(todayStr));
        } else if (dateFilter === 'MONTH') {
            filtered = invoices.filter(inv => inv.dateTime.startsWith(currentMonthStr));
        }

        const totalSales = filtered.reduce((acc, inv) => acc + inv.grandTotal, 0);
        const totalDiscount = filtered.reduce((acc, inv) => acc + (inv.discount || 0), 0);
        const totalItemsSold = filtered.reduce((acc, inv) => acc + inv.items.reduce((sum, item) => sum + item.quantity, 0), 0);

        container.innerHTML = `
            <!-- Top Header -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div>
                    <h2 class="text-xl font-bold text-slate-100 font-serif">รายงานสรุปยอดขาย & จัดการบิลย้อนหลัง</h2>
                    <p class="text-xs text-slate-400 mt-0.5">ตรวจสอบประวัติยอดขาย ออกบิลซ้ำ ดูรายละเอียด แก้ไขบิลย้อนหลัง หรือลบบิล</p>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                    <!-- Date Filter Pills -->
                    <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                        <button onclick="ReportsComponent.setDateFilter('ALL')" class="px-3.5 py-1.5 rounded-lg transition-all ${dateFilter === 'ALL' ? 'bg-rose-500 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}">ทั้งหมด</button>
                        <button onclick="ReportsComponent.setDateFilter('TODAY')" class="px-3.5 py-1.5 rounded-lg transition-all ${dateFilter === 'TODAY' ? 'bg-rose-500 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}">วันนี้</button>
                        <button onclick="ReportsComponent.setDateFilter('MONTH')" class="px-3.5 py-1.5 rounded-lg transition-all ${dateFilter === 'MONTH' ? 'bg-rose-500 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}">เดือนนี้</button>
                    </div>

                    <button onclick="Exporter.exportInvoices(db.getInvoices())" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700">
                        <i data-lucide="download" class="w-4 h-4 text-rose-400"></i>
                        <span>Export Excel (.xlsx)</span>
                    </button>
                    
                    <button onclick="Exporter.exportToCSV('kc_bra_invoices', db.getInvoices())" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700">
                        <i data-lucide="file-text" class="w-4 h-4 text-amber-400"></i>
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            <!-- Summary KPI Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                    <span class="text-xs text-slate-400 font-semibold">รายได้รวมสุทธิ (Gross Revenue)</span>
                    <span class="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-200 mt-1">${Utils.formatCurrency(totalSales)}</span>
                    <span class="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                        <i data-lucide="trending-up" class="w-3 h-3"></i>
                        <span>จากทั้งหมด ${filtered.length} บิลสินค้า</span>
                    </span>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                    <span class="text-xs text-slate-400 font-semibold">จำนวนสินค้าที่ขายได้รวม</span>
                    <span class="text-2xl font-bold font-mono text-slate-100 mt-1">${totalItemsSold} ชิ้น</span>
                    <span class="text-[10px] text-slate-400 mt-2 font-medium">รวมทุกหมวดหมู่สินค้า KC Bra</span>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                    <span class="text-xs text-slate-400 font-semibold">ยอดส่วนลดที่ให้ลูกค้ารวม</span>
                    <span class="text-2xl font-bold font-mono text-rose-400 mt-1">${Utils.formatCurrency(totalDiscount)}</span>
                    <span class="text-[10px] text-slate-400 mt-2 font-medium">รวมส่วนลดต่อชิ้นและส่วนลดท้ายบิล</span>
                </div>
            </div>

            <!-- Invoices Table -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div class="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 class="text-sm font-bold text-slate-100 font-serif">ประวัติการออกบิลสินค้า (Sales Invoices Log)</h3>
                    <span class="text-xs text-slate-400 font-mono font-bold">${filtered.length} รายการ</span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-300">
                        <thead class="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th class="p-4">เลขที่บิล</th>
                                <th class="p-4">วัน-เวลา</th>
                                <th class="p-4">ชื่อลูกค้า</th>
                                <th class="p-4 text-center">จำนวนชิ้น</th>
                                <th class="p-4 text-right">ยอดรวมก่อนลด</th>
                                <th class="p-4 text-right">ส่วนลด</th>
                                <th class="p-4 text-right">ยอดสุทธิ</th>
                                <th class="p-4 text-center">ชำระโดย</th>
                                <th class="p-4 text-center">จัดการบิลย้อนหลัง</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 font-medium">
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="9" class="text-center py-12 text-slate-500">
                                        <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
                                        <p>ไม่พบรายการบิลสินค้าในช่วงเวลาที่เลือก</p>
                                    </td>
                                </tr>
                            ` : filtered.map(inv => `
                                <tr class="hover:bg-slate-850/60 transition-colors">
                                    <td class="p-4 font-mono text-rose-400 font-extrabold whitespace-nowrap">${inv.id}</td>
                                    <td class="p-4 text-slate-400 whitespace-nowrap font-mono">${inv.dateTime}</td>
                                    <td class="p-4 text-slate-100 font-bold whitespace-nowrap">${inv.customerName}</td>
                                    <td class="p-4 text-center font-mono font-bold whitespace-nowrap text-slate-300">${inv.itemsCount} ชิ้น</td>
                                    <td class="p-4 text-right font-mono text-slate-300 whitespace-nowrap">${Utils.formatCurrency(inv.subtotal)}</td>
                                    <td class="p-4 text-right font-mono text-rose-400 whitespace-nowrap">- ${Utils.formatCurrency(inv.discount)}</td>
                                    <td class="p-4 text-right font-mono font-extrabold text-slate-100 text-sm whitespace-nowrap">${Utils.formatCurrency(inv.grandTotal)}</td>
                                    <td class="p-4 text-center whitespace-nowrap">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                            ${inv.paymentMethod}
                                        </span>
                                    </td>
                                    <td class="p-4 text-center whitespace-nowrap">
                                        <div class="flex items-center justify-center gap-1.5">
                                            <button 
                                                onclick="ReportsComponent.viewInvoice('${inv.id}')"
                                                class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
                                                title="ดูบิล/พิมพ์บิลซ้ำ"
                                            >
                                                <i data-lucide="eye" class="w-3.5 h-3.5 text-rose-400"></i>
                                                <span>ดูบิล</span>
                                            </button>
                                            <button 
                                                onclick="ReportsComponent.openEditModal('${inv.id}')"
                                                class="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                                title="แก้ไขข้อมูลบิลย้อนหลัง"
                                            >
                                                <i data-lucide="edit-3" class="w-3.5 h-3.5 text-amber-400"></i>
                                                <span>แก้ไขบิล</span>
                                            </button>
                                            <button 
                                                onclick="ReportsComponent.confirmDeleteInvoice('${inv.id}')"
                                                class="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 rounded-lg text-xs transition-all"
                                                title="ลบบิล"
                                            >
                                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    function setDateFilter(filter) {
        dateFilter = filter;
        render();
    }

    function viewInvoice(invoiceId) {
        const inv = db.getInvoiceById(invoiceId);
        if (!inv) {
            Utils.showToast("ไม่พบบิลสินค้าที่ระบุ", "error");
            return;
        }
        if (window.POSComponent && typeof POSComponent.showReceiptModal === 'function') {
            POSComponent.showReceiptModal(inv);
        } else {
            Utils.showToast("ระบบพิมพ์บิลยังไม่พร้อมใช้งาน", "error");
        }
    }

    // Retroactive Invoice Edit Modal
    function openEditModal(invoiceId) {
        const inv = db.getInvoiceById(invoiceId);
        if (!inv) {
            Utils.showToast("ไม่พบข้อมูลบิลสินค้า!", "error");
            return;
        }

        currentEditInvoice = JSON.parse(JSON.stringify(inv));
        editItems = [...currentEditInvoice.items];

        renderEditModalHTML();
    }

    function renderEditModalHTML() {
        if (!currentEditInvoice) return;

        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const customers = db.getCustomers();

        // Calculate Subtotal & Grand Total for edit modal
        const subtotal = editItems.reduce((acc, item) => {
            const multiplier = item.unit === 'DOZ/โหล' ? 12 : 1;
            return acc + ((parseFloat(item.customPrice) || 0) * (parseInt(item.quantity) || 1) * multiplier);
        }, 0);

        const discount = Math.max(0, parseFloat(currentEditInvoice.discount) || 0);
        const deposit = Math.max(0, parseFloat(currentEditInvoice.deposit) || 0);
        const shippingFee = Math.max(0, parseFloat(currentEditInvoice.shippingFee) || 0);

        const netAfterDiscount = Math.max(0, subtotal - discount);
        const netAfterDeposit = Math.max(0, netAfterDiscount - deposit);
        const grandTotal = Math.max(0, netAfterDeposit + shippingFee);

        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 flex flex-col gap-4 shadow-2xl relative my-8">
                    
                    <button onclick="document.getElementById('modal-container').innerHTML=''" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">RETROACTIVE EDIT</span>
                            <span class="text-xs text-slate-400 font-mono">ID: ${currentEditInvoice.id}</span>
                        </div>
                        <h3 class="text-lg font-serif font-bold text-slate-100 mt-1">แก้ไขข้อมูลบิลสินค้าย้อนหลัง</h3>
                        <p class="text-xs text-slate-400">ปรับเปลี่ยนข้อมูลลูกค้า รายการสินค้า ราคา จำนวน และส่วนลด (ระบบจะอัปเดตสต็อกและยอดสะสมให้อัตโนมัติ)</p>
                    </div>

                    <form onsubmit="ReportsComponent.saveEditInvoice(event)" class="flex flex-col gap-4 text-xs">
                        
                        <!-- Top Metadata: Date, Customer, Payment Method -->
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">วัน-เวลา ออกบิล *</label>
                                <input 
                                    type="text" 
                                    id="edit-inv-datetime" 
                                    value="${currentEditInvoice.dateTime}" 
                                    required 
                                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                                >
                            </div>

                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">ลูกค้ารายบิล *</label>
                                <select 
                                    id="edit-inv-customer"
                                    onchange="ReportsComponent.updateEditCustomer(this.value)"
                                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 font-medium focus:outline-none focus:border-amber-500"
                                >
                                    <option value="walk-in" ${currentEditInvoice.customerId === 'walk-in' ? 'selected' : ''}>ลูกค้าหน้าร้านทั่วไป (Walk-in)</option>
                                    ${customers.map(c => `
                                        <option value="${c.id}" ${currentEditInvoice.customerId === c.id ? 'selected' : ''}>${c.name} ${c.phone ? '(' + c.phone + ')' : ''}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">ช่องทางชำระเงิน</label>
                                <select 
                                    id="edit-inv-payment"
                                    onchange="ReportsComponent.updateEditPayment(this.value)"
                                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 font-medium focus:outline-none focus:border-amber-500"
                                >
                                    <option value="Cash" ${currentEditInvoice.paymentMethod === 'Cash' ? 'selected' : ''}>Cash (เงินสด)</option>
                                    <option value="Transfer" ${currentEditInvoice.paymentMethod === 'Transfer' ? 'selected' : ''}>Transfer (โอนเงิน)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Bill Items Editor Table -->
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-slate-200">รายการสินค้าในบิล (${editItems.length} รายการ)</span>
                                <button type="button" onclick="ReportsComponent.openAddItemModal()" class="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1">
                                    <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                                    <span>+ เพิ่มสินค้าลงบิลนี้</span>
                                </button>
                            </div>

                            <div class="max-h-56 overflow-y-auto pr-1 flex flex-col gap-2">
                                ${editItems.length === 0 ? `
                                    <div class="text-center py-8 text-slate-500 bg-slate-950 border border-dashed border-slate-800 rounded-xl">
                                        <p>ไม่มีรายการสินค้าในบิล กดปุ่ม "+ เพิ่มสินค้าลงบิลนี้" เพื่อเพิ่ม</p>
                                    </div>
                                ` : editItems.map((item, idx) => {
                                    const multiplier = item.unit === 'DOZ/โหล' ? 12 : 1;
                                    const itemTotal = (parseFloat(item.customPrice) || 0) * (parseInt(item.quantity) || 1) * multiplier;
                                    const prod = db.getProductBySKU(item.productCode);
                                    let colorsList = prod ? ['คละสี', 'ไม่ระบุ', ...(prod.colors || []).filter(c => c !== 'คละสี' && c !== 'ไม่ระบุ')] : ['คละสี', 'ไม่ระบุ', item.selectedColor];
                                    if (!colorsList.includes(item.selectedColor)) colorsList.push(item.selectedColor);

                                    return `
                                        <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center gap-2">
                                                    <span class="font-mono font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">${item.productCode} - ${item.category}</span>
                                                    <select 
                                                        onchange="ReportsComponent.updateItemColor(${idx}, this.value)"
                                                        class="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-300 font-bold focus:outline-none"
                                                    >
                                                        ${colorsList.map(c => `
                                                            <option value="${c}" ${item.selectedColor === c ? 'selected' : ''}>${c === 'คละสี' ? '🎨 คละสี' : (c === 'ไม่ระบุ' ? '⚪ ไม่ระบุ' : 'สี' + c)}</option>
                                                        `).join('')}
                                                    </select>
                                                </div>

                                                <button type="button" onclick="ReportsComponent.removeEditItem(${idx})" class="text-slate-500 hover:text-rose-400 p-1">
                                                    <i data-lucide="trash" class="w-4 h-4"></i>
                                                </button>
                                            </div>

                                            <div class="grid grid-cols-12 items-center gap-2 pt-1 border-t border-slate-800/80">
                                                <div class="col-span-4 flex flex-col">
                                                    <span class="text-[9px] text-rose-400 uppercase font-bold">ราคาต่อหน่วย (฿)</span>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value="${item.customPrice}"
                                                        oninput="ReportsComponent.updateItemPrice(${idx}, this.value)"
                                                        class="w-full bg-slate-900 border border-rose-500/50 rounded px-2 py-1 text-xs font-mono font-extrabold text-rose-300 focus:outline-none focus:border-rose-500"
                                                    >
                                                </div>

                                                <div class="col-span-3 flex flex-col items-center">
                                                    <span class="text-[9px] text-slate-400 uppercase font-semibold mb-0.5">จำนวน</span>
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        value="${item.quantity}"
                                                        oninput="ReportsComponent.updateItemQty(${idx}, this.value)"
                                                        class="w-full text-center bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-100 focus:outline-none"
                                                    >
                                                </div>

                                                <div class="col-span-2 flex flex-col">
                                                    <span class="text-[9px] text-slate-400 uppercase font-semibold">หน่วย</span>
                                                    <select 
                                                        onchange="ReportsComponent.updateItemUnit(${idx}, this.value)"
                                                        class="bg-slate-900 border border-slate-700 rounded px-1 py-1 text-[10px] text-slate-200 font-bold focus:outline-none"
                                                    >
                                                        <option value="PCS/ตัว" ${item.unit === 'PCS/ตัว' ? 'selected' : ''}>PCS/ตัว</option>
                                                        <option value="DOZ/โหล" ${item.unit === 'DOZ/โหล' ? 'selected' : ''}>DOZ/โหล</option>
                                                    </select>
                                                </div>

                                                <div class="col-span-3 text-right">
                                                    <span class="text-[9px] text-slate-400 uppercase font-semibold block">รวม</span>
                                                    <span class="font-mono font-bold text-slate-100 text-xs">${Utils.formatCurrency(itemTotal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Totals Adjustments -->
                        <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
                            <div class="grid grid-cols-3 gap-3">
                                <div>
                                    <label class="block font-semibold text-slate-400 mb-1">ส่วนลดพิเศษ (฿)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value="${currentEditInvoice.discount || 0}"
                                        oninput="ReportsComponent.updateEditDiscount(this.value)"
                                        class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-rose-300 font-mono font-bold focus:outline-none focus:border-rose-500"
                                    >
                                </div>
                                <div>
                                    <label class="block font-semibold text-amber-300 mb-1">เงินมัดจำ (฿)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value="${currentEditInvoice.deposit || 0}"
                                        oninput="ReportsComponent.updateEditDeposit(this.value)"
                                        class="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                                    >
                                </div>
                                <div>
                                    <label class="block font-semibold text-emerald-300 mb-1">ค่าจัดส่ง (฿)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value="${currentEditInvoice.shippingFee || 0}"
                                        oninput="ReportsComponent.updateEditShipping(this.value)"
                                        class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                                    >
                                </div>
                            </div>

                            <div class="flex items-baseline justify-between pt-2 border-t border-slate-800 text-sm">
                                <span class="font-bold text-slate-300">ยอดรวมสุทธิหลังแก้ไข (Grand Total):</span>
                                <span class="font-mono text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-200">${Utils.formatCurrency(grandTotal)}</span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
                            <button type="submit" class="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-950/50">
                                บันทึกการแก้ไขบิลย้อนหลัง (Save Invoice Changes)
                            </button>
                            <button type="button" onclick="document.getElementById('modal-container').innerHTML=''" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all">
                                ยกเลิก
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    function updateEditCustomer(custId) {
        if (!currentEditInvoice) return;
        const customer = custId === 'walk-in' ? null : db.getCustomerById(custId);
        currentEditInvoice.customerId = custId;
        currentEditInvoice.customerName = customer ? customer.name : 'ลูกค้าหน้าร้านทั่วไป';
    }

    function updateEditPayment(method) {
        if (!currentEditInvoice) return;
        currentEditInvoice.paymentMethod = method;
    }

    function updateItemPrice(idx, val) {
        if (editItems[idx]) {
            editItems[idx].customPrice = Math.max(0, parseFloat(val) || 0);
            renderEditModalHTML();
        }
    }

    function updateItemQty(idx, val) {
        if (editItems[idx]) {
            editItems[idx].quantity = Math.max(1, parseInt(val) || 1);
            renderEditModalHTML();
        }
    }

    function updateItemUnit(idx, unit) {
        if (editItems[idx]) {
            editItems[idx].unit = unit;
            renderEditModalHTML();
        }
    }

    function updateItemColor(idx, col) {
        if (editItems[idx]) {
            editItems[idx].selectedColor = col;
            renderEditModalHTML();
        }
    }

    function removeEditItem(idx) {
        editItems.splice(idx, 1);
        renderEditModalHTML();
    }

    function updateEditDiscount(val) {
        if (!currentEditInvoice) return;
        currentEditInvoice.discount = Math.max(0, parseFloat(val) || 0);
        renderEditModalHTML();
    }

    function updateEditDeposit(val) {
        if (!currentEditInvoice) return;
        currentEditInvoice.deposit = Math.max(0, parseFloat(val) || 0);
        renderEditModalHTML();
    }

    function updateEditShipping(val) {
        if (!currentEditInvoice) return;
        currentEditInvoice.shippingFee = Math.max(0, parseFloat(val) || 0);
        renderEditModalHTML();
    }

    function openAddItemModal() {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const products = db.getProducts();

        const addModalHTML = `
            <div id="add-item-modal-sub" class="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 flex flex-col gap-4 shadow-2xl relative">
                    <button onclick="document.getElementById('add-item-modal-sub').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <h3 class="text-base font-bold text-slate-100">เลือกสินค้าเพิ่มในบิล</h3>

                    <div class="max-h-64 overflow-y-auto flex flex-col gap-2">
                        ${products.map(p => `
                            <button 
                                onclick="ReportsComponent.confirmAddItemToEdit('${p.id}')"
                                class="w-full bg-slate-950 hover:bg-rose-950/40 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs transition-all text-left"
                            >
                                <div>
                                    <span class="font-mono font-extrabold text-rose-400 block">${p.sku}</span>
                                    <span class="text-slate-300 font-semibold">${p.category} (ไซส์ ${p.size})</span>
                                </div>
                                <span class="font-mono font-bold text-amber-300">฿${p.standardPrice}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = addModalHTML;
        document.body.appendChild(div.firstElementChild);
        if (window.lucide) lucide.createIcons();
    }

    function confirmAddItemToEdit(productId) {
        const prod = db.getProductById(productId);
        if (!prod) return;

        editItems.push({
            productId: prod.id,
            productCode: prod.sku,
            productName: prod.name,
            category: prod.category,
            selectedColor: 'คละสี',
            customPrice: prod.standardPrice,
            quantity: 1,
            unit: 'PCS/ตัว',
            note: ''
        });

        const modal = document.getElementById('add-item-modal-sub');
        if (modal) modal.remove();

        renderEditModalHTML();
    }

    function saveEditInvoice(e) {
        e.preventDefault();
        if (!currentEditInvoice) return;

        if (editItems.length === 0) {
            Utils.showToast("บิลสินค้าต้องมีรายการสินค้าอย่างน้อย 1 รายการ!", "error");
            return;
        }

        const dateTimeVal = document.getElementById('edit-inv-datetime').value.trim();

        const subtotal = editItems.reduce((acc, item) => {
            const multiplier = item.unit === 'DOZ/โหล' ? 12 : 1;
            return acc + (item.customPrice * item.quantity * multiplier);
        }, 0);

        const discount = Math.max(0, parseFloat(currentEditInvoice.discount) || 0);
        const deposit = Math.max(0, parseFloat(currentEditInvoice.deposit) || 0);
        const shippingFee = Math.max(0, parseFloat(currentEditInvoice.shippingFee) || 0);

        const netAfterDiscount = Math.max(0, subtotal - discount);
        const netAfterDeposit = Math.max(0, netAfterDiscount - deposit);
        const grandTotal = Math.max(0, netAfterDeposit + shippingFee);

        const updatedData = {
            dateTime: dateTimeVal,
            customerId: currentEditInvoice.customerId,
            customerName: currentEditInvoice.customerName,
            paymentMethod: currentEditInvoice.paymentMethod,
            subtotal: subtotal,
            discount: discount,
            deposit: deposit,
            shippingFee: shippingFee,
            grandTotal: grandTotal,
            items: editItems
        };

        db.updateInvoice(currentEditInvoice.id, updatedData);
        Utils.showToast(`บันทึกการแก้ไขบิล ${currentEditInvoice.id} สำเร็จ! อัปเดตสต็อกเรียบร้อยแล้ว`);

        document.getElementById('modal-container').innerHTML = '';
        currentEditInvoice = null;
        editItems = [];

        render();
        if (window.ProductsComponent) ProductsComponent.render();
        if (window.CustomersComponent) CustomersComponent.render();
    }

    function confirmDeleteInvoice(invoiceId) {
        const inv = db.getInvoiceById(invoiceId);
        if (!inv) return;

        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 flex flex-col gap-4 shadow-2xl relative">
                    <button onclick="document.getElementById('modal-container').innerHTML=''" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <div class="text-center pt-2">
                        <div class="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center mx-auto mb-3 text-rose-400">
                            <i data-lucide="alert-triangle" class="w-6 h-6"></i>
                        </div>
                        <h3 class="text-base font-bold text-slate-100">ยืนยันลบบิลสินค้า ${inv.id}?</h3>
                        <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                            ระบบจะยกเลิกยอดขายบิลนี้ และ<strong>คืนจำนวนสต็อกสินค้าตามสี</strong>กลับเข้าคลังอัตโนมัติ
                        </p>
                    </div>

                    <div class="flex items-center gap-2 pt-2">
                        <button onclick="ReportsComponent.executeDeleteInvoice('${inv.id}')" class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-rose-950/50">
                            ยืนยันลบบิล
                        </button>
                        <button onclick="document.getElementById('modal-container').innerHTML=''" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all">
                            ยกเลิก
                        </button>
                    </div>

                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    function executeDeleteInvoice(invoiceId) {
        db.deleteInvoice(invoiceId);
        Utils.showToast(`ลบบิลสินค้า ${invoiceId} และคืนสต็อกเรียบร้อยแล้ว`);
        document.getElementById('modal-container').innerHTML = '';
        render();
        if (window.ProductsComponent) ProductsComponent.render();
        if (window.CustomersComponent) CustomersComponent.render();
    }

    return {
        init,
        render,
        setDateFilter,
        viewInvoice,
        openEditModal,
        updateEditCustomer,
        updateEditPayment,
        updateItemPrice,
        updateItemQty,
        updateItemUnit,
        updateItemColor,
        removeEditItem,
        updateEditDiscount,
        updateEditDeposit,
        updateEditShipping,
        openAddItemModal,
        confirmAddItemToEdit,
        saveEditInvoice,
        confirmDeleteInvoice,
        executeDeleteInvoice
    };
})();
