/**
 * KC Bra / KCP&P Shop - Product Catalog & Color Stock Audit Component
 */

const ProductsComponent = (() => {

    let searchQuery = '';
    let categoryFilter = 'ALL';
    let stockFilter = 'ALL';
    let currentPage = 1;
    let itemsPerPage = 25;

    function init() {
        render();
    }

    function render() {
        const container = document.getElementById('view-products');
        if (!container) return;

        const allProducts = db.getProducts();

        // 1. Filter logic
        let filtered = allProducts;
        if (categoryFilter !== 'ALL') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }
        if (stockFilter === 'LOW') {
            filtered = filtered.filter(p => db.getTotalStock(p) <= p.minStockAlert && db.getTotalStock(p) > 0);
        } else if (stockFilter === 'OUT') {
            filtered = filtered.filter(p => db.getTotalStock(p) === 0);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(p => 
                p.sku.toLowerCase().includes(q) || 
                p.name.toLowerCase().includes(q) ||
                p.size.toLowerCase().includes(q) ||
                (p.colors && p.colors.join(' ').toLowerCase().includes(q))
            );
        }

        // 2. Pagination calculation
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

        const categoryOptions = [
            'ALL', 'Bra', 'Panty', 'Shapewear Control', 'Inner Bra Tops', 'Bottom-Hip Push up'
        ];

        container.innerHTML = `
            <!-- Header Bar -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-xl font-bold text-slate-100 font-serif">คลังสินค้า & สต็อกแยกตามสี (KC Bra / KCP&P Shop Catalog)</h2>
                        <span class="text-xs bg-rose-500/10 text-rose-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-rose-500/20">
                            ${allProducts.length.toLocaleString()} SKUs
                        </span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">คุณสามารถพิมพ์กรอกจำนวนสต็อกคงเหลือแยกตามแต่ละสีของสินค้าได้เองในตารางด้านล่าง</p>
                </div>

                <!-- Export & Import Controls -->
                <div class="flex items-center gap-2 flex-wrap">
                    <button onclick="Exporter.exportProducts(db.getProducts())" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700">
                        <i data-lucide="download" class="w-4 h-4 text-rose-400"></i>
                        <span>Export Excel (.xlsx)</span>
                    </button>
                    
                    <button onclick="ProductsComponent.openAddModal()" class="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center gap-1.5">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i>
                        <span>เพิ่ม SKU สินค้าใหม่</span>
                    </button>
                </div>
            </div>

            <!-- Search Bar & Category Filters -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                
                <!-- Search Input -->
                <div class="sm:col-span-5 relative">
                    <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400"></i>
                    <input 
                        type="text" 
                        placeholder="พิมพ์ค้นหารหัส SKU (เช่น No. 0777), สี หรือไซส์..." 
                        value="${searchQuery}"
                        oninput="ProductsComponent.setSearch(this.value)"
                        class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
                    >
                </div>

                <!-- Category Filter (5 Categories strictly!) -->
                <div class="sm:col-span-4">
                    <select onchange="ProductsComponent.setCategoryFilter(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-rose-500">
                        ${categoryOptions.map(cat => `
                            <option value="${cat}" ${categoryFilter === cat ? 'selected' : ''}>
                                ${cat === 'ALL' ? 'หมวดหมู่ทั้งหมด (5 ประเภท)' : cat}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Stock Level Filter -->
                <div class="sm:col-span-3">
                    <select onchange="ProductsComponent.setStockFilter(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-rose-500">
                        <option value="ALL" ${stockFilter === 'ALL' ? 'selected' : ''}>สถานะสต็อกทั้งหมด</option>
                        <option value="LOW" ${stockFilter === 'LOW' ? 'selected' : ''}>สต็อกใกล้หมด (≤ 10 ชิ้น)</option>
                        <option value="OUT" ${stockFilter === 'OUT' ? 'selected' : ''}>สต็อกหมดชั่วคราว (0 ชิ้น)</option>
                    </select>
                </div>

            </div>

            <!-- Product Data Table with Color Variant Stock Audit Inputs -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-300">
                        <thead class="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th class="p-4">รหัสสินค้า (SKU)</th>
                                <th class="p-4">ชื่อประเภทสินค้า</th>
                                <th class="p-4">ไซส์ (Size)</th>
                                <th class="p-4 text-right">ราคาขายมาตรฐาน</th>
                                <th class="p-4 text-center">สต็อกระบุแยกตามสี (กรอกจำนวนได้เอง)</th>
                                <th class="p-4 text-center">สต็อกรวม</th>
                                <th class="p-4 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 font-medium">
                            ${pageItems.length === 0 ? `
                                <tr>
                                    <td colspan="7" class="text-center py-16 text-slate-500">
                                        <i data-lucide="package-x" class="w-10 h-10 mx-auto mb-2 opacity-30 text-rose-400"></i>
                                        <p class="font-semibold text-slate-400">ไม่พบรายการสินค้าตรงตามตัวกรอง</p>
                                    </td>
                                </tr>
                            ` : pageItems.map(p => {
                                const totalStockCount = db.getTotalStock(p);
                                return `
                                    <tr class="hover:bg-slate-850/70 transition-colors">
                                        <td class="p-4 font-mono text-rose-400 font-extrabold text-sm whitespace-nowrap">${p.sku}</td>
                                        <!-- CRUCIAL RULE: Product Name = Category Name -->
                                        <td class="p-4 text-slate-100 font-bold whitespace-nowrap">
                                            <span class="px-2.5 py-1 rounded-lg border text-xs ${Utils.getCategoryBadgeClass(p.category)}">${p.name}</span>
                                        </td>
                                        <td class="p-4 text-slate-300 font-medium whitespace-nowrap max-w-xs truncate">${p.size}</td>
                                        <td class="p-4 text-right font-mono font-extrabold text-slate-100 text-sm whitespace-nowrap">${Utils.formatCurrency(p.standardPrice)}</td>
                                        
                                        <!-- Color Stock Direct Audit Inputs -->
                                        <td class="p-4">
                                            <div class="flex flex-wrap items-center justify-center gap-2">
                                                ${(p.colors || ['ดำ', 'เนื้อ']).map(colorName => {
                                                    const currentVal = p.colorStock ? (p.colorStock[colorName] || 0) : 0;
                                                    return `
                                                        <div class="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                                                            <span class="text-[10px] text-amber-300 font-bold">${colorName}:</span>
                                                            <input 
                                                                type="number" 
                                                                min="0"
                                                                value="${currentVal}"
                                                                onchange="ProductsComponent.updateColorStockDirect('${p.id}', '${colorName}', this.value)"
                                                                class="w-12 bg-slate-900 border border-slate-700 rounded text-center py-0.5 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-rose-500"
                                                                title="พิมพ์ใส่จำนวนสต็อกสี${colorName}"
                                                            >
                                                        </div>
                                                    `;
                                                }).join('')}
                                            </div>
                                        </td>

                                        <!-- Total Stock Counter -->
                                        <td class="p-4 text-center font-mono font-extrabold whitespace-nowrap ${totalStockCount <= p.minStockAlert ? 'text-rose-400' : 'text-emerald-400'}">
                                            ${totalStockCount} ชิ้น
                                        </td>

                                        <td class="p-4 text-right whitespace-nowrap">
                                            <button onclick="ProductsComponent.duplicateProduct('${p.id}')" class="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 rounded-xl transition-all mr-1" title="คัดลอกรายการสินค้า (Duplicate)">
                                                <i data-lucide="copy" class="w-4 h-4"></i>
                                            </button>
                                            <button onclick="ProductsComponent.openEditModal('${p.id}')" class="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all mr-1" title="แก้ไขรายการ">
                                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                                            </button>
                                            <button onclick="ProductsComponent.deleteProduct('${p.id}')" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all" title="ลบรายการ">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Footer Bar -->
                <div class="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <div>
                        แสดงรายการที่ <strong class="text-slate-200 font-mono">${totalItems === 0 ? 0 : startIndex + 1}</strong> ถึง <strong class="text-slate-200 font-mono">${Math.min(startIndex + itemsPerPage, totalItems)}</strong> จากทั้งหมด <strong class="text-slate-200 font-mono">${totalItems}</strong> SKUs
                    </div>

                    <div class="flex items-center gap-2">
                        <select onchange="ProductsComponent.setItemsPerPage(this.value)" class="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 font-medium">
                            <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10 รายการ/หน้า</option>
                            <option value="25" ${itemsPerPage === 25 ? 'selected' : ''}>25 รายการ/หน้า</option>
                            <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50 รายการ/หน้า</option>
                            <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100 รายการ/หน้า</option>
                        </select>

                        <div class="flex items-center gap-1 font-semibold">
                            <button onclick="ProductsComponent.setPage(1)" ${currentPage === 1 ? 'disabled' : ''} class="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 rounded-lg">หน้าแรก</button>
                            <button onclick="ProductsComponent.setPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 rounded-lg">&laquo;</button>
                            <span class="px-3 py-1 font-mono font-extrabold text-slate-100">หน้า ${currentPage} / ${totalPages}</span>
                            <button onclick="ProductsComponent.setPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 rounded-lg">&raquo;</button>
                            <button onclick="ProductsComponent.setPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''} class="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 rounded-lg">หน้าสุดท้าย</button>
                        </div>
                    </div>
                </div>

            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    // Setters
    function setSearch(q) {
        searchQuery = q;
        currentPage = 1;
        render();
    }

    function setCategoryFilter(cat) {
        categoryFilter = cat;
        currentPage = 1;
        render();
    }

    function setStockFilter(st) {
        stockFilter = st;
        currentPage = 1;
        render();
    }

    function setPage(p) {
        currentPage = p;
        render();
    }

    function setItemsPerPage(num) {
        itemsPerPage = parseInt(num) || 25;
        currentPage = 1;
        render();
    }

    function updateColorStockDirect(productId, colorName, val) {
        const success = db.updateColorStockInline(productId, colorName, val);
        if (success) {
            Utils.showToast(`อัปเดตสต็อกสี${colorName} เรียบร้อยแล้ว`);
            render();
        }
    }

    function deleteProduct(id) {
        const p = db.getProductById(id);
        if (!p) return;
        if (confirm(`คุณต้องการลบ SKU ${p.sku} ใช่หรือไม่?`)) {
            db.deleteProduct(id);
            Utils.showToast(`ลบรายการ ${p.sku} เรียบร้อยแล้ว`);
            render();
        }
    }

    function duplicateProduct(id) {
        const sourceProd = db.getProductById(id);
        if (!sourceProd) return;

        const cloned = {
            sku: `${sourceProd.sku}-COPY`,
            category: sourceProd.category,
            name: sourceProd.category,
            colors: sourceProd.colors ? [...sourceProd.colors] : ['ดำ', 'เนื้อ'],
            size: sourceProd.size || '',
            standardPrice: sourceProd.standardPrice || 0,
            colorStock: sourceProd.colorStock ? JSON.parse(JSON.stringify(sourceProd.colorStock)) : {}
        };

        openProductModal(cloned, false, true);
    }

    function openAddModal() {
        openProductModal();
    }

    function openEditModal(id) {
        const prod = db.getProductById(id);
        if (prod) openProductModal(prod, true, false);
    }

    function openProductModal(prod = null, isEdit = false, isDuplicate = false) {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const categoryOptions = ['Bra', 'Panty', 'Shapewear Control', 'Inner Bra Tops', 'Bottom-Hip Push up'];
        const modalTitle = isEdit ? 'แก้ไขรายการ SKU' : (isDuplicate ? 'คัดลอกและสร้าง SKU ใหม่ (Duplicate SKU)' : 'เพิ่ม SKU สินค้าใหม่');
        const submitLabel = isEdit ? 'บันทึกการแก้ไข' : (isDuplicate ? 'คัดลอกสร้าง SKU ใหม่' : 'สร้างรายการ SKU ใหม่');

        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 flex flex-col gap-4 shadow-2xl relative">
                    
                    <button onclick="document.getElementById('modal-container').innerHTML=''" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <h3 class="text-lg font-bold text-slate-100 font-serif">${modalTitle}</h3>

                    <form onsubmit="ProductsComponent.saveProductForm(event, '${isEdit && prod ? prod.id : ''}')" class="flex flex-col gap-3.5 text-xs">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">รหัสสินค้า (SKU Code) *</label>
                                <input type="text" id="modal-sku" required value="${prod ? prod.sku : 'No. ' + Math.floor(100 + Math.random()*900)}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-rose-500">
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">ประเภทสินค้า (Category) *</label>
                                <select id="modal-category" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500 font-bold">
                                    ${categoryOptions.map(c => `
                                        <option value="${c}" ${prod && prod.category === c ? 'selected' : ''}>${c}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold text-slate-300 mb-1">รายการสี (คั่นด้วยเว้นวรรค) *</label>
                            <input type="text" id="modal-colors" required value="${prod ? (prod.colors ? prod.colors.join(' ') : 'ดำ เนื้อ') : 'ดำ เนื้อ ขาว'}" placeholder="เช่น ดำ เนื้อ ขาว ชมพู" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-medium focus:outline-none focus:border-rose-500">
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">ไซส์ (Size)</label>
                                <input type="text" id="modal-size" value="${prod ? prod.size : '34, 36, 38, 40'}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-medium focus:outline-none focus:border-rose-500">
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">ราคามาตรฐาน (฿) *</label>
                                <input type="number" id="modal-price" required min="0" value="${prod ? prod.standardPrice : 640}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-rose-500">
                            </div>
                        </div>

                        <div class="flex items-center gap-2 pt-3">
                            <button type="submit" class="flex-1 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-rose-950/40">
                                ${submitLabel}
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

    function saveProductForm(e, id) {
        e.preventDefault();
        const cat = document.getElementById('modal-category').value;
        const colorsArr = document.getElementById('modal-colors').value.trim().split(/\s+/);
        
        const data = {
            sku: document.getElementById('modal-sku').value.trim(),
            category: cat,
            name: cat, // CRUCIAL RULE: Name = Category Name
            colors: colorsArr,
            size: document.getElementById('modal-size').value.trim(),
            standardPrice: parseFloat(document.getElementById('modal-price').value) || 0
        };

        if (id) data.id = id;

        db.saveProduct(data);
        Utils.showToast(`บันทึก SKU ${data.sku} เรียบร้อยแล้ว`);
        document.getElementById('modal-container').innerHTML = '';
        render();
    }

    return {
        init,
        render,
        setSearch,
        setCategoryFilter,
        setStockFilter,
        setPage,
        setItemsPerPage,
        updateColorStockDirect,
        deleteProduct,
        duplicateProduct,
        openAddModal,
        openEditModal,
        saveProductForm
    };
})();
