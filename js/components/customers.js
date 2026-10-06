/**
 * KC Bra / KCP&P Shop - Customer CRM & Purchase History Component
 */

const CustomersComponent = (() => {

    let searchQuery = '';

    function init() {
        render();
    }

    function render() {
        const container = document.getElementById('view-customers');
        if (!container) return;

        const customers = db.getCustomers();

        let filtered = customers;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(q) || 
                (c.phone && c.phone.includes(q)) ||
                (c.lineId && c.lineId.toLowerCase().includes(q)) ||
                (c.whatsapp && c.whatsapp.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q))
            );
        }

        container.innerHTML = `
            <!-- Top Header Bar -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div>
                    <h2 class="text-xl font-bold text-slate-100 font-serif">ฐานข้อมูลสมาชิกลูกค้า (Customer CRM)</h2>
                    <p class="text-xs text-slate-400 mt-0.5">จัดการประวัติการซื้อ ยอดสะสมรวม และช่องทางติดต่อ (Line, WhatsApp, เบอร์โทรศัพท์)</p>
                </div>

                <div class="flex items-center gap-2">
                    <button onclick="Exporter.exportCustomers(db.getCustomers())" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700">
                        <i data-lucide="download" class="w-4 h-4 text-rose-400"></i>
                        <span>Export Excel (.xlsx)</span>
                    </button>
                    <button onclick="CustomersComponent.openAddModal()" class="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center gap-1.5">
                        <i data-lucide="user-plus" class="w-4 h-4"></i>
                        <span>ลงทะเบียนสมาชิกใหม่</span>
                    </button>
                </div>
            </div>

            <!-- Search Bar -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative">
                <i data-lucide="search" class="w-4 h-4 absolute left-7 top-1/2 -translate-y-1/2 text-rose-400"></i>
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อลูกค้า, เบอร์โทรศัพท์, Line หรือ WhatsApp..." 
                    value="${searchQuery}"
                    oninput="CustomersComponent.setSearch(this.value)"
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
                >
            </div>

            <!-- Customer Table -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-300">
                        <thead class="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th class="p-4">ชื่อสมาชิก / ข้อมูลเพิ่มเติม</th>
                                <th class="p-4">เบอร์โทรศัพท์</th>
                                <th class="p-4">ช่องทาง Line / WhatsApp</th>
                                <th class="p-4 text-center">จำนวนครั้งที่ซื้อ</th>
                                <th class="p-4 text-right">ยอดซื้อสะสมรวม</th>
                                <th class="p-4 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 font-medium">
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="6" class="text-center py-16 text-slate-500">
                                        <i data-lucide="user-x" class="w-10 h-10 mx-auto mb-2 opacity-30 text-rose-400"></i>
                                        <p class="font-semibold text-slate-400">ยังไม่มีข้อมูลลูกค้าในระบบ กดปุ่ม "ลงทะเบียนสมาชิกใหม่" เพื่อเพิ่มลูกค้า</p>
                                    </td>
                                </tr>
                            ` : filtered.map(c => `
                                <tr class="hover:bg-slate-850/60 transition-colors">
                                    <td class="p-4 text-slate-100 font-bold whitespace-nowrap">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                                ${c.name.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <span class="text-sm">${c.name}</span>
                                                ${c.notes ? `<span class="block text-[10px] text-slate-400 font-normal truncate max-w-xs mt-0.5">${c.notes}</span>` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-4 font-mono text-slate-200 font-bold whitespace-nowrap">${c.phone || '-'}</td>
                                    <td class="p-4 whitespace-nowrap">
                                        <div class="flex flex-col text-[11px]">
                                            ${c.lineId ? `<span class="text-emerald-400 font-medium">Line: ${c.lineId}</span>` : ''}
                                            ${c.whatsapp ? `<span class="text-amber-400 font-medium">WhatsApp: ${c.whatsapp}</span>` : ''}
                                            ${!c.lineId && !c.whatsapp ? `<span class="text-slate-500">-</span>` : ''}
                                        </div>
                                    </td>
                                    <td class="p-4 text-center whitespace-nowrap font-mono font-extrabold text-slate-200">${c.purchaseCount || 0} บิล</td>
                                    <td class="p-4 text-right font-mono font-extrabold text-rose-400 text-sm whitespace-nowrap">${Utils.formatCurrency(c.totalSpent || 0)}</td>
                                    <td class="p-4 text-right whitespace-nowrap">
                                        <button onclick="CustomersComponent.openHistoryModal('${c.id}')" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 border border-slate-700">
                                            <i data-lucide="history" class="w-3.5 h-3.5 text-rose-400"></i>
                                            <span>ประวัติการสั่งซื้อ</span>
                                        </button>
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

    function setSearch(q) {
        searchQuery = q;
        render();
    }

    function openAddModal() {
        CustomerModal.open(() => render());
    }

    function openHistoryModal(customerId) {
        const customer = db.getCustomerById(customerId);
        if (!customer) return;

        const invoices = db.getInvoices().filter(inv => inv.customerId === customerId);

        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 flex flex-col gap-4 shadow-2xl relative max-h-[85vh]">
                    
                    <button onclick="document.getElementById('modal-container').innerHTML=''" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <div>
                        <span class="text-xs text-rose-400 font-extrabold tracking-widest uppercase">ประวัติการซื้อสมาชิก</span>
                        <h3 class="text-xl font-serif font-bold text-slate-100 mt-0.5">${customer.name}</h3>
                        <p class="text-xs text-slate-400 mt-0.5">เบอร์โทรศัพท์: <strong class="text-slate-200 font-mono">${customer.phone || '-'}</strong> &bull; ยอดซื้อสะสมรวม: <strong class="text-rose-300 font-mono text-sm">${Utils.formatCurrency(customer.totalSpent || 0)}</strong> (${invoices.length} บิล)</p>
                    </div>

                    <div class="overflow-y-auto max-h-[480px] flex flex-col gap-3 pr-1">
                        ${invoices.length === 0 ? `
                            <div class="text-center py-12 text-slate-500 bg-slate-950/60 border border-slate-800 rounded-2xl">
                                <i data-lucide="receipt" class="w-8 h-8 mx-auto mb-2 opacity-40 text-rose-400"></i>
                                <p class="text-xs font-semibold">ยังไม่มีประวัติการซื้อบิลสินค้าสำหรับลูกค้ารายนี้</p>
                            </div>
                        ` : invoices.map(inv => `
                            <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                                <div class="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                                    <div>
                                        <span class="font-mono font-extrabold text-rose-400 text-sm">${inv.id}</span>
                                        <span class="text-slate-400 ml-2 font-mono">&bull; ${inv.dateTime}</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-slate-400">ยอดสุทธิ:</span>
                                        <span class="font-mono font-extrabold text-slate-100 ml-1 text-sm">${Utils.formatCurrency(inv.grandTotal)}</span>
                                    </div>
                                </div>

                                <div class="flex flex-col gap-1.5 text-xs">
                                    ${inv.items.map(item => `
                                        <div class="flex items-center justify-between text-slate-300">
                                            <span class="font-medium">${item.productCode} - ${item.category} (สี${item.selectedColor})</span>
                                            <span class="font-mono text-slate-400">${item.quantity} ${item.unit} x ฿${item.customPrice} = <strong class="text-slate-100 font-bold">฿${item.customPrice * item.quantity * (item.unit === 'DOZ/โหล' ? 12 : 1)}</strong></span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="pt-2 text-right border-t border-slate-800">
                        <button onclick="document.getElementById('modal-container').innerHTML=''" class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all">
                            ปิดหน้าต่าง
                        </button>
                    </div>

                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    return {
        init,
        render,
        setSearch,
        openAddModal,
        openHistoryModal
    };
})();
