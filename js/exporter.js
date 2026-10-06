/**
 * KC Bra - Data Export Manager (Excel .xlsx & CSV)
 */

const Exporter = (() => {

    function exportToCSV(filename, rows) {
        if (!rows || !rows.length) {
            Utils.showToast("No data to export", "error");
            return;
        }

        const keys = Object.keys(rows[0]);
        const csvContent = [
            keys.join(','),
            ...rows.map(row => 
                keys.map(k => {
                    let cell = row[k] === null || row[k] === undefined ? '' : String(row[k]);
                    cell = cell.replace(/"/g, '""');
                    if (cell.search(/("|,|\n)/g) >= 0) {
                        cell = `"${cell}"`;
                    }
                    return cell;
                }).join(',')
            )
        ].join('\n');

        // Include UTF-8 BOM for Thai language Excel compatibility
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Utils.showToast(`Exported ${filename}.csv successfully!`);
    }

    function exportToExcel(filename, rows, sheetName = 'Sheet1') {
        if (!rows || !rows.length) {
            Utils.showToast("No data to export", "error");
            return;
        }

        if (window.XLSX) {
            try {
                const worksheet = XLSX.utils.json_to_sheet(rows);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
                XLSX.writeFile(workbook, `${filename}.xlsx`);
                Utils.showToast(`Exported ${filename}.xlsx successfully!`);
                return;
            } catch (err) {
                console.error("SheetJS export failed, falling back to CSV:", err);
            }
        }

        // Fallback to CSV
        exportToCSV(filename, rows);
    }

    function exportProducts(products) {
        const data = products.map(p => ({
            "Product ID": p.id,
            "SKU Code": p.sku,
            "Product Name": p.name,
            "Category": p.category,
            "Color": p.color,
            "Size": p.size,
            "Standard Price (THB)": p.standardPrice,
            "Current Stock": p.currentStock,
            "Stock Status": p.currentStock <= p.minStockAlert ? "LOW STOCK" : "NORMAL"
        }));
        exportToExcel(`kc_bra_products_${new Date().toISOString().split('T')[0]}`, data, "Products Catalog");
    }

    function exportInvoices(invoices) {
        const data = invoices.map(inv => ({
            "Invoice ID": inv.id,
            "Date & Time": inv.dateTime,
            "Customer Name": inv.customerName,
            "Items Count": inv.itemsCount,
            "Subtotal (THB)": inv.subtotal,
            "Discount (THB)": inv.discount,
            "Grand Total (THB)": inv.grandTotal,
            "Payment Method": inv.paymentMethod,
            "Payment Status": inv.paymentStatus
        }));
        exportToExcel(`kc_bra_sales_report_${new Date().toISOString().split('T')[0]}`, data, "Sales Invoices");
    }

    function exportCustomers(customers) {
        const data = customers.map(c => ({
            "Customer ID": c.id,
            "Customer Name": c.name,
            "Phone": c.phone,
            "Email": c.email,
            "Total Spent (THB)": c.totalSpent,
            "Total Orders": c.purchaseCount,
            "Registration Date": c.createdAt,
            "Notes": c.notes
        }));
        exportToExcel(`kc_bra_customers_${new Date().toISOString().split('T')[0]}`, data, "Customer Database");
    }

    return {
        exportToCSV,
        exportToExcel,
        exportProducts,
        exportInvoices,
        exportCustomers
    };
})();
