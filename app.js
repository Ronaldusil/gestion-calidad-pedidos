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
    
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginUser = document.getElementById('login-user');
    const loginPass = document.getElementById('login-pass');
    const loginError = document.getElementById('login-error');
    const appContent = document.getElementById('app-content');
    
    // Diccionario de usuarios (Configurable por el admin)
    const USUARIOS = {
        "ADMIN": "Martinez01",
        "PEDLD7": "VenLD7",
        "PEDLE4": "VenLE4",
        "PEM007": "Ven007",
        "PEM151": "Ven151",
        "PEM167": "Ven167",
        "PEM231": "Ven231",
        "PEM286": "Ven286",
        "PEM292": "Ven292",
        "PEM342": "Ven342",
        "PEM370": "Ven370",
        "PEM395": "Ven395",
        "PEM468": "Ven468",
        "PEM473": "Ven473",
        "PEM474": "Ven474",
        "PEM561": "Ven561",
        "PEMB95": "VenB95",
        "PEMB96": "VenB96",
        "PEMB97": "VenB97",
        "PEMB98": "VenB98",
        "PEMB99": "VenB99",
        "PEMC12": "VenC12",
        "PEMC13": "VenC13",
        "PEMC35": "VenC35",
        "PEMD46": "VenD46",
        "PEMD47": "VenD47",
        "PEMD48": "VenD48",
        "PEMD49": "VenD49",
        "PEMD50": "VenD50",
        "PEMD51": "VenD51",
        "PEMD52": "VenD52",
        "PEMD53": "VenD53",
        "PEMD54": "VenD54",
        "PEMD55": "VenD55",
        "PEMD56": "VenD56",
        "PEMD57": "VenD57",
        "PEMD58": "VenD58",
        "PEMD65": "VenD65",
        "PEMD68": "VenD68",
        "PEMD74": "VenD74",
        "PEMD75": "VenD75",
        "PEMD76": "VenD76",
        "PEMD77": "VenD77",
        "PEMD78": "VenD78",
        "PEMD79": "VenD79",
        "PEMD80": "VenD80",
        "PEMD81": "VenD81",
        "PEMD82": "VenD82",
        "PEMD83": "VenD83",
        "PEOD65": "VenD65",
        "PEOE07": "VenE07",
        "PEOE65": "VenE65",
        "PEX098": "Ven098",
        "PEX099": "Ven099",
        "PEX100": "Ven100",
        "PEX101": "Ven101",
        "PEX103": "Ven103",
        "PEX104": "Ven104",
        "PEX105": "Ven105",
        "PEX107": "Ven107",
        "PEX662": "Ven662",
        "PEX663": "Ven663",
        "PEX665": "Ven665",
        "PEX666": "Ven666",
        "PEX667": "Ven667",
        "PEX668": "Ven668",
        "PEX669": "Ven669",
        "PEX670": "Ven670",
        "PEX697": "Ven697",
        "PEX698": "Ven698",
        "PEX700": "Ven700",
        "PEX702": "Ven702",
        "PEX703": "Ven703",
        "PEX704": "Ven704",
        "PEX706": "Ven706",
        "PEX707": "Ven707",
        "PEX708": "Ven708",
        "PEX710": "Ven710"
    };
    
    let globalData = [];
    let sellersData = {}; // Map of { ZV: [orders] }
    let activeSeller = null;
    let currentUserRole = null; // 'admin' o 'seller'
    let currentUserZV = null;

    sellerSearch.addEventListener('input', handleSearch);
    
    // Lógica de Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = loginUser.value.trim().toUpperCase();
        const pass = loginPass.value.trim();
        
        if (USUARIOS[user] && USUARIOS[user] === pass) {
            loginError.style.display = 'none';
            loginOverlay.style.display = 'none';
            appContent.classList.remove('hidden');
            
            if (user === "ADMIN") {
                currentUserRole = 'admin';
            } else {
                currentUserRole = 'seller';
                currentUserZV = user;
                // Ocultar barra lateral para el vendedor
                const dashboardLayout = document.querySelector('.dashboard-layout');
                const sidebar = document.querySelector('.sidebar');
                if (dashboardLayout) dashboardLayout.style.gridTemplateColumns = '1fr';
                if (sidebar) sidebar.style.display = 'none';
            }
            
            // Recién ahora cargamos el Excel
            loadDataAutomatically();
        } else {
            loginError.style.display = 'block';
        }
    });
    
    if(deliveryFilter) {
        // Dejar el filtro vacío por defecto para que muestre todos los pedidos
        deliveryFilter.value = "";

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
            // Ya no forzamos la descarga si el usuario elige subir un archivo
            // Generar un número aleatorio para forzar a GitHub y al navegador a bajar la versión más nueva
            const cacheBuster = '?t=' + new Date().getTime();
            
            // Intentar descargar el archivo 'pedidos.xlsx'
            let response = await fetch('pedidos.xlsx' + cacheBuster, { cache: 'no-store' });
            
            // Si falla por mayúsculas/minúsculas en GitHub Pages (ej. pedidos.XLSX)
            if (!response.ok) {
                response = await fetch('pedidos.XLSX' + cacheBuster, { cache: 'no-store' });
            }
            
            if (!response.ok) {
                throw new Error('Archivo pedidos.xlsx (ni pedidos.XLSX) fue encontrado en el servidor.');
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            processArrayBuffer(data);
            
        } catch (error) {
            console.error('Error cargando el Excel:', error);
            loadingOverlay.classList.add('hidden');
            emptyState.classList.remove('hidden');
        }
    }

    function processArrayBuffer(data) {
        if (data.length > 2 && data[0] === 60 && data[1] === 33) {
            alert("AVISO CRÍTICO: El archivo que se descargó no es un Excel, ¡es una página web! Sube tu archivo pedidos.xlsx a GitHub otra vez.");
            loadingOverlay.classList.add('hidden');
            return;
        }
        if (data.length > 2 && data[0] !== 80 && data[1] !== 75) {
            alert("AVISO: El archivo descargado no tiene el formato correcto de Excel (.xlsx). Podría estar corrupto.");
        }
        
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            processExcelData(workbook, data);
            
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
            console.error('Error procesando Excel:', error);
            alert("AVISO: Ocurrió un error al intentar procesar el archivo Excel. Asegúrate de que el archivo no esté dañado.");
            loadingOverlay.classList.add('hidden');
        }
    }

    // SOPORTE PARA CARGA LOCAL DE ARCHIVOS
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            loadingOverlay.classList.remove('hidden');
            emptyState.classList.add('hidden');
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                processArrayBuffer(data);
            };
            reader.onerror = function() {
                alert("Error al leer el archivo local.");
                loadingOverlay.classList.add('hidden');
            };
            reader.readAsArrayBuffer(file);
        });
    }

    function processExcelData(workbook, rawBytes) {
        // Llaves exactas que usa la aplicación
        const standardKeys = [
            "TpMt", "ClVt", "ZV", "Nombre 1", "Solic.", "Material", 
            "Denominación", "FePrefEnt.", "Cantidad de pedido", "UM", 
            "Nº pedido cliente", "CPag", "Asegurar pago", "AP", "Creado el", "ST"
        ];
        
        let headerRowIndex = -1;
        let bestMatchCount = 0;
        let targetRawData = [];
        
        // Buscar en todas las hojas del Excel
        for (let sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            
            // Buscar la fila que tenga más coincidencias (hasta 50 filas hacia abajo)
            for (let i = 0; i < Math.min(rawData.length, 50); i++) {
                const row = rawData[i];
                let matchCount = 0;
                if (!Array.isArray(row)) continue;
                
                for (let cell of row) {
                    const upperCell = String(cell).trim().toUpperCase();
                    if (standardKeys.some(sk => sk.toUpperCase() === upperCell)) {
                        matchCount++;
                    }
                }
                
                // Si esta fila tiene más coincidencias, se convierte en la ganadora absoluta
                if (matchCount > bestMatchCount) {
                    bestMatchCount = matchCount;
                    headerRowIndex = i;
                    targetRawData = rawData;
                }
            }
        }
        
        if (headerRowIndex === -1 || bestMatchCount === 0) {
            let debugStr = "AVISO: No encontré los títulos (TpMt, ZV, etc.)\n\n";
            debugStr += "INFORMACIÓN TÉCNICA:\n";
            if (rawBytes) {
                debugStr += "Tamaño descargado: " + rawBytes.length + " bytes\n";
                debugStr += "Primeros bytes: " + Array.from(rawBytes.slice(0, 5)).join(",") + "\n";
            }
            debugStr += "Hojas detectadas: " + workbook.SheetNames.length + "\n\n";
            
            let firstDataRow = null;
            
            // Buscar la primera fila que tenga ALGO de texto para mostrársela
            for (let sheetName of workbook.SheetNames) {
                const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                firstDataRow = sheetData.find(r => r.length > 0 && String(r[0]).trim() !== "");
                if (firstDataRow) break;
            }
            
            if (firstDataRow) {
                debugStr += "Esto es lo que veo en la primera celda de tu archivo:\n\n" + String(firstDataRow[0]).substring(0, 150);
                if (firstDataRow.length === 1 && String(firstDataRow[0]).includes("TpMt")) {
                    debugStr += "\n\n¡OJO! Parece que todo el texto está pegado en una sola celda. Esto pasa si guardaste un archivo de texto (TXT/CSV) poniéndole extensión .xlsx a la fuerza. Ábrelo en Excel y guárdalo formalmente como 'Libro de Excel (*.xlsx)'.";
                }
            } else {
                debugStr += "El archivo parece estar totalmente en blanco.";
            }
            
            alert(debugStr);
            return;
        }
        
        // Mapear los índices de las columnas
        const headerRow = targetRawData[headerRowIndex];
        const colMap = {};
        headerRow.forEach((cell, index) => {
            const upperCell = String(cell).trim().toUpperCase();
            const matchedKey = standardKeys.find(sk => sk.toUpperCase() === upperCell);
            if (matchedKey) {
                colMap[index] = matchedKey; // Mapea el índice a la llave oficial
            }
        });
        
        // Extraer los datos a partir de la fila siguiente al encabezado
        const cleanData = [];
        for (let i = headerRowIndex + 1; i < targetRawData.length; i++) {
            const rowArr = targetRawData[i];
            if (!Array.isArray(rowArr) || rowArr.length === 0) continue; // Saltar filas vacías
            
            // Solo procesar filas que tengan algo de contenido
            if (rowArr.some(cell => String(cell).trim() !== "")) {
                let cleanRow = {};
                for (let colIndex in colMap) {
                    cleanRow[colMap[colIndex]] = rowArr[colIndex];
                }
                cleanData.push(cleanRow);
            }
        }
        
        // DESACTIVAR FILTROS TEMPORALMENTE PARA PROBAR QUE SÍ CARGA DATOS
        /*
        const validClVt = ["ZPP3", "ZPP5", "ZPPV"];
        globalData = cleanData.filter(row => {
            const isFert = String(row["TpMt"]).toUpperCase().trim() === "FERT";
            const isZPP = validClVt.includes(String(row["ClVt"]).toUpperCase().trim());
            const hasOrder = String(row["Nº pedido cliente"]).trim() !== "";
            return isFert && isZPP && hasOrder;
        });
        */
        globalData = cleanData; // PASAR TODOS LOS DATOS SIN FILTRO
        
        if (globalData.length === 0 && cleanData.length > 0) {
            let debugMsg = "AVISO: El Excel cargó, pero NINGUNA fila cumple con FERT y ZPP3/ZPP5/ZPPV.\n\n";
            const rowPem = cleanData.find(r => String(r["ZV"]).trim().toUpperCase() === "PEM286");
            if (rowPem) {
                debugMsg += "Para PEM286 encontré esto:\nTpMt: '" + rowPem["TpMt"] + "'\nClVt: '" + rowPem["ClVt"] + "'\n¿Ves el error? Quizás las letras no coinciden exacto.\n\n";
            } else {
                debugMsg += "Además, NO ENCONTRÉ a PEM286 antes de filtrar. La primera fila leída es:\n" + JSON.stringify(cleanData[0]).substring(0, 200) + "...";
            }
            alert(debugMsg);
        } else if (cleanData.length === 0) {
            alert("AVISO: El Excel se leyó, pero parece estar VACÍO. Revisa si los títulos de las columnas están en la fila 1.");
        }

        // Agrupar por vendedor (ZV)
        sellersData = {};
        
        globalData.forEach(row => {
            const zv = String(row["ZV"] || "Sin Vendedor").trim();
            if (!sellersData[zv]) {
                sellersData[zv] = [];
            }
            sellersData[zv].push(row);
        });

        // Si es vendedor, forzar a que la lista de vendedores sea SOLO él mismo
        if (currentUserRole === 'seller') {
            const foundSellers = Object.keys(sellersData).join(", ");
            sellersData = { [currentUserZV]: sellersData[currentUserZV] || [] };
            if (!sellersData[currentUserZV] || sellersData[currentUserZV].length === 0) {
                alert("AVISO: Para el vendedor " + currentUserZV + " no hay pedidos de FERT/ZPP.\n\nLos vendedores que SÍ tienen pedidos válidos en este Excel son: " + (foundSellers || "Ninguno") + "\n\nSi dice 'Sin Vendedor', significa que la columna 'ZV' no existe en el Excel.");
            }
        }
        
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
        
        // Bloqueados basados en la columna AP con valor C
        const bloqueadosOrders = orders.filter(o => String(o["AP"] || "").trim().toUpperCase() === "C");
        const uniqueBlocked = new Set(bloqueadosOrders.map(o => o["Nº pedido cliente"])).size;
        
        if (uniqueBlocked > 0) {
            statOrders.innerHTML = `${uniqueOrders} <span style="font-size: 0.5em; color: #ef4444; font-weight: normal; vertical-align: middle;">(${uniqueBlocked} Bloq.)</span>`;
        } else {
            statOrders.textContent = uniqueOrders;
        }
        
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
            
            let asegurarPago = String(order["Asegurar pago"] || "").trim();
            if (asegurarPago === "N/A") asegurarPago = "";
            
            const apValue = String(order["AP"] || "").trim().toUpperCase();
            const bloqueado = (apValue === "C") ? "Bloqueado" : "";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="client-name">${clientName}</div>
                    <div class="client-id">Cod: ${clientId}</div>
                    <div class="client-id" style="margin-top: 0.25rem; font-weight: 500; color: var(--accent-primary);">Ped: ${orderNum}</div>
                </td>
                <td>
                    <div class="date-badge" style="background: ${condicionPago === 'Contado' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${condicionPago === 'Contado' ? '#34d399' : '#fbbf24'};">${condicionPago}</div>
                </td>
                <td>
                    ${asegurarPago ? `<div class="date-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; font-weight: bold; border: 1px solid rgba(239, 68, 68, 0.5);">${asegurarPago}</div>` : ''}
                </td>
                <td>
                    ${bloqueado ? `<div class="date-badge" style="background: rgba(249, 115, 22, 0.2); color: #fb923c; font-weight: bold; border: 1px solid rgba(249, 115, 22, 0.5);"><i class="ph ph-lock-key"></i> ${bloqueado}</div>` : ''}
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
        
        let str = String(excelDate).trim();
        // Si el Excel guardó la fecha como texto (ej. "24/07/2026")
        if (str.includes('/')) {
            const parts = str.split('/');
            if (parts.length === 3) {
                let d = parts[0].padStart(2, '0');
                let m = parts[1].padStart(2, '0');
                let y = parts[2];
                if (y.length === 2) y = "20" + y; // Por si es "26" en vez de "2026"
                if (parts[0].length === 4) { // Por si vino como YYYY/MM/DD
                    y = parts[0];
                    d = parts[2].padStart(2, '0');
                }
                return `${y}-${m}-${d}`;
            }
        } else if (str.includes('-')) {
            const parts = str.split('-');
            if (parts.length === 3 && parts[0].length !== 4) {
                let d = parts[0].padStart(2, '0');
                let m = parts[1].padStart(2, '0');
                let y = parts[2];
                if (y.length === 2) y = "20" + y;
                return `${y}-${m}-${d}`;
            }
        }
        return str; 
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
    
    const texto = `Código de Cliente: ${order["Solic."] || "N/A"}\n` +
                  `N° Pedido: ${order["Nº pedido cliente"] || "N/A"}\n\n` +
                  `Hola, por favor anular este pedido.`;
                  
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
