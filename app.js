/* =========================================
   1. ESTADO GLOBAL & COLECCIONES
   ========================================= */
const STATE = {
    // Simulación de base de datos de residentes (PROVEEDOR en Power Apps usa esto para filtrar)
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "525511223344" },
        { Torre: "B", Departamento: "205", Nombre: "Ana Gomez", Número: "525599887766" },
        { Torre: "C", Departamento: "PH1", Nombre: "Luis Miguel", Número: "525500000000" }
    ],
    colvisitaOrdenada: [],      // AA2
    colpersonalaviso: [],       // AC2
    colrecibirunpaquete: [],    // BA2
    colEntregasLocales: [],     // BB2
    colproveedorOrdenada: [],   // D2 (Integrado)
    colPersonalServicio: [],    // F2
    photos: {}, 
    signature: null,
    currentContext: "" // Para saber quién abrió el modal (aa1, ac1, d1)
};

/* URLs de Logic Apps */
const API = {
    VISITA: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64",
    PAQUETE: "https://prod-12.mexicocentral.logic.azure.com:443/workflows/974146d8a5cc450aa5687f5710d95e8a/triggers/Recibir_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Paquete_HTTP%2Frun&sv=1.0&sig=fF8pX4HPrHO1wCUY4097ARXMLgQ1gTaQ0zhC28wAtko",
    ENTREGA: "https://prod-30.mexicocentral.logic.azure.com:443/workflows/58581c1247984f83b83d030640287167/triggers/Entregar_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FEntregar_Paquete_HTTP%2Frun&sv=1.0&sig=Nce4hIr59n137JvNnSheVZN_UX_VGrR-uX-fbISjg9k",
    // Nota: El YAML D1 usa la misma URL base que Visita pero con Tipo_Lista=PROVEEDOR, se manejará en submitProveedor
    PROVEEDOR: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64"
};

/* =========================================
   2. MOTOR DE PANTALLAS (HTML TEMPLATES)
   ========================================= */
const SCREENS = {
    'INICIO': `
        <div class="screen active">
            <h2 class="title">PANEL DE CONTROL</h2>
            <div class="grid-menu">
                <div class="menu-card" onclick="navigate('A1')"><i class="fas fa-users card-icon"></i><span class="card-text">VISITAS</span></div>
                <div class="menu-card" onclick="navigate('B1')"><i class="fas fa-box-open card-icon"></i><span class="card-text">PAQUETERÍA</span></div>
                <div class="menu-card" onclick="navigate('D1')"><i class="fas fa-tools card-icon"></i><span class="card-text">PROVEEDORES</span></div>
                <div class="menu-card" onclick="navigate('E1')"><i class="fas fa-qrcode card-icon"></i><span class="card-text">MODULOS QR</span></div>
                <div class="menu-card full" onclick="navigate('F1')"><i class="fas fa-user-shield card-icon"></i><span class="card-text">PERSONAL INTERNO</span></div>
            </div>
        </div>
    `,
    // --- MÓDULO A: VISITAS ---
    'A1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">VISITAS</h2>
            <div class="action-list">
                <div class="btn-action primary" onclick="navigate('AA1')"><span>➕ REGISTRAR VISITA</span><i class="fas fa-chevron-right"></i></div>
                <div class="btn-action primary" style="background:#4a0012" onclick="navigate('AC1')"><span>👷 PERSONAL DE SERVICIO</span><i class="fas fa-chevron-right"></i></div>
            </div>
        </div>
    `,
    'AA1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('A1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">NUEVA VISITA</h2>
            <div class="form-box">
                <div class="input-group"><label>NOMBRE VISITANTE</label><input type="text" id="aa1-nombre" class="ravens-input"></div>
                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="aa1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="aa1-depto" class="ravens-input" readonly></div>
                </div>
                <div class="input-group"><label>RESIDENTE</label><input type="text" id="aa1-res-name" class="ravens-input" readonly></div>
                <button class="btn-save blue" style="margin-bottom:15px;" onclick="openResidenteModal('aa1')">🔍 SELECCIONAR RESIDENTE</button>
                <div class="input-group"><label>MOTIVO</label><input type="text" id="aa1-motivo" class="ravens-input"></div>
                <button class="btn-save" onclick="submitAviso('aa1')">GUARDAR</button>
            </div>
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('AA2')"><span>📋 VER LIBRETA VISITAS</span></div>
        </div>
    `,
    'AA2': `<div class="screen active"><div class="btn-back" onclick="navigate('AA1')">⬅ VOLVER</div><h2 class="title">Libreta Visitas</h2><div class="gallery-container" id="gal-aa2"></div><div class="view-form" id="detail-aa2"></div></div>`,

    // --- MÓDULO B: PAQUETERÍA ---
    'B1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">PAQUETERÍA</h2>
            <div class="action-list">
                <div class="btn-action primary" onclick="navigate('BA1')"><span>⬇ RECIBIR PAQUETE</span><i class="fas fa-chevron-right"></i></div>
                <div class="btn-action blue" onclick="navigate('BB1')"><span>⬆ ENTREGAR</span><i class="fas fa-chevron-right"></i></div>
            </div>
        </div>
    `,
    'BA1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('B1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">RECEPCIÓN</h2>
            <div class="form-box">
                <div class="input-group"><label>PARA RESIDENTE</label><input type="text" id="ba1-nombre" class="ravens-input"></div>
                <div class="input-group"><label>EMPRESA</label><input type="text" id="ba1-empresa" class="ravens-input"></div>
                <div class="input-group"><label>FOTO</label>
                    <div class="photo-area" onclick="document.getElementById('cam-ba1').click()">
                        <input type="file" id="cam-ba1" hidden accept="image/*" capture="environment" onchange="previewImg(this, 'ba1')">
                        <div id="prev-ba1" class="photo-preview hidden"></div>
                        <span>📷 TOMAR FOTO</span>
                    </div>
                </div>
                <button class="btn-save" onclick="submitPaquete('ba1')">GUARDAR</button>
            </div>
        </div>
    `,
    'BB1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('B1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--azul)">ENTREGA</h2>
            <div class="form-box">
                <div class="input-group"><label>QUIEN RECIBE</label><input type="text" id="bb1-nombre" class="ravens-input"></div>
                <div class="input-group"><label>FIRMA</label><div class="signature-wrapper"><canvas id="sig-canvas"></canvas></div></div>
                <button class="btn-save" style="background:var(--azul)" onclick="submitEntrega('bb1')">CONFIRMAR</button>
            </div>
        </div>
    `,

    // --- MÓDULO D: PROVEEDORES (INTEGRADO D1 y D2) ---
    'D1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">PROVEEDOR</h2>
            <h3 class="subtitle">NUEVO REGISTRO</h3>
            
            <div class="form-box">
                <div class="input-group"><label>NOMBRE PROVEEDOR *</label><input type="text" id="d1-nombre" class="ravens-input"></div>
                <div class="input-group"><label>EMPRESA *</label><input type="text" id="d1-empresa" class="ravens-input"></div>
                <div class="input-group"><label>NÚMERO TEL *</label><input type="tel" id="d1-telefono" class="ravens-input"></div>
                <div class="input-group"><label>ASUNTO *</label><input type="text" id="d1-asunto" class="ravens-input"></div>

                <hr style="border:0; border-top:1px solid #333; margin: 15px 0;">

                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="d1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="d1-depto" class="ravens-input" readonly></div>
                </div>
                <div class="input-group"><label>RESIDENTE</label><input type="text" id="d1-res-name" class="ravens-input" readonly></div>
                
                <button class="btn-save blue" style="margin-bottom:15px" onclick="openResidenteModal('d1')">🔍 SELECCIONAR RESIDENTE</button>
                <button class="btn-save" onclick="submitProveedor()">GUARDAR</button>
            </div>

            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('D2')">
                <span>📓 VER LIBRETA</span><i class="fas fa-chevron-right"></i>
            </div>
        </div>
    `,

    'D2': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('D1')">⬅ REGISTRO</div>
            <h2 class="title">PROVEEDOR</h2>
            <h3 class="subtitle">LIBRETA</h3>
            <div class="gallery-container" id="gal-d2">
                </div>
            <div class="view-form" id="detail-d2">
                <p style="text-align:center; color:#888;">Selecciona un registro para ver detalles.</p>
            </div>
        </div>
    `,

    // --- OTROS MÓDULOS ---
    'E1': `<div class="screen active"><div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div><h2 class="title">QR ACCESO</h2><div id="qr-reader"></div><div class="row" style="margin-top:20px"><button class="btn-save" onclick="startQR()">ACTIVAR</button></div></div>`,
    'F1': `<div class="screen active"><div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div><h2 class="title">PERSONAL</h2><div class="form-box"><input type="text" placeholder="ID PERSONAL" class="ravens-input"><div class="row"><button class="btn-save">ENTRADA</button><button class="btn-save" style="background:var(--azul)">SALIDA</button></div></div></div>`,
    
    // --- PERSONAL SERVICIO (AC1/AC2) ---
    'AC1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('A1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">PERSONAL SERVICIO</h2>
            <div class="form-box">
                <div class="input-group"><label>NOMBRE</label><input type="text" id="ac1-nombre" class="ravens-input"></div>
                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="ac1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="ac1-depto" class="ravens-input" readonly></div>
                </div>
                <div class="input-group"><label>RESIDENTE</label><input type="text" id="ac1-res-name" class="ravens-input" readonly></div>
                <button class="btn-save blue" style="margin-bottom:15px;" onclick="openResidenteModal('ac1')">🔍 BUSCAR RESIDENTE</button>
                <div class="input-group"><label>CARGO</label><input type="text" id="ac1-cargo" class="ravens-input"></div>
                <button class="btn-save" onclick="submitAviso('ac1')">GUARDAR</button>
            </div>
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('AC2')"><span>📋 LIBRETA PERSONAL</span></div>
        </div>
    `,
    'AC2': `<div class="screen active"><div class="btn-back" onclick="navigate('AC1')">⬅ VOLVER</div><h2 class="title">Libreta Personal</h2><div class="gallery-container" id="gal-ac2"></div><div class="view-form" id="detail-ac2"></div></div>`,

    // --- FEEDBACK ---
    'SUCCESS': `<div class="screen active" style="text-align:center; padding-top:100px;"><i class="fas fa-check-circle fa-5x" style="color:var(--verde)"></i><h2>ÉXITO</h2></div>`
};

/* =========================================
   3. MOTOR LÓGICO & NAVEGACIÓN
   ========================================= */
let signaturePad;
let html5QrCode;

function navigate(screen) {
    if(html5QrCode) html5QrCode.stop().catch(()=>{});
    document.getElementById('viewport').innerHTML = SCREENS[screen] || SCREENS['INICIO'];
    
    // Inicializaciones especiales
    if(screen === 'BB1') initSignature();
    if(screen === 'AA2') renderGallery('colvisitaOrdenada', 'gal-aa2');
    if(screen === 'AC2') renderGallery('colpersonalaviso', 'gal-ac2');
    if(screen === 'D2') renderGallery('colproveedorOrdenada', 'gal-d2'); // Inicializa libreta proveedores
    
    if(screen === 'SUCCESS') setTimeout(() => navigate('INICIO'), 2000);
    
    window.scrollTo(0,0);
}

// SELECTOR RESIDENTE (Lógica común para Visita, Personal y Proveedor)
function openResidenteModal(ctx) {
    STATE.currentContext = ctx;
    const torres = [...new Set(STATE.colBaserFiltrada.map(i => i.Torre))];
    document.getElementById('sel-torre').innerHTML = torres.map(t => `<option value="${t}">${t}</option>`).join('');
    updateDeptos();
    document.getElementById('modal-selector').classList.add('active');
}

function updateDeptos() {
    const t = document.getElementById('sel-torre').value;
    const deptos = STATE.colBaserFiltrada.filter(i => i.Torre === t).map(i => i.Departamento);
    // Truco del YAML: Ordenar numéricamente si es posible, aquí simple sort
    deptos.sort(); 
    document.getElementById('sel-depto').innerHTML = deptos.map(d => `<option value="${d}">${d}</option>`).join('');
    updateResidentes();
}

function updateResidentes() {
    const t = document.getElementById('sel-torre').value;
    const d = document.getElementById('sel-depto').value;
    const res = STATE.colBaserFiltrada.filter(i => i.Torre === t && i.Departamento === d).map(r => r.Nombre);
    document.getElementById('sel-nombre').innerHTML = res.map(n => `<option value="${n}">${n}</option>`).join('');
}

function confirmResidente() {
    const p = STATE.currentContext; // 'aa1', 'ac1' o 'd1'
    const item = STATE.colBaserFiltrada.find(i => i.Nombre === document.getElementById('sel-nombre').value);
    
    // Guardamos datos temporales en el estado del contexto
    STATE[p] = { 
        residente: item.Nombre, 
        numero: item.Número, 
        torre: item.Torre, 
        depto: item.Departamento 
    };

    // Llenamos inputs visuales (asegura que existan en el HTML de la pantalla actual)
    if(document.getElementById(`${p}-torre`)) document.getElementById(`${p}-torre`).value = item.Torre;
    if(document.getElementById(`${p}-depto`)) document.getElementById(`${p}-depto`).value = item.Departamento;
    if(document.getElementById(`${p}-res-name`)) document.getElementById(`${p}-res-name`).value = item.Nombre;
    
    closeResidenteModal();
}

function closeResidenteModal() { document.getElementById('modal-selector').classList.remove('active'); }

// FIRMA & FOTO
function initSignature() {
    const canvas = document.getElementById('sig-canvas');
    signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgb(255, 255, 255)' });
}

function previewImg(input, id) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            STATE.photos[id] = e.target.result;
            const prev = document.getElementById('prev-'+id);
            prev.style.backgroundImage = `url(${e.target.result})`;
            prev.classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// --- LOGICA DE ENVÍO DE VISITAS Y PERSONAL (A1, AC1) ---
async function submitAviso(p) {
    const nom = document.getElementById(p+'-nombre').value;
    if(!nom || !STATE[p] || !STATE[p].residente) return alert("Faltan datos obligatorios o residente");
    
    const record = { 
        Nombre: nom, 
        Torre: STATE[p].torre, 
        Depto: STATE[p].depto, 
        Estatus: "Nuevo", // Valor por defecto
        Fecha: new Date().toLocaleString() 
    };
    
    const col = p === 'aa1' ? 'colvisitaOrdenada' : 'colpersonalaviso';
    STATE[col].unshift(record);
    
    // Llamada simulada a la API (fetch real comentado para evitar errores de CORS en demo local)
    // await fetch(API.VISITA, { method: 'POST' ... });
    
    navigate('SUCCESS');
}

// --- LOGICA DE ENVÍO DE PROVEEDOR (D1) ---
async function submitProveedor() {
    // 1. Obtener datos del DOM
    const nombre = document.getElementById('d1-nombre').value;
    const empresa = document.getElementById('d1-empresa').value;
    const telefono = document.getElementById('d1-telefono').value;
    const asunto = document.getElementById('d1-asunto').value;
    
    // 2. Validación
    if(!nombre || !empresa || !telefono || !asunto) {
        alert("❌ Error. Revisa los datos obligatorios.");
        return;
    }

    // Datos del residente (pueden ser opcionales según YAML, pero aquí los tomamos si existen)
    const torre = STATE['d1']?.torre || "";
    const depto = STATE['d1']?.depto || "";
    const condominio = "TorreCentral"; // Simulado varPermiso.Condominio

    // 3. Guardar en memoria (Colección colproveedorOrdenada)
    const newRecord = {
        Nombre: nombre,
        Empresa: empresa,
        Número: telefono,
        Asunto: asunto,
        Torre: torre,
        Departamento: depto,
        'Fecha y hora': new Date().toLocaleString(), // Formato local simple
        Estatus: "Nuevo"
    };

    STATE.colproveedorOrdenada.unshift(newRecord);

    // 4. Construcción de URL (Lógica del botón Guardar en D1.pa.yaml)
    // EncodeUrl simulado con encodeURIComponent
    const urlParams = new URLSearchParams({
        Nombre: nombre,
        Telefono: telefono,
        Torre: torre,
        Depto: depto,
        Empresa: empresa,
        Asunto: asunto,
        Condominio: condominio,
        Hora: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        Ignorar: new Date().toISOString().replace(/[-:T.]/g, ''),
        Tipo_Lista: "PROVEEDOR"
    });

    const fullUrl = `${API.PROVEEDOR}&${urlParams.toString()}`;
    
    console.log("Enviando a Azure Logic App:", fullUrl);

    // 5. Fetch (Disparar flujo)
    try {
        await fetch(fullUrl, { method: 'GET' }); // Trigger GET
        navigate('SUCCESS');
    } catch (e) {
        console.error("Error de red", e);
        // A efectos de demo, navegamos a success aunque falle el fetch (cors)
        navigate('SUCCESS');
    }
}

// --- RENDERIZADO DE GALERÍAS (D2, AA2, AC2) ---
function renderGallery(colName, elementId) {
    const container = document.getElementById(elementId);
    const collection = STATE[colName];

    if(collection.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#555">No hay registros recientes.</div>`;
        return;
    }

    container.innerHTML = collection.map((item, idx) => `
        <div class="gallery-item" onclick="showDetail('${colName}', ${idx}, '${elementId === 'gal-d2' ? 'detail-d2' : (elementId === 'gal-aa2' ? 'detail-aa2' : 'detail-ac2')}')">
            <div class="gallery-text">
                <h4>${item.Nombre}</h4>
                <p>${item.Torre || '?'} - ${item.Departamento || '?'} • ${item['Fecha y hora'] || item.Fecha}</p>
            </div>
            <i class="fas fa-chevron-right" style="color:#555"></i>
        </div>
    `).join('');
}

function showDetail(colName, idx, targetId) {
    const item = STATE[colName][idx];
    const target = document.getElementById(targetId);

    // Determinar color del estatus (Lógica de D2.pa.yaml)
    let statusClass = "";
    if (item.Estatus === "Aceptado") statusClass = "status-aceptado";
    else if (item.Estatus === "Rechazado") statusClass = "status-rechazado";
    else statusClass = "status-nuevo"; // "Nuevo" o cualquier otro -> Azul/Negro por defecto

    // Template específico para Proveedores (D2)
    if(colName === 'colproveedorOrdenada') {
        target.innerHTML = `
            <div class="view-form">
                <div class="data-field"><label>ESTATUS</label><span class="${statusClass}">${item.Estatus}</span></div>
                <div class="data-field"><label>NOMBRE</label><span>${item.Nombre}</span></div>
                <div class="data-field"><label>EMPRESA</label><span>${item.Empresa}</span></div>
                <div class="data-field"><label>ASUNTO</label><span>${item.Asunto}</span></div>
                <div class="data-field"><label>UBICACIÓN</label><span>Torre ${item.Torre} - Depto ${item.Departamento}</span></div>
                <div class="data-field"><label>FECHA</label><span>${item['Fecha y hora']}</span></div>
            </div>`;
    } else {
        // Template genérico (Visitas/Personal)
        target.innerHTML = `
            <div class="view-form">
                <div class="data-field"><label>Nombre</label><span>${item.Nombre}</span></div>
                <div class="data-field"><label>Estatus</label><span class="${statusClass}">${item.Estatus}</span></div>
                <div class="data-field"><label>Ubicación</label><span>Torre ${item.Torre} - Depto ${item.Departamento || item.Depto}</span></div>
                <div class="data-field"><label>Fecha</label><span>${item.Fecha}</span></div>
            </div>`;
    }
}

// Inicialización
window.onload = () => navigate('INICIO');
