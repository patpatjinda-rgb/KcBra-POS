/**
 * KC Bra - Executive Dashboard & Analytics Component
 */

const DashboardComponent = (() => {

    let chartInstance = null;
    let pieChartInstance = null;

    function init() {
        render();
    }

    function render() {
        const container = document.getElementById('view-dashboard');
        if (!container) return;

        const products = db.getProducts();
        const invoices = db.getInvoices();
        const customers = db.getCustomers();

        // Calculations
        const totalSales = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
        const lowStockProducts = products.filter(p => p.currentStock <= p.minStockAlert);
        const outOfStockProducts = products.filter(p => p.currentStock === 0);

        container.innerHTML = `
            <!-- Top Metric Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                    <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
                        <span>ยอดขายรวมทั้งหมด</span>
                        <div class="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                            <i data-lucide="dollar-sign" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="mt-2">
                        <span class="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-200">${Utils.formatCurrency(totalSales)}</span>
                        <span class="text-[10px] text-slate-400 block mt-0.5">ยอดรวมบิลสินค้าที่ยืนยันแล้ว</span>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                    <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
                        <span>จำนวน SKUs ในระบบ</span>
                        <div class="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                            <i data-lucide="package" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="mt-2">
                        <span class="text-2xl font-bold font-mono text-slate-100">${products.length.toLocaleString()} SKUs</span>
                        <span class="text-[10px] text-emerald-400 block mt-0.5">รวมรหัสสินค้าจริงจากแคตตาล็อก KC Bra</span>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
                    <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
                        <span>สมาชิกลูกค้าในระบบ</span>
                        <div class="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                            <i data-lucide="users" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="mt-2">
                        <span class="text-2xl font-bold font-mono text-slate-100">${customers.length} คน</span>
                        <span class="text-[10px] text-slate-400 block mt-0.5">ฐานข้อมูลประวัติการซื้อ CRM</span>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl ${lowStockProducts.length > 0 ? 'border-rose-500/40 bg-rose-950/20' : ''}">
                    <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
                        <span>แจ้งเตือนสต็อกใกล้หมด</span>
                        <div class="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                            <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                        </div>
                    </div>
                    <div class="mt-2">
                        <span class="text-2xl font-bold font-mono text-rose-400">${lowStockProducts.length} SKUs</span>
                        <span class="text-[10px] text-rose-300 block mt-0.5">${outOfStockProducts.length} รายการสต็อกหมดชั่วคราว</span>
                    </div>
                </div>

            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <!-- Revenue Trend Chart -->
                <div class="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                    <div>
                        <h3 class="text-sm font-bold text-slate-100 font-serif">แนวโน้มรายได้การขาย (Revenue Trend)</h3>
                        <p class="text-xs text-slate-400">กราฟแสดงยอดขายตามบิลย้อนหลังล่าสุด</p>
                    </div>
                    <div class="h-64 relative w-full">
                        <canvas id="chart-revenue-trend"></canvas>
                    </div>
                </div>

                <!-- Sales Category Breakdown Pie -->
                <div class="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                    <div>
                        <h3 class="text-sm font-bold text-slate-100 font-serif">สัดส่วนยอดขายตามหมวดหมู่</h3>
                        <p class="text-xs text-slate-400">จำแนกตามประเภทสินค้า KC Bra</p>
                    </div>
                    <div class="h-64 relative w-full flex items-center justify-center">
                        <canvas id="chart-category-breakdown"></canvas>
                    </div>
                </div>

            </div>

            <!-- Low Stock Alerts Table with 1-Click Restock -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div class="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i data-lucide="alert-circle" class="w-4 h-4 text-rose-400"></i>
                        <h3 class="text-sm font-bold text-slate-100">รายการสินค้าสต็อกใกล้หมด (น้อยกว่า 10 ชิ้น)</h3>
                    </div>
                    <button onclick="app.switchTab('products')" class="text-xs text-rose-400 hover:underline font-semibold">ดูรายการ SKU ทั้งหมด &rarr;</button>
                </div>

                <div class="overflow-x-auto max-h-80">
                    <table class="w-full text-left text-xs text-slate-300">
                        <thead class="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px] sticky top-0">
                            <tr>
                                <th class="p-3.5">รหัสสินค้า (SKU)</th>
                                <th class="p-3.5">ชื่อสินค้า</th>
                                <th class="p-3.5">หมวดหมู่</th>
                                <th class="p-3.5 text-center">คงเหลือปัจจุบัน</th>
                                <th class="p-3.5 text-right">เติมสต็อกด่วน</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 font-medium">
                            ${lowStockProducts.length === 0 ? `
                                <tr>
                                    <td colspan="5" class="text-center py-8 text-slate-500">
                                        <p class="text-emerald-400 font-semibold">สต็อกสินค้าทุกรายการสมบูรณ์ดี</p>
                                    </td>
                                </tr>
                            ` : lowStockProducts.slice(0, 10).map(p => `
                                <tr class="hover:bg-slate-850/60 transition-colors">
                                    <td class="p-3.5 font-mono text-rose-400 font-extrabold">${p.sku}</td>
                                    <td class="p-3.5 text-slate-100 font-semibold">${p.name}</td>
                                    <td class="p-3.5">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${Utils.getCategoryBadgeClass(p.category)}">${p.category}</span>
                                    </td>
                                    <td class="p-3.5 text-center font-mono font-extrabold text-rose-400 text-sm">
                                        ${p.currentStock} ชิ้น
                                    </td>
                                    <td class="p-3.5 text-right">
                                        <button onclick="DashboardComponent.restockItem('${p.id}', 30)" class="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all">
                                            + เติม 30 ชิ้น
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

        setTimeout(() => renderCharts(invoices, products), 50);
    }

    function renderCharts(invoices, products) {
        if (!window.Chart) return;

        const trendCanvas = document.getElementById('chart-revenue-trend');
        if (trendCanvas) {
            const ctx = trendCanvas.getContext('2d');
            if (chartInstance) chartInstance.destroy();

            const labels = invoices.map(inv => inv.id).reverse();
            const dataValues = invoices.map(inv => inv.grandTotal).reverse();

            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.length ? labels : ['No Data'],
                    datasets: [{
                        label: 'ยอดขาย (บาท)',
                        data: dataValues.length ? dataValues : [0],
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244, 63, 94, 0.15)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#f43f5e'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        const pieCanvas = document.getElementById('chart-category-breakdown');
        if (pieCanvas) {
            const ctxPie = pieCanvas.getContext('2d');
            if (pieChartInstance) pieChartInstance.destroy();

            const catCounts = {};

            invoices.forEach(inv => {
                inv.items.forEach(item => {
                    catCounts[item.category] = (catCounts[item.category] || 0) + item.subtotal;
                });
            });

            pieChartInstance = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(catCounts).length ? Object.keys(catCounts) : ['เสื้อในมีโครง', 'เสื้อในไร้โครง', 'เสื้อในไร้ขอบ', 'กางเกงใน'],
                    datasets: [{
                        data: Object.values(catCounts).length ? Object.values(catCounts) : [12000, 8500, 6400, 3200],
                        backgroundColor: [
                            '#f43f5e',
                            '#ec4899',
                            '#a855f7',
                            '#f59e0b',
                            '#10b981'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
                    }
                }
            });
        }
    }

    function restockItem(id, count) {
        const p = db.getProductById(id);
        if (p) {
            db.updateStockInline(id, p.currentStock + count);
            Utils.showToast(`เติมสต็อก ${count} ชิ้น สำหรับ ${p.sku} เรียบร้อยแล้ว`);
            render();
        }
    }

    return {
        init,
        render,
        restockItem
    };
})();
