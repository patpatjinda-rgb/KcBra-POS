/**
 * KC Bra / KCP&P Shop - Application Core & Tab Router Engine
 */

const app = (() => {

    let activeTab = 'pos';
    let isDarkTheme = true;

    function init() {
        // Subscribe components to DB updates
        db.subscribe(() => {
            renderActiveTab();
        });

        // Initialize default tab
        switchTab('pos');
    }

    function switchTab(tabId) {
        activeTab = tabId;

        // Update nav buttons active state
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeNavBtn = document.getElementById(`nav-${tabId}`);
        if (activeNavBtn) activeNavBtn.classList.add('active');

        // Hide all views
        document.querySelectorAll('.tab-view').forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });

        // Show selected view
        const activeView = document.getElementById(`view-${tabId}`);
        if (activeView) {
            activeView.classList.remove('hidden');
            activeView.classList.add('active');
        }

        renderActiveTab();
    }

    function renderActiveTab() {
        switch (activeTab) {
            case 'pos':
                POSComponent.init();
                break;
            case 'dashboard':
                DashboardComponent.init();
                break;
            case 'products':
                ProductsComponent.init();
                break;
            case 'customers':
                CustomersComponent.init();
                break;
            case 'reports':
                ReportsComponent.init();
                break;
        }

        if (window.lucide) lucide.createIcons();
    }

    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        const html = document.documentElement;
        const themeIcon = document.getElementById('theme-icon');

        if (isDarkTheme) {
            html.classList.add('dark');
            html.classList.remove('light');
            if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
        } else {
            html.classList.remove('dark');
            html.classList.add('light');
            if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
        }

        if (window.lucide) lucide.createIcons();
    }

    function resetSeedData() {
        if (confirm("คุณต้องการรีเซ็ตฐานข้อมูลกลับไปใช้แคตตาล็อกสินค้า KC Bra / KCP&P Shop จาก Google Sheet ใช่หรือไม่?")) {
            db.resetToSeedData();
            Utils.showToast("รีเซ็ตฐานข้อมูลเรียบร้อยแล้ว!");
            renderActiveTab();
        }
    }

    return {
        init,
        switchTab,
        toggleTheme,
        resetSeedData
    };
})();

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
