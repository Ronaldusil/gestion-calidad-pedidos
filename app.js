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
    const statOrdersSub = document.getElementById('stat-orders-sub');
    const statClients = document.getElementById('stat-clients');
    const statClientsSub = document.getElementById('stat-clients-sub');
    const statSales = document.getElementById('stat-sales');
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
    let activeActionFilter = null;
    let currentPage = 1;
    const ITEMS_PER_PAGE = 50;

    // Constantes para mapeo de CD
    const CD_MAP = {
        "BK79": "CD Arequipa",
        "BK44": "CD ILO",
        "BK76": "CD Tacna"
    };

    sellerSearch.addEventListener('input', handleSearch);
    
    // LÃ³gica de Login
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
                // Ocultar barra lateral para admin
                const dashboardLayout = document.querySelector('.dashboard-layout');
                const sidebar = document.querySelector('.sidebar');
                if (dashboardLayout) dashboardLayout.style.gridTemplateColumns = '1fr';
                if (sidebar) sidebar.style.display = 'none';
            } else {
                currentUserRole = 'seller';
                currentUserZV = user;
                // Ocultar barra lateral para el vendedor
                const dashboardLayout = document.querySelector('.dashboard-layout');
                const sidebar = document.querySelector('.sidebar');
                if (dashboardLayout) dashboardLayout.style.gridTemplateColumns = '1fr';
                if (sidebar) sidebar.style.display = 'none';
            }
            
            // Si la data ya se pre-cargÃ³ en segundo plano, esto serÃ¡ instantÃ¡neo
            loadDataAutomatically();
        } else {
            loginError.style.display = 'block';
        }
    });
    
    function triggerFilterUpdate(resetPage = true) {
        if (resetPage) currentPage = 1;
        if (currentUserRole === 'seller' && activeSeller) {
            renderDashboard(activeSeller, 'seller');
        } else if (currentUserRole === 'admin') {
            if (activeCD) {
                renderDashboard(activeCD, 'admin');
            } else {
                renderDashboard("Vista Global", 'admin');
            }
        }
    }

    if(deliveryFilter) {
        deliveryFilter.value = "";
        deliveryFilter.addEventListener('change', () => triggerFilterUpdate(true));
    }
    
    if(clientSearch) {
        clientSearch.addEventListener('input', () => triggerFilterUpdate(true));
    }
    
    document.querySelectorAll('.action-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterType = e.target.getAttribute('data-filter');
            
            if (activeActionFilter === filterType) {
                activeActionFilter = null;
                e.target.style.background = 'white';
                e.target.style.color = 'var(--text-secondary)';
            } else {
                activeActionFilter = filterType;
                document.querySelectorAll('.action-filter-btn').forEach(b => {
                    b.style.background = 'white';
                    b.style.color = 'var(--text-secondary)';
                });
                e.target.style.background = 'var(--accent-primary)';
                e.target.style.color = 'white';
            }
            triggerFilterUpdate(true);
        });
    });

    // PRE-CARGA EN SEGUNDO PLANO
    // Iniciamos la descarga apenas abre la web, para que cuando haga Login ya estÃ© listo
    let prefetchPromise = null;
    
    function startPrefetch() {
        const excelUrl = 'https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.xlsx';
        const excelUrlUpper = 'https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.XLSX';
        
        prefetchPromise = fetch(excelUrl)
            .then(res => {
                if (!res.ok) return fetch(excelUrlUpper);
                return res;
            })
            .then(res => {
                if (!res.ok) throw new Error('Archivo no encontrado');
                return res.arrayBuffer();
            })
            .then(buffer => new Uint8Array(buffer))
            .catch(err => {
                console.error("Error en precarga:", err);
                return null; // FallÃ³ la precarga
            });
    }
    
    // Iniciar precarga inmediatamente
    startPrefetch();

    async function loadDataAutomatically() {
        loadingOverlay.classList.remove('hidden');
        emptyState.classList.add('hidden'); // Ocultar mensaje de "No hay datos" mientras carga

        try {
            let data = null;
            if (prefetchPromise) {
                data = await prefetchPromise;
            }
            
            if (!data) {
                // Si la precarga fallÃ³, intentamos una vez mÃ¡s de forma tradicional
                let res = await fetch('https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.xlsx');
                if (!res.ok) res = await fetch('https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.XLSX');
                if (!res.ok) throw new Error('Archivo no encontrado en el servidor');
                
                const buffer = await res.arrayBuffer();
                data = new Uint8Array(buffer);
            }
            
            processArrayBuffer(data);
            
        } catch (error) {
            console.error('Error cargando el Excel:', error);
            loadingOverlay.classList.add('hidden');
            emptyState.classList.remove('hidden');
        }
    }

    function processArrayBuffer(data) {
        if (data.length > 2 && data[0] === 60 && data[1] === 33) {
            alert("AVISO CRÃTICO: El archivo que se descargÃ³ no es un Excel, Â¡es una pÃ¡gina web! Sube tu archivo pedidos.xlsx a GitHub otra vez.");
            loadingOverlay.classList.add('hidden');
            return;
        }
        if (data.length > 2 && data[0] !== 80 && data[1] !== 75) {
            alert("AVISO: El archivo descargado no tiene el formato correcto de Excel (.xlsx). PodrÃ­a estar corrupto.");
        }
        
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const success = processExcelData(workbook, data);
            
            if (success) {
                const lastUpdateEl = document.getElementById('last-update');
                if (lastUpdateEl) {
                    const now = new Date();
                    lastUpdateEl.textContent = `Ãltima act: ${now.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`;
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
            alert("AVISO: OcurriÃ³ un error al intentar procesar el archivo Excel. AsegÃºrate de que el archivo no estÃ© daÃ±ado.");
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
        // Llaves exactas que usa la macro en la hoja BD
        const standardKeys = [
            "Doc.venta", "CD", "SKU", "Material", "Tipo Pedido", "Cdigo", "Cliente", "ZV", 
            "Ped. Bloqueado", "Creado por", "Fecha Entrega", "Cantidad de pedido", "UM", 
            "Creado el", "ValorNeto", "Importe del impuesto", "Subtotal 1", "Subtotal 6", 
            "Subtotal 3", "Subtotal 5", "Tipo de Pago", "N pedido", "Supervisor Venta", 
            "Prepago", "Marca", "Categoria", "Caja", "HL", "Contador ped", "Contador Client", "Rechazo"
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
                let debugStr = "AVISO: No encontrÃ© los tÃ­tulos en tu archivo local.nn";
                debugStr += "TamaÃ±o: " + rawBytes.length + " bytesn";
                alert(debugStr);
            } else {
                console.warn("Archivo vacÃ­o o daÃ±ado.");
            }
            return false;
        }
        
        // Normalizar textos para evitar problemas con acentos y sÃ­mbolos
        const normalizeStr = (s) => String(s).trim().toUpperCase().normalize("NFD").replace(/[u0300-u036f]/g, "").replace(/[^A-Z0-9]/g, "");

        // Mapear los Ã­ndices de las columnas
        const headerRow = targetRawData[headerRowIndex];
        const colMap = {};
        headerRow.forEach((cell, index) => {
            const normCell = normalizeStr(cell);
            
            // Buscar coincidencias robustas
            if (normCell === normalizeStr("Doc.venta")) colMap[index] = "Doc.venta";
            if (normCell === normalizeStr("CD")) colMap[index] = "CD";
            if (normCell === normalizeStr("SKU")) colMap[index] = "SKU";
            if (normCell === normalizeStr("Material")) colMap[index] = "Material";
            if (normCell.includes(normalizeStr("Cliente")) || normCell === normalizeStr("Solic")) colMap[index] = "Cliente";
            if (normCell === normalizeStr("ZV")) colMap[index] = "ZV";
            if (normCell.includes(normalizeStr("Cdigo")) || normCell.includes(normalizeStr("Codigo"))) colMap[index] = "Codigo";
            if (normCell.includes(normalizeStr("Fecha Entrega"))) colMap[index] = "Fecha Entrega";
            if (normCell.includes(normalizeStr("Cantidad"))) colMap[index] = "Cantidad de pedido";
            if (normCell === normalizeStr("UM")) colMap[index] = "UM";
            if (normCell.includes(normalizeStr("Creado el"))) colMap[index] = "Creado el";
            if (normCell === normalizeStr("ValorNeto") || normCell.includes("NETO")) colMap[index] = "ValorNeto";
            if (normCell === normalizeStr("N pedido") || normCell.includes("PEDIDO") && !normCell.includes("TIPO")) colMap[index] = "N pedido";
            if (normCell.includes(normalizeStr("Tipo Pedido"))) colMap[index] = "Tipo Pedido";
            if (normCell.includes(normalizeStr("Tipo de Pago"))) colMap[index] = "Tipo de Pago";
            if (normCell.includes(normalizeStr("Supervisor"))) colMap[index] = "Supervisor Venta";
            if (normCell === normalizeStr("Marca")) colMap[index] = "Marca";
            if (normCell.includes(normalizeStr("Categoria"))) colMap[index] = "Categoria";
            if (normCell === normalizeStr("Caja")) colMap[index] = "Caja";
            if (normCell === normalizeStr("HL")) colMap[index] = "HL";
            if (normCell === normalizeStr("Prepago")) colMap[index] = "Prepago";
            if (normCell === normalizeStr("Rechazo")) colMap[index] = "Rechazo";
            if (normCell.includes(normalizeStr("Bloqueado"))) colMap[index] = "Ped. Bloqueado";
            if (normCell === normalizeStr("CPag") || normCell === normalizeStr("Pago")) colMap[index] = "CPag";
            if (normCell === normalizeStr("AP")) colMap[index] = "AP";
            if (normCell.includes(normalizeStr("Nombre"))) colMap[index] = "Nombre 1";
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
                
                // Asegurar formato del CD (la macro ya lo trae como "CD Arequipa", pero por precauciÃ³n)
                let ceRaw = String(cleanRow["CD"] || "").trim();
                if (ceRaw && !ceRaw.toUpperCase().startsWith("CD ")) {
                    ceRaw = "CD " + ceRaw;
                }
                cleanRow["CD"] = ceRaw || "Otro CD";
                
                cleanData.push(cleanRow);
            }
        }
        
        // DESACTIVAR FILTROS TEMPORALMENTE PARA PROBAR QUE SÃ CARGA DATOS
        globalData = cleanData; // PASAR TODOS LOS DATOS SIN FILTRO
        
        if (globalData.length === 0 && cleanData.length > 0) {
            alert("AVISO: El Excel cargÃ³, pero ninguna fila cumple con los filtros.");
        } else if (cleanData.length === 0) {
            alert("AVISO: El Excel se leyÃ³, pero parece estar VACÃO.");
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
            row["ZV"] = zv; // Asegurar mayÃºsculas
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
                alert("Error in ADMIN logic: " + err.message + "n" + err.stack);
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
                <div class="seller-name">${cd === "Vista Global" ? "ð " : "ð¢ "}${cd}</div>
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
                
                // Ocultar tarjetas superiores, tÃ­tulo de detalle y filtros
                document.querySelector('.stats-grid').style.display = 'none';
                document.querySelector('.panel-title').style.display = 'none';
                document.querySelector('.panel-header').style.display = 'none';
                
                renderGlobalView();
                return; // Stop here, global view has its own rendering
            } else {
                if(globalViewContainer) globalViewContainer.style.display = 'none';
                if(detailTableContainer) detailTableContainer.style.display = 'block';
                
                // Mostrar tarjetas y filtros si entramos a un CD especÃ­fico en modo Admin
                document.querySelector('.stats-grid').style.display = 'grid';
                document.querySelector('.panel-title').style.display = 'block';
                document.querySelector('.panel-header').style.display = 'flex';
            }
        } else {
            orders = sellersData[key] || [];
            currentSellerName.textContent = "";
            
            // Asegurar que tarjetas y filtros estÃ©n visibles para el vendedor
            document.querySelector('.stats-grid').style.display = 'grid';
            document.querySelector('.panel-title').style.display = 'block';
            document.querySelector('.panel-header').style.display = 'flex';
        }
        
        // Agregar botÃ³n de volver para Admin si estÃ¡ en un CD especÃ­fico
        if (role === 'admin' && key !== "Vista Global") {
            currentSellerName.innerHTML = `Centro: ${key} <button onclick="selectCD('Vista Global')" style="margin-left: 1rem; padding: 0.3rem 0.8rem; border-radius: 20px; border: none; background: var(--accent-primary); color: white; cursor: pointer; font-size: 0.9rem;">â Volver al Resumen</button>`;
        }
        
        const filterDateStr = deliveryFilter ? deliveryFilter.value : "";
        const searchStr = clientSearch ? clientSearch.value.toLowerCase() : "";
        
        if (filterDateStr || searchStr || activeActionFilter) {
            orders = orders.filter(order => {
                let matchDate = true;
                let matchSearch = true;
                let matchAction = true;
                
                if (filterDateStr) {
                    const dateIso = formatToIsoDate(order["Fecha Entrega"]);
                    matchDate = (dateIso === filterDateStr);
                }
                
                if (searchStr) {
                    const clientName = String(order["Nombre 1"] || order["Cliente"] || "").toLowerCase();
                    const clientId = String(order["Codigo"] || "").toLowerCase();
                    const orderNum = String(order["N pedido"] || "").toLowerCase();
                    matchSearch = clientName.includes(searchStr) || clientId.includes(searchStr) || orderNum.includes(searchStr);
                }
                
                if (activeActionFilter) {
                    if (activeActionFilter === 'bloqueado') {
                        const apValue = String(order["Ped. Bloqueado"] || order["AP"] || "").trim().toUpperCase();
                        matchAction = (apValue === "C" || apValue === "BLOQUEADO" || apValue.includes("BLOQ"));
                    } else if (activeActionFilter === 'prepago') {
                        matchAction = String(order["Prepago"] || "").trim() !== "";
                    } else if (activeActionFilter === 'rechazo') {
                        const r = String(order["Rechazo"] || "").trim();
                        matchAction = (r !== "" && r !== "N/A");
                    }
                }
                
                return matchDate && matchSearch && matchAction;
            });
        }
        
        // Stats
        const uniqueOrders = new Set(orders.map(o => o["N pedido"])).size;
        
        // Bloqueados basados en la columna
        const bloqueadosOrders = orders.filter(o => {
            const apValue = String(o["Ped. Bloqueado"] || o["AP"] || "").trim().toUpperCase();
            return apValue === "C" || apValue === "BLOQUEADO" || apValue.includes("BLOQ");
        });
        const uniqueBlockedOrders = new Set(bloqueadosOrders.map(o => o["N pedido"])).size;
        
        statOrders.textContent = uniqueOrders;
        if (uniqueBlockedOrders > 0) {
            statOrdersSub.innerHTML = `Se tiene <span style="font-weight:700;">${uniqueBlockedOrders}</span> para gestionar liberaciÃ³n! (Ped. Bloqueados)`;
            statOrdersSub.style.display = 'block';
        } else {
            statOrdersSub.style.display = 'none';
        }
        
        const uniqueClients = new Set(orders.map(o => o["Codigo"] || o["Cliente"])).size;
        statClients.textContent = uniqueClients;
        
        const blockedClients = new Set();
        const prepagoClients = new Set();
        const rejectedClients = new Set();
        
        orders.forEach(o => {
            const clientKey = o["Codigo"] || o["Cliente"];
            
            const apValue = String(o["Ped. Bloqueado"] || o["AP"] || "").trim().toUpperCase();
            if (apValue === "C" || apValue === "BLOQUEADO" || apValue.includes("BLOQ")) {
                blockedClients.add(clientKey);
            }
            
            const prepago = String(o["Prepago"] || "").trim();
            if (prepago) {
                prepagoClients.add(clientKey);
            }
            
            const rechazo = String(o["Rechazo"] || "").trim();
            if (rechazo && rechazo !== "N/A") {
                rejectedClients.add(clientKey);
            }
        });
        
        let clientSubHtml = '';
        if (prepagoClients.size > 0) {
            clientSubHtml += `<div style="color: #374151; margin-bottom: 2px;">Se tiene <span style="font-weight:700; color:#1D4ED8;">${prepagoClients.size}</span> para solicitar voucher. (Prepagos)</div>`;
        }
        if (rejectedClients.size > 0) {
            clientSubHtml += `<div style="color: #B91C1C;">Se tiene <span style="font-weight:700;">${rejectedClients.size}</span> para reforzar recepciÃ³n de pedido. (Rechazos)</div>`;
        }
        
        statClientsSub.innerHTML = clientSubHtml;
        statClientsSub.style.display = clientSubHtml ? 'flex' : 'none';
        
        let cajasTotal = 0;
        let hlTotal = 0;
        orders.forEach(order => {
            cajasTotal += (parseFloat(order["Caja"]) || 0);
            hlTotal += (parseFloat(order["HL"]) || 0);
        });
        
        if (statSales) {
            statSales.innerHTML = `<span style="font-size: 1.15rem;">ð¦ ${cajasTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })} CA<br>ðº ${hlTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })} HL</span>`;
        }
        
        if (statBoxes) {
            statBoxes.innerHTML = '';
        }
        
        // Render Table
        ordersTbody.innerHTML = '';
        
        // No mostrar tabla si no hay filtro de fecha seleccionado
        if (!filterDateStr) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="10" style="text-align:center; padding: 2rem; color: #6b7280;">Seleccione una fecha para ver el detalle de pedidos</td>';
            ordersTbody.appendChild(tr);
            if (document.getElementById('pagination-controls')) {
                document.getElementById('pagination-controls').style.display = 'none';
            }
            return;
        }
        
        const totalItems = orders.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedOrders = orders.slice(startIndex, endIndex);

        updatePaginationUI(totalItems, totalPages);
        
        paginatedOrders.forEach((order, index) => {
            const clientName = order["Nombre 1"] || order["Cliente"] || "Sin Nombre";
            const clientId = order["Codigo"] || "N/A";
            
            // Producto: Material + Marca + Categoria
            const sku = String(order["SKU"] || "").trim();
            const material = String(order["Material"] || "Sin Desc.").trim();
            const marca = String(order["Marca"] || "").trim();
            const categoria = String(order["Categoria"] || "").trim();
            const prodBadges = `${marca ? `<span style="background:rgba(0,0,0,0.05); padding:2px 6px; border-radius:4px; margin-right:4px;">${marca}</span>` : ''}${categoria ? `<span style="background:rgba(0,0,0,0.05); padding:2px 6px; border-radius:4px;">${categoria}</span>` : ''}`;
            
            // Reemplazar Fecha Entrega por Fecha de CreaciÃ³n
            const dateCreation = formatDate(order["Creado el"]);
            const valorNeto = parseFloat(order["ValorNeto"]) || 0;
            
            const qty = order["Cantidad de pedido"] || 0;
            const um = String(order["UM"] || "").trim().toUpperCase();
            const caja = parseFloat(order["Caja"]) || 0;
            const hl = parseFloat(order["HL"]) || 0;
            
            const orderNum = order["N pedido"] || "N/A";
            
            const cPagValue = String(order["CPag"] || "").trim();
            const condicionPago = (cPagValue.includes("Contado") || cPagValue === "0001") ? "Contado" : "CrÃ©dito";
            
            let asegurarPago = String(order["Asegurar pago"] || "").trim();
            if (asegurarPago === "N/A") asegurarPago = "";
            let prepago = String(order["Prepago"] || "").trim();
            
            const apValue = String(order["Ped. Bloqueado"] || order["AP"] || "").trim().toUpperCase();
            const bloqueado = (apValue === "C" || apValue === "BLOQUEADO" || apValue.includes("BLOQ")) ? "Bloqueado" : "";
            
            const rechazo = String(order["Rechazo"] || "").trim();

            const tipoPagoStr = String(order["Tipo de Pago"] || "Sin Tipo");
            let tipoPagoBg = "#F8F9FA"; 
            let tipoPagoColor = "#6C757D";
            
            if (tipoPagoStr.toLowerCase().includes("contado")) {
                tipoPagoBg = "#DBEAFE";
                tipoPagoColor = "#1E40AF";
            } else if (tipoPagoStr.toLowerCase().includes("crÃ©dito") || tipoPagoStr.toLowerCase().includes("credito")) {
                tipoPagoBg = "#F3F4F6";
                tipoPagoColor = "#374151";
            }
            
            function getAlertStyle(text) {
                const t = text.toLowerCase();
                if (t.includes('segur') || t.includes('ok') || t.includes('aprobado')) {
                    return 'background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; font-weight: 600; padding: 2px 8px;';
                }
                return 'background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; font-weight: 600; padding: 2px 8px;';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="client-name">${clientName}</div>
                    <div class="client-id">Cod: ${clientId}</div>
                    <div class="client-id" style="margin-top: 0.25rem; font-weight: 500; color: var(--accent-primary);">Ped: ${orderNum}</div>
                </td>
                <td>
                    <div class="client-name" style="font-size: 0.85rem;">${material}</div>
                    <div class="client-id" style="margin-bottom:0.25rem;">SKU: ${sku}</div>
                    <div style="font-size: 0.75rem;">${prodBadges}</div>
                </td>
                <td style="white-space: nowrap; text-align: right; font-variant-numeric: tabular-nums;">
                    <strong>S/ ${valorNeto.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                </td>
                <td style="white-space: nowrap; text-align: right; font-variant-numeric: tabular-nums;">
                    <strong>${caja}</strong> <span style="font-size: 0.8em; color: var(--success);">CA</span> &nbsp;|&nbsp; <strong>${hl.toFixed(2)}</strong> <span style="font-size: 0.8em; color: var(--accent-primary);">HL</span>
                </td>
                <td>
                    <div class="date-badge" style="background: #F8F9FA; color: #495057; font-weight: 600; border: 1px solid #DEE2E6;">${dateCreation}</div>
                </td>
                <td>
                    <div class="date-badge" style="background: ${tipoPagoBg}; color: ${tipoPagoColor}; font-weight: 600;">${tipoPagoStr}</div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:4px; align-items: flex-start;">
                        ${prepago ? `<div class="date-badge" style="${getAlertStyle(prepago)}">${prepago}</div>` : ''}
                        ${bloqueado ? `<div class="date-badge" style="background: #FEE2E2; color: #991B1B; font-weight: bold; padding: 2px 8px; border: 1px solid #FCA5A5;"><i class="ph ph-lock-key"></i> Bloqueado</div>` : ''}
                    </div>
                </td>
                <td style="white-space: nowrap;">
                    ${rechazo && rechazo !== "N/A" ? `<div class="date-badge" style="${getAlertStyle(rechazo)}">${rechazo}</div>` : ''}
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

    function updatePaginationUI(totalItems, totalPages) {
        const pagControls = document.getElementById('pagination-controls');
        if (!pagControls) return;
        
        if (totalItems === 0) {
            pagControls.style.display = 'none';
            return;
        }
        
        pagControls.style.display = 'flex';
        
        const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
        
        document.getElementById('pagination-info').textContent = `Mostrando ${start}-${end} de ${totalItems} pedidos`;
        
        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');
        
        btnPrev.disabled = currentPage === 1;
        btnPrev.style.opacity = currentPage === 1 ? '0.5' : '1';
        
        btnNext.disabled = currentPage === totalPages;
        btnNext.style.opacity = currentPage === totalPages ? '0.5' : '1';
        
        const pagNumbers = document.getElementById('pagination-numbers');
        pagNumbers.innerHTML = '';
        
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.style.padding = '0.4rem 0.8rem';
            btn.style.border = '1px solid #CED4DA';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = '500';
            
            if (i === currentPage) {
                btn.style.background = 'var(--accent-primary)';
                btn.style.color = 'white';
                btn.style.borderColor = 'var(--accent-primary)';
            } else {
                btn.style.background = 'white';
                btn.style.color = 'var(--text-primary)';
            }
            
            btn.addEventListener('click', () => {
                currentPage = i;
                triggerFilterUpdate(false);
            });
            pagNumbers.appendChild(btn);
        }
        
        btnPrev.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                triggerFilterUpdate(false);
            }
        };
        
        btnNext.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                triggerFilterUpdate(false);
            }
        };
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
        // Si el Excel guardÃ³ la fecha como texto (ej. "24/07/2026")
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
    const condicionPago = (cPagValue === "0001") ? "Contado" : "CrÃ©dito";
    
    const texto = `CÃ³digo de Cliente: ${order["Cliente"] || "N/A"}n` +
                  `NÂº Pedido: ${order["N pedido"] || "N/A"}nn` +
                  `Hola, por favor anular este pedido.`;
                  
    navigator.clipboard.writeText(texto).then(() => {
        showToast();
    }).catch(err => {
        console.error('Error al copiar: ', err);
        alert("No se pudo copiar automÃ¡ticamente. Puedes copiar este texto manualmente:nn" + texto);
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

window.adminGlobalFilter = window.adminGlobalFilter || 'Todas';

window.setAdminFilter = function(filter) {
    window.adminGlobalFilter = filter;
    renderGlobalView();
};

function renderGlobalView() {
    try {
        const container = document.getElementById('global-view-container');
        if (!container) return;
        
        // Register plugin globally if it hasn't been already
        if (window.ChartDataLabels) {
            Chart.register(ChartDataLabels);
        }
        
        const cdKeys = ["CD Arequipa", "CD ILO", "CD Tacna"];
    
    // Capacidades fijas dadas por el usuario
    const CAPACITIES = {
        "CD Arequipa": { hl: 2500, trucks: 42 },
        "CD Tacna": { hl: 450, trucks: 7 },
        "CD ILO": { hl: 350, trucks: 6 }
    };
    
    // Filtro activo
    const activeFilter = window.adminGlobalFilter;
    
    function formatToIsoDate(excelDate) {
        if (!excelDate) return "";
        if (typeof excelDate === 'number') {
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            return `${y}-${m}-${d}`;
        }
        return String(excelDate);
    }

    
    let globalOrders = [];
    if (activeFilter === 'Todas') {
        globalOrders = cdsData["Vista Global"] || [];
    } else {
        const cdKey = `CD ${activeFilter}`;
        const exactKey = cdKeys.find(k => k.toLowerCase().includes(activeFilter.toLowerCase()));
        globalOrders = cdsData[exactKey] || [];
    }
    
    // Agrupar por fecha
    const evolution = {};
    let totalBloqueadosPeriodo = 0;
    let totalRechazosPeriodo = 0;
    
    globalOrders.forEach(o => {
        const dateStr = o["Fecha Entrega"] ? formatToIsoDate(o["Fecha Entrega"]) : "Sin Fecha";
        if (!evolution[dateStr]) {
            evolution[dateStr] = {
                pedidos: new Set(),
                clientes: new Set(),
                cajas: 0,
                hl: 0,
                bloqueados: 0,
                rechazos: 0
            };
        }
        
        evolution[dateStr].pedidos.add(o["N pedido"]);
        evolution[dateStr].clientes.add(o["Cliente"]);
        evolution[dateStr].cajas += (parseFloat(o["Caja"]) || 0);
        evolution[dateStr].hl += (parseFloat(o["HL"]) || 0);
        
        const apValue = String(o["Ped. Bloqueado"] || o["AP"] || "").trim().toUpperCase();
        if (apValue === "C" || apValue === "BLOQUEADO" || apValue.includes("BLOQ")) {
            evolution[dateStr].bloqueados++;
            totalBloqueadosPeriodo++;
        }
        
        const r = String(o["Rechazo"] || "").trim();
        if (r !== "" && r !== "N/A") {
            evolution[dateStr].rechazos++;
            totalRechazosPeriodo++;
        }
    });
    
    // Ordenar de menor a mayor (Ascendente)
    const sortedDates = Object.keys(evolution).sort((a, b) => a.localeCompare(b));
    
    // Capacidad seleccionada
    let targetHLCapacity = 0;
    if (activeFilter === 'Todas') {
        targetHLCapacity = Object.values(CAPACITIES).reduce((acc, curr) => acc + curr.hl, 0);
    } else {
        const exactKey = cdKeys.find(k => k.toLowerCase().includes(activeFilter.toLowerCase()));
        targetHLCapacity = CAPACITIES[exactKey] ? CAPACITIES[exactKey].hl : 1000;
    }
    
    // Encontrar el pico de sobrecupo
    let picoMaxPct = 0;
    let picoFecha = "N/A";
    sortedDates.forEach(d => {
        const pct = (evolution[d].hl / targetHLCapacity) * 100;
        if (pct > picoMaxPct) {
            picoMaxPct = pct;
            picoFecha = d;
        }
    });

    let html = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover)); padding: 1rem; border-radius: 12px; color: #fff; box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);">
                    <i class="ph ph-chart-line-up" style="font-size: 2rem;"></i>
                </div>
                <h2 style="font-size: 2.2rem; color: var(--text-primary); margin: 0; font-weight: 800; letter-spacing: -0.5px;">Centro de Control Logístico</h2>
            </div>
            
            <div style="display: flex; gap: 0.5rem; background: var(--bg-secondary); padding: 0.5rem; border-radius: 12px; border: 1px solid var(--glass-border);">
                ${['Todas', 'Arequipa', 'Tacna', 'Ilo'].map(f => `
                    <button onclick="window.setAdminFilter('${f}')" style="padding: 0.5rem 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; ${activeFilter === f ? 'background: var(--accent-primary); color: white; box-shadow: 0 2px 8px rgba(255,87,34,0.3);' : 'background: transparent; color: var(--text-secondary);'}">${f}</button>
                `).join('')}
            </div>
        </div>
        
        <!-- Top 3 KPIs -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            <div class="glass-panel" style="background: linear-gradient(135deg, #fff, #f8f9fa); padding: 1.5rem; border-radius: 16px; border-left: 4px solid ${picoMaxPct > 100 ? '#DC2626' : '#10B981'}; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                <div style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">Pico de Sobrecupo</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">${picoMaxPct > 100 ? '🚨' : '✅'} ${picoFecha}</div>
                <div style="font-size: 1rem; color: ${picoMaxPct > 100 ? '#DC2626' : '#10B981'}; font-weight: bold; margin-top: 0.25rem;">${picoMaxPct.toFixed(1)}% de Capacidad</div>
            </div>
            
            <div class="glass-panel" style="background: linear-gradient(135deg, #fff, #f8f9fa); padding: 1.5rem; border-radius: 16px; border-left: 4px solid ${totalBloqueadosPeriodo > 0 ? '#DC2626' : '#10B981'}; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                <div style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">Bloqueados (Crédito)</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">💳 ${totalBloqueadosPeriodo}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">Pedidos en los próximos 7 días</div>
            </div>
            
            <div class="glass-panel" style="background: linear-gradient(135deg, #fff, #f8f9fa); padding: 1.5rem; border-radius: 16px; border-left: 4px solid ${totalRechazosPeriodo > 0 ? '#F59E0B' : '#10B981'}; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                <div style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem;">Rechazos / Reprog.</div>
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">⚠️ ${totalRechazosPeriodo}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">Casos en los próximos 7 días</div>
            </div>
        </div>
        
        <!-- Contenedor del Gráfico de Tendencias -->
        <div class="glass-panel" style="background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 2rem; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0; color: var(--text-primary); font-size: 1.2rem;"><i class="ph ph-trend-up"></i> Proyección de Carga (HL) - ${activeFilter}</h3>
                <span style="font-size: 0.85rem; color: var(--text-secondary); background: rgba(0,0,0,0.05); padding: 0.3rem 0.8rem; border-radius: 20px;">
                    Haz clic en una barra para ver el detalle de pedidos
                </span>
            </div>
            <div style="position: relative; height: 320px; width: 100%;">
                <canvas id="trendChart"></canvas>
            </div>
        </div>
        
        <!-- Tabla de Fechas -->
        <div class="glass-panel" style="background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="width: 100%; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: rgba(0,0,0,0.02); border-bottom: 2px solid var(--glass-border);">
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px;">Fecha de Entrega</th>
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; text-align: center;">Pedidos</th>
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; text-align: right;">Cajas</th>
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; text-align: right;">HL (Cap: ${targetHLCapacity})</th>
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; text-align: center;">Bloqueados (Crédito)</th>
                            <th style="padding: 1.2rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; text-align: center;">Rechazos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedDates.map((date, idx) => {
                            const data = evolution[date];
                            const capPct = (data.hl / targetHLCapacity) * 100;
                            const isOverCap = capPct > 100;
                            
                            return `
                            <tr style="border-bottom: 1px solid var(--glass-border); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'}; transition: background 0.2s;">
                                <td style="padding: 1.2rem; color: var(--text-primary); font-weight: 600;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <i class="ph ph-calendar-blank" style="color: var(--accent-primary);"></i>
                                        ${date}
                                    </div>
                                </td>
                                <td style="padding: 1.2rem; color: var(--text-primary); text-align: center; font-weight: 500;">
                                    <span style="background: rgba(0,0,0,0.05); padding: 0.2rem 0.6rem; border-radius: 4px;">${data.pedidos.size}</span>
                                </td>
                                <td style="padding: 1.2rem; color: var(--text-primary); font-weight: 500; text-align: right; font-variant-numeric: tabular-nums;">
                                    ${data.cajas.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                </td>
                                <td style="padding: 1.2rem; font-weight: 700; text-align: right; font-variant-numeric: tabular-nums; color: ${isOverCap ? '#DC2626' : 'var(--text-primary)'}">
                                    ${data.hl.toLocaleString('en-US', { maximumFractionDigits: 2 })} 
                                    <span style="font-size: 0.8rem; background: ${isOverCap ? '#FEE2E2' : '#F3F4F6'}; color: ${isOverCap ? '#991B1B' : '#374151'}; padding: 2px 6px; border-radius: 10px; margin-left: 8px;">
                                        ${capPct.toFixed(1)}%
                                    </span>
                                </td>
                                <td style="padding: 1.2rem; text-align: center;">
                                    ${data.bloqueados > 0 
                                        ? `<span style="background: #FEE2E2; color: #991B1B; padding: 4px 10px; border-radius: 6px; font-weight: bold; cursor: pointer;" onclick="document.getElementById('delivery-filter').value='${date}'; document.getElementById('delivery-filter').dispatchEvent(new Event('change')); setTimeout(()=>document.querySelector('[data-filter=&quot;bloqueado&quot;]').click(), 100);"><i class="ph ph-lock-key"></i> ${data.bloqueados}</span>` 
                                        : `<span style="color: #9CA3AF;">0</span>`}
                                </td>
                                <td style="padding: 1.2rem; text-align: center;">
                                    ${data.rechazos > 0 
                                        ? `<span style="background: #FEE2E2; color: #991B1B; padding: 4px 10px; border-radius: 6px; font-weight: bold; cursor: pointer;" onclick="document.getElementById('delivery-filter').value='${date}'; document.getElementById('delivery-filter').dispatchEvent(new Event('change')); setTimeout(()=>document.querySelector('[data-filter=&quot;rechazo&quot;]').click(), 100);"><i class="ph ph-warning-circle"></i> ${data.rechazos}</span>` 
                                        : `<span style="color: #9CA3AF;">0</span>`}
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Burbujas de los CDs (solo en Vista "Todas")
    if (activeFilter === 'Todas') {
        let bubblesHtml = `<div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">`;
        
        cdKeys.forEach(cd => {
            const cdData = cdsData[cd] || [];
            let hlSum = 0;
            let bloqueados = 0;
            let rechazos = 0;
            
            cdData.forEach(o => {
                hlSum += (parseFloat(o["HL"]) || 0);
                
                const apValue = String(o["Ped. Bloqueado"] || o["AP"] || "").trim().toUpperCase();
                if (apValue === "C" || apValue === "BLOQUEADO" || apValue.includes("BLOQ")) {
                    bloqueados++;
                }
                
                const r = String(o["Rechazo"] || "").trim();
                if (r !== "" && r !== "N/A") {
                    rechazos++;
                }
            });

            const cap = CAPACITIES[cd];
            const pct = (hlSum / cap.hl) * 100;
            const alertIcon = pct > 100 ? '🔴' : (pct > 80 ? '⚠️' : '✅');

            bubblesHtml += `
                <div onclick="window.setAdminFilter('${cd.replace('CD ', '')}')" class="glass-panel" style="cursor: pointer; padding: 1.5rem 2rem; border-radius: 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; transition: transform 0.2s, box-shadow 0.2s; background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85)); box-shadow: 0 8px 32px rgba(0,0,0,0.05); min-width: 320px;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 40px rgba(255, 87, 34, 0.15)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.05)';">
                    <div style="display: flex; align-items: center; gap: 0.8rem; width: 100%; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.8rem;">
                        <div style="background: var(--accent-primary); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0;">
                            <i class="ph ph-map-pin"></i>
                        </div>
                        <h3 style="margin: 0; color: var(--text-primary); font-size: 1.3rem;">${cd.replace('CD ', '')}</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 100%; margin-top: 0.5rem;">
                        <div style="font-size: 0.95rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
                            <span>Capacidad HL (Total: ${cap.hl})</span>
                            <span style="font-weight: bold; color: ${pct > 100 ? '#DC2626' : 'var(--text-primary)'}">${alertIcon} ${pct.toFixed(1)}%</span>
                        </div>
                        <div style="font-size: 0.95rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
                            <span>Bloqueos de Crédito</span>
                            <span style="font-weight: bold; color: ${bloqueados > 0 ? '#DC2626' : 'var(--text-primary)'}">${bloqueados > 0 ? '🔴' : '✅'} ${bloqueados}</span>
                        </div>
                        <div style="font-size: 0.95rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
                            <span>Rechazos / Reprog.</span>
                            <span style="font-weight: bold; color: ${rechazos > 0 ? '#DC2626' : 'var(--text-primary)'}">${rechazos > 0 ? '🔴' : '✅'} ${rechazos}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        bubblesHtml += `</div>`;

        html += bubblesHtml;
    }

    const globalViewContainer = document.getElementById('global-view-container');
    if (globalViewContainer) {
        globalViewContainer.innerHTML = html;
        
        // Inicializar Gráfico si no existe o actualizarlo
        const ctx = document.getElementById('trendChart');
        if (ctx) {
            const chartLabels = sortedDates;
            const chartData = sortedDates.map(d => evolution[d].hl);
            
            // Destruir instancia anterior si existe
            if (window.adminTrendChart) {
                window.adminTrendChart.destroy();
            }
            
            window.adminTrendChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Proyección HL',
                            data: chartData,
                            backgroundColor: chartData.map(val => val > targetHLCapacity ? 'rgba(220, 38, 38, 0.8)' : 'rgba(255, 153, 0, 0.8)'), // Rojo si sobrepasa la capacidad total
                            borderRadius: 6,
                            borderWidth: 0
                        },
                        {
                            label: 'Capacidad Máxima',
                            data: sortedDates.map(() => targetHLCapacity),
                            type: 'line',
                            borderColor: '#374151',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false,
                            pointRadius: 0,
                            datalabels: {
                                display: false
                            }
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: (e, activeElements) => {
                        if (activeElements.length > 0) {
                            const dataIndex = activeElements[0].index;
                            const clickedDate = chartLabels[dataIndex];
                            // Simulate switching back to detail view and filtering by date
                            document.getElementById('global-view-container').style.display = 'none';
                            document.getElementById('detail-table-container').style.display = 'block';
                            document.querySelector('.stats-grid').style.display = 'grid';
                            // Show filter tools again
                            const controls = document.querySelector('.controls-section');
                            if(controls) controls.style.display = 'flex'; 
                            
                            // Set date filter
                            const df = document.getElementById('delivery-filter');
                            if(df) {
                                df.value = clickedDate;
                                df.dispatchEvent(new Event('change'));
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            formatter: (value) => {
                                const pct = (value / targetHLCapacity) * 100;
                                return `${value.toLocaleString('en-US', {maximumFractionDigits: 0})} HL (${pct.toFixed(0)}%)`;
                            },
                            color: (context) => {
                                return context.dataset.data[context.dataIndex] > targetHLCapacity ? '#991B1B' : '#6B7280';
                            },
                            font: {
                                weight: 'bold',
                                size: 11
                            },
                            padding: 4
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMax: targetHLCapacity * 1.2
                        }
                    }
                }
            });
        }
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
