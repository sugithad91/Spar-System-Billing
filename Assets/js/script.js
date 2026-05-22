// Local Runtime Database Sync Keys
const STOCK_KEY = 'spar_stock_registry';
const CAT_KEY = 'spar_categories';
const SUPP_KEY = 'spar_suppliers';

let stockRegistry = []; 
let targetFilteredRegistry = [];
let operationalCategories = [];
let stockChartObj = null;
let condChartObj = null;

// Self-Executing Baseline Initialization Block
(() => {
    if (!localStorage.getItem(CAT_KEY)) {
        const defaultCats = ['Groceries', 'Dairy', 'Beverages', 'Packaged Foods', 'Personal Care'];
        localStorage.setItem(CAT_KEY, JSON.stringify(defaultCats));
    }
    if (!localStorage.getItem(SUPP_KEY)) {
        const defaultSupps = [
            { id: "SUP-1001", name: "Reliance Logistics Pvt Ltd", phone: "022-459102", email: "info@reliance.com", address: "Mumbai Hub" },
            { id: "SUP-1002", name: "Heritage Dairy Farms Node", phone: "040-231904", email: "supply@heritage.in", address: "Hyderabad Grid" },
            { id: "SUP-1003", name: "United Beverages Corp", phone: "080-881920", email: "orders@ubcorp.com", address: "Bangalore Depot" }
        ];
        localStorage.setItem(SUPP_KEY, JSON.stringify(defaultSupps));
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    loadCachedDataset();
    repopulateDynamicSelectElements();
    
    if (document.getElementById('inventory-table-rows')) {
        syncGlobalRegistryToView();
        evaluateDashboardMetrics();
        initializeGraphicsPlates();
    }
});

function loadCachedDataset() {
    const rawStock = localStorage.getItem(STOCK_KEY);
    
    // SMART FIX: If cache is empty OR contains only the old 2-product skeleton dataset, overwrite it with the 22 items
    if (rawStock && JSON.parse(rawStock).length > 2) {
        stockRegistry = JSON.parse(rawStock);
    } else {
        // Enriched 22-Product Core Baseline Stock Inventory Dataset
        stockRegistry = [
            { "id": "0101", "name": "Premium Basmati Rice 5kg", "category": "Groceries", "unit": "kg", "quantity": 120, "price": 450.00, "gst": 5, "supplierId": "SUP-1001", "mfgDate": "2026-01-15", "expDate": "2026-06-10", "condition": "Good", "invoice": "INV-7481029", "barcode": "8901011234017" },
            { "id": "0102", "name": "Organic Whole Milk 1L", "category": "Dairy", "unit": "liters", "quantity": 8, "price": 75.00, "gst": 0, "supplierId": "SUP-1002", "mfgDate": "2026-05-10", "expDate": "2026-05-25", "condition": "Good", "invoice": "INV-1950348", "barcode": "8901011234024" },
            { "id": "0103", "name": "Sparkling Apple Juice Mix 750ml", "category": "Beverages", "unit": "liters", "quantity": 210, "price": 120.00, "gst": 18, "supplierId": "SUP-1003", "mfgDate": "2026-03-20", "expDate": "2026-11-20", "condition": "Good", "invoice": "INV-3849102", "barcode": "8901011234031" },
            { "id": "0104", "name": "Choco Chip Oatmeal Biscuits", "category": "Packaged Foods", "unit": "pack", "quantity": 5, "price": 40.00, "gst": 18, "supplierId": "SUP-1001", "mfgDate": "2026-02-18", "expDate": "2026-08-18", "condition": "Damaged", "invoice": "INV-9948201", "barcode": "8901011234048" },
            { "id": "0105", "name": "Extra Virgin Olive Oil 1L", "category": "Groceries", "unit": "liters", "quantity": 45, "price": 850.00, "gst": 5, "supplierId": "SUP-1001", "mfgDate": "2026-02-10", "expDate": "2027-02-10", "condition": "Good", "invoice": "INV-7731049", "barcode": "8901011234055" },
            { "id": "0106", "name": "Greek Yogurt Plain 500g", "category": "Dairy", "unit": "kg", "quantity": 25, "price": 140.00, "gst": 0, "supplierId": "SUP-1002", "mfgDate": "2026-05-01", "expDate": "2026-05-21", "condition": "Good", "invoice": "INV-2294018", "barcode": "8901011234062" },
            { "id": "0107", "name": "Roasted Almonds Value Pack", "category": "Packaged Foods", "unit": "pack", "quantity": 80, "price": 350.00, "gst": 12, "supplierId": "SUP-1001", "mfgDate": "2026-04-05", "expDate": "2026-12-05", "condition": "Good", "invoice": "INV-4820194", "barcode": "8901011234079" },
            { "id": "0108", "name": "Cold Brew Coffee Concentrate", "category": "Beverages", "unit": "liters", "quantity": 60, "price": 90.00, "gst": 18, "supplierId": "SUP-1003", "mfgDate": "2026-05-08", "expDate": "2026-07-08", "condition": "Good", "invoice": "INV-1039482", "barcode": "8901011234086" },
            { "id": "0109", "name": "Dark Chocolate Infusion Bar", "category": "Packaged Foods", "unit": "pack", "quantity": 150, "price": 180.00, "gst": 18, "supplierId": "SUP-1001", "mfgDate": "2026-03-01", "expDate": "2027-03-01", "condition": "Good", "invoice": "INV-5829104", "barcode": "8901011234109" },
            { "id": "0110", "name": "Natural Mineral Water 5L Bulk", "category": "Beverages", "unit": "gallons", "quantity": 300, "price": 110.00, "gst": 18, "supplierId": "SUP-1003", "mfgDate": "2026-04-18", "expDate": "2027-04-18", "condition": "Good", "invoice": "INV-8849201", "barcode": "8901011234116" },
            { "id": "0111", "name": "Organic Forest Honey 500g", "category": "Groceries", "unit": "kg", "quantity": 40, "price": 420.00, "gst": 5, "supplierId": "SUP-1001", "mfgDate": "2026-01-20", "expDate": "2026-06-15", "condition": "Good", "invoice": "INV-3401928", "barcode": "8901011234123" },
            { "id": "0112", "name": "Cheddar Cheese Block 200g", "category": "Dairy", "unit": "kg", "quantity": 18, "price": 260.00, "gst": 5, "supplierId": "SUP-1002", "mfgDate": "2026-04-12", "expDate": "2026-06-05", "condition": "Good", "invoice": "INV-5920194", "barcode": "8901011234130" },
            { "id": "0113", "name": "Spiced Potato Chips Max Box", "category": "Packaged Foods", "unit": "pack", "quantity": 2, "price": 60.00, "gst": 18, "supplierId": "SUP-1001", "mfgDate": "2026-05-02", "expDate": "2026-11-02", "condition": "Damaged", "invoice": "INV-7039281", "barcode": "8901011234147" },
            { "id": "0114", "name": "Herbal Aloe Shampoo 500ml", "category": "Personal Care", "unit": "liters", "quantity": 95, "price": 280.00, "gst": 18, "supplierId": "SUP-1001", "mfgDate": "2026-02-25", "expDate": "2028-02-25", "condition": "Good", "invoice": "INV-4920138", "barcode": "8901011234154" },
            { "id": "0115", "name": "Moisturizing Body Wash Gel", "category": "Personal Care", "unit": "pack", "quantity": 4, "price": 320.00, "gst": 18, "supplierId": "SUP-1001", "mfgDate": "2026-03-14", "expDate": "2026-06-12", "condition": "Good", "invoice": "INV-9301928", "barcode": "8901011234161" },
            { "id": "0116", "name": "Fresh Alphonso Mangoes 1 Box", "category": "Groceries", "unit": "kg", "quantity": 50, "price": 600.00, "gst": 0, "supplierId": "SUP-1001", "mfgDate": "2026-05-12", "expDate": "2026-05-26", "condition": "Good", "invoice": "INV-1049281", "barcode": "8901011234178" },
            { "id": "0117", "name": "Salted Butter Premium 500g", "category": "Dairy", "unit": "kg", "quantity": 65, "price": 245.00, "gst": 12, "supplierId": "SUP-1002", "mfgDate": "2026-04-20", "expDate": "2026-07-20", "condition": "Good", "invoice": "INV-5829102", "barcode": "8901011234185" },
            { "id": "0118", "name": "Pure Apple Cider Vinegar 500ml", "category": "Groceries", "unit": "liters", "quantity": 35, "price": 199.00, "gst": 5, "supplierId": "SUP-1001", "mfgDate": "2026-01-10", "expDate": "2026-06-08", "condition": "Good", "invoice": "INV-6920194", "barcode": "8901011234192" },
            { "id": "0119", "name": "Premium Refined Sunflower Oil", "category": "Groceries", "unit": "gallons", "quantity": 110, "price": 540.00, "gst": 5, "supplierId": "SUP-1001", "mfgDate": "2026-03-15", "expDate": "2027-03-15", "condition": "Good", "invoice": "INV-3049182", "barcode": "8901011234208" },
            { "id": "0120", "name": "Instant Masala Noodles 12-Pack", "category": "Packaged Foods", "unit": "pack", "quantity": 140, "price": 168.00, "gst": 18, "supplierId": "SUP-1001", "mfgDate": "2026-04-01", "expDate": "2026-10-01", "condition": "Good", "invoice": "INV-7492014", "barcode": "8901011234215" },
            { "id": "0121", "name": "Sugar Free Cranberry Drink", "category": "Beverages", "unit": "liters", "quantity": 7, "price": 145.00, "gst": 18, "supplierId": "SUP-1003", "mfgDate": "2026-04-10", "expDate": "2026-05-30", "condition": "Good", "invoice": "INV-8830192", "barcode": "8901011234222" },
            { "id": "0122", "name": "Antibacterial Hand Soap Liquid", "category": "Personal Care", "unit": "liters", "quantity": 190, "price": 85.00, "gst": 18, "supplierId": "SUP-1001", "mfgDate": "2026-02-12", "expDate": "2027-02-12", "condition": "Good", "invoice": "INV-2940192", "barcode": "8901011234239" }
        ];
        persistToLocalStorage();
    }
    operationalCategories = JSON.parse(localStorage.getItem(CAT_KEY));
}


function persistToLocalStorage() {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stockRegistry));
}

function repopulateDynamicSelectElements() {
    const filterCat = document.getElementById('filter-cat-select');
    const formCat = document.getElementById('input-cat');
    const formSupp = document.getElementById('input-supplier-id');

    if (filterCat && formCat) {
        filterCat.innerHTML = '<option value="">All Categories</option>';
        formCat.innerHTML = '';
        operationalCategories.forEach(cat => {
            filterCat.innerHTML += `<option value="${cat}">${cat}</option>`;
            formCat.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }

    if (formSupp) {
        const vendors = JSON.parse(localStorage.getItem(SUPP_KEY)) || [];
        formSupp.innerHTML = '';
        vendors.forEach(v => {
            formSupp.innerHTML += `<option value="${v.id}">${v.id} - ${v.name}</option>`;
        });
    }
}

function syncGlobalRegistryToView() {
    targetFilteredRegistry = [...stockRegistry];
    refreshDataGridDisplay();
}

function switchPage(targetPageId, navElement) {
    document.querySelectorAll('.app-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
         
    document.getElementById(targetPageId).classList.add('active');
    navElement.classList.add('active');

    if(targetPageId === 'dashboard-view') {
        evaluateDashboardMetrics();
        syncGraphicPlatesData();
    }
}

function evaluateDashboardMetrics() {
    const totalLinesCount = stockRegistry.length;
    const totalUnitsQuantity = stockRegistry.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
    const capitalWorth = stockRegistry.reduce((sum, item) => sum + ((parseFloat(item.price) * parseInt(item.quantity || 0)) * (1 + parseInt(item.gst || 0) / 100)), 0);
    const lowStockCount = stockRegistry.filter(item => parseInt(item.quantity || 0) < 10).length;

    document.getElementById('metric-total').textContent = totalLinesCount;
    document.getElementById('metric-quantity').textContent = totalUnitsQuantity;
    document.getElementById('metric-value').textContent = '₹' + capitalWorth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('metric-low-stock').textContent = lowStockCount;
}

function initializeGraphicsPlates() {
    const canvasStock = document.getElementById('stockChart')?.getContext('2d');
    const canvasCond = document.getElementById('conditionChart')?.getContext('2d');
    if (!canvasStock || !canvasCond) return;

    if (stockChartObj) stockChartObj.destroy();
    if (condChartObj) condChartObj.destroy();

    stockChartObj = new Chart(canvasStock, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Stock Volume (Units)', data: [], backgroundColor: '#3f7594', barThickness: 'flex' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Stock Levels by Category', color: '#063b8a', font: { size: 14, weight: 'bold' } } } }
    });

    condChartObj = new Chart(canvasCond, {
        type: 'doughnut',
        data: { labels: ['Stable Stock', 'Damaged Defective', 'Low Stock Alert (<10)'], datasets: [{ data: [], backgroundColor: ['#0b936a', '#c35858', '#f59e0b'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Inventory Stock Status Mix', color: '#063b8a', font: { size: 14, weight: 'bold' } } } }
    });
    syncGraphicPlatesData();
}

function syncGraphicPlatesData() {
    if(!stockChartObj || !condChartObj) return;

    const countedValues = operationalCategories.map(cat => {
        return stockRegistry.filter(item => item.category === cat).reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
    });
         
    stockChartObj.data.labels = operationalCategories;
    stockChartObj.data.datasets[0].data = countedValues;
    stockChartObj.update();

    const totalLowStock = stockRegistry.filter(item => parseInt(item.quantity || 0) < 10).reduce((sum, i) => sum + parseInt(i.quantity || 0), 0);
    const regularGood = stockRegistry.filter(item => item.condition === 'Good' && parseInt(item.quantity || 0) >= 10).reduce((sum, i) => sum + parseInt(i.quantity || 0), 0);
    const regularDamaged = stockRegistry.filter(item => item.condition === 'Damaged' && parseInt(item.quantity || 0) >= 10).reduce((sum, i) => sum + parseInt(i.quantity || 0), 0);

    condChartObj.data.datasets[0].data = [regularGood, regularDamaged, totalLowStock];
    condChartObj.update();
}

function refreshDataGridDisplay() {
    const tableBody = document.getElementById('inventory-table-rows');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (targetFilteredRegistry.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:var(--text-secondary); padding:2rem;">No matching product records verified.</td></tr>`;
        return;
    }

    targetFilteredRegistry.forEach(item => {
        const tr = document.createElement('tr');
        const isLowStock = parseInt(item.quantity || 0) < 10;
        if (isLowStock) tr.classList.add('low-stock-warning-row');

        const calculatedGstValue = parseFloat(item.price) * (parseInt(item.gst || 0) / 100);
        let statusBadgeHtml = item.condition === 'Damaged' ? `<span class="status-badge damaged">Damaged</span>` : (isLowStock ? `<span class="status-badge low-stock">Low Stock</span>` : `<span class="status-badge good">Good</span>`);

        tr.innerHTML = `
            <td style="font-family:monospace; font-weight:bold; color:var(--text-secondary);">${item.id}</td>
            <td>
                <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(item.name)}</div>
                <div style="margin-top:4px;">${statusBadgeHtml}</div>
            </td>
            <td>
                <span style="font-size:12px; font-family:monospace; font-weight:bold; color:var(--text-secondary);">${escapeHtml(item.invoice || 'N/A')}</span>
                <small style="display:block; color:gray;">ID: ${item.supplierId || 'Direct'}</small>
            </td>
            <td><svg id="barcode-canvas-${item.id}" class="barcode-svg"></svg>
            <button class="btn-action-icon download-action" onclick="downloadBarcodePDF('${item.id}')"><i class="fa-solid fa-file-pdf"></i></button></td>
            <td><span style="padding:4px 8px; font-size:12px; background:var(--bg-base); border-radius:4px; font-weight:500;">${item.category}</span></td>
            <td style="font-weight:600;">${item.quantity} <small style="color:var(--text-secondary);">${item.unit || 'units'}</small></td>
            <td>₹${parseFloat(item.price).toFixed(2)}</td>
            <td>${item.gst}% <small style="color:var(--text-secondary); display:block;">+₹${calculatedGstValue.toFixed(2)}</small></td>
            <td>
                <div style="font-size:11px;"><b>MFG:</b> ${item.mfgDate}</div>
                <div style="font-size:11px; color:var(--text-secondary);"><b>EXP:</b> ${item.expDate}</div>
            </td>
            <td>
                <div class="row-actions-block">
                    <button class="btn-action-icon edit-action" onclick="editProductItem('${item.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-action-icon delete-action" onclick="purgeProductItem('${item.id}')"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);

        setTimeout(() => {
            try {
                JsBarcode(`#barcode-canvas-${item.id}`, item.barcode, {
                    format: "EAN13", width: 1.0, height: 20, displayValue: true, fontSize: 8, margin: 0
                });
            } catch (err) {
                JsBarcode(`#barcode-canvas-${item.id}`, item.id, { format: "CODE128", width: 1.0, height: 20, displayValue: true, fontSize: 8 });
            }
        }, 5);
    });
}
function downloadBarcodePDF(itemId) {
    const originalSvg = document.getElementById(`barcode-canvas-${itemId}`);
    if (!originalSvg) {
        alert("Barcode element not found.");
        return;
    }

    // Convert live SVG XML to a clean string format
    const svgSerializer = new XMLSerializer();
    const svgString = svgSerializer.serializeToString(originalSvg);

    // Create a temporary hidden iframe for printing layout isolation
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    
    // Write a clean HTML wrapper directly inside the frame
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Barcode_${itemId}</title>
            <style>
                @page {
                    size: auto;
                    margin: 0mm;
                }
                body {
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #ffffff;
                }
                svg {
                    width: 100%;
                    max-width: 300px;
                    height: auto;
                }
            </style>
        </head>
        <body>
            ${svgString}
            <script>
                // Auto-trigger printing/saving window as soon as elements register
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.frameElement.remove();
                    }, 100);
                };
            <\/script>
        </body>
        </html>
    `);
    doc.close();
}


function filterDataGrid() {
    // Collect criteria parameters and normalize case variations
    const query = document.getElementById('search-bar').value.toLowerCase().trim();
    const targetCategory = document.getElementById('filter-cat-select').value;
    const filterMfg = document.getElementById('filter-mfg-date').value;
    const filterExp = document.getElementById('filter-exp-date').value;

    targetFilteredRegistry = stockRegistry.filter(item => {
        // Multi-tier query match string mapping
        const matchesId = item.id && item.id.toLowerCase().includes(query);
        const matchesName = item.name && item.name.toLowerCase().includes(query);
        const matchesInvoice = item.invoice && item.invoice.toLowerCase().includes(query);
        
        // Composite query match state validation
        const matchesQuery = matchesId || matchesName || matchesInvoice;
        
        // Contextual date and category match filtering
        const matchesCategory = !targetCategory || item.category === targetCategory;
        const matchesMfg = !filterMfg || item.mfgDate === filterMfg;
        const matchesExp = !filterExp || item.expDate === filterExp;
        
        return matchesQuery && matchesCategory && matchesMfg && matchesExp;
    });
    
    // Refresh visual interface components instantly
    refreshDataGridDisplay();
}


/* ==========================================================================
   Modals Management & Submission Pipelines
   ========================================================================== */
function showProductModal() {
    document.getElementById('product-entry-form').reset();
    document.getElementById('entry-target-id').value = '';
    document.getElementById('modal-heading-text').textContent = 'New Product Record Form';
    document.getElementById('form-validation-alert').style.display = 'none';
    
    // Auto-assignment restricted solely to barcodes. Invoices left unpopulated for input.
    document.getElementById('input-barcode').value = "890" + Math.floor(1000000000 + Math.random() * 9000000000);
    
    repopulateDynamicSelectElements();
    document.getElementById('entry-modal').classList.add('open');
}

function hideProductModal() {
    document.getElementById('entry-modal').classList.remove('open');
}

function triggerInlineCategoryInjection() {
    const rawCategory = prompt("Register dynamic product category grouping node:");
    if (!rawCategory || !rawCategory.trim()) return;
    
    const standardized = rawCategory.trim().charAt(0).toUpperCase() + rawCategory.trim().slice(1);
    if (operationalCategories.some(c => c.toLowerCase() === standardized.toLowerCase())) {
        alert("Action Cancelled: Specified validation token conflicts with registered classifications.");
        return;
    }
    
    operationalCategories.push(standardized);
    localStorage.setItem(CAT_KEY, JSON.stringify(operationalCategories));
    repopulateDynamicSelectElements();
    document.getElementById('input-cat').value = standardized;
}

function commitFormSubmission(event) {
    event.preventDefault();
    const alertBox = document.getElementById('form-validation-alert');
    alertBox.style.display = 'none';

    const targetId = document.getElementById('entry-target-id').value;
    const name = document.getElementById('input-name').value.trim();
    const category = document.getElementById('input-cat').value;
    const unit = document.getElementById('input-unit').value;
    const quantity = parseInt(document.getElementById('input-qty').value);
    const price = parseFloat(document.getElementById('input-price').value);
    const gst = parseInt(document.getElementById('input-gst').value);
    const supplierId = document.getElementById('input-supplier-id').value;
    const condition = document.getElementById('input-cond').value;
    const mfgDate = document.getElementById('input-mfg').value;
    const expDate = document.getElementById('input-exp').value;
    const invoice = document.getElementById('input-invoice').value.trim();
    const barcode = document.getElementById('input-barcode').value;

    const runtimeTimeframeMarker = new Date();

    if (new Date(mfgDate) > runtimeTimeframeMarker) {
        alertBox.textContent = "Data Matrix Refused: Manufacturing origin timeline metrics cannot exceed current date thresholds.";
        alertBox.style.display = 'block';
        return;
    }

    if (new Date(mfgDate) >= new Date(expDate)) {
        alertBox.textContent = "Validation Failure: Manufacturing timeline dates must precede expiration markers.";
        alertBox.style.display = 'block';
        return;
    }

    if (targetId) {
        const idx = stockRegistry.findIndex(p => p.id === targetId);
        if (idx !== -1) {
            stockRegistry[idx] = { id: targetId, name, category, unit, quantity, price, gst, supplierId, mfgDate, expDate, condition, invoice, barcode };
        }
    } else {
        const nextId = String(stockRegistry.length > 0 ? Math.max(...stockRegistry.map(o => parseInt(o.id))) + 1 : 101).padStart(4, '0');
        stockRegistry.push({ id: nextId, name, category, unit, quantity, price, gst, supplierId, mfgDate, expDate, condition, invoice, barcode });
    }

    persistToLocalStorage();
    hideProductModal();
    filterDataGrid();
    evaluateDashboardMetrics();
}

function editProductItem(id) {
    const item = stockRegistry.find(p => p.id === id);
    if (!item) return;

    showProductModal();
    document.getElementById('modal-heading-text').textContent = `Modify Product Record [ID: ${id}]`;
    document.getElementById('entry-target-id').value = item.id;
    document.getElementById('input-name').value = item.name;
    document.getElementById('input-cat').value = item.category;
    document.getElementById('input-unit').value = item.unit || 'kg';
    document.getElementById('input-qty').value = item.quantity;
    document.getElementById('input-price').value = item.price;
    document.getElementById('input-gst').value = item.gst || 0;
    document.getElementById('input-supplier-id').value = item.supplierId || '';
    document.getElementById('input-cond').value = item.condition || 'Good';
    document.getElementById('input-mfg').value = item.mfgDate || '';
    document.getElementById('input-exp').value = item.expDate || '';
    document.getElementById('input-invoice').value = item.invoice || '';
    document.getElementById('input-barcode').value = item.barcode || '';
}

function purgeProductItem(id) {
    if (confirm(`Purge item resource data row [ID: ${id}]?`)) {
        stockRegistry = stockRegistry.filter(item => item.id !== id);
        persistToLocalStorage();
        filterDataGrid();
        evaluateDashboardMetrics();
    }
}



function exportDataGridCSV() {
    if (targetFilteredRegistry.length === 0) return;
    let csv = "Item ID,Name,Category,Unit,Quantity,Price,GST,Supplier ID,Mfg Date,Exp Date,Condition,Invoice,Barcode\n";
    targetFilteredRegistry.forEach(i => {
        csv += `"${i.id}","${i.name.replace(/"/g, '""')}","${i.category}","${i.unit || 'unit'}",${i.quantity},${i.price},${i.gst},"${i.supplierId}","${i.mfgDate}","${i.expDate}","${i.condition}","${i.invoice}","${i.barcode}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `SPAR_Dump_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
