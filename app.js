document.addEventListener('DOMContentLoaded', () => {
    const emptyState = document.getElementById('empty-state');
    const mainDashboard = document.getElementById('main-dashboard');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // UI Elements
    const sellerList = document.getElementById('seller-list');
    const sellerSearch = document.getElementById('seller-search');
    const sellerCount = document.getElementById('seller-count');
    const currentSellerName = document.getElementById('current-seller-name');
    
    const ordersTbody = document.getElementById('orders-tbody');
    const statOrders = document.getElementById('stat-orders');
    const statClients = document.getElementById('stat-clients');
    const statBoxes = document.getElementById('stat-boxes');
    const deliveryFilter = document.getElementById('delivery-filter');
    const clientSearch = document.getElementById('client-search');
    
    let globalData = [];
    let sellersData = {}; // Map of { ZV: [orders] }
    let activeSeller = null;

    sellerSearch.addEventListener('input', handleSearch);
    
    // Cargar automáticamente los datos al iniciar
    loadDataAutomatically();
    
    if(deliveryFilter) {
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const y = tomorrow.getFullYear();
        const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const d = String(tomorrow.getDate()).padStart(2, '0');
        deliveryFilter.value = `${y}-${m}-${d}`;

        deliveryFilter.addEventListener('change', () => {
            if (activeSeller) renderDashboard(activeSeller);
        });
    }
    
    if(clientSearch) {
        clientSearch.addEventListener('input', () => {
            if (activeSeller) renderDashboard(activeSeller);
        });
    }

    async function loadDataAutomatically() {
        loadingOverlay.classList.remove('hidden');

        try {
            // Intentar descargar el archivo 'pedidos.xlsx' alojado junto al HTML
            const response = await fetch('pedidos.xlsx', { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error('Archivo pedidos.xlsx no encontrado en el servidor.');
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(new Uint8Array(arrayBuffer), {type: 'array'});
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            
            // Convert to JSON
            const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            
            processExcelData(rawJson);
            
            const lastUpdateEl = document.getElementById('last-update');
            if (lastUpdateEl) {
                const now = new Date();
                lastUpdateEl.textContent = `Última act: ${now.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`;
                const container = document.getElementById('last-update-container');
                if (container) container.style.display = 'block';
            }
            
            emptyState.classList.add('hidden');
            mainDashboard.classList.remove('hidden');
        } catch (error) {
            console.error("Error fetching Excel:", error);
            emptyState.classList.remove('hidden');
            mainDashboard.classList.add('hidden');
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }

    function processExcelData(data) {
        // Filtros solicitados: TpMt = FERT, ClVt en ZPP3, ZPP5, ZPPV
        const validClVt = ["ZPP3", "ZPP5", "ZPPV"];
        
        globalData = data.filter(row => {
            const tpMt = String(row["TpMt"] || "").trim().toUpperCase();
            const clVt = String(row["ClVt"] || "").trim().toUpperCase();
            return tpMt === "FERT" && validClVt.includes(clVt);
        });

        // Agrupar por vendedor (ZV)
        sellersData = {};
        
        globalData.forEach(row => {
            const zv = String(row["ZV"] || "Sin Vendedor").trim();
            if (!sellersData[zv]) {
                sellersData[zv] = [];
            }
            sellersData[zv].push(row);
        });

        renderSellersList(Object.keys(sellersData));
    }

    function renderSellersList(sellers) {
        sellerList.innerHTML = '';
        sellerCount.textContent = sellers.length;

        // Sort sellers alphabetically
        sellers.sort().forEach(zv => {
            const li = document.createElement('li');
            li.className = 'seller-item';
            li.innerHTML = `
                <div class="seller-name">Vendedor: ${zv}</div>
                <div class="seller-id">Pedidos: ${sellersData[zv].length}</div>
            `;
            
            li.addEventListener('click', () => {
                document.querySelectorAll('.seller-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                activeSeller = zv;
                renderDashboard(zv);
            });
            
            sellerList.appendChild(li);
        });
        
        // Auto-select first seller if exists
        if (sellers.length > 0) {
            sellerList.firstChild.click();
        }
    }

    function handleSearch(e) {
        const term = e.target.value.toLowerCase();
        const allSellers = Object.keys(sellersData);
        const filtered = allSellers.filter(zv => zv.toLowerCase().includes(term));
        renderSellersList(filtered);
    }

    function renderDashboard(zv) {
        let orders = sellersData[zv] || [];
        currentSellerName.textContent = `Vendedor: ${zv}`;
        
        const filterDateStr = deliveryFilter ? deliveryFilter.value : "";
        const searchStr = clientSearch ? clientSearch.value.toLowerCase() : "";
        
        if (filterDateStr || searchStr) {
            orders = orders.filter(order => {
                let matchDate = true;
                let matchSearch = true;
                
                if (filterDateStr) {
                    const dateIso = formatToIsoDate(order["FePrefEnt."]);
                    matchDate = (dateIso === filterDateStr);
                }
                
                if (searchStr) {
                    const clientName = String(order["Nombre 1"] || "").toLowerCase();
                    const clientId = String(order["Solic."] || "").toLowerCase();
                    matchSearch = clientName.includes(searchStr) || clientId.includes(searchStr);
                }
                
                return matchDate && matchSearch;
            });
        }
        
        // Stats
        const uniqueOrders = new Set(orders.map(o => o["Nº pedido cliente"])).size;
        statOrders.textContent = uniqueOrders;
        
        const uniqueClients = new Set(orders.map(o => o["Solic."])).size;
        statClients.textContent = uniqueClients;
        
        const umTotals = {};
        orders.forEach(order => {
            const qty = parseFloat(order["Cantidad de pedido"]) || 0;
            const umRaw = String(order["UM"] || "S/U").trim().toUpperCase();
            const um = (umRaw === "C/U" || umRaw === "PQ") ? "MKP" : String(order["UM"] || "S/U").trim();
            if(!umTotals[um]) umTotals[um] = 0;
            umTotals[um] += qty;
        });
        
        const umTexts = Object.entries(umTotals).map(([um, qty]) => {
            return `${qty.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${um}`;
        });
        statBoxes.innerHTML = umTexts.join('<br>') || "0";
        
        // Render Table
        ordersTbody.innerHTML = '';
        
        orders.forEach((order, index) => {
            const clientName = order["Nombre 1"] || "N/A";
            const clientId = order["Solic."] || "N/A";
            const material = order["Material"] || "N/A";
            const desc = order["Denominación"] || "N/A";
            
            const dateCreated = formatDate(order["Creado el"]);
            const dateDelivery = formatDate(order["FePrefEnt."]);
            
            const qty = order["Cantidad de pedido"] || 0;
            const umRaw = String(order["UM"] || "").trim().toUpperCase();
            const um = (umRaw === "C/U" || umRaw === "PQ") ? "MKP" : String(order["UM"] || "").trim();
            const orderNum = order["Nº pedido cliente"] || "N/A";
            
            const cPagValue = String(order["CPag"] || "").trim();
            const condicionPago = (cPagValue === "0001") ? "Contado" : "Crédito";
            const asegurarPago = order["Asegurar pago"] || "N/A";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="client-name" style="color: #fff; font-weight: 500;">${orderNum}</div>
                </td>
                <td>
                    <div class="client-name">${clientName}</div>
                    <div class="client-id">Cod: ${clientId}</div>
                </td>
                <td>
                    <div class="date-badge" style="background: ${condicionPago === 'Contado' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${condicionPago === 'Contado' ? '#34d399' : '#fbbf24'};">${condicionPago}</div>
                </td>
                <td>
                    <div class="date-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; font-weight: bold; border: 1px solid rgba(239, 68, 68, 0.5);">${asegurarPago}</div>
                </td>
                <td>
                    <div class="client-name">${desc}</div>
                    <div class="client-id">SKU: ${material}</div>
                </td>
                <td>
                    <div class="date-badge" title="Creado el" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">${dateCreated}</div>
                </td>
                <td>
                    <strong>${qty}</strong> <span style="font-size: 0.8em; color: var(--text-secondary);">${um}</span>
                </td>
                <td class="text-right">
                    <button class="btn-cancel" onclick="anularPedido(${index})">
                        <i class="ph ph-x-circle"></i> Anular
                    </button>
                </td>
            `;
            
            // Store order data globally for the button click
            window[`orderData_${index}`] = order;
            
            ordersTbody.appendChild(tr);
        });
    }

    function formatDate(excelDate) {
        if (!excelDate) return "-";
        // Convert Excel serial date to JS string
        if (typeof excelDate === 'number') {
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            // Fix timezone offset issue
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            return date.toLocaleDateString('es-ES');
        }
        return excelDate; 
    }

    function formatToIsoDate(excelDate) {
        if (!excelDate) return "";
        if (typeof excelDate === 'number') {
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return String(excelDate).trim(); 
    }
});

// Global function for cancel button
window.anularPedido = function(index) {
    const order = window[`orderData_${index}`];
    if (!order) return;
    
    const umRaw = String(order["UM"] || "").trim().toUpperCase();
    const um = (umRaw === "C/U" || umRaw === "PQ") ? "MKP" : String(order["UM"] || "").trim();
    const cPagValue = String(order["CPag"] || "").trim();
    const condicionPago = (cPagValue === "0001") ? "Contado" : "Crédito";
    
    const texto = `Hola, por favor anular el siguiente pedido:\n` +
                  `Pedido N°: ${order["Nº pedido cliente"] || "N/A"}\n` +
                  `Vendedor (ZV): ${order["ZV"]}\n` +
                  `Cliente: ${order["Nombre 1"]} (${order["Solic."]})\n` +
                  `Condición Pago: ${condicionPago}\n` +
                  `Asegurar Pago: ${order["Asegurar pago"] || "N/A"}\n` +
                  `Material: ${order["Denominación"]} (${order["Material"]})\n` +
                  `Cantidad: ${order["Cantidad de pedido"]} ${um}`;
                  
    navigator.clipboard.writeText(texto).then(() => {
        showToast();
    }).catch(err => {
        console.error('Error al copiar: ', err);
        alert("No se pudo copiar automáticamente. Puedes copiar este texto manualmente:\n\n" + texto);
    });
};

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    
    void toast.offsetWidth; // force reflow
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}
