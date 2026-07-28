
window.currentGroupedMap = new Map();

window.openDetailsModal = function(numPedido) {
    const group = window.currentGroupedMap.get(numPedido);
    if (!group) return;
    
    let html = '';
    group.lineItems.forEach(item => {
        const material = item["Material"] || "Sin Desc.";
        const sku = item["SKU"] || "";
        const caja = parseFloat(item["Caja"]) || 0;
        const hl = parseFloat(item["HL"]) || 0;
        const vneto = (parseFloat(item["ValorNeto"]) || 0) + (parseFloat(item["Importe del impuesto"]) || 0);
        
        html += `<tr>
            <td style="padding:12px 8px; border-bottom:1px solid #f1f5f9;">
                <div style="font-weight: 500; color: #1e293b;">${material}</div>
                <div style="color:#64748b; font-size: 0.8rem; margin-top: 2px;">SKU: ${sku}</div>
            </td>
            <td style="padding:12px 8px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight: 500;">${caja} <span style="font-size: 0.75rem; color: #10b981;">CA</span></td>
            <td style="padding:12px 8px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight: 500;">${hl.toFixed(2)} <span style="font-size: 0.75rem; color: #3b82f6;">HL</span></td>
            <td style="padding:12px 8px; border-bottom:1px solid #f1f5f9; text-align:right; font-weight: 700; color: #0f172a;">S/ ${vneto.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
        </tr>`;
    });
    
    document.getElementById('modal-details-tbody').innerHTML = html;
    document.getElementById('modal-details-title').textContent = `Detalle del Pedido: ${numPedido}`;
    document.getElementById('details-modal').style.display = 'flex';
};

window.closeDetailsModal = function() {
    document.getElementById('details-modal').style.display = 'none';
};


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

            

            const SUPERVISORES = ["Alecam", "Marrib", "Jhofue", "Reyzeb", "Erigon", "Diepar", "Luigut", "Juvand", "Maulun", "Alivel"];
            
            if (user === "ADMIN") {
                currentUserRole = 'admin';
                // Admin ve la barra lateral (sidebar) para poder cambiar entre "Vista Global" y los CDs.
                const dashboardLayout = document.querySelector('.dashboard-layout');
                const sidebar = document.querySelector('.sidebar');
                if (dashboardLayout) dashboardLayout.style.gridTemplateColumns = '250px 1fr';
                if (sidebar) sidebar.style.display = 'block';

            } else if (SUPERVISORES.includes(user)) {
                currentUserRole = 'admin'; // Mantienen permisos de admin (ver tabla completa, ver ZV)
                
                // Pero se oculta la barra lateral (vista de supervisor)
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
            const button = e.target.closest('.action-filter-btn');
            if (!button) return;
            const filterType = button.getAttribute('data-filter');
            
            if (activeActionFilter === filterType) {
                activeActionFilter = null;
                button.classList.remove('activo');
            } else {
                activeActionFilter = filterType;
                document.querySelectorAll('.action-filter-btn').forEach(b => {
                    b.classList.remove('activo');
                    b.style.background = ''; // Clear inline styles from old version if any
                    b.style.color = '';
                });
                button.classList.add('activo');
            }

            triggerFilterUpdate(true);

        });

    });



    // PRE-CARGA EN SEGUNDO PLANO

    // Iniciamos la descarga apenas abre la web, para que cuando haga Login ya este listo

    let prefetchPromise = null;

    

    function startPrefetch() {

        const excelUrl = 'https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.xlsx?t=' + new Date().getTime();

        const excelUrlUpper = 'https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.XLSX?t=' + new Date().getTime();

        

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

                let res = await fetch('https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.xlsx?t=' + new Date().getTime());

                if (!res.ok) res = await fetch('https://raw.githubusercontent.com/Ronaldusil/gestion-calidad-pedidos/main/pedidos.XLSX?t=' + new Date().getTime());

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

                    let maxMinutes = -1;
                    let maxTimeStr = "--:--";
                    
                    if (typeof globalData !== 'undefined' && globalData.length > 0) {
                        globalData.forEach(row => {
                            let horaVal = row["Hora"];
                            if (!horaVal && horaVal !== 0) return;
                            
                            let hh = 0, mm = 0;
                            let strVal = String(horaVal).trim();

                            if (strVal.includes(":")) {
                                let parts = strVal.split(":");
                                hh = parseInt(parts[0], 10);
                                mm = parseInt(parts[1], 10);
                            } else {
                                let floatVal = parseFloat(horaVal);
                                if (!isNaN(floatVal) && floatVal >= 0 && floatVal <= 1) {
                                    let totalMin = Math.round(floatVal * 24 * 60);
                                    hh = Math.floor(totalMin / 60);
                                    mm = totalMin % 60;
                                }
                            }

                            if (!isNaN(hh) && !isNaN(mm)) {
                                let currentMinutes = hh * 60 + mm;
                                if (currentMinutes > maxMinutes) {
                                    maxMinutes = currentMinutes;
                                    maxTimeStr = String(hh).padStart(2, '0') + ":" + String(mm).padStart(2, '0');
                                }
                            }
                        });
                    }

                    if (maxMinutes >= 0) {
                        lastUpdateEl.textContent = `Ultima act: ${maxTimeStr}`;
                    } else {
                        const now = new Date();
                        lastUpdateEl.textContent = `Ultima act: ${now.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}`;
                    }

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

            

            // Always show the normal dashboard components
            if(document.getElementById('detail-table-container')) document.getElementById('detail-table-container').style.display = 'block';
            if(document.getElementById('pagination-controls')) document.getElementById('pagination-controls').style.display = 'flex';
            document.querySelector('.dashboard-container').style.display = 'grid';
            document.querySelector('.panel-title').style.display = 'block';
            document.querySelector('.tabla-controles').style.display = 'flex';

        } else {

            orders = sellersData[key] || [];

            currentSellerName.textContent = "";

            

            // Asegurar que tarjetas y filtros esten visibles para el vendedor

            document.querySelector('.dashboard-container').style.display = 'grid';

            document.querySelector('.panel-title').style.display = 'block';

            document.querySelector('.tabla-controles').style.display = 'flex';

        }

        

        // Agregar boton de volver para Admin si esta en un CD especifico

        if (role === 'admin' && key !== "Vista Global") {

            currentSellerName.innerHTML = `Centro: ${key} <button onclick="selectCD('Vista Global')" style="margin-left: 1rem; padding: 0.3rem 0.8rem; border-radius: 20px; border: none; background: var(--accent-primary); color: white; cursor: pointer; font-size: 0.9rem;"> Volver al Resumen</button>`;

        }

        

        const filterDateStr = deliveryFilter ? deliveryFilter.value : "";
        const searchStr = clientSearch ? clientSearch.value.toLowerCase() : "";
        
        let baseOrders = orders;
        
        if (filterDateStr || searchStr) {
            baseOrders = orders.filter(order => {
                let matchDate = true;
                let matchSearch = true;
                
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
                
                return matchDate && matchSearch;
            });
        }
        
        // 1. Calculate KPI Stats based on baseOrders
        const uniqueOrders = new Set(baseOrders.map(o => o["N pedido"])).size;
        const uniqueClients = new Set(baseOrders.map(o => o["Codigo"] || o["Cliente"])).size;
        
        const blockedClients = new Set();
        const rejectedClients = new Set();
        const prepagoClients = new Set();
        const n3Clients = new Set();
        const clientStats = {};
        const categoryStats = {
            'CERVEZA': {cajas: 0, hl: 0, display: 'Cerveza'},
            'GASEOSA': {cajas: 0, hl: 0, display: 'Gaseosa'},
            'MALTAS': {cajas: 0, hl: 0, display: 'Maltas'},
            'AGUA': {cajas: 0, hl: 0, display: 'Agua'},
            'MKP': {cajas: 0, hl: 0, display: 'Mkp'},
            'RTD': {cajas: 0, hl: 0, display: 'Rtd'}
        };
        
        let cajasTotal = 0;
        let hlTotal = 0;

        baseOrders.forEach(o => {
            const clientKey = o["Codigo"] || o["Cliente"];
            
            // Client Stats
            if (!clientStats[clientKey]) {
                clientStats[clientKey] = { pedidos: new Set(), cajas: 0 };
            }
            if (o["Doc.venta"]) {
                clientStats[clientKey].pedidos.add(o["Doc.venta"]);
            }
            clientStats[clientKey].cajas += (parseFloat(o["Caja"]) || 0);
            
            // Category Stats
            let rawCat = String(o["Categoria"] || "Otros").trim().toUpperCase();
            let cat = rawCat;
            if(rawCat.includes("CERVEZA")) cat = "CERVEZA";
            else if(rawCat.includes("GASEOSA") || rawCat.includes("GASEOSAS")) cat = "GASEOSA";
            else if(rawCat.includes("MALTA")) cat = "MALTAS";
            else if(rawCat.includes("AGUA")) cat = "AGUA";
            else if(rawCat.includes("MKP")) cat = "MKP";
            else if(rawCat.includes("RTD")) cat = "RTD";
            
            if (categoryStats[cat]) {
                categoryStats[cat].cajas += (parseFloat(o["Caja"]) || 0);
                categoryStats[cat].hl += (parseFloat(o["HL"]) || 0);
            }
            
            // Flags
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
        
        // 2. Populate Category Card
        const statCategories = document.getElementById('stat-categories');
        if (statCategories) {
            statCategories.removeAttribute('style'); // Clean up any inline styles
            let catHtml = '';
            
            // Unify categories safely ignoring case
            const catMap = { 'CERVEZA':0, 'GASEOSA':0, 'MALTAS':0, 'AGUA':0, 'MKP':0, 'RTD':0 };
            for (let c in categoryStats) {
                const upC = c.toUpperCase();
                if (catMap[upC] !== undefined) {
                    catMap[upC] += categoryStats[c].cajas;
                }
            }
            
            const orderCat = ['CERVEZA', 'GASEOSA', 'MALTAS', 'AGUA', 'MKP', 'RTD'];
            orderCat.forEach(cat => {
                catHtml += `<div class="cat-item">
      <span class="cat-nombre" style="text-transform: capitalize;">${cat.toLowerCase()}</span>
      <span class="cat-valor">${(catMap[cat] || 0).toLocaleString('en-US', {maximumFractionDigits:0})} <sub>CA</sub></span>
    </div>`;
            });
            statCategories.innerHTML = catHtml;
        }

        // 3. Apply Action Filter for Table
        let finalOrders = baseOrders;
        if (activeActionFilter) {
            finalOrders = baseOrders.filter(order => {
                const clientKey = order["Codigo"] || order["Cliente"];
                
                if (activeActionFilter === 'bloqueado') {
                    const apValue = String(order["Ped. Bloqueado"] || order["AP"] || "").trim().toUpperCase();
                    return (apValue === "C" || apValue === "BLOQUEADO" || apValue.includes("BLOQ"));
                } else if (activeActionFilter === 'prepago') {
                    return String(order["Prepago"] || "").trim() !== "";
                } else if (activeActionFilter === 'rechazo') {
                    const r = String(order["Rechazo"] || "").trim();
                    return (r !== "" && r !== "N/A");
                } else if (activeActionFilter === 'n3') {
                    return String(order["Prepago"] || "").trim().toUpperCase().includes("N3");
                } else if (activeActionFilter === 'multipedido') {
                    return clientStats[clientKey] && clientStats[clientKey].pedidos.size > 1;
                } else if (activeActionFilter === 'altovol') {
                    return clientStats[clientKey] && clientStats[clientKey].cajas > 50;
                }
                return true;
            });
        }
        
        orders = finalOrders;
        if (document.getElementById('th-zv')) { document.getElementById('th-zv').style.display = (role === 'admin') ? '' : 'none'; }
 // Set orders to finalOrders so the rest of the function renders correctly!
        
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
            statSales.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <span class="numero-grande" style="font-size: 2.2rem; font-weight: bold; color: #0f172a; line-height: 1.1; margin-bottom: 2px;">${cajasTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })} <small style="font-size: 60%; color: #64748b;">CA</small></span>
            <span class="numero-mediano" style="font-size: 1.2rem; font-weight: bold; color: #334155; line-height: 1; margin-left: 0;">${hlTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })} <small style="font-size: 60%; color: #94a3b8;">HL</small></span>
        </div>
    `;
        }
        if (statClients) {
            statClients.textContent = uniqueClients;
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

        

        
        const groupedMap = new Map();
        finalOrders.forEach(order => {
            const numPedido = String(order["N pedido"] || "N/A").trim();
            if (!groupedMap.has(numPedido)) {
                groupedMap.set(numPedido, {
                    ...order, 
                    lineItems: [],
                    groupedValorNeto: 0,
                    groupedCajas: 0,
                    groupedHL: 0
                });
            }
            const group = groupedMap.get(numPedido);
            group.lineItems.push(order);
            
            const vneto = parseFloat(order["ValorNeto"]) || 0;
            const impuesto = parseFloat(order["Importe del impuesto"]) || 0;
            group.groupedValorNeto += (vneto + impuesto);
            group.groupedCajas += (parseFloat(order["Caja"]) || 0);
            group.groupedHL += (parseFloat(order["HL"]) || 0);
        });
        
        window.currentGroupedMap = groupedMap;
        const groupedOrders = Array.from(groupedMap.values());
        
        const totalItems = groupedOrders.length;


        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

        if (currentPage > totalPages) currentPage = totalPages;

        if (currentPage < 1) currentPage = 1;



        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

        const endIndex = startIndex + ITEMS_PER_PAGE;

        const paginatedOrders = groupedOrders.slice(startIndex, endIndex);



        updatePaginationUI(totalItems, totalPages);

        

        paginatedOrders.forEach((order, index) => {

            const zvVal = String(order["Vendedor"] || order["ZV"] || "N/A").trim().toUpperCase();
            const clientName = order["Nombre 1"] || order["Cliente"] || "Sin Nombre";

            const clientId = order["Codigo"] || "N/A";

            

            

            

            // Reemplazar Fecha Entrega por Fecha de Creacion

            // Usar Fecha Entrega o Creado el + 1 por defecto
            let defaultDateNum = parseInt(order["Creado el"]) ? parseInt(order["Creado el"]) + 1 : null;
            let dateVal = order["Fecha Entrega"] || defaultDateNum;
            const dateCreation = formatDate(dateVal);

            const valorNeto = order.groupedValorNeto;

            

            const qty = order["Cantidad de pedido"] || 0;

            const um = String(order["UM"] || "").trim().toUpperCase();

            const caja = order.groupedCajas;

            const hl = order.groupedHL;

            

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

                ${role === "admin" ? `<td style="text-align: center;"><div class="client-id" style="font-weight: 600; color: #475569;">${zvVal}</div></td>` : ""}
                <td>

                    <div class="client-name">${clientName}</div>

                    <div class="client-id">Cod: ${clientId}</div>

                    <div class="client-id" style="margin-top: 0.25rem; font-weight: 500; color: var(--accent-primary);">Ped: ${orderNum}</div>

                </td>

                

                <td style="white-space: nowrap; text-align: right; font-variant-numeric: tabular-nums;">
                    ${valorNeto >= 2000 ? 
                        `<div style="background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; padding: 4px 8px; border-radius: 6px; display: inline-block; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);" title="Requiere voucher">
                            <strong style="font-size: 1rem;">S/ ${valorNeto.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                            <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-top: 2px; color: #B45309;">⚠️ Requiere Voucher</div>
                        </div>` 
                        : 
                        `<strong>S/ ${valorNeto.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>`
                    }
                </td>

                <td class="celda-numero" style="text-align:right;">
                    <div style="font-weight: 700; color: #1e293b; line-height: 1.2;">${hl.toFixed(2)} <span style="font-size: 0.75rem; font-weight: 600; color: #3b82f6;">HL</span></div>
                    <div style="font-weight: 700; color: #475569; font-size: 0.9rem; line-height: 1.2; margin-top: 2px;">${caja} <span style="font-size: 0.75rem; font-weight: 600; color: #10b981;">CA</span></div>
                </td>

                <td style="text-align: center;">
                    <div class="date-badge" style="background: #F8F9FA; color: #495057; font-weight: 600; border: 1px solid #DEE2E6;">${dateCreation}</div>
                </td>

                <td style="text-align: center;">
                    ${tipoPagoStr.toLowerCase().includes('contado') 
                        ? `<div class="date-badge" style="background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; padding: 4px 8px; font-weight: 600; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">💵 ${tipoPagoStr}</div>`
                        : `<div class="date-badge" style="background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0; padding: 4px 8px; font-weight: 600; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">💳 ${tipoPagoStr}</div>`
                    }

                </td>

                <td style="text-align: center;">
                    <div style="display:flex; flex-direction:column; gap:4px; align-items: center;">
                        ${prepago ? `<div class="date-badge" style="${getAlertStyle(prepago)}">${prepago}</div>` : ''}

                        ${bloqueado ? `<div class="date-badge" style="background: #FEE2E2; color: #991B1B; font-weight: bold; padding: 2px 8px; border: 1px solid #FCA5A5;"><i class="ph ph-lock-key"></i> Bloqueado</div>` : ''}

                    </div>

                </td>

                <td style="white-space: nowrap;">

                    ${rechazo && rechazo !== "N/A" ? `<div class="date-badge" style="${getAlertStyle(rechazo)}">${rechazo}</div>` : ''}

                </td>

                <td style="text-align: center;">
                    <button class="btn-detalle" onclick="toggleDetails('det-${orderNum.replace(/\W/g, '')}', this)" title="Ver Detalle" style="background:none; border:none; cursor:pointer; font-size:1.2rem; transition: transform 0.2s;">➕</button>
                </td>
                <td class="text-right">
                    <button class="btn-anular" onclick="anularPedido(${index})" title="Anular">
                        ✖
                    </button>

                </td>

            `;

            

            // Store order data globally for the button click

            window[`orderData_${index}`] = order;

            

            ordersTbody.appendChild(tr);

            const trDet = document.createElement('tr');
            trDet.id = `det-${orderNum.replace(/\W/g, '')}`;
            trDet.style.display = 'none';
            trDet.style.backgroundColor = '#f8fafc';
            
            let lineItemsHtml = `<td colspan="${role === 'admin' ? 10 : 9}" style="padding: 1rem; border-bottom: 2px solid #e2e8f0;">
                <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #f1f5f9; color: #475569; font-size: 0.85rem; text-transform: uppercase;">
                        <tr>
                            <th style="padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">Material</th>
                            <th style="padding: 10px 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">UM</th>
                            <th style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">Cant.</th>
                            <th style="padding: 10px 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">cPag</th>
                        </tr>
                    </thead>
                    <tbody>`;
            
            order.lineItems.forEach(item => {
                const material = item["Material"] || item["Producto"] || "Desconocido";
                const um = item["UM"] || "";
                const cant = item["Cantidad de pedido"] || "0";
                const cPag = item["CPag"] || "";
                
                lineItemsHtml += `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 8px 12px; font-size: 0.9rem; color: #1e293b;">${material}</td>
                            <td style="padding: 8px 12px; font-size: 0.85rem; text-align: center; color: #475569;">${um}</td>
                            <td style="padding: 8px 12px; font-size: 0.9rem; text-align: right; font-weight: 600; color: #0f172a;">${parseFloat(cant).toLocaleString()}</td>
                            <td style="padding: 8px 12px; font-size: 0.85rem; text-align: center; color: #64748b;">${cPag}</td>
                        </tr>`;
            });
            
            lineItemsHtml += `</tbody></table></div></td>`;
            trDet.innerHTML = lineItemsHtml;
            ordersTbody.appendChild(trDet);

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



        function renderAdminCharts(globalOrders) {
            // Re-use logic for charts
            let dailySales = {};
            let currentMonthHL = 0;
            
            globalOrders.forEach(order => {
                let dNum = parseInt(order["Creado el"]);
                let hl = parseFloat(order["HL"]) || 0;
                
                if (dNum > 40000) {
                    let d = new Date((dNum - 25569) * 86400 * 1000);
                    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                    let dayStr = d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth()+1).toString().padStart(2, '0');
                    dailySales[dayStr] = (dailySales[dayStr] || 0) + hl;
                    currentMonthHL += hl;
                }
            });
            
            const days = Object.keys(dailySales).sort((a,b) => {
                let pa = a.split('/'); let pb = b.split('/');
                return new Date(2024, pa[1]-1, pa[0]) - new Date(2024, pb[1]-1, pb[0]);
            });
            const dayVals = days.map(d => dailySales[d]);
            
            if (window.dailyChartInstance) window.dailyChartInstance.destroy();
            const ctxD = document.getElementById('dailySalesChart');
            if (ctxD) {
                window.dailyChartInstance = new Chart(ctxD, {
                    type: 'bar',
                    data: { labels: days, datasets: [{ label: 'Venta HL', data: dayVals, backgroundColor: '#3b82f6', borderRadius: 4 }] },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }
            
            if (window.monthlyChartInstance) window.monthlyChartInstance.destroy();
            const ctxM = document.getElementById('monthlyQuotaChart');
            
            // Calculo simple de cuota total
            const maxCaps = window.maxCapsGlobal || {
                    'Arequipa': { hl: 2500, cli: 1300 },
                    'Tacna': { hl: 450, cli: 450 },
                    'Ilo': { hl: 380, cli: 350 }
                };
            let totalQuota = maxCaps['Arequipa'].hl + maxCaps['Tacna'].hl + maxCaps['Ilo'].hl;
            
            if (ctxM) {
                window.monthlyChartInstance = new Chart(ctxM, {
                    type: 'doughnut',
                    data: {
                        labels: ['Avance', 'Faltante'],
                        datasets: [{ data: [currentMonthHL, Math.max(0, totalQuota - currentMonthHL)], backgroundColor: ['#10b981', '#e2e8f0'] }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
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


window.toggleDetails = function(id, btn) {
    const row = document.getElementById(id);
    if (!row) return;
    if (row.style.display === 'none') {
        row.style.display = 'table-row';
        btn.textContent = '➖';
        btn.style.transform = 'scale(1.1)';
    } else {
        row.style.display = 'none';
        btn.textContent = '➕';
        btn.style.transform = 'scale(1)';
    }
};
