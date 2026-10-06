/**
 * KC Bra / KCP&P Shop - Database Manager
 * Persistent LocalStorage / IndexedDB Engine
 */

class DatabaseManager {
    constructor() {
        this.STORAGE_KEY_PRODUCTS = 'kcpp_products_v3';
        this.STORAGE_KEY_CUSTOMERS = 'kcpp_customers_v3';
        this.STORAGE_KEY_INVOICES = 'kcpp_invoices_v3';
        
        this.products = [];
        this.customers = [];
        this.invoices = [];
        this.subscribers = [];

        this.init();
    }

    init() {
        try {
            const rawProducts = localStorage.getItem(this.STORAGE_KEY_PRODUCTS);
            const rawCustomers = localStorage.getItem(this.STORAGE_KEY_CUSTOMERS);
            const rawInvoices = localStorage.getItem(this.STORAGE_KEY_INVOICES);

            if (!rawProducts) {
                this.products = SEED_DATA.getProducts();
                this.customers = SEED_DATA.getCustomers();
                this.invoices = SEED_DATA.getInvoices();
                this.saveAllToStorage();
            } else {
                this.products = JSON.parse(rawProducts);
                this.customers = JSON.parse(rawCustomers || '[]');
                this.invoices = JSON.parse(rawInvoices || '[]');
            }
        } catch (err) {
            console.error("Storage error, resetting data:", err);
            this.products = SEED_DATA.getProducts();
            this.customers = SEED_DATA.getCustomers();
            this.invoices = SEED_DATA.getInvoices();
            this.saveAllToStorage();
        }
    }

    saveAllToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY_PRODUCTS, JSON.stringify(this.products));
            localStorage.setItem(this.STORAGE_KEY_CUSTOMERS, JSON.stringify(this.customers));
            localStorage.setItem(this.STORAGE_KEY_INVOICES, JSON.stringify(this.invoices));
            this.notifySubscribers();
        } catch (err) {
            console.error("Failed to write to localStorage:", err);
        }
    }

    subscribe(callback) {
        if (typeof callback === 'function') {
            this.subscribers.push(callback);
        }
    }

    notifySubscribers() {
        this.subscribers.forEach(cb => cb());
    }

    resetToSeedData() {
        this.products = SEED_DATA.getProducts();
        this.customers = SEED_DATA.getCustomers();
        this.invoices = SEED_DATA.getInvoices();
        this.saveAllToStorage();
    }

    // --- PRODUCT CRUD & COLOR STOCK AUDIT ---
    getProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    getProductBySKU(sku) {
        if (!sku) return null;
        const normalized = sku.trim().toLowerCase();
        return this.products.find(p => p.sku.toLowerCase() === normalized);
    }

    saveProduct(productData) {
        if (productData.id) {
            const index = this.products.findIndex(p => p.id === productData.id);
            if (index !== -1) {
                this.products[index] = { ...this.products[index], ...productData };
            }
        } else {
            const newProduct = {
                id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                minStockAlert: 10,
                colors: productData.colors || ["ดำ", "เนื้อ", "คละสี"],
                colorStock: productData.colorStock || {},
                ...productData
            };
            this.products.unshift(newProduct);
        }
        this.saveAllToStorage();
    }

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveAllToStorage();
    }

    updateColorStockInline(productId, colorName, newStock) {
        const prod = this.products.find(p => p.id === productId);
        if (prod) {
            if (!prod.colorStock) prod.colorStock = {};
            const parsedStock = Math.max(0, parseInt(newStock) || 0);
            prod.colorStock[colorName] = parsedStock;
            this.saveAllToStorage();
            return true;
        }
        return false;
    }

    getTotalStock(product) {
        if (!product || !product.colorStock) return 0;
        return Object.values(product.colorStock).reduce((acc, count) => acc + (parseInt(count) || 0), 0);
    }

    // --- CUSTOMER CRM ---
    getCustomers() {
        return this.customers;
    }

    getCustomerById(id) {
        return this.customers.find(c => c.id === id);
    }

    saveCustomer(customerData) {
        if (customerData.id) {
            const index = this.customers.findIndex(c => c.id === customerData.id);
            if (index !== -1) {
                this.customers[index] = { ...this.customers[index], ...customerData };
            }
        } else {
            const newCustomer = {
                id: `cust_${Date.now()}`,
                totalSpent: 0,
                purchaseCount: 0,
                lineId: customerData.lineId || '',
                whatsapp: customerData.whatsapp || '',
                createdAt: new Date().toISOString().split('T')[0],
                notes: '',
                ...customerData
            };
            this.customers.unshift(newCustomer);
            this.saveAllToStorage();
            return newCustomer;
        }
        this.saveAllToStorage();
    }

    getInvoiceById(id) {
        return this.invoices.find(inv => inv.id === id);
    }

    createInvoice(invoiceData) {
        const invoiceId = this.generateInvoiceId();

        const newInvoice = {
            id: invoiceId,
            dateTime: invoiceData.dateTime || Utils.formatDateTime(new Date()),
            customerId: invoiceData.customerId || 'walk-in',
            customerName: invoiceData.customerName || 'ลูกค้าหน้าร้านทั่วไป',
            subtotal: invoiceData.subtotal,
            discount: invoiceData.discount || 0,
            deposit: invoiceData.deposit || 0,
            shippingFee: invoiceData.shippingFee || 0, // ค่าจัดส่ง
            grandTotal: invoiceData.grandTotal, // ยอดสุทธิ
            paymentStatus: 'Paid',
            paymentMethod: invoiceData.paymentMethod || 'Cash',
            itemsCount: invoiceData.items.length,
            items: invoiceData.items
        };

        this.invoices.unshift(newInvoice);

        // Auto stock deduction per color
        invoiceData.items.forEach(item => {
            const product = this.products.find(p => p.id === item.productId || p.sku === item.productCode);
            if (product && product.colorStock && item.selectedColor) {
                const current = parseInt(product.colorStock[item.selectedColor]) || 0;
                const qtyPcs = item.unit === 'DOZ/โหล' ? item.quantity * 12 : item.quantity;
                product.colorStock[item.selectedColor] = Math.max(0, current - qtyPcs);
            }
        });

        if (invoiceData.customerId && invoiceData.customerId !== 'walk-in') {
            const customer = this.customers.find(c => c.id === invoiceData.customerId);
            if (customer) {
                customer.totalSpent = (customer.totalSpent || 0) + invoiceData.grandTotal;
                customer.purchaseCount = (customer.purchaseCount || 0) + 1;
            }
        }

        this.saveAllToStorage();
        return newInvoice;
    }

    updateInvoice(invoiceId, updatedData) {
        const index = this.invoices.findIndex(inv => inv.id === invoiceId);
        if (index === -1) return null;

        const oldInvoice = this.invoices[index];

        // 1. REVERSE old stock deduction
        if (oldInvoice.items && Array.isArray(oldInvoice.items)) {
            oldInvoice.items.forEach(item => {
                const product = this.products.find(p => p.id === item.productId || p.sku === item.productCode);
                if (product && product.colorStock && item.selectedColor) {
                    const current = parseInt(product.colorStock[item.selectedColor]) || 0;
                    const qtyPcs = item.unit === 'DOZ/โหล' ? item.quantity * 12 : item.quantity;
                    product.colorStock[item.selectedColor] = current + qtyPcs;
                }
            });
        }

        // 2. REVERSE old customer total spent
        if (oldInvoice.customerId && oldInvoice.customerId !== 'walk-in') {
            const oldCustomer = this.customers.find(c => c.id === oldInvoice.customerId);
            if (oldCustomer) {
                oldCustomer.totalSpent = Math.max(0, (oldCustomer.totalSpent || 0) - (oldInvoice.grandTotal || 0));
                oldCustomer.purchaseCount = Math.max(0, (oldCustomer.purchaseCount || 0) - 1);
            }
        }

        // 3. UPDATE invoice object
        const updatedInvoice = {
            ...oldInvoice,
            ...updatedData,
            id: invoiceId, // Preserve original invoice ID
            itemsCount: updatedData.items ? updatedData.items.length : oldInvoice.itemsCount
        };

        this.invoices[index] = updatedInvoice;

        // 4. APPLY new stock deduction
        if (updatedInvoice.items && Array.isArray(updatedInvoice.items)) {
            updatedInvoice.items.forEach(item => {
                const product = this.products.find(p => p.id === item.productId || p.sku === item.productCode);
                if (product && product.colorStock && item.selectedColor) {
                    const current = parseInt(product.colorStock[item.selectedColor]) || 0;
                    const qtyPcs = item.unit === 'DOZ/โหล' ? item.quantity * 12 : item.quantity;
                    product.colorStock[item.selectedColor] = Math.max(0, current - qtyPcs);
                }
            });
        }

        // 5. APPLY new customer total spent
        if (updatedInvoice.customerId && updatedInvoice.customerId !== 'walk-in') {
            const newCustomer = this.customers.find(c => c.id === updatedInvoice.customerId);
            if (newCustomer) {
                newCustomer.totalSpent = (newCustomer.totalSpent || 0) + (updatedInvoice.grandTotal || 0);
                newCustomer.purchaseCount = (newCustomer.purchaseCount || 0) + 1;
            }
        }

        this.saveAllToStorage();
        return updatedInvoice;
    }

    deleteInvoice(invoiceId) {
        const index = this.invoices.findIndex(inv => inv.id === invoiceId);
        if (index === -1) return false;

        const targetInvoice = this.invoices[index];

        // 1. REVERSE stock deduction
        if (targetInvoice.items && Array.isArray(targetInvoice.items)) {
            targetInvoice.items.forEach(item => {
                const product = this.products.find(p => p.id === item.productId || p.sku === item.productCode);
                if (product && product.colorStock && item.selectedColor) {
                    const current = parseInt(product.colorStock[item.selectedColor]) || 0;
                    const qtyPcs = item.unit === 'DOZ/โหล' ? item.quantity * 12 : item.quantity;
                    product.colorStock[item.selectedColor] = current + qtyPcs;
                }
            });
        }

        // 2. REVERSE customer total spent
        if (targetInvoice.customerId && targetInvoice.customerId !== 'walk-in') {
            const customer = this.customers.find(c => c.id === targetInvoice.customerId);
            if (customer) {
                customer.totalSpent = Math.max(0, (customer.totalSpent || 0) - (targetInvoice.grandTotal || 0));
                customer.purchaseCount = Math.max(0, (customer.purchaseCount || 0) - 1);
            }
        }

        this.invoices.splice(index, 1);
        this.saveAllToStorage();
        return true;
    }
}

const db = new DatabaseManager();
