/**
 * KC Bra - Utility Functions & UI Helpers
 */

const Utils = (() => {

    function formatCurrency(amount) {
        const val = parseFloat(amount) || 0;
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            maximumFractionDigits: 0
        }).format(val);
    }

    function formatDateTime(date = new Date()) {
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    }

    function getCategoryBadgeClass(category) {
        switch (category) {
            case 'Bra':
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'Panty':
                return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
            case 'Shapewear Control':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Inner Bra Tops':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Bottom-Hip Push up':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    }

    function showToast(message, type = 'success') {
        const toastId = 'kc-toast-box';
        let toastBox = document.getElementById(toastId);
        
        if (!toastBox) {
            toastBox = document.createElement('div');
            toastBox.id = toastId;
            toastBox.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(toastBox);
        }

        const el = document.createElement('div');
        const bgClass = type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/90 border-rose-500/40 text-rose-200';
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';

        el.className = `flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 pointer-events-auto ${bgClass}`;
        el.innerHTML = `
            <i data-lucide="${icon}" class="w-5 h-5 shrink-0"></i>
            <span class="text-sm font-medium">${message}</span>
        `;

        toastBox.appendChild(el);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => {
            el.classList.remove('translate-y-4', 'opacity-0');
        });

        setTimeout(() => {
            el.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }

    return {
        formatCurrency,
        formatDateTime,
        getCategoryBadgeClass,
        showToast
    };
})();
