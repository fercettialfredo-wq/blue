/* =========================================
   1. ESTADO GLOBAL & COLECCIONES
   ========================================= */
const STATE = {
    // Simulación de base de datos de usuarios
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "525511223344" },
        { Torre: "B", Departamento: "205", Nombre: "Ana Gomez", Número: "525599887766" },
        { Torre: "C", Departamento: "PH1", Nombre: "Luis Miguel", Número: "525500000000" }
    ],
    // Colecciones de la App
    colvisitaOrdenada: [],           
    colpersonalaviso: [],            
    colrecibirunpaqueteOrdenada: [], 
    colEntregasLocales: [],          
    colproveedorOrdenada: [],        
    colPersonalServicio: [],         
    
    // Variables temporales y multimedia
    photos: {}, 
    signature: null,
    currentContext: "" // Para saber quién abrió el modal
};

/* URLs de Logic Apps */
const API = {
    GENERAL_WEBHOOK: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64",
    PAQUETE_RECIBIR: "https://prod-12.mexicocentral.logic.azure.com:443/workflows/974146d8a5cc450aa5687f5710d95e8a/triggers/Recibir_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Paquete_HTTP%2Frun&sv=1.0&sig=fF8pX4HPrHO1wCUY4097ARXMLgQ1gTaQ0zhC28wAtko",
    PAQUETE_ENTREGAR: "https://prod-30.mexicocentral.logic.azure.com:443/workflows/58581c1247984f83b83d030640287167/triggers/Entregar_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FEntregar_Paquete_HTTP%2Frun&sv=1.0&sig=Nce4hIr59n137JvNnSheVZN_UX_VGrR-uX-fbISjg9k"
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
    
    // --- MÓDULO A: VISITAS (Igualado a estilo B1) ---
    'A1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">VISITAS</h2>
            <h3 class="subtitle">¿Qué deseas hacer?</h3>
            <div class="grid-menu">
                <div class="menu-card big" onclick="navigate('AA1')">
                    <i class="fas fa-user-plus card-icon" style="color:white"></i>
                    <span class="card-text" style="color:white; font-weight:900;">REGISTRAR VISITA</span>
                </div>
                <div class="menu-card big" style="background:#4a0012" onclick="navigate('AC1')">
                    <i class="fas fa-hard-hat card-icon" style="color:white"></i>
                    <span class="card-text" style="color:white; font-weight:900;">PERSONAL DE SERVICIO</span>
                </div>
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
                
                <div class="input-group"><label>PLACA</label><input type="text" id="aa1-placa" class="ravens-input"></div>
                
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
            <h3 class="subtitle">¿Qué deseas hacer?</h3>
            <div class="grid-menu">
                <div class="menu-card big" onclick="navigate('BA1')">
                    <i class="fas fa-box card-icon" style="color:white"></i>
                    <span class="card-text" style="color:white; font-weight:900;">RECIBIR UN PAQUETE</span>
                </div>
                <div class="menu-card big blue" onclick="navigate('BB1')">
                    <i class="fas fa-truck-loading card-icon" style="color:white"></i>
                    <span class="card-text" style="color:white; font-weight:900;">ENTREGAR UN PAQUETE</span>
                </div>
            </div>
        </div>
    `,

    'BA1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('B1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">RECIBIR PAQUETE</h2>
            <div class="form-box">
                <div class="input-group"><label>NOMBRE DESTINATARIO *</label><input type="text" id="ba1-nombre" class="ravens-input"></div>
                
                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="ba1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="ba1-depto" class="ravens-input" readonly></div>
                </div>
                <div class="input-group"><label>RESIDENTE</label><input type="text" id="ba1-res-name" class="ravens-input" readonly></div>
                
                <button class="btn-save blue" style="margin-bottom:15px" onclick="openResidenteModal('ba1')">🔍 SELECCIONAR RESIDENTE</button>
                
                <div class="input-group"><label>PAQUETERÍA *</label><input type="text" id="ba1-paqueteria" class="ravens-input"></div>
                
                <div class="input-group">
                    <label>ESTATUS *</label>
                    <select id="ba1-estatus" class="ravens-input">
                        <option value="Aceptado">Aceptado</option>
                        <option value="Dañado/Devuelto">Dañado/Devuelto</option>
                    </select>
                </div>

                <div class="input-group"><label>FOTO *</label>
                    <div class="photo-area" onclick="document.getElementById('cam-ba1').click()">
                        <input type="file" id="cam-ba1" hidden accept="image/*" capture="environment" onchange="previewImg(this, 'ba1')">
                        <div id="prev-ba1" class="photo-preview hidden"></div>
                        <span style="color:#aaa"><i class="fas fa-camera"></i> TOCAR PARA FOTO</span>
                    </div>
                </div>
                
                <button class="btn-save" onclick="submitRecepcionPaquete()">GUARDAR</button>
            </div>
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('BA2')"><span>📋 VER LIBRETA RECEPCIÓN</span></div>
        </div>
    `,

    'BA2': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('BA1')">⬅ VOLVER</div>
            <h2 class="title">LIBRETA RECEPCIÓN</h2>
            <div class="gallery-container" id="gal-ba2"></div>
            <div class="view-form" id="detail-ba2">
                <p style="text-align:center; color:#888;">Selecciona un registro</p>
            </div>
        </div>
    `,

    'BB1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('B1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--azul)">ENTREGAR PAQUETE</h2>
            <div class="form-box">
                <div class="input-group"><label>NOMBRE QUIEN RECIBE *</label><input type="text" id="bb1-nombre" class="ravens-input"></div>

                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="bb1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="bb1-depto" class="ravens-input" readonly></div>
                </div>
                <div class="input-group"><label>RESIDENTE (DUEÑO) *</label><input type="text" id="bb1-res-name" class="ravens-input" readonly></div>
                
                <button class="btn-save blue" style="margin-bottom:15px" onclick="openResidenteModal('bb1')">🔍 SELECCIONAR RESIDENTE</button>

                <div class="input-group"><label>FOTO *</label>
                    <div class="photo-area" onclick="document.getElementById('cam-bb1').click()">
                        <input type="file" id="cam-bb1" hidden accept="image/*" capture="environment" onchange="previewImg(this, 'bb1')">
                        <div id="prev-bb1" class="photo-preview hidden"></div>
                        <span style="color:#aaa"><i class="fas fa-camera"></i> TOCAR PARA FOTO</span>
                    </div>
                </div>

                <div class="input-group"><label>FIRMA *</label>
                    <div class="signature-wrapper">
                        <canvas id="sig-canvas"></canvas>
                        <i class="fas fa-times-circle" style="position:absolute; bottom:5px; right:5px; color:red; z-index:10; font-size:20px; cursor:pointer;" onclick="clearSignature()"></i>
                    </div>
                </div>
                
                <button class="btn-save blue" onclick="submitEntregaPaquete()">GUARDAR</button>
            </div>
             <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('BB2')"><span>📋 VER LIBRETA ENTREGA</span></div>
        </div>
    `,

    'BB2': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('BB1')">⬅ VOLVER</div>
            <h2 class="title">LIBRETA ENTREGA</h2>
            <div class="gallery-container" id="gal-bb2"></div>
            <div class="view-form" id="detail-bb2">
                 <p style="text-align:center; color:#888;">Selecciona un registro</p>
            </div>
        </div>
    `,

    // --- MÓDULO D: PROVEEDORES ---
    'D1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">PROVEEDOR</h2>
            <h3 class="subtitle">NUEVO REGISTRO</h3>
            
            <div class="form-box">
                <div class="input-group"><label>NOMBRE PROVEEDOR *</label><input type="text" id="d1-nombre" class="ravens-input"></div>
                <div class="input-group"><label>EMPRESA *</label><input type="text" id="d1-empresa" class="ravens-input"></div>
                <div class="input-group"><label>TELÉFONO PROVEEDOR *</label><input type="tel" id="d1-telefono" class="ravens-input"></div>
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
            <div class="gallery-container" id="gal-d2"></div>
            <div class="view-form" id="detail-d2"><p style="text-align:center; color:#888;">Selecciona un registro.</p></div>
        </div>
    `,

    // --- MÓDULO AC: PERSONAL DE SERVICIO ---
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

    // --- OTROS MÓDULOS ---
    'E1': `<div class="screen active"><div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div><h2 class="title">QR ACCESO</h2><div id="qr-reader"></div><div class="row" style="margin-top:20px"><button class="btn-save" onclick="startQR()">ACTIVAR</button></div></div>`,
    'F1': `<div class="screen active"><div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div><h2 class="title">PERSONAL</h2><div class="form-box"><input type="text" placeholder="ID PERSONAL" class="ravens-input"><div class="row"><button class="btn-save">ENTRADA</button><button class="btn-save" style="background:var(--azul)">SALIDA</button></div></div></div>`,
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
    
    // Inicializaciones especiales por pantalla
    if(screen === 'BB1') initSignature();
    if(screen === 'AA2') renderGallery('colvisitaOrdenada', 'gal-aa2');
    if(screen === 'AC2') renderGallery('colpersonalaviso', 'gal-ac2');
    if(screen === 'D2') renderGallery('colproveedorOrdenada', 'gal-d2');
    if(screen === 'BA2') renderGallery('colrecibirunpaqueteOrdenada', 'gal-ba2');
    if(screen === 'BB2') renderGallery('colEntregasLocales', 'gal-bb2');
    
    if(screen === 'SUCCESS') setTimeout(() => navigate('INICIO'), 2000);
    
    window.scrollTo(0,0);
}

// SELECTOR RESIDENTE
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
    const p = STATE.currentContext; // 'aa1', 'ac1', 'd1', 'ba1', 'bb1'
    const item = STATE.colBaserFiltrada.find(i => i.Nombre === document.getElementById('sel-nombre').value);
    
    // Guardar datos en el estado
    STATE[p] = { 
        residente: item.Nombre, 
        numero: item.Número, 
        torre: item.Torre, 
        depto: item.Departamento 
    };

    // Llenar inputs visuales si existen en la pantalla actual
    if(document.getElementById(`${p}-torre`)) document.getElementById(`${p}-torre`).value = item.Torre;
    if(document.getElementById(`${p}-depto`)) document.getElementById(`${p}-depto`).value = item.Departamento;
    if(document.getElementById(`${p}-res-name`)) document.getElementById(`${p}-res-name`).value = item.Nombre;
    
    // Nota: El input de número ha sido eliminado visualmente, pero los datos están en STATE[p].numero
    
    closeResidenteModal();
}

function closeResidenteModal() { document.getElementById('modal-selector').classList.remove('active'); }

// FIRMA & FOTO
function initSignature() {
    setTimeout(() => {
        const canvas = document.getElementById('sig-canvas');
        if(canvas) {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgb(255, 255, 255)' });
        }
    }, 300); // Delay para asegurar que el DOM está renderizado
}

function clearSignature() {
    if(signaturePad) signaturePad.clear();
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

// --- LÓGICA DE ENVÍO DE DATOS ---

// 1. VISITAS (AA1) Y PERSONAL (AC1)
async function submitAviso(p) {
    const nom = document.getElementById(p+'-nombre').value;
    if(!nom || !STATE[p] || !STATE[p].residente) return alert("Faltan datos obligatorios o residente");
    
    // Si es AA1, obtenemos placa
    let placa = "";
    if(p === 'aa1' && document.getElementById('aa1-placa')) {
        placa = document.getElementById('aa1-placa').value;
    }

    const record = { 
        Nombre: nom, 
        Torre: STATE[p].torre, 
        Depto: STATE[p].depto, 
        Placa: placa, // Nuevo campo
        Estatus: "Nuevo",
        Fecha: new Date().toLocaleString() 
    };
    
    const col = p === 'aa1' ? 'colvisitaOrdenada' : 'colpersonalaviso';
    STATE[col].unshift(record);
    
    // Aquí iría el fetch a API.GENERAL_WEBHOOK usando record y STATE[p].numero
    navigate('SUCCESS');
}

// 2. PROVEEDOR (D1)
async function submitProveedor() {
    const nombre = document.getElementById('d1-nombre').value;
    const empresa = document.getElementById('d1-empresa').value;
    const telefono = document.getElementById('d1-telefono').value;
    const asunto = document.getElementById('d1-asunto').value;
    
    if(!nombre || !empresa || !telefono || !asunto) return alert("Faltan datos obligatorios");

    // Datos del residente tomados del STATE (sin input visual de número)
    const residenteInfo = STATE['d1'] || {};

    const record = {
        Nombre: nombre, Empresa: empresa, Número: telefono, Asunto: asunto,
        Torre: residenteInfo.torre || "", Departamento: residenteInfo.depto || "",
        'Fecha y hora': new Date().toLocaleString(), Estatus: "Nuevo"
    };

    STATE.colproveedorOrdenada.unshift(record);
    
    const urlParams = new URLSearchParams({
        Nombre: nombre, Telefono: telefono, Torre: record.Torre, Depto: record.Departamento,
        Empresa: empresa, Asunto: asunto, Tipo_Lista: "PROVEEDOR",
        // Si la API pide el teléfono del residente para buscarlo, usamos residenteInfo.numero
    });
    
    navigate('SUCCESS');
}

// 3. RECIBIR PAQUETE (BA1)
async function submitRecepcionPaquete() {
    const nombre = document.getElementById('ba1-nombre').value;
    const paqueteria = document.getElementById('ba1-paqueteria').value;
    const estatus = document.getElementById('ba1-estatus').value;
    const foto = STATE.photos['ba1'];

    if(!nombre || !paqueteria || !estatus || !foto || !STATE['ba1']?.residente) return alert("Faltan datos, residente o foto.");

    const record = {
        Nombre: nombre,
        Torre: STATE['ba1'].torre,
        Departamento: STATE['ba1'].depto,
        Número: STATE['ba1'].numero, // Dato interno
        Paqueteria: paqueteria,
        Estatus: estatus,
        Foto: foto,
        Fechayhora: new Date().toLocaleString()
    };

    STATE.colrecibirunpaqueteOrdenada.unshift(record);
    navigate('SUCCESS');
}

// 4. ENTREGAR PAQUETE (BB1)
async function submitEntregaPaquete() {
    const nombre = document.getElementById('bb1-nombre').value;
    const foto = STATE.photos['bb1'];
    
    if(!nombre || !STATE['bb1']?.residente || !foto || signaturePad.isEmpty()) return alert("Faltan datos, firma o foto.");

    const record = {
        Nombre: nombre, // Quien recibe
        Residente: STATE['bb1'].residente, // Dueño
        Torre: STATE['bb1'].torre,
        Departamento: STATE['bb1'].depto,
        FotoBase64: foto,
        FirmaBase64: signaturePad.toDataURL(),
        Fechayhora: new Date().toLocaleString()
    };

    STATE.colEntregasLocales.unshift(record);
    navigate('SUCCESS');
}


// --- RENDERIZADO DE GALERÍAS GENÉRICO ---
function renderGallery(colName, elementId) {
    const container = document.getElementById(elementId);
    const collection = STATE[colName];

    if(!collection || collection.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#555">No hay registros recientes.</div>`;
        return;
    }

    container.innerHTML = collection.map((item, idx) => `
        <div class="gallery-item" onclick="showDetail('${colName}', ${idx}, '${elementId.replace('gal','detail')}')">
            <div class="gallery-text">
                <h4>${item.Nombre}</h4>
                <p>${item.Torre || '?'} - ${item.Departamento || '?'} • ${item['Fecha y hora'] || item.Fechayhora || item.Fecha}</p>
            </div>
            <i class="fas fa-chevron-right" style="color:#555"></i>
        </div>
    `).join('');
}

function showDetail(colName, idx, targetId) {
    const item = STATE[colName][idx];
    const target = document.getElementById(targetId);
    let htmlContent = "";

    // PAQUETERÍA (BA2)
    if(colName === 'colrecibirunpaqueteOrdenada') {
        htmlContent = `
            <div class="data-field"><label>NOMBRE</label><span>${item.Nombre}</span></div>
            <div class="data-field"><label>PAQUETERÍA</label><span>${item.Paqueteria}</span></div>
            <div class="data-field"><label>ESTATUS</label><span class="${item.Estatus === 'Aceptado' ? 'status-aceptado' : 'status-rechazado'}">${item.Estatus}</span></div>
            <div class="data-field"><label>UBICACIÓN</label><span>${item.Torre} - ${item.Departamento}</span></div>
            <div class="data-field"><label>FOTO</label><img src="${item.Foto}" /></div>
        `;
    }
    // ENTREGAS (BB2)
    else if(colName === 'colEntregasLocales') {
        htmlContent = `
            <div class="data-field"><label>RECIBIÓ</label><span>${item.Nombre}</span></div>
            <div class="data-field"><label>DEL RESIDENTE</label><span>${item.Residente}</span></div>
            <div class="data-field"><label>UBICACIÓN</label><span>${item.Torre} - ${item.Departamento}</span></div>
            <div class="data-field"><label>FOTO EVIDENCIA</label><img src="${item.FotoBase64}" /></div>
            <div class="data-field"><label>FIRMA</label><img src="${item.FirmaBase64}" style="background:white; padding:10px" /></div>
        `;
    }
    // PROVEEDORES (D2)
    else if(colName === 'colproveedorOrdenada') {
        htmlContent = `
            <div class="data-field"><label>ESTATUS</label><span class="status-nuevo">${item.Estatus}</span></div>
            <div class="data-field"><label>EMPRESA</label><span>${item.Empresa}</span></div>
            <div class="data-field"><label>NOMBRE</label><span>${item.Nombre}</span></div>
            <div class="data-field"><label>UBICACIÓN</label><span>${item.Torre} - ${item.Departamento}</span></div>
        `;
    }
    // GENÉRICO (Visitas/Personal)
    else {
        htmlContent = `
            <div class="data-field"><label>NOMBRE</label><span>${item.Nombre}</span></div>
            <div class="data-field"><label>UBICACIÓN</label><span>${item.Torre} - ${item.Depto || item.Departamento}</span></div>
            ${item.Placa ? `<div class="data-field"><label>PLACA</label><span>${item.Placa}</span></div>` : ''}
            <div class="data-field"><label>FECHA</label><span>${item.Fecha || item['Fecha y hora']}</span></div>
        `;
    }

    target.innerHTML = htmlContent;
}

// Inicialización
window.onload = () => navigate('INICIO');
