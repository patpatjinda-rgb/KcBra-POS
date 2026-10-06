/**
 * KC Bra / KCP&P Shop - Customer Registration Modal Helper
 */

const CustomerModal = (() => {

    function open(onSuccessCallback = null) {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl relative">
                    
                    <button onclick="document.getElementById('modal-container').innerHTML=''" class="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>

                    <div>
                        <span class="text-xs font-bold text-rose-400 uppercase tracking-widest">CUSTOMER REGISTRATION</span>
                        <h3 class="text-lg font-serif font-bold text-slate-100 mt-0.5">ลงทะเบียนสมาชิกลูกค้าใหม่</h3>
                    </div>

                    <form onsubmit="CustomerModal.save(event)" class="flex flex-col gap-3.5 text-xs">
                        <div>
                            <label class="block font-semibold text-slate-300 mb-1">ชื่อ-นามสกุล ลูกค้า *</label>
                            <input type="text" id="cust-modal-name" required placeholder="เช่น คุณนภาพร ส." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-medium focus:outline-none focus:border-rose-500">
                        </div>

                        <!-- Phone Number is OPTIONAL (no mandatory asterisk *) -->
                        <div>
                            <label class="block font-semibold text-slate-300 mb-1">เบอร์โทรศัพท์ติดต่อ (ไม่บังคับกรอก)</label>
                            <input type="text" id="cust-modal-phone" placeholder="081-234-5678" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-rose-500">
                        </div>

                        <!-- Added Line ID & WhatsApp Contact Channels -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">Line</label>
                                <input type="text" id="cust-modal-line" placeholder="@kcbra_line" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-medium focus:outline-none focus:border-rose-500">
                            </div>
                            <div>
                                <label class="block font-semibold text-slate-300 mb-1">WhatsApp</label>
                                <input type="text" id="cust-modal-whatsapp" placeholder="+66812345678" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-medium focus:outline-none focus:border-rose-500">
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold text-slate-300 mb-1">อีเมล</label>
                            <input type="email" id="cust-modal-email" placeholder="customer@example.com" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-medium focus:outline-none focus:border-rose-500">
                        </div>

                        <div>
                            <label class="block font-semibold text-slate-300 mb-1">หมายเหตุ / ไซส์ประจำลูกค้า</label>
                            <textarea id="cust-modal-notes" rows="2" placeholder="เช่น ชอบเสื้อในรุ่น No.0777 ไซส์ 36" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-medium focus:outline-none focus:border-rose-500"></textarea>
                        </div>

                        <div class="flex items-center gap-2 pt-2">
                            <button type="submit" class="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-rose-950/50">
                                บันทึกข้อมูลสมาชิก
                            </button>
                            <button type="button" onclick="document.getElementById('modal-container').innerHTML=''" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all">
                                ยกเลิก
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        `;

        CustomerModal._onSuccess = onSuccessCallback;
        if (window.lucide) lucide.createIcons();
    }

    function save(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('cust-modal-name').value.trim(),
            phone: document.getElementById('cust-modal-phone').value.trim(),
            lineId: document.getElementById('cust-modal-line').value.trim(),
            whatsapp: document.getElementById('cust-modal-whatsapp').value.trim(),
            email: document.getElementById('cust-modal-email').value.trim(),
            notes: document.getElementById('cust-modal-notes').value.trim()
        };

        const newCustomer = db.saveCustomer(data);
        Utils.showToast(`บันทึกข้อมูลคุณ ${newCustomer.name} เรียบร้อยแล้ว!`);
        document.getElementById('modal-container').innerHTML = '';

        if (typeof CustomerModal._onSuccess === 'function') {
            CustomerModal._onSuccess(newCustomer);
        }
    }

    return {
        open,
        save
    };
})();
