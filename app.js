
window.esPeFormatter = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' });
window.esEsFormatter = new Intl.DateTimeFormat('es-ES');
window.formatearFechaExcel = function(fecha) {
    let fStr = String(fecha);
    let fNum = parseInt(fStr, 10);
    if (!isNaN(fNum) && fNum > 40000) {
        let dateObj = new Date((fNum - (25567 + 2)) * 86400 * 1000);
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        return window.esPeFormatter.format(dateObj);
    }
    return fStr;
};

// Helper para ordenar fechas en formato '27-jul.' o '27 jul'
window.parseDateValue = function(dStr) {
    const meses = {"ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6, "jul": 7, "ago": 8, "sep": 9, "oct": 10, "nov": 11, "dic": 12};
    let clean = String(dStr).toLowerCase().replace(/[^a-z0-9]/g, '');
    let match = clean.match(/^(\d{1,2})([a-z]+)/);
    if (!match) return 0;
    let day = parseInt(match[1], 10);
    let month = match[2].substring(0, 3);
    let monthNum = meses[month] || 0;
    return monthNum * 100 + day; 
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.Chart && window.ChartDataLabels) Chart.register(ChartDataLabels);


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
        "Alecam": "Ale123",
        "Marrib": "Mar123",
        "Jhofue": "Jho123",
        "Reyzeb": "Rey123",
        "Erigon": "Eri123",
        "Diepar": "Die123",
        "Luigut": "Lui123",
        "Juvand": "Juv123",
        "Maulun": "Mau123",
        "Alivel": "Ali123",

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

    let evolutionChart = null;

    let forceDetailView = false;
    let activeCD = null;
    let currentUserRole = null; // 'admin' o 'seller'
    let currentUserZV = null;
    
    // Capacidades por defecto (Modificables en vivo)
    let currentCapHL = 2500;
    let currentCapClientes = 1300;

    const defaultCaps = {
        'Todas': { hl: 3300, clientes: 2050 },
        'Arequipa': { hl: 2500, clientes: 1300 },
        'Tacna': { hl: 450, clientes: 400 },
        'Ilo': { hl: 350, clientes: 350 }
    };


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

    

    // Logica de Login

    loginForm.addEventListener('submit', (e) => {

        e.preventDefault();

        const user = loginUser.value.trim().toUpperCase();

        const pass = loginPass.value.trim();

        

        if (USUARIOS[user] && USUARIOS[user] === pass) {

            loginError.style.display = 'none';

            loginOverlay.style.display = 'none';

            appContent.classList.remove('hidden');

            

            const SUPERVISORES = ["ADMIN", "Alecam", "Marrib", "Jhofue", "Reyzeb", "Erigon", "Diepar", "Luigut", "Juvand", "Maulun", "Alivel"];
            if (SUPERVISORES.includes(user)) {

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

            

            // Si la data ya se pre-cargo en segundo plano, esto sera instantaneo

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
        const today = new Date();
        const nextDay = new Date(today);
        if (today.getDay() === 6) { // Si es sábado
            nextDay.setDate(today.getDate() + 2); // Lunes
        } else {
            nextDay.setDate(today.getDate() + 1); // Día siguiente
        }
        // Formato YYYY-MM-DD local timezone
        const year = nextDay.getFullYear();
        const month = String(nextDay.getMonth() + 1).padStart(2, '0');
        const day = String(nextDay.getDate()).padStart(2, '0');
        deliveryFilter.value = `${year}-${month}-${day}`;
        
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

    // Iniciamos la descarga apenas abre la web, para que cuando haga Login ya este listo

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

                return null; // Fallo la precarga

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

                // Si la precarga fallo, intentamos una vez mas de forma tradicional

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

            alert("AVISO CRATICO: El archivo que se descargo no es un Excel, es una pagina web! Sube tu archivo pedidos.xlsx a GitHub otra vez.");

            loadingOverlay.classList.add('hidden');

            return;

        }

        if (data.length > 2 && data[0] !== 80 && data[1] !== 75) {

            alert("AVISO: El archivo descargado no tiene el formato correcto de Excel (.xlsx). Podria estar corrupto.");

        }

        

        try {

            const workbook = XLSX.read(data, { type: 'array' });

            const success = processExcelData(workbook, data);

            

            if (success) {

                const lastUpdateEl = document.getElementById('last-update');

                if (lastUpdateEl) {

                    const now = new Date();

                    lastUpdateEl.textContent = `Ultima act: ${now.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`;

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

            alert("AVISO: Ocurrio un error al intentar procesar el archivo Excel. Asegurate de que el archivo no este daAado.");

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

                let debugStr = "AVISO: No encontre los titulos en tu archivo local.nn";

                debugStr += "TamaAo: " + rawBytes.length + " bytesn";

                alert(debugStr);

            } else {

                console.warn("Archivo vacio o daAado.");

            }

            return false;

        }

        

        // Normalizar textos para evitar problemas con acentos y simbolos

        const normalizeStr = (s) => String(s).trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");



        // Mapear los indices de las columnas

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
            if (normCell === normalizeStr("Contador Client") || normCell.includes("CONTADOR CLIENT")) colMap[index] = "Contador Client";

            if (normCell === normalizeStr("Prepago")) colMap[index] = "Prepago";

            if (normCell === normalizeStr("Rechazo")) colMap[index] = "Rechazo";

            if (normCell.includes(normalizeStr("Bloqueado"))) colMap[index] = "Ped. Bloqueado";

            if (normCell === normalizeStr("CPag") || normCell === normalizeStr("Pago")) colMap[index] = "CPag";

            if (normCell === normalizeStr("AP")) colMap[index] = "AP";

            if (normCell.includes(normalizeStr("Nombre"))) colMap[index] = "Nombre 1";

        });

        

        // Mapear la ultima columna como "Hora" si existe
        if (headerRow.length > 0) {
            colMap[headerRow.length - 1] = "Hora";
        }
        
        // Mapear la ultima columna como "Hora" si existe
        if (headerRow.length > 0) {
            colMap[headerRow.length - 1] = "Hora";
        }
        
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

                

                // Asegurar formato del CD (la macro ya lo trae como "CD Arequipa", pero por precaucion)

                let ceRaw = String(cleanRow["CD"] || "").trim();

                if (ceRaw && !ceRaw.toUpperCase().startsWith("CD ")) {

                    ceRaw = "CD " + ceRaw;

                }

                cleanRow["CD"] = ceRaw || "Otro CD";
                
                let tipoPedido = String(cleanRow["Tipo Pedido"] || "").trim().toUpperCase();
                if (tipoPedido === "PED. DSD" || tipoPedido === "PED. KKAA") {
                    cleanData.push(cleanRow);
                }

            }

        }

        

        // DESACTIVAR FILTROS TEMPORALMENTE PARA PROBAR QUE SA CARGA DATOS

        globalData = cleanData; // PASAR TODOS LOS DATOS SIN FILTRO

        

        if (globalData.length === 0 && cleanData.length > 0) {

            alert("AVISO: El Excel cargo, pero ninguna fila cumple con los filtros.");

        } else if (cleanData.length === 0) {

            alert("AVISO: El Excel se leyo, pero parece estar VACAO.");

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

            row["ZV"] = zv; // Asegurar mayusculas

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

                <div class="seller-name">${cd === "Vista Global" ? " " : " "}${cd}</div>

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

            

            if (key === "Vista Global" && !forceDetailView) {

                if(globalViewContainer) globalViewContainer.style.display = 'block';

                if(detailTableContainer) detailTableContainer.style.display = 'none';
                if(document.getElementById('pagination-controls')) document.getElementById('pagination-controls').style.display = 'none';

                

                // Ocultar tarjetas superiores, titulo de detalle y filtros

                document.querySelector('.dashboard-container').style.display = 'none';

                document.querySelector('.panel-title').style.display = 'none';

                document.querySelector('.panel-header').style.display = 'none';

                

                renderGlobalView();

                return; // Stop here, global view has its own rendering

            } else {

                if(globalViewContainer) globalViewContainer.style.display = 'none';

                if(detailTableContainer) detailTableContainer.style.display = 'block';
                if(document.getElementById('pagination-controls')) document.getElementById('pagination-controls').style.display = 'flex';

                

                // Mostrar tarjetas y filtros si entramos a un CD especifico en modo Admin

                document.querySelector('.dashboard-container').style.display = 'grid';

                document.querySelector('.panel-title').style.display = 'block';

                document.querySelector('.panel-header').style.display = 'flex';

            }

        } else {

            orders = sellersData[key] || [];

            currentSellerName.textContent = "";

            

            // Asegurar que tarjetas y filtros esten visibles para el vendedor

            document.querySelector('.dashboard-container').style.display = 'grid';

            document.querySelector('.panel-title').style.display = 'block';

            document.querySelector('.panel-header').style.display = 'flex';

        }

        

        // Agregar boton de volver para Admin si esta en un CD especifico

        if (role === 'admin' && key !== "Vista Global") {

            currentSellerName.innerHTML = `Centro: ${key} <button onclick="selectCD('Vista Global')" style="margin-left: 1rem; padding: 0.3rem 0.8rem; border-radius: 20px; border: none; background: var(--accent-primary); color: white; cursor: pointer; font-size: 0.9rem;"> Volver al Resumen</button>`;

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
        
        const uniqueClients = new Set(orders.map(o => o["Codigo"] || o["Cliente"])).size;
        statClients.textContent = uniqueClients;
        
                        const blockedClients = new Set();
        const rejectedClients = new Set();
        const prepagoClients = new Set();
        const n3Clients = new Set();
        const clientStats = {};
        
        let cajasTotal = 0;
        let hlTotal = 0;

        orders.forEach(o => {
            const clientKey = o["Codigo"] || o["Cliente"];
            
            if (!clientStats[clientKey]) {
                clientStats[clientKey] = { pedidos: new Set(), cajas: 0 };
            }
            if (o["Doc.venta"]) {
                clientStats[clientKey].pedidos.add(o["Doc.venta"]);
            }
            clientStats[clientKey].cajas += (parseFloat(o["Caja"]) || 0);
            
            const apValue = String(o["Ped. Bloqueado"] || o["AP"] || "").trim().toUpperCase();
            if (apValue === "C" || apValue === "BLOQUEADO" || apValue.includes("BLOQ") || apValue.includes("CREDITO") || apValue.includes("CR")) {
                blockedClients.add(clientKey);
            }
            
            const rechazo = String(o["Rechazo"] || o["Motivo de rechazo"] || "").trim();
            if (rechazo && rechazo !== "N/A") {
                rejectedClients.add(clientKey);
            }
            
            const prepagoValue = String(o["Prepago"] || "").trim().toUpperCase();
            if (prepagoValue === "LISTA NEGRA" || prepagoValue === "LISTA SEGURA") {
                prepagoClients.add(clientKey);
            }
            if (prepagoValue.includes("N3")) {
                n3Clients.add(clientKey);
            }
            
            cajasTotal += (parseFloat(o["Caja"]) || 0);
            hlTotal += (parseFloat(o["HL"]) || 0);
        });
        
        let multiOrderClients = 0;
        let highVolClients = 0;
        Object.values(clientStats).forEach(stats => {
            if (stats.pedidos.size > 1) multiOrderClients++;
            if (stats.cajas > 50) highVolClients++;
        });
        
        const statBlocked = document.getElementById('stat-blocked');
        if (statBlocked) statBlocked.textContent = blockedClients.size;
        
        const statRejected = document.getElementById('stat-rejected');
        if (statRejected) statRejected.textContent = rejectedClients.size;
        
        const statPrepago = document.getElementById('stat-prepago');
        if (statPrepago) statPrepago.textContent = prepagoClients.size;
        
        const statN3 = document.getElementById('stat-n3');
        if (statN3) statN3.textContent = n3Clients.size;
        
        const statMultiOrder = document.getElementById('stat-multi-order');
        if (statMultiOrder) statMultiOrder.textContent = multiOrderClients;
        
        const statHighVol = document.getElementById('stat-high-vol');
        if (statHighVol) statHighVol.textContent = highVolClients;
        
        if (statSales) {
            statSales.innerHTML = `<div style="display: flex; gap: 1rem; align-items: baseline;"><span class="metric-value">${cajasTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span><span class="metric-unit">CA</span> <span class="metric-value" style="margin-left: 10px;">${hlTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span><span class="metric-unit">HL</span></div>`;
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

            

            // Reemplazar Fecha Entrega por Fecha de Creacion

            const dateCreation = formatDate(order["Creado el"]);

            const valorNeto = parseFloat(order["ValorNeto"]) || 0;

            

            const qty = order["Cantidad de pedido"] || 0;

            const um = String(order["UM"] || "").trim().toUpperCase();

            const caja = parseFloat(order["Caja"]) || 0;

            const hl = parseFloat(order["HL"]) || 0;

            

            const orderNum = order["N pedido"] || "N/A";

            

            const cPagValue = String(order["CPag"] || "").trim();

            const condicionPago = (cPagValue.includes("Contado") || cPagValue === "0001") ? "Contado" : "Credito";

            

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

            } else if (tipoPagoStr.toLowerCase().includes("credito") || tipoPagoStr.toLowerCase().includes("credito")) {

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
        let fNum = Number(excelDate);
        if (!isNaN(fNum) && fNum > 40000) {
            const date = new Date((fNum - 25569) * 86400 * 1000);
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            return window.esEsFormatter ? window.esEsFormatter.format(date) : date.toLocaleDateString('es-ES');
        }
        return excelDate; 
    }



    function formatToIsoDate(excelDate) {

        if (!excelDate) return "";

        if (!isNaN(excelDate) && Number(excelDate) > 40000) {

            const date = new Date((excelDate - 25569) * 86400 * 1000);

            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

            const y = date.getFullYear();

            const m = String(date.getMonth() + 1).padStart(2, '0');

            const d = String(date.getDate()).padStart(2, '0');

            return `${y}-${m}-${d}`;

        }

        

        let str = String(excelDate).trim();

        // Si el Excel guardo la fecha como texto (ej. "24/07/2026")

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

    const condicionPago = (cPagValue === "0001") ? "Contado" : "Credito";

    

    const texto = `Codigo de Cliente: ${order["Cliente"] || "N/A"}n` +

                  `N Pedido: ${order["N pedido"] || "N/A"}nn` +

                  `Hola, por favor anular este pedido.`;

                  

    navigator.clipboard.writeText(texto).then(() => {

        showToast();

    }).catch(err => {

        console.error('Error al copiar: ', err);

        alert("No se pudo copiar automaticamente. Puedes copiar este texto manualmente:nn" + texto);

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
            const globalViewContainer = document.getElementById('global-view-container');
            if (!globalViewContainer) return;
            
            const activeGFilterBtn = document.querySelector('.g-filter-btn.active');
            const activeGFilter = activeGFilterBtn ? (activeGFilterBtn.dataset.cd || activeGFilterBtn.textContent.trim()) : 'Todas';
            
            const activeMetricBtn = document.querySelector('.m-filter-btn.active');
            const activeMetric = activeMetricBtn ? activeMetricBtn.dataset.metric : 'HL';
            
            let globalOrders = cdsData["Vista Global"] || [];
            
            // Calculate capacities by CD
            
            if (!window.maxCapsGlobal) {
                window.maxCapsGlobal = {
                    'Arequipa': { hl: 2500, cli: 1300 },
                    'Tacna': { hl: 450, cli: 450 },
                    'Ilo': { hl: 380, cli: 350 }
                };
            }
            const maxCaps = window.maxCapsGlobal;

            let caps, tableData, sicData;
            
            if (window.globalViewCache) {
                caps = window.globalViewCache.caps;
                tableData = window.globalViewCache.tableData;
                sicData = window.globalViewCache.sicData;
            } else {
                caps = {
                    'Arequipa': { hl: 0, cli: 0 },
                    'Tacna': { hl: 0, cli: 0 },
                    'Ilo': { hl: 0, cli: 0 }
                };
                tableData = {};
                sicData = {};
                
                const globalToday = new Date();
                let isSaturday = globalToday.getDay() === 6;
                const targetDate1 = new Date(globalToday);
                targetDate1.setDate(targetDate1.getDate() + (isSaturday ? 2 : 1));
                const globalTargetDateStr = window.esPeFormatter ? window.esPeFormatter.format(targetDate1) : targetDate1.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
                
                let globalTargetDateStrSun = null;
                if (isSaturday) {
                    const targetDate2 = new Date(globalToday);
                    targetDate2.setDate(targetDate2.getDate() + 1);
                    globalTargetDateStrSun = window.esPeFormatter ? window.esPeFormatter.format(targetDate2) : targetDate2.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
                }

                globalOrders.forEach(o => {
                    const cdStr = String(o["CD"] || "").toUpperCase();
                    let cdKey = null;
                    if (cdStr.includes("AREQUIPA")) cdKey = "Arequipa";
                    else if (cdStr.includes("TACNA")) cdKey = "Tacna";
                    else if (cdStr.includes("ILO")) cdKey = "Ilo";
                    
                    if (!cdKey) return;
                    
                    const hl = parseFloat(o["HL"]) || 0;
                    const cliVal = parseFloat(o["Contador Client"]) || 0;
                    const fechaStr = String(o["Fecha Entrega"] || "");
                    const horaStr = String(o["Hora"] || "");
                    
                    let displayDate = window.formatearFechaExcel ? window.formatearFechaExcel(fechaStr) : fechaStr;
                    
                    const targetDateStr = globalTargetDateStr;
                    const targetDateStrSun = globalTargetDateStrSun;
                    
                    let isTargetDay = (displayDate === targetDateStr) || (targetDateStrSun && displayDate === targetDateStrSun);
                    
                    let hour = "00";
                    if (horaStr) {
                        const hMatch = horaStr.match(/^(\d{1,2}):/);
                        if (hMatch) {
                            hour = hMatch[1].padStart(2, '0');
                        } else {
                            const floatTime = parseFloat(horaStr);
                            if (!isNaN(floatTime) && floatTime < 1) {
                                hour = Math.floor(floatTime * 24).toString().padStart(2, '0');
                            } else {
                                hour = String(horaStr).substring(0, 2).padStart(2, '0');
                            }
                        }
                    }
                    
                    if (isTargetDay) {
                        caps[cdKey].hl += hl;
                        caps[cdKey].cli += cliVal;
                    }
                    
                    if (!tableData[displayDate]) {
                        tableData[displayDate] = {
                            'Arequipa': { hl: 0, cli: 0 },
                            'Tacna': { hl: 0, cli: 0 },
                            'Ilo': { hl: 0, cli: 0 }
                        };
                    }
                    tableData[displayDate][cdKey].hl += hl;
                    tableData[displayDate][cdKey].cli += cliVal;
                    
                    if (isTargetDay) {
                        if (!sicData[hour]) sicData[hour] = { hl: 0, cli: 0 };
                        sicData[hour].hl += hl;
                        sicData[hour].cli += cliVal;
                    }
                });
                
                window.globalViewCache = { caps, tableData, sicData };
            }
            
            // Format Capacities HTML

            
            const renderCapHTML = (title, cdData, maxData) => {
                const renderItem = (cdName, cdKey) => {
                    const actVal = cdData[cdKey];
                    const maxVal = maxData[cdKey];
                    const pct = maxVal > 0 ? Math.round((actVal / maxVal) * 100) : 0;
                    const badgeClass = pct > 100 ? 'critico' : 'normal';
                    return `
                      <div class="capacidad-item">
                        <span class="capacidad-sede">CD ${cdName}</span>
                        <div class="capacidad-datos">
                          <span class="capacidad-valores">${actVal.toLocaleString('en-US', {maximumFractionDigits:0})} / ${maxVal}</span>
                          <span class="capacidad-badge ${badgeClass}">${pct}%</span>
                        </div>
                      </div>
                    `;
                };
                
                return `
                  <div class="card">
                    <h3 class="card-title">${title}</h3>
                    <div class="capacidad-list">
                      ${renderItem('Arequipa', 'Arequipa')}
                      ${renderItem('Tacna', 'Tacna')}
                      ${renderItem('Ilo', 'Ilo')}
                    </div>
                  </div>
                `;
            };

            
            // Filter orders for charts based on selected CD
            let filteredOrders = globalOrders;
            if (activeGFilter !== 'Todas') {
                const searchKey = "CD " + activeGFilter.toUpperCase();
                const actualKey = Object.keys(cdsData).find(k => k.toUpperCase() === searchKey);
                if (actualKey) {
                    filteredOrders = cdsData[actualKey];
                }
            }
            
            // Daily Chart Data
            const daily = {};
            const sicFiltered = {};
            
            // Siguiente dia habil para SIC
            const sicToday = new Date();
            let isSaturdaySic = sicToday.getDay() === 6;
            const sicTargetDate1 = new Date(sicToday);
            sicTargetDate1.setDate(sicTargetDate1.getDate() + (isSaturdaySic ? 2 : 1));
            const targetDateStrSic = window.esPeFormatter ? window.esPeFormatter.format(sicTargetDate1) : sicTargetDate1.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
            
            let targetDateStrSicSun = null;
            if (isSaturdaySic) {
                const sicTargetDate2 = new Date(sicToday);
                sicTargetDate2.setDate(sicTargetDate2.getDate() + 1);
                targetDateStrSicSun = window.esPeFormatter ? window.esPeFormatter.format(sicTargetDate2) : sicTargetDate2.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
            }

            filteredOrders.forEach(o => {
                const fechaStr = String(o["Fecha Entrega"] || "");
                let displayDate = window.formatearFechaExcel ? window.formatearFechaExcel(fechaStr) : fechaStr;
                
                const hl = parseFloat(o["HL"]) || 0;
                const cliVal = parseFloat(o["Contador Client"]) || 0;
                if (!daily[displayDate]) daily[displayDate] = { hl: 0, cli: 0 };
                daily[displayDate].hl += hl;
                daily[displayDate].cli += cliVal;
                
                let isTargetDaySic = (displayDate === targetDateStrSic) || (targetDateStrSicSun && displayDate === targetDateStrSicSun);
                if (isTargetDaySic) {
                    const horaStr = String(o["Hora"] || "");
                    let hour = "00";
                    if (horaStr) {
                        const hMatch = horaStr.match(/^(\d{1,2}):/);
                        if (hMatch) {
                            hour = hMatch[1].padStart(2, '0');
                        } else {
                            const floatTime = parseFloat(horaStr);
                            if (!isNaN(floatTime) && floatTime < 1) {
                                hour = Math.floor(floatTime * 24).toString().padStart(2, '0');
                            } else {
                                hour = String(horaStr).substring(0, 2).padStart(2, '0');
                            }
                        }
                    }
                    if (!sicFiltered[hour]) sicFiltered[hour] = { hl: 0, cli: 0 };
                    sicFiltered[hour].hl += hl;
                    sicFiltered[hour].cli += cliVal;
                }
            });
            const sortedDates = Object.keys(daily).sort((a, b) => window.parseDateValue(a) - window.parseDateValue(b));
            const dailyValues = sortedDates.map(d => activeMetric === 'HL' ? daily[d].hl : daily[d].cli);
            
            const sicHours = ["07","08","09","10","11","12","13","14","15","16","17","18"];
            let cumValue = 0;
            // Acumular valores antes de las 07:00
            Object.keys(sicFiltered).forEach(h => {
                if (parseInt(h) < 7) {
                    cumValue += (activeMetric === 'HL' ? sicFiltered[h].hl : sicFiltered[h].cli);
                }
            });
            const sicCumulative = sicHours.map(h => {
                const val = sicFiltered[h] ? (activeMetric === 'HL' ? sicFiltered[h].hl : sicFiltered[h].cli) : 0;
                cumValue += val;
                return cumValue;
            });
            
            // Format Proposal Table HTML
            const sortedTableDates = Object.keys(tableData).sort((a, b) => window.parseDateValue(a) - window.parseDateValue(b));
            let tableRows = '';
            const getStyle = (val, max) => val <= max ? 'color: #10B981; font-weight: bold;' : 'color: #EF4444; font-weight: bold;';
            
            sortedTableDates.forEach(d => {
                const td = tableData[d];
                tableRows += `
                    <tr>
                        <td style="font-weight: bold;">${d}</td>
                        <td style="${getStyle(td.Arequipa.hl, maxCaps.Arequipa.hl)}">${td.Arequipa.hl.toLocaleString('en-US', {maximumFractionDigits:0})}</td>
                        <td style="${getStyle(td.Arequipa.cli, maxCaps.Arequipa.cli)}">${td.Arequipa.cli}</td>
                        <td style="${getStyle(td.Tacna.hl, maxCaps.Tacna.hl)}">${td.Tacna.hl.toLocaleString('en-US', {maximumFractionDigits:0})}</td>
                        <td style="${getStyle(td.Tacna.cli, maxCaps.Tacna.cli)}">${td.Tacna.cli}</td>
                        <td style="${getStyle(td.Ilo.hl, maxCaps.Ilo.hl)}">${td.Ilo.hl.toLocaleString('en-US', {maximumFractionDigits:0})}</td>
                        <td style="${getStyle(td.Ilo.cli, maxCaps.Ilo.cli)}">${td.Ilo.cli}</td>
                    </tr>
                `;
            });

            // Building HTML
            const html = `
                
                <div class="admin-top-section" style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 24px;">
                    <div class="card" style="flex: 1 1 23%; min-width: 250px;">
                        ${renderCapHTML('% CAPACIDAD (HL)', {Arequipa:caps.Arequipa.hl, Tacna:caps.Tacna.hl, Ilo:caps.Ilo.hl}, {Arequipa:maxCaps.Arequipa.hl, Tacna:maxCaps.Tacna.hl, Ilo:maxCaps.Ilo.hl})}
                    </div>
                    <div class="card" style="flex: 1 1 23%; min-width: 250px;">
                        ${renderCapHTML('% CAPACIDAD (Cli.)', {Arequipa:caps.Arequipa.cli, Tacna:caps.Tacna.cli, Ilo:caps.Ilo.cli}, {Arequipa:maxCaps.Arequipa.cli, Tacna:maxCaps.Tacna.cli, Ilo:maxCaps.Ilo.cli})}
                    </div>
                    
                    <div class="card" style="flex: 1 1 48%; min-width: 0; overflow-x: auto;">
                        <h3 class="card-title" style="text-align: left; margin-bottom: 4px;">Avance por CD x día</h3>
                        <table class="tabla-avance">
                            <thead>
                                <tr>
                                    <th rowspan="2">Fecha</th>
                                    <th colspan="2">CD Arequipa</th>
                                    <th colspan="2">CD Tacna</th>
                                    <th colspan="2">CD Ilo</th>
                                </tr>
                                <tr>
                                    <th>HL</th>
                                    <th>Contactos</th>
                                    <th>HL</th>
                                    <th>Contactos</th>
                                    <th>HL</th>
                                    <th>Contactos</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card controles-bar">
                    <!-- Filtros de Centro de Distribución -->
                    <div class="filtros-grupo">
                        <button class="g-filter-btn btn-filtro ${activeGFilter === 'Todas' ? 'active' : ''}" data-cd="Todas">Gerencia</button>
                        <button class="g-filter-btn btn-filtro ${activeGFilter === 'Arequipa' ? 'active' : ''}" data-cd="Arequipa">CD Arequipa</button>
                        <button class="g-filter-btn btn-filtro ${activeGFilter === 'Tacna' ? 'active' : ''}" data-cd="Tacna">CD Tacna</button>
                        <button class="g-filter-btn btn-filtro ${activeGFilter === 'Ilo' ? 'active' : ''}" data-cd="Ilo">CD Ilo</button>
                    </div>

                    <!-- Filtros de Vista -->
                    <div class="filtros-grupo">
                        <button class="m-filter-btn btn-filtro ${activeMetric === 'HL' ? 'active' : ''}" data-metric="HL">Ver HL</button>
                        <button class="m-filter-btn btn-filtro ${activeMetric === 'Clientes' ? 'active' : ''}" data-metric="Clientes">Ver Clientes</button>
                    </div>

                    <!-- Inputs y Simulación -->
                    <div class="simulacion-grupo" style="${activeGFilter === 'Todas' ? 'display: none;' : 'display: flex;'}">
                        <div class="input-wrapper">
                            <label for="sim-cap-hl">Capacidad HL</label>
                            <input type="number" id="sim-cap-hl" class="input-control" value="${activeGFilter !== 'Todas' ? maxCaps[activeGFilter].hl : ''}">
                        </div>
                        <div class="input-wrapper">
                            <label for="sim-cap-cli">Tope Clientes</label>
                            <input type="number" id="sim-cap-cli" class="input-control" value="${activeGFilter !== 'Todas' ? maxCaps[activeGFilter].cli : ''}">
                        </div>
                        <button id="btn-simulate" class="btn-primary">Simular</button>
                    </div>
                </div>

                <div class="graficos-container" style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px;">
                    <div class="card" style="flex: 1 1 45%; min-width: 300px; overflow: hidden;">
                        <h3 class="card-title">Detalle por Día</h3>
                        <div class="grafico-wrapper" style="width: 100%; overflow-x: auto; overflow-y: hidden; padding-bottom: 10px;">
                            <div style="min-width: 800px; height: 300px; position: relative;">
                                <canvas id="dailyChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="card" style="flex: 1 1 45%; min-width: 300px; overflow: hidden;">
                        <h3 class="card-title">SIC de Preventa</h3>
                        <div class="grafico-wrapper" style="width: 100%; overflow-x: auto; overflow-y: hidden; padding-bottom: 10px;">
                            <div style="min-width: 800px; height: 300px; position: relative;">
                                <canvas id="sicChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

            `;
            
            globalViewContainer.innerHTML = html;
            
            // Event listeners
            document.querySelectorAll('.g-filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cd = e.target.dataset.cd;
                    document.querySelectorAll('.g-filter-btn').forEach(b => {
                        b.classList.remove('active');
                        b.classList.remove('black');
                    });
                    e.target.classList.add('active');
                    if (cd === 'Todas') e.target.classList.add('black');
                    
                    renderGlobalView();
                });
            });
            
            document.querySelectorAll('.m-filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.m-filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    renderGlobalView();
                });
            });
            
            const btnSim = document.getElementById('btn-simulate');
            if (btnSim) {
                btnSim.addEventListener('click', () => {
                    const newHL = parseFloat(document.getElementById('sim-cap-hl').value);
                    const newCli = parseFloat(document.getElementById('sim-cap-cli').value);
                    if (newHL > 0 && activeGFilter !== 'Todas') maxCaps[activeGFilter].hl = newHL;
                    if (newCli > 0 && activeGFilter !== 'Todas') maxCaps[activeGFilter].cli = newCli;
                    renderGlobalView(); // Re-render with new max capacities
                });
            }
            
            // Draw Charts
            const ctxDaily = document.getElementById('dailyChart');
            if (ctxDaily && window.Chart) {
                const currentMax = activeGFilter === 'Todas' ? 
                    (activeMetric === 'HL' ? maxCaps.Arequipa.hl + maxCaps.Tacna.hl + maxCaps.Ilo.hl : maxCaps.Arequipa.cli + maxCaps.Tacna.cli + maxCaps.Ilo.cli) :
                    (activeMetric === 'HL' ? maxCaps[activeGFilter].hl : maxCaps[activeGFilter].cli);
                
                new Chart(ctxDaily, {
                    type: 'bar',
                    data: {
                        labels: sortedDates,
                        datasets: [
                            {
                                type: 'line',
                                label: 'Capacidad Máx',
                                data: sortedDates.map(() => currentMax),
                                borderColor: '#EF4444',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                pointRadius: 0,
                                fill: false,
                                datalabels: { display: false }
                            },
                            {
                                type: 'bar',
                                label: activeMetric,
                                data: dailyValues,
                                backgroundColor: dailyValues.map(v => v > currentMax ? '#EF4444' : '#10B981'),
                                borderRadius: 4,
                                maxBarThickness: 60
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            datalabels: {
                                anchor: 'end',
                                align: 'top',
                                color: '#000',
                                font: { weight: 'bold', size: 10 },
                                formatter: (value) => value.toLocaleString('en-US', {maximumFractionDigits:0}) + (activeMetric === 'HL' ? ' HL' : '')
                            }
                        },
                        scales: {
                            y: { beginAtZero: true, grid: { borderDash: [2, 4] } }
                        }
                    }
                });
            }
            
            
            const ctxSic = document.getElementById('sicChart');
            if (ctxSic && window.Chart) {
                const maxVal = Math.max(...sicCumulative, 20);
                
                const sicBackgroundPlugin = {
                    id: 'sicBackground',
                    beforeDraw: (chart) => {
                        const {ctx, chartArea: {top, bottom, left, right, width, height}} = chart;
                        if (!width) return;
                        ctx.save();
                        // Draw bands: Green (bottom), Yellow (middle), Red (top)
                        ctx.fillStyle = 'rgba(220, 38, 38, 0.1)'; // Red
                        ctx.fillRect(left, top, width, height * 0.33);
                        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; // Yellow
                        ctx.fillRect(left, top + height * 0.33, width, height * 0.33);
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; // Green
                        ctx.fillRect(left, top + height * 0.66, width, height * 0.34);
                        ctx.restore();
                    }
                };
                
                new Chart(ctxSic, {
                    type: 'line',
                    data: {
                        labels: sicHours.map(h => h + ':00'),
                        datasets: [{
                            label: 'Acumulado ' + activeMetric,
                            data: sicCumulative,
                            borderColor: '#374151',
                            borderWidth: 3,
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: '#374151',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            fill: true,
                            backgroundColor: 'rgba(55, 65, 81, 0.05)',
                            tension: 0.4
                        }]
                    },
                    plugins: [sicBackgroundPlugin],
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            datalabels: {
                                anchor: 'end',
                                align: 'top',
                                color: '#1F2937',
                                font: { weight: 'bold', size: 10 },
                                formatter: (val) => (val > 0 ? (val > 1000 ? (val/1000).toFixed(1) + 'k' : val.toFixed(1)) : '')
                            }
                        },
                        scales: {
                            y: { 
                                beginAtZero: true, 
                                suggestedMax: maxVal * 1.2, 
                                grid: { color: 'rgba(0,0,0,0.05)' }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { maxRotation: 45, minRotation: 45 }
                            }
                        }
                    }
                });
            }

        }

        // Funcion global para el boton de las tarjetas
window.selectCD = function(cd) {

    // Encontrar el li correspondiente en el sidebar y hacerle clic

    document.querySelectorAll('.seller-item').forEach(el => {

        if (el.textContent.includes(cd)) {

            el.click();

        }

    });

};



});

