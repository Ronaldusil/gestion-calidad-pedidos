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
    let cdsData = {};     // Map of { CD: [orders] }
    let activeSeller = null;
    let activeCD = null;
    let currentUserRole = null; // 'admin' o 'seller'
    let currentUserZV = null;

    // Constantes para mapeo de CD
    const CD_MAP = {
        "BK79": "CD Arequipa",
        "BK44": "CD ILO",
        "BK76": "CD Tacna"
    };

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
            
            // Intentar descargar el archivo directamente desde el repositorio (bypassing GitHub Pages)
            const excelUrl = 'https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.xlsx';
            let response = await fetch(excelUrl + cacheBuster, { cache: 'no-store' });
            
            // Si falla por mayúsculas/minúsculas en GitHub
            if (!response.ok) {
                const excelUrlUpper = 'https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.XLSX';
                response = await fetch(excelUrlUpper + cacheBuster, { cache: 'no-store' });
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
            const success = processExcelData(workbook, data);
            
            if (success) {
                const lastUpdateEl = document.getElementById('last-update');
                if (lastUpdateEl) {
                    const now = new Date();
                    lastUpdateEl.textContent = `Última act: ${now.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`;
                    const container = document.getElementById('last-update-container');
                    if (container) container.style.display = 'block';
                }
                
                emptyState.classList.add('hidden');
                mainDashboard.classList.remove('hidden');
            } else {
                // Si falla el procesamiento (ej. archivo de 2 bytes), mostrar empty state
                emptyState.classList.remove('hidden');
                mainDashboard.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error procesando Excel:', error);
            alert("AVISO: Ocurrió un error al intentar procesar el archivo Excel. Asegúrate de que el archivo no esté dañado.");
            emptyState.classList.remove('hidden');
            mainDashboard.classList.add('hidden');
        } finally {
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
        // 1. Extraer mapeo de Supervisores desde la hoja VTA
        let zvToSupervisor = {};
        const vtaSheetName = workbook.SheetNames.find(s => s.trim().toUpperCase() === "VTA");
        if (vtaSheetName) {
            const rawVta = XLSX.utils.sheet_to_json(workbook.Sheets[vtaSheetName], { header: 1, defval: "" });
            let zvIdx = -1, supIdx = -1;
            for (let i = 0; i < Math.min(rawVta.length, 20); i++) {
                if (!Array.isArray(rawVta[i])) continue;
                for (let j = 0; j < rawVta[i].length; j++) {
                    const cell = String(rawVta[i][j]).trim().toUpperCase();
                    if (cell === "ZV") zvIdx = j;
                    if (cell === "SUPERVISOR") supIdx = j;
                }
                if (zvIdx !== -1 && supIdx !== -1) {
                    for (let r = i + 1; r < rawVta.length; r++) {
                        const z = String(rawVta[r][zvIdx]).trim();
                        const s = String(rawVta[r][supIdx]).trim();
                        if (z && s) zvToSupervisor[z] = s;
                    }
                    break;
                }
            }
        }

        // 2. Extraer mapeo de Tipo desde la hoja LS (Columna A = Material, Columna B = Tipo)
        let materialToTipo = {};
        const lsSheetName = workbook.SheetNames.find(s => s.trim().toUpperCase() === "LS");
        if (lsSheetName) {
            const rawLs = XLSX.utils.sheet_to_json(workbook.Sheets[lsSheetName], { header: 1, defval: "" });
            // Asumimos que la Col A (0) es Material y Col B (1) es Tipo, puede o no tener título en fila 1
            for (let i = 0; i < rawLs.length; i++) {
                if (!Array.isArray(rawLs[i]) || rawLs[i].length < 2) continue;
                const mat = String(rawLs[i][0]).trim(); // Columna A
                const tipo = String(rawLs[i][1]).trim(); // Columna B
                if (mat) materialToTipo[mat] = tipo;
            }
        }

        // 3. Extraer mapeo de HL desde la hoja SKU
        let materialToHl = {};
        const skuSheetName = workbook.SheetNames.find(s => s.trim().toUpperCase() === "SKU");
        if (skuSheetName) {
            const rawSku = XLSX.utils.sheet_to_json(workbook.Sheets[skuSheetName], { header: 1, defval: "" });
            let matIdx = -1, hlIdx = -1;
            for (let i = 0; i < Math.min(rawSku.length, 20); i++) {
                if (!Array.isArray(rawSku[i])) continue;
                for (let j = 0; j < rawSku[i].length; j++) {
                    const cell = String(rawSku[i][j]).trim().toUpperCase();
                    if (cell === "MATERIAL") matIdx = j;
                    if (cell.includes("HL") && cell.includes("UNIDAD")) hlIdx = j;
                }
                if (matIdx !== -1 && hlIdx !== -1) {
                    for (let r = i + 1; r < rawSku.length; r++) {
                        const m = String(rawSku[r][matIdx]).trim();
                        const h = parseFloat(rawSku[r][hlIdx]);
                        if (m && !isNaN(h)) materialToHl[m] = h;
                    }
                    break;
                }
            }
        }

        // Llaves exactas que usa la aplicación (actualizadas)
        const standardKeys = [
            "TpMt", "CIVt", "ClVt", "ZV", "Nombre1", "Nombre 1", "Solic.", "Material", 
            "Denominación", "FePrefEnt.", "Cantidad de pedido", "UM", 
            "Nº pedido cliente", "CPag", "Asegurar pago", "AP", "Creado el", "ST", "Contador"
        ];
        
        let headerRowIndex = -1;
        let bestMatchCount = 0;
        let targetRawData = [];
        let bdSheetName = workbook.SheetNames.find(s => s.trim().toUpperCase() === "BD");
        
        // Buscar en la hoja BD o en todas si no existe
        const sheetsToSearch = bdSheetName ? [bdSheetName] : workbook.SheetNames;
        
        for (let sheetName of sheetsToSearch) {
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            
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
                
                if (matchCount > bestMatchCount) {
                    bestMatchCount = matchCount;
                    headerRowIndex = i;
                    targetRawData = rawData;
                }
            }
        }
        
        if (headerRowIndex === -1 || bestMatchCount === 0) {
            if (rawBytes && rawBytes.length > 1000) {
                let debugStr = "AVISO: No encontré los títulos en tu archivo local.\n\n";
                debugStr += "Tamaño: " + rawBytes.length + " bytes\n";
                alert(debugStr);
            } else {
                console.warn("Archivo vacío o dañado.");
            }
            return false;
        }
        
        // Mapear los índices de las columnas
        const headerRow = targetRawData[headerRowIndex];
        const colMap = {};
        headerRow.forEach((cell, index) => {
            const upperCell = String(cell).trim().toUpperCase();
            const matchedKey = standardKeys.find(sk => sk.toUpperCase() === upperCell);
            if (matchedKey) {
                // Normalizar nombres variantes
                let normKey = matchedKey;
                if (normKey === "Nombre1") normKey = "Nombre 1";
                if (normKey === "CIVt") normKey = "ClVt";
                colMap[index] = normKey;
            }
        });
        
        // Extraer los datos
        const cleanData = [];
        for (let i = headerRowIndex + 1; i < targetRawData.length; i++) {
            const rowArr = targetRawData[i];
            if (!Array.isArray(rowArr) || rowArr.length === 0) continue;
            
            if (rowArr.some(cell => String(cell).trim() !== "")) {
                let cleanRow = {};
                for (let colIndex in colMap) {
                    cleanRow[colMap[colIndex]] = rowArr[colIndex];
                }
                
                // Si la columna Material no se mapeó por título, usar la Columna F (índice 5) a la fuerza
                if (!cleanRow["Material"] && rowArr.length > 5) {
                    cleanRow["Material"] = rowArr[5];
                }
                
                // Si la columna de Pedido no se mapeó por título, usar la Columna C (índice 2) a la fuerza
                if (!cleanRow["Nº pedido cliente"] && rowArr.length > 2) {
                    cleanRow["Nº pedido cliente"] = rowArr[2];
                }
                
                // Mapeo de CD (Columna A - índice 0)
                let ceRaw = String(rowArr[0] || "").trim().toUpperCase();
                cleanRow["CD"] = CD_MAP[ceRaw] || "Otro CD";
                
                // CRUCES DE DATOS
                const matCode = String(cleanRow["Material"] || "").trim();
                const zvCode = String(cleanRow["ZV"] || "").trim();
                
                cleanRow["Tipo"] = materialToTipo[matCode] || "Sin Tipo";
                cleanRow["Supervisor"] = zvToSupervisor[zvCode] || "Sin Supervisor";
                cleanRow["HL_Unit"] = materialToHl[matCode] || 0;
                
                cleanData.push(cleanRow);
            }
        }
        
        // DESACTIVAR FILTROS TEMPORALMENTE PARA PROBAR QUE SÍ CARGA DATOS
        globalData = cleanData; // PASAR TODOS LOS DATOS SIN FILTRO
        
        if (globalData.length === 0 && cleanData.length > 0) {
            alert("AVISO: El Excel cargó, pero ninguna fila cumple con los filtros.");
        } else if (cleanData.length === 0) {
            alert("AVISO: El Excel se leyó, pero parece estar VACÍO.");
        }

        // Agrupar por vendedor (ZV) y por CD
        sellersData = {};
        cdsData = {
            "Vista Global": [],
            "CD Arequipa": [],
            "CD ILO": [],
            "CD Tacna": []
        };
        
        globalData.forEach(row => {
            const zv = String(row["ZV"] || "Sin Vendedor").trim().toUpperCase();
            row["ZV"] = zv; // Asegurar mayúsculas
            if (!sellersData[zv]) {
                sellersData[zv] = [];
            }
            sellersData[zv].push(row);
            
            // Agrupar en CDs
            const cd = row["CD"];
            if (cdsData[cd]) {
                cdsData[cd].push(row);
            }
            // Agregar todos a Vista Global
            cdsData["Vista Global"].push(row);
        });

        if (currentUserRole === 'seller') {
            sellersData = { [currentUserZV]: sellersData[currentUserZV] || [] };
            const sellerKeys = Object.keys(sellersData);
            renderSellersList(sellerKeys);
            if (sellerKeys.length > 0) {
                renderDashboard(sellerKeys[0], 'seller');
            } else {
                renderDashboard(null, 'seller');
            }
        } else {
            // ADMIN
            try {
                renderAdminSidebar();
                renderDashboard("Vista Global", 'admin');
            } catch (err) {
                alert("Error in ADMIN logic: " + err.message + "\n" + err.stack);
                console.error(err);
            }
        }
        
        return true;
    }

    function renderAdminSidebar() {
        sellerList.innerHTML = '';
        sellerCount.textContent = Object.keys(cdsData).length; // 4 (Vista Global + 3 CDs)
        
        // Modificar cabecera y ocultar buscador
        const sidebarTitle = document.querySelector('.sidebar-header h2');
        if (sidebarTitle) sidebarTitle.textContent = 'Centros';
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) searchContainer.style.display = 'none';

        const cdKeys = ["Vista Global", "CD Arequipa", "CD ILO", "CD Tacna"];
        
        cdKeys.forEach(cd => {
            const li = document.createElement('li');
            li.className = 'seller-item';
            
            const count = (cdsData[cd] || []).length;
            
            li.innerHTML = `
                <div class="seller-name">${cd === "Vista Global" ? "🌍 " : "🏢 "}${cd}</div>
                <div class="seller-id">Pedidos: ${count}</div>
            `;
            
            li.addEventListener('click', () => {
                document.querySelectorAll('.seller-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                activeCD = cd;
                renderDashboard(cd, 'admin');
            });
            
            sellerList.appendChild(li);
        });
        
        // Auto-select first item
        if (sellerList.firstChild) {
            sellerList.firstChild.classList.add('active');
        }
    }

    function renderSellersList(sellers) {
        sellerList.innerHTML = '';
        sellerCount.textContent = sellers.length;
        
        // Restaurar cabecera y buscador
        const sidebarTitle = document.querySelector('.sidebar-header h2');
        if (sidebarTitle) sidebarTitle.textContent = 'Vendedores';
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) searchContainer.style.display = 'block';

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
                renderDashboard(zv, 'seller');
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

    function renderDashboard(key, role) {
        let orders = [];
        if (role === 'admin') {
            orders = cdsData[key] || [];
            currentSellerName.textContent = key === "Vista Global" ? "Resumen de todos los Centros" : `Centro: ${key}`;
            
            // Toggle Global View
            const globalViewContainer = document.getElementById('global-view-container');
            const detailTableContainer = document.getElementById('detail-table-container');
            
            if (key === "Vista Global") {
                if(globalViewContainer) globalViewContainer.style.display = 'block';
                if(detailTableContainer) detailTableContainer.style.display = 'none';
                
                // Ocultar tarjetas superiores, título de detalle y filtros
                document.querySelector('.stats-grid').style.display = 'none';
                document.querySelector('.panel-title').style.display = 'none';
                document.querySelector('.panel-header').style.display = 'none';
                
                renderGlobalView();
                return; // Stop here, global view has its own rendering
            } else {
                if(globalViewContainer) globalViewContainer.style.display = 'none';
                if(detailTableContainer) detailTableContainer.style.display = 'block';
                
                // Mostrar tarjetas y filtros si entramos a un CD específico en modo Admin
                document.querySelector('.stats-grid').style.display = 'grid';
                document.querySelector('.panel-title').style.display = 'block';
                document.querySelector('.panel-header').style.display = 'flex';
            }
        } else {
            orders = sellersData[key] || [];
            currentSellerName.textContent = `Vendedor: ${key}`;
            
            // Asegurar que tarjetas y filtros estén visibles para el vendedor
            document.querySelector('.stats-grid').style.display = 'grid';
            document.querySelector('.panel-title').style.display = 'block';
            document.querySelector('.panel-header').style.display = 'flex';
        }
        
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
        
        // No mostrar tabla si no hay filtro de fecha seleccionado (a menos que se busque por texto? 
        // El usuario pidió: "no debería mostrar datos en el detalle de pedidos hasta seleccionar la fecha")
        if (!filterDateStr) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="10" style="text-align:center; padding: 2rem; color: #6b7280;">Seleccione una fecha para ver el detalle de pedidos</td>';
            ordersTbody.appendChild(tr);
            return;
        }
        
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
                    <div class="client-name" style="font-size: 0.9rem;">${order["ZV"] || "N/A"}</div>
                    <div class="client-id">Sup: ${order["Supervisor"] || "N/A"}</div>
                </td>
                <td>
                    <div class="client-name">${desc}</div>
                    <div class="client-id">SKU: ${material}</div>
                </td>
                <td>
                    <strong>${qty}</strong> <span style="font-size: 0.8em; color: var(--text-secondary);">${um}</span>
                </td>
                <td>
                    <div class="date-badge" title="Creado el" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">${dateCreated}</div>
                </td>
                <td>
                    <div class="date-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">${String(order["Tipo"] || "Sin Tipo")}</div>
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

// --- Global View Logic ---
function renderGlobalView() {
    const container = document.getElementById('global-view-container');
    if (!container) return;
    
    const cds = ["CD Arequipa", "CD ILO", "CD Tacna"];
    
    const globalOrders = cdsData["Vista Global"] || [];
    
    // Agrupar por fecha
    const evolution = {};
    globalOrders.forEach(o => {
        const dateStr = o["FePrefEnt."] ? formatToIsoDate(o["FePrefEnt."]) : "Sin Fecha";
        if (!evolution[dateStr]) {
            evolution[dateStr] = {
                pedidos: new Set(),
                clientes: new Set(),
                cajas: 0,
                hl: 0
            };
        }
        
        evolution[dateStr].pedidos.add(o["Nº pedido cliente"]);
        evolution[dateStr].clientes.add(o["Solic."]);
        
        const qty = parseFloat(o["Cantidad de pedido"]) || 0;
        const um = String(o["UM"] || "").trim().toUpperCase();
        
        if (um === "CA" || um === "PQ") {
            evolution[dateStr].cajas += qty;
        }
        
        const clvt = String(o["ClVt"] || "").trim().toUpperCase();
        if (["ZPP3", "ZPP1", "ZPP5"].includes(clvt)) {
            const contador = parseFloat(o["Contador"]) || 0;
            const hlUnit = parseFloat(o["HL_Unit"]) || 0;
            
            let calcVal = 0;
            if (um === "CA") {
                calcVal = qty * contador;
            } else if (um === "UN") {
                calcVal = qty;
            }
            
            evolution[dateStr].hl += (calcVal * hlUnit);
        }
    });
    
    // Ordenar de menor a mayor (Ascendente)
    const sortedDates = Object.keys(evolution).sort((a, b) => a.localeCompare(b));

    let html = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2rem;">
            <div style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover)); padding: 1rem; border-radius: 12px; color: #fff; box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);">
                <i class="ph ph-chart-line-up" style="font-size: 2rem;"></i>
            </div>
            <h2 style="font-size: 2.2rem; color: var(--text-primary); margin: 0; font-weight: 800; letter-spacing: -0.5px;">Gerencia Arequipa, Tacna e Ilo</h2>
        </div>
        
        <div class="glass-panel" style="background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="width: 100%; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: rgba(0,0,0,0.02); border-bottom: 2px solid var(--glass-border);">
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">Fecha de Entrega</th>
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; text-align: center;">Pedidos</th>
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; text-align: center;">Clientes</th>
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; text-align: right;">Cajas</th>
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; text-align: right;">HL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedDates.map((date, idx) => `
                            <tr style="border-bottom: 1px solid var(--glass-border); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'}; transition: background 0.2s;" onmouseover="this.style.background='rgba(255, 87, 34, 0.05)'" onmouseout="this.style.background='${idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'}'">
                                <td style="padding: 1.2rem; color: var(--text-primary); font-weight: 600;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <i class="ph ph-calendar-blank" style="color: var(--accent-primary);"></i>
                                        ${date}
                                    </div>
                                </td>
                                <td style="padding: 1.2rem; color: var(--text-primary); text-align: center; font-weight: 500;">
                                    <span style="background: rgba(0,0,0,0.05); padding: 0.2rem 0.6rem; border-radius: 4px;">${evolution[date].pedidos.size}</span>
                                </td>
                                <td style="padding: 1.2rem; color: var(--text-primary); text-align: center; font-weight: 500;">
                                    <span style="background: rgba(0,0,0,0.05); padding: 0.2rem 0.6rem; border-radius: 4px;">${evolution[date].clientes.size}</span>
                                </td>
                                <td style="padding: 1.2rem; color: var(--success); font-weight: 700; text-align: right;">${evolution[date].cajas.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                                <td style="padding: 1.2rem; color: var(--accent-primary); font-weight: 700; text-align: right;">${evolution[date].hl.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const globalViewContainer = document.getElementById('global-view-container');
    if (globalViewContainer) {
        globalViewContainer.innerHTML = html;
    }
}

// Función global para el botón de las tarjetas
window.selectCD = function(cd) {
    // Encontrar el li correspondiente en el sidebar y hacerle clic
    document.querySelectorAll('.seller-item').forEach(el => {
        if (el.textContent.includes(cd)) {
            el.click();
        }
    });
};

});
