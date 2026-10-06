/**
 * KC Bra / KCP&P Shop - Storefront POS Component
 * Full-Featured Storefront & Wholesale Billing System
 */

const POSComponent = (() => {

    let cartItems = [];
    let selectedCustomerId = 'walk-in';
    let invoiceDate = new Date().toISOString().split('T')[0];
    let globalDiscount = 0;
    let depositAmount = 0; // มัดจำ
    let enableShipping = false; // สวิตช์คิดค่าส่ง
    let shippingFee = 0; // ค่าจัดส่ง
    let paymentMethod = 'Cash'; // Cash or Transfer
    let searchQuery = '';
    let selectedCategory = 'ALL';
    let receiptStyle = 'retail'; // 'retail' or 'wholesale'
    let receiptLang = 'TH'; // 'TH' or 'EN'

    function init() {
        render();
    }

    function render() {
        const container = document.getElementById('view-pos');
        if (!container) return;

        const allProducts = db.getProducts();
        const customers = db.getCustomers();

        // Calculations
        const subtotal = cartItems.reduce((acc, item) => {
            const multiplier = item.unit === 'DOZ/โหล' ? 12 : 1;
            return acc + (parseFloat(item.customPrice || 0) * item.quantity * multiplier);
        }, 0);
        const netAfterDiscount = Math.max(0, subtotal - globalDiscount);
        const netAfterDeposit = Math.max(0, netAfterDiscount - depositAmount);
        const grandTotal = Math.max(0, netAfterDeposit + (enableShipping ? shippingFee : 0));

        const categoriesList = ['ALL', 'Bra', 'Panty', 'Shapewear Control', 'Inner Bra Tops', 'Bottom-Hip Push up'];

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <!-- Left Panel: Product Catalog Grid & Search (7 Cols) -->
                <div class="lg:col-span-7 flex flex-col gap-4">
                    
                    <!-- Search Header Card -->
                    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
                        <div class="flex items-center justify-between gap-3">
                            <div class="relative flex-1">
                                <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400"></i>
                                <input 
                                    type="text" 
                                    id="pos-search-input"
                                    placeholder="พิมพ์ค้นหารหัสสินค้า (SKU เช่น No. 0777, B010)..." 
                                    value="${searchQuery}"
                                    oninput="POSComponent.handleSearch(this.value)"
                                    class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
                                >
                            </div>
                            <button onclick="POSComponent.clearSearch()" class="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-all">
                                ล้าง
                            </button>
                        </div>

                        <!-- Category Filter Pills Bar -->
                        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                            ${categoriesList.map(cat => `
                                <button 
                                    onclick="POSComponent.setCategory('${cat}')" 
                                    class="px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 font-semibold ${selectedCategory === cat ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-950/60 border border-rose-400/40' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'}"
                                >
                                    <span>${cat === 'ALL' ? 'สินค้าทั้งหมด (' + allProducts.length + ')' : cat}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Products Grid Container -->
                    <div id="pos-grid-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                        ${renderProductsGridHTML(allProducts)}
                    </div>

                </div>

                <!-- Right Panel: Order Checkout & Ad-Hoc Price Editor (5 Cols) -->
                <div class="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-2xl min-h-[640px] sticky top-20">
                    
                    <div class="flex flex-col gap-4">
                        
                        <!-- Header & Active Bill Indicator -->
                        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="font-serif font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-200 uppercase tracking-widest">KC Bra / KCP&P Shop</span>
                                    <button onclick="POSComponent.showInvoiceIdInfo()" class="text-slate-500 hover:text-rose-400" title="วิธีสร้างเลขที่บิล">
                                        <i data-lucide="help-circle" class="w-3.5 h-3.5"></i>
                                    </button>
                                </div>
                                <h2 class="text-lg font-bold text-slate-100 mt-0.5">ออกบิลสินค้า (Create Bill)</h2>
                            </div>
                            <button onclick="POSComponent.clearCart()" class="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-semibold">
                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                <span>ล้างตะกร้า</span>
                            </button>
                        </div>

                        <!-- Customer Selection & Date Picker -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/90 p-3 rounded-xl border border-slate-800/80 text-xs">
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <label class="font-semibold text-slate-300">เลือกลูกค้า (Customer)</label>
                                    <button onclick="POSComponent.openAddCustomerModal()" class="text-[10px] text-rose-400 hover:underline font-bold">+ เพิ่มลูกค้าใหม่</button>
                                </div>
                                <select 
                                    onchange="POSComponent.setCustomer(this.value)" 
                                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-rose-500"
                                >
                                    <option value="walk-in" ${selectedCustomerId === 'walk-in' ? 'selected' : ''}>ลูกค้าหน้าร้านทั่วไป (Walk-in)</option>
                                    ${customers.map(c => `
                                        <option value="${c.id}" ${selectedCustomerId === c.id ? 'selected' : ''}>${c.name} ${c.phone ? '(' + c.phone + ')' : ''}</option>
                                    `).join('')}
                                </select>
                            </div>

                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">วันที่ออกบิล (Date)</label>
                                <input 
                                    type="date" 
                                    value="${invoiceDate}"
                                    onchange="POSComponent.setDate(this.value)"
                                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-rose-500"
                                >
                            </div>
                        </div>

                        <!-- Bill Items Table -->
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                                <span class="text-slate-200">รายการในบิล (${cartItems.length} รายการ)</span>
                                <span class="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">*แก้ไขราคาต่อชิ้นได้อิสระ</span>
                            </div>

                            <div class="max-h-[250px] overflow-y-auto pr-1 flex flex-col gap-2">
                                ${cartItems.length === 0 ? `
                                    <div class="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                                        <i data-lucide="shopping-bag" class="w-10 h-10 mx-auto mb-2 opacity-30 text-rose-400"></i>
                                        <p class="text-xs font-semibold text-slate-400">ยังไม่มีรายการสินค้าในบิล</p>
                                        <p class="text-[11px] text-slate-600 mt-0.5">เลือกสินค้าจากตารางด้านซ้ายเพื่อเพิ่มในบิล</p>
                                    </div>
                                ` : cartItems.map((item, idx) => {
                                    const multiplier = item.unit === 'DOZ/โหล' ? 12 : 1;
                                    const itemSubtotal = item.customPrice * item.quantity * multiplier;
                                    
                                    return `
                                        <div class="bg-slate-950 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-2 transition-all hover:border-slate-700">
                                            
                                            <div class="flex items-start justify-between gap-2">
                                                <div>
                                                    <div class="flex items-center gap-2">
                                                        <span class="font-mono text-xs font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">${item.productCode} - ${item.category}</span>
                                                        <span class="text-xs font-bold text-amber-300">สี: ${item.selectedColor}</span>
                                                    </div>
                                                </div>
                                                <button onclick="POSComponent.removeFromCart(${idx})" class="text-slate-500 hover:text-rose-400 p-1 transition-colors" title="ลบรายการ">
                                                    <i data-lucide="x" class="w-4 h-4"></i>
                                                </button>
                                            </div>

                                            <div class="grid grid-cols-12 items-center gap-2 pt-1 border-t border-slate-800/60 text-xs">
                                                <div class="col-span-4 flex flex-col">
                                                    <span class="text-[9px] text-rose-400 uppercase font-bold">ราคา (฿)</span>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value="${item.customPrice}"
                                                        onchange="POSComponent.updateCartItemPrice(${idx}, this.value)"
                                                        class="w-full bg-slate-900 border border-rose-500/50 rounded px-2 py-1 text-xs font-mono font-extrabold text-rose-300 focus:outline-none focus:border-rose-500 shadow-inner"
                                                    >
                                                </div>

                                                <div class="col-span-3 flex flex-col items-center">
                                                    <span class="text-[9px] text-slate-400 uppercase font-semibold mb-0.5">จำนวน</span>
                                                    <div class="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                                                        <button onclick="POSComponent.updateCartItemQty(${idx}, ${item.quantity - 1})" class="w-4 h-4 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-[10px]">-</button>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            value="${item.quantity}"
                                                            onchange="POSComponent.updateCartItemQty(${idx}, this.value)"
                                                            class="w-6 text-center bg-transparent text-xs text-slate-100 font-bold focus:outline-none font-mono"
                                                        >
                                                        <button onclick="POSComponent.updateCartItemQty(${idx}, ${item.quantity + 1})" class="w-4 h-4 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-[10px]">+</button>
                                                    </div>
                                                </div>

                                                <div class="col-span-2 flex flex-col">
                                                    <span class="text-[9px] text-slate-400 uppercase font-semibold">หน่วย</span>
                                                    <select 
                                                        onchange="POSComponent.updateCartItemUnit(${idx}, this.value)"
                                                        class="bg-slate-900 border border-slate-800 rounded px-1 py-1 text-[10px] text-slate-200 font-bold focus:outline-none"
                                                    >
                                                        <option value="PCS/ตัว" ${item.unit === 'PCS/ตัว' ? 'selected' : ''}>PCS/ตัว</option>
                                                        <option value="DOZ/โหล" ${item.unit === 'DOZ/โหล' ? 'selected' : ''}>DOZ/โหล</option>
                                                    </select>
                                                </div>

                                                <div class="col-span-3 text-right">
                                                    <span class="text-[9px] text-slate-400 uppercase font-semibold block">รวมเงิน</span>
                                                    <span class="font-mono font-extrabold text-slate-100 text-xs">${Utils.formatCurrency(itemSubtotal)}</span>
                                                </div>
                                            </div>

                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                    </div>

                    <!-- Totals & Checkout Panel -->
                    <div class="pt-4 border-t border-slate-800 flex flex-col gap-3 mt-3">
                        
                        <!-- Payment Method Toggle -->
                        <div class="flex items-center justify-between text-xs gap-2">
                            <span class="font-semibold text-slate-300">ช่องทางชำระเงิน:</span>
                            <div class="flex items-center gap-1.5">
                                ${['Cash', 'Transfer'].map(m => `
                                    <button 
                                        onclick="POSComponent.setPaymentMethod('${m}')"
                                        class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${paymentMethod === m ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'}"
                                    >
                                        ${m === 'Cash' ? 'Cash (เงินสด)' : 'Transfer (โอนเงิน)'}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Calculations Summary -->
                        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 flex flex-col gap-2 text-xs">
                            <div class="flex justify-between text-slate-400">
                                <span>ยอดรวม (Subtotal):</span>
                                <span class="font-mono font-bold text-slate-200">${Utils.formatCurrency(subtotal)}</span>
                            </div>
                            
                            <div class="flex justify-between items-center text-slate-400">
                                <span class="flex items-center gap-1.5">
                                    <span>ส่วนลดพิเศษ:</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value="${globalDiscount}"
                                        oninput="POSComponent.setGlobalDiscount(this.value)"
                                        placeholder="0"
                                        class="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-rose-300 font-mono font-bold text-right focus:outline-none focus:border-rose-500"
                                    >
                                </span>
                                <span class="font-mono font-bold text-rose-400">- ${Utils.formatCurrency(globalDiscount)}</span>
                            </div>

                            <div class="flex justify-between items-center text-slate-400 border-t border-slate-900 pt-1">
                                <span class="flex items-center gap-1.5">
                                    <span class="text-amber-300 font-semibold">มัดจำ (Deposit):</span>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value="${depositAmount}"
                                        oninput="POSComponent.setDepositAmount(this.value)"
                                        placeholder="0"
                                        class="w-20 bg-slate-900 border border-amber-500/50 rounded px-2 py-0.5 text-xs text-amber-300 font-mono font-bold text-right focus:outline-none focus:border-amber-500"
                                    >
                                </span>
                                <span class="font-mono font-bold text-amber-400">- ${Utils.formatCurrency(depositAmount)}</span>
                            </div>

                            <!-- NEW: Shipping Fee Checkbox & Input (คิดค่าส่งเพิ่ม) -->
                            <div class="flex justify-between items-center text-slate-400 border-t border-slate-900 pt-1">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        ${enableShipping ? 'checked' : ''} 
                                        onchange="POSComponent.toggleShipping(this.checked)"
                                        class="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-500"
                                    >
                                    <span class="font-semibold text-slate-300">คิดค่าจัดส่ง (Shipping Fee):</span>
                                </label>
                                ${enableShipping ? `
                                    <span class="flex items-center gap-1">
                                        <input 
                                            type="number" 
                                            min="0"
                                            value="${shippingFee}"
                                            oninput="POSComponent.setShippingFee(this.value)"
                                            placeholder="0"
                                            class="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-emerald-300 font-mono font-bold text-right focus:outline-none focus:border-emerald-500"
                                        >
                                        <span class="font-mono font-bold text-emerald-400">+ ${Utils.formatCurrency(shippingFee)}</span>
                                    </span>
                                ` : `
                                    <span class="text-[10px] text-slate-500">ไม่ได้ติ๊กคิดค่าส่ง</span>
                                `}
                            </div>

                            <div class="flex justify-between items-baseline text-base font-extrabold text-slate-100 pt-2 border-t border-slate-800">
                                <span class="text-rose-400 font-serif">ยอดสุทธิ (Grand Total):</span>
                                <span class="font-mono text-2xl text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-amber-200">${Utils.formatCurrency(grandTotal)}</span>
                            </div>
                        </div>

                        <!-- Confirm & Complete Order Button -->
                        <button 
                            onclick="POSComponent.checkout()"
                            ${cartItems.length === 0 ? 'disabled' : ''}
                            class="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-rose-950/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 transform active:scale-98"
                        >
                            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                            <span>ยืนยันออกบิลสินค้า & ตัดสต็อก (Confirm Invoice)</span>
                        </button>

                    </div>

                </div>

            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    function renderProductsGridHTML(allProducts) {
        let filteredProducts = allProducts;
        if (selectedCategory !== 'ALL') {
            filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filteredProducts = filteredProducts.filter(p => 
                p.sku.toLowerCase().includes(q) || 
                p.name.toLowerCase().includes(q) ||
                p.size.toLowerCase().includes(q)
            );
        }
        
        const displayProducts = filteredProducts.slice(0, 24);

        if (displayProducts.length === 0) {
            return `
                <div class="col-span-3 text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                    <i data-lucide="package-search" class="w-10 h-10 mx-auto mb-3 opacity-40 text-rose-400"></i>
                    <p class="text-sm font-semibold">ไม่พบรายการสินค้าที่ค้นหา "${searchQuery}"</p>
                    <p class="text-xs text-slate-600 mt-1">ลองค้นหาด้วยรหัส เช่น No. 023, No. 0777 หรือ No. B010</p>
                </div>
            `;
        }

        return displayProducts.map(p => `
            <div 
                onclick="POSComponent.openColorPickerModal('${p.id}')" 
                class="group cursor-pointer bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/60 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-950/30 relative overflow-hidden"
            >
                <div class="flex items-center justify-between gap-2">
                    <span class="font-mono text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-200 block">${p.sku}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full border ${Utils.getCategoryBadgeClass(p.category)} inline-block font-bold">${p.category}</span>
                </div>

                <div>
                    <h4 class="text-xs font-bold text-slate-100 group-hover:text-rose-300 leading-snug line-clamp-2 transition-colors">รหัส: ${p.sku} - ${p.category}</h4>
                    <p class="text-[10px] text-slate-400 mt-1">ไซส์: <span class="text-slate-200 font-semibold">${p.size}</span></p>
                    <p class="text-[10px] text-slate-400 mt-0.5">สี: <span class="text-amber-300 font-semibold">${p.colors ? p.colors.join(', ') : '-'}</span></p>
                </div>

                <div class="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs">
                    <div>
                        <span class="text-[9px] text-slate-500 block uppercase">ราคามาตรฐาน</span>
                        <span class="font-mono font-bold text-slate-100 text-sm group-hover:text-amber-300 transition-colors">${Utils.formatCurrency(p.standardPrice)}</span>
                    </div>
                    <span class="text-[10px] px-2 py-1 bg-rose-500/20 text-rose-300 rounded-lg font-bold group-hover:bg-rose-500 group-hover:text-white transition-all">
                        + เลือกสี
                    </span>
                </div>
            </div>
        `).join('');
    }

    function handleSearch(query) {
        searchQuery = query;
        const grid = document.getElementById('pos-grid-container');
        if (grid) {
            grid.innerHTML = renderProductsGridHTML(db.getProducts());
            if (window.lucide) lucide.createIcons();
        }
    }

    function clearSearch() {
        searchQuery = '';
        const searchInput = document.getElementById('pos-search-input');
        if (searchInput) searchInput.value = '';
        handleSearch('');
    }

    function setCategory(cat) {
        selectedCategory = cat;
        render();
    }

    // Modal to pick color variant including "คละสี" and "ไม่ระบุ" at the TOP!
    function openColorPickerModal(productId) {
        const prod = db.getProductById(productId);
        if (!prod) return;

        // USER REQUIREMENT: "คละสี" and "ไม่ระบุ" must be the VERY FIRST options!
        let baseColors = (prod.colors || ['ดำ', 'เนื้อ']).filter(c => c !== 'คละสี' && c !== 'ไม่ระบุ');
        let colorsList = ['คละสี', 'ไม่ระบุ', ...baseColors];

        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 flex flex-col gap-4 shadow-2xl relative">
                    <button onclick="document.getElementById('modal-container').innerHTML=''" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <div>
                        <span class="text-[11px] font-mono font-extrabold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">${prod.sku}</span>
                        <h3 class="text-base font-bold text-slate-100 mt-1">เลือกสีสินค้าสำหรับบิลนี้</h3>
                        <p class="text-xs text-slate-400">ประเภท: ${prod.category} &bull; ไซส์: ${prod.size}</p>
                    </div>

                    <div class="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                        ${colorsList.map(col => {
                            const stockNum = prod.colorStock ? (prod.colorStock[col] || 0) : 0;
                            const isAssorted = col === 'คละสี';
                            const isUnspecified = col === 'ไม่ระบุ';

                            let btnStyle = 'border-slate-800 bg-slate-950 hover:bg-rose-950/40';
                            let textStyle = 'text-slate-100';
                            let labelText = `สี${col}`;
                            let subText = stockNum <= 5 ? `สต็อก: ${stockNum} ชิ้น (เหลือน้อย)` : `สต็อก: ${stockNum} ชิ้น`;

                            if (isAssorted) {
                                btnStyle = 'border-amber-500/60 bg-amber-950/20 hover:bg-amber-900/40';
                                textStyle = 'text-amber-300';
                                labelText = '🎨 คละสี (Assorted Colors)';
                                subText = 'สั่งขายคละสี';
                            } else if (isUnspecified) {
                                btnStyle = 'border-slate-700 bg-slate-900/80 hover:bg-slate-800';
                                textStyle = 'text-slate-200';
                                labelText = '⚪ ไม่ระบุ (Unspecified)';
                                subText = 'ไม่ระบุสีในบิล';
                            }

                            return `
                                <button 
                                    onclick="POSComponent.confirmAddToCart('${prod.id}', '${col}')"
                                    class="w-full border ${btnStyle} p-3 rounded-xl flex items-center justify-between text-xs transition-all hover:border-rose-500/60"
                                >
                                    <span class="font-bold ${textStyle}">
                                        ${labelText}
                                    </span>
                                    <span class="font-mono text-[11px] ${stockNum <= 5 && !isAssorted && !isUnspecified ? 'text-rose-400 font-bold' : 'text-slate-400'}">
                                        ${subText}
                                    </span>
                                </button>
                            `;
                        }).join('')}
                    </div>

                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    function confirmAddToCart(productId, selectedColor) {
        const prod = db.getProductById(productId);
        if (!prod) return;

        const existingIdx = cartItems.findIndex(item => item.productId === productId && item.selectedColor === selectedColor);
        if (existingIdx !== -1) {
            cartItems[existingIdx].quantity += 1;
        } else {
            cartItems.push({
                productId: prod.id,
                productCode: prod.sku,
                productName: prod.name,
                category: prod.category,
                selectedColor: selectedColor,
                customPrice: prod.standardPrice,
                quantity: 1,
                unit: 'PCS/ตัว',
                note: ''
            });
        }

        Utils.showToast(`เพิ่ม ${prod.sku} (${selectedColor}) เข้าบิลสินค้าเรียบร้อยแล้ว`);
        document.getElementById('modal-container').innerHTML = '';
        render();
    }

    function removeFromCart(idx) {
        cartItems.splice(idx, 1);
        render();
    }

    function clearCart() {
        cartItems = [];
        globalDiscount = 0;
        depositAmount = 0;
        enableShipping = false;
        shippingFee = 0;
        render();
    }

    function updateCartItemPrice(idx, newPrice) {
        const parsed = Math.max(0, parseFloat(newPrice) || 0);
        if (cartItems[idx]) {
            cartItems[idx].customPrice = parsed;
            render();
        }
    }

    function updateCartItemQty(idx, newQty) {
        const parsed = Math.max(1, parseInt(newQty) || 1);
        if (cartItems[idx]) {
            cartItems[idx].quantity = parsed;
            render();
        }
    }

    function updateCartItemUnit(idx, unitVal) {
        if (cartItems[idx]) {
            cartItems[idx].unit = unitVal;
            render();
        }
    }

    function updateCartItemNote(idx, note) {
        if (cartItems[idx]) {
            cartItems[idx].note = note;
        }
    }

    function setCustomer(custId) {
        selectedCustomerId = custId;
        render();
    }

    function setDate(dateStr) {
        invoiceDate = dateStr;
    }

    function setGlobalDiscount(val) {
        globalDiscount = Math.max(0, parseFloat(val) || 0);
        render();
    }

    function setDepositAmount(val) {
        depositAmount = Math.max(0, parseFloat(val) || 0);
        render();
    }

    function toggleShipping(checked) {
        enableShipping = checked;
        if (!checked) shippingFee = 0;
        render();
    }

    function setShippingFee(val) {
        shippingFee = Math.max(0, parseFloat(val) || 0);
        render();
    }

    function setPaymentMethod(method) {
        paymentMethod = method;
        render();
    }

    function openAddCustomerModal() {
        if (window.CustomerModal) {
            CustomerModal.open(newCust => {
                selectedCustomerId = newCust.id;
                render();
            });
        }
    }

    function showInvoiceIdInfo() {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 flex flex-col gap-3 shadow-2xl relative">
                    <button onclick="document.getElementById('modal-container').innerHTML=''" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <h3 class="text-base font-bold text-slate-100 font-serif">โครงสร้างเลขที่บิล (Invoice ID Format)</h3>
                    <p class="text-xs text-slate-300 leading-relaxed">
                        เลขที่บิลสร้างขึ้นด้วยระบบมาตรฐานร้านขายส่ง ดังนี้:<br>
                        <strong class="text-rose-400 font-mono text-sm">KCB-20261006-001</strong>
                    </p>
                    <ul class="text-xs text-slate-400 list-disc pl-5 flex flex-col gap-1">
                        <li><strong class="text-slate-200">KCB:</strong> คำย่อชื่อร้าน KC Bra / KCP&P Shop</li>
                        <li><strong class="text-slate-200">20261006:</strong> วันที่ออกบิล (ปี ค.ศ.-เดือน-วัน)</li>
                        <li><strong class="text-slate-200">001:</strong> ลำดับเลขบิลประจำวัน (เรียงจาก 001, 002, 003...)</li>
                    </ul>

                    <div class="pt-2 text-right">
                        <button onclick="document.getElementById('modal-container').innerHTML=''" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl">เข้าใจแล้ว</button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    function checkout() {
        if (cartItems.length === 0) {
            Utils.showToast("ตะกร้าสินค้าว่างเปล่า!", "error");
            return;
        }

        const customer = selectedCustomerId === 'walk-in' ? null : db.getCustomerById(selectedCustomerId);
        const customerName = customer ? customer.name : 'ลูกค้าหน้าร้านทั่วไป';

        const subtotal = cartItems.reduce((acc, item) => {
            const multiplier = item.unit === 'DOZ/โหล' ? 12 : 1;
            return acc + (item.customPrice * item.quantity * multiplier);
        }, 0);
        const netAfterDiscount = Math.max(0, subtotal - globalDiscount);
        const netAfterDeposit = Math.max(0, netAfterDiscount - depositAmount);
        const grandTotal = Math.max(0, netAfterDeposit + (enableShipping ? shippingFee : 0));

        const invoiceData = {
            dateTime: `${invoiceDate} ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`,
            customerId: selectedCustomerId,
            customerName: customerName,
            subtotal: subtotal,
            discount: globalDiscount,
            deposit: depositAmount,
            shippingFee: enableShipping ? shippingFee : 0,
            grandTotal: grandTotal,
            paymentMethod: paymentMethod,
            items: cartItems
        };

        const createdInvoice = db.createInvoice(invoiceData);

        if (window.confetti) {
            confetti({
                particleCount: 90,
                spread: 80,
                origin: { y: 0.6 }
            });
        }

        Utils.showToast(`ออกบิล ${createdInvoice.id} สำเร็จ! ตัดสต็อกเรียบร้อยแล้ว`);

        cartItems = [];
        globalDiscount = 0;
        depositAmount = 0;
        enableShipping = false;
        shippingFee = 0;
        render();

        showReceiptModal(createdInvoice);
    }

    function showReceiptModal(invoice) {
        receiptStyle = 'retail';
        receiptLang = 'TH';
        renderModalContent(invoice);
    }

    function toggleReceiptStyle(style, invoice) {
        receiptStyle = style;
        renderModalContent(invoice);
    }

    function toggleReceiptLang(lang, invoice) {
        receiptLang = lang;
        renderModalContent(invoice);
    }

    function renderModalContent(invoice) {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 flex flex-col gap-4 shadow-2xl relative my-8">
                    
                    <button onclick="document.getElementById('modal-container').innerHTML=''" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <!-- Receipt Style & Language Controls -->
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div>
                            <h3 class="text-lg font-bold text-slate-100">ออกบิลสำเร็จเรียบร้อย!</h3>
                            <p class="text-xs text-slate-400">เลขที่บิล: <strong class="font-mono text-rose-400">${invoice.id}</strong></p>
                        </div>

                        <div class="flex items-center gap-2 flex-wrap">
                            <!-- Language Selector: TH / EN -->
                            <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                                <button onclick="POSComponent.toggleReceiptLang('TH', ${JSON.stringify(invoice).replace(/"/g, '&quot;')})" class="px-2.5 py-1 rounded-lg font-bold transition-all ${receiptLang === 'TH' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}">🇹🇭 TH</button>
                                <button onclick="POSComponent.toggleReceiptLang('EN', ${JSON.stringify(invoice).replace(/"/g, '&quot;')})" class="px-2.5 py-1 rounded-lg font-bold transition-all ${receiptLang === 'EN' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}">🇬🇧 EN</button>
                            </div>

                            <!-- Bill Style: Retail vs Wholesale -->
                            <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                                <button onclick="POSComponent.toggleReceiptStyle('retail', ${JSON.stringify(invoice).replace(/"/g, '&quot;')})" class="px-3 py-1 rounded-lg transition-all ${receiptStyle === 'retail' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}">บิลขายปลีก</button>
                                <button onclick="POSComponent.toggleReceiptStyle('wholesale', ${JSON.stringify(invoice).replace(/"/g, '&quot;')})" class="px-3 py-1 rounded-lg transition-all ${receiptStyle === 'wholesale' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}">บิลขายส่ง (ตาราง)</button>
                            </div>
                        </div>
                    </div>

                    <!-- Printable Bill Document Area -->
                    <div id="printable-receipt-area" class="receipt-paper p-6 rounded-xl text-xs leading-relaxed border border-gray-200 ${receiptStyle === 'retail' ? 'retail-mode max-w-sm mx-auto' : 'w-full'}">
                        ${receiptStyle === 'retail' ? renderRetailReceiptHTML(invoice, receiptLang) : renderWholesaleInvoiceHTML(invoice, receiptLang)}
                    </div>

                    <!-- Modal Actions -->
                    <div class="flex items-center gap-2 pt-2">
                        <button onclick="window.print()" class="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/40">
                            <i data-lucide="printer" class="w-4 h-4"></i>
                            <span>พิมพ์บิลสินค้า (Print Invoice)</span>
                        </button>
                        <button onclick="document.getElementById('modal-container').innerHTML=''" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all">
                            ปิดหน้าต่าง
                        </button>
                    </div>

                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    // Retail Receipt HTML (บิลปลีก)
    function renderRetailReceiptHTML(invoice, lang = 'TH') {
        const isEn = lang === 'EN';

        return `
            <!-- Retail Header with Logo & Balanced Address -->
            <div class="text-center pb-3 border-b border-dashed border-gray-400">
                <div class="flex justify-center mb-2">
                    <img src="assets/logo.png" alt="K.C Bra Logo" class="h-14 object-contain rounded-xl shadow-sm">
                </div>
                <h2 class="font-serif font-bold text-lg tracking-widest text-gray-900">KC Bra / KCP&P Shop</h2>
                <p class="text-[11px] text-gray-700 font-semibold leading-relaxed mt-1">
                    ${isEn ? '88/9 Ground Floor, Bobae Tower<br>Klong Mahanak, Pom Prap Sattru Phai, Bangkok 10100' : '88/9 ชั้น G โบ๊เบ๊ทาเวอร์<br>แขวงคลองมหานาค เขตป้อมปราบศัตรูพ่าย 10100'}
                </p>
                <div class="mt-2.5 text-[10px] text-gray-600 font-mono">
                    <p>${isEn ? 'Invoice No.:' : 'เลขที่บิล:'} ${invoice.id}</p>
                    <p>${isEn ? 'Date:' : 'วันที่:'} ${invoice.dateTime}</p>
                    <p>${isEn ? 'Customer:' : 'ชื่อลูกค้า:'} ${invoice.customerName}</p>
                </div>
            </div>

            <!-- Bill Items List (Color hidden from customer receipt) -->
            <div class="py-3 border-b border-dashed border-gray-400 flex flex-col gap-2">
                ${invoice.items.map(item => {
                    const multiplier = item.unit === 'DOZ/โหล' ? 12 : 1;
                    const itemTotal = item.customPrice * item.quantity * multiplier;
                    return `
                        <div>
                            <div class="flex justify-between font-bold text-gray-900">
                                <span>${item.productCode} - ${item.category}</span>
                            </div>
                            <div class="flex justify-between text-[11px] text-gray-700">
                                <span>${item.quantity} ${item.unit} x ฿${item.customPrice}</span>
                                <span class="font-mono font-bold">฿${itemTotal}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Totals & Deposit Breakdown -->
            <div class="py-3 border-b border-dashed border-gray-400 flex flex-col gap-1 text-gray-800">
                <div class="flex justify-between">
                    <span>${isEn ? 'Subtotal:' : 'ยอดรวม (Subtotal):'}</span>
                    <span class="font-mono">฿${invoice.subtotal}</span>
                </div>
                ${invoice.discount > 0 ? `
                    <div class="flex justify-between text-rose-600 font-bold">
                        <span>${isEn ? 'Discount:' : 'ส่วนลดพิเศษ:'}</span>
                        <span class="font-mono">-฿${invoice.discount}</span>
                    </div>
                ` : ''}
                ${invoice.deposit > 0 ? `
                    <div class="flex justify-between text-amber-600 font-bold">
                        <span>${isEn ? 'Deposit:' : 'มัดจำ (Deposit):'}</span>
                        <span class="font-mono">-฿${invoice.deposit}</span>
                    </div>
                ` : ''}
                ${invoice.shippingFee > 0 ? `
                    <div class="flex justify-between text-emerald-600 font-bold">
                        <span>${isEn ? 'Shipping Fee:' : 'ค่าจัดส่ง (Shipping Fee):'}</span>
                        <span class="font-mono">+฿${invoice.shippingFee}</span>
                    </div>
                ` : ''}
                <div class="flex justify-between font-bold text-base pt-1 border-t border-gray-300 text-gray-900">
                    <span>${isEn ? 'Grand Total:' : 'ยอดสุทธิ (Grand Total):'}</span>
                    <span class="font-mono text-lg">฿${invoice.grandTotal}</span>
                </div>
                <div class="flex justify-between text-[10px] text-gray-600 pt-1">
                    <span>${isEn ? 'Payment Method:' : 'ชำระโดย:'}</span>
                    <span>${invoice.paymentMethod === 'Cash' ? (isEn ? 'Cash' : 'Cash (เงินสด)') : (isEn ? 'Transfer' : 'Transfer (โอนเงิน)')}</span>
                </div>
            </div>

            <!-- Custom Retail Footer Text (Nicely Multi-lined) -->
            <div class="text-center pt-3">
                <p class="text-[11px] font-bold text-gray-900 leading-relaxed">
                    ${isEn ? 'Thank you for shopping at KC Bra!<br>For online orders, please contact<br><span class="font-mono font-extrabold text-xs">ID Line: KCBRA &bull; Tel: 081-648-4221</span>' : 'ขอบคุณลูกค้าที่อุดหนุน KC Bra<br>หากลูกค้าไม่สะดวกมาหน้าร้าน สามารถสั่งผ่านออนไลน์ได้ที่<br><span class="font-mono font-extrabold text-xs">ID Line: KCBRA &bull; โทร 081-648-4221</span>'}
                </p>
            </div>
        `;
    }

    // Wholesale Invoice Table HTML (บิลส่ง)
    function renderWholesaleInvoiceHTML(invoice, lang = 'TH') {
        const isEn = lang === 'EN';

        return `
            <!-- Wholesale Header with Logo & Balanced Address -->
            <div class="flex items-center justify-between pb-4 border-b-2 border-gray-800 gap-4">
                <div class="flex items-center gap-3.5">
                    <img src="assets/logo.png" alt="K.C Bra Logo" class="h-16 object-contain rounded-xl shadow-sm border border-gray-200 p-0.5 bg-black">
                    <div>
                        <h2 class="font-serif font-bold text-xl text-gray-900 tracking-wide">KC Bra / KCP&P Shop</h2>
                        <p class="text-xs text-gray-700 font-semibold leading-relaxed mt-0.5">
                            ${isEn ? '88/9 Ground Floor, Bobae Tower<br>Klong Mahanak, Pom Prap Sattru Phai, Bangkok 10100' : '88/9 ชั้น G โบ๊เบ๊ทาเวอร์<br>แขวงคลองมหานาค เขตป้อมปราบศัตรูพ่าย 10100'}
                        </p>
                        <p class="text-xs text-gray-800 font-extrabold mt-1 uppercase tracking-wider">${isEn ? 'Tax Invoice / Receipt' : 'ใบส่งสินค้า / ใบเสร็จรับเงิน (Invoice)'}</p>
                    </div>
                </div>
                <div class="text-right whitespace-nowrap">
                    <span class="text-xs font-mono font-extrabold text-gray-900 block">${isEn ? 'Invoice No.:' : 'เลขที่บิล:'} ${invoice.id}</span>
                    <span class="text-xs text-gray-700 block mt-1">${isEn ? 'Date:' : 'วันที่ออกบิล:'} ${invoice.dateTime}</span>
                    <span class="text-xs text-gray-700 block mt-0.5">${isEn ? 'Customer:' : 'ลูกค้า:'} <strong>${invoice.customerName}</strong></span>
                    <span class="text-[10px] text-gray-600 block mt-0.5">${isEn ? 'Payment:' : 'การชำระ:'} ${invoice.paymentMethod === 'Cash' ? 'Cash' : 'Transfer'}</span>
                </div>
            </div>

            <!-- Wholesale Items Table (Color column hidden from customer invoice) -->
            <div class="my-4">
                <table class="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr class="bg-gray-100 text-gray-900 border-y border-gray-800">
                            <th class="p-2 text-center">${isEn ? 'No.' : 'ลำดับ'}</th>
                            <th class="p-2">${isEn ? 'SKU Code' : 'รหัสสินค้า'}</th>
                            <th class="p-2">${isEn ? 'Category' : 'ประเภทสินค้า'}</th>
                            <th class="p-2 text-center">${isEn ? 'Qty' : 'จำนวน'}</th>
                            <th class="p-2 text-center">${isEn ? 'Unit' : 'หน่วย'}</th>
                            <th class="p-2 text-right">${isEn ? 'Price' : 'ราคา/หน่วย'}</th>
                            <th class="p-2 text-right">${isEn ? 'Amount' : 'จำนวนเงิน'}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${invoice.items.map((item, idx) => {
                            const multiplier = item.unit === 'DOZ/โหล' ? 12 : 1;
                            const itemTotal = item.customPrice * item.quantity * multiplier;
                            return `
                                <tr>
                                    <td class="p-2 text-center font-mono">${idx + 1}</td>
                                    <td class="p-2 font-mono font-bold text-gray-900">${item.productCode}</td>
                                    <td class="p-2 font-semibold text-gray-800">${item.category}</td>
                                    <td class="p-2 text-center font-mono font-bold">${item.quantity}</td>
                                    <td class="p-2 text-center text-gray-700">${item.unit}</td>
                                    <td class="p-2 text-right font-mono">฿${item.customPrice}</td>
                                    <td class="p-2 text-right font-mono font-bold text-gray-900">฿${itemTotal}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Summary Table Footer -->
            <div class="flex justify-end pt-2 border-t-2 border-gray-800">
                <div class="w-64 flex flex-col gap-1 text-xs">
                    <div class="flex justify-between text-gray-700">
                        <span>${isEn ? 'Subtotal:' : 'ยอดรวม (Subtotal):'}</span>
                        <span class="font-mono font-bold">฿${invoice.subtotal}</span>
                    </div>
                    ${invoice.discount > 0 ? `
                        <div class="flex justify-between text-rose-600 font-bold">
                            <span>${isEn ? 'Discount:' : 'ส่วนลดพิเศษ:'}</span>
                            <span class="font-mono">-฿${invoice.discount}</span>
                        </div>
                    ` : ''}
                    ${invoice.deposit > 0 ? `
                        <div class="flex justify-between text-amber-600 font-bold">
                            <span>${isEn ? 'Deposit:' : 'มัดจำ (Deposit):'}</span>
                            <span class="font-mono">-฿${invoice.deposit}</span>
                        </div>
                    ` : ''}
                    ${invoice.shippingFee > 0 ? `
                        <div class="flex justify-between text-emerald-600 font-bold">
                            <span>${isEn ? 'Shipping Fee:' : 'ค่าจัดส่ง (Shipping Fee):'}</span>
                            <span class="font-mono">+฿${invoice.shippingFee}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-sm font-extrabold text-gray-900 pt-1.5 border-t border-gray-400">
                        <span>${isEn ? 'Grand Total:' : 'ยอดสุทธิ (Grand Total):'}</span>
                        <span class="font-mono text-base">฿${invoice.grandTotal}</span>
                    </div>
                </div>
            </div>

            <!-- Wholesale Footer Statement with Line & Tel Contact -->
            <div class="text-center pt-5 mt-4 border-t border-dashed border-gray-300">
                <p class="text-xs font-bold text-gray-900 leading-relaxed">
                    ${isEn ? 'Thank you for shopping at KC Bra!<br><span class="font-mono text-sm text-gray-800">ID Line: KCBRA &bull; Tel. 081-648-4221</span>' : 'ขอบคุณที่อุดหนุน KC Bra ขอให้ขายดีๆ เฮงๆนะคะ<br><span class="font-mono text-sm text-gray-800">ID Line: KCBRA &bull; Tel. 081-648-4221</span>'}
                </p>
            </div>
        `;
    }

    return {
        init,
        render,
        handleSearch,
        clearSearch,
        setCategory,
        openColorPickerModal,
        confirmAddToCart,
        removeFromCart,
        clearCart,
        updateCartItemPrice,
        updateCartItemQty,
        updateCartItemUnit,
        updateCartItemNote,
        setCustomer,
        setDate,
        setGlobalDiscount,
        setDepositAmount,
        toggleShipping,
        setShippingFee,
        setPaymentMethod,
        openAddCustomerModal,
        showInvoiceIdInfo,
        checkout,
        showReceiptModal,
        toggleReceiptStyle,
        toggleReceiptLang
    };
})();
