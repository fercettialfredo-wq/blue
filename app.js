/* =========================================
   1. ESTADO GLOBAL & COLECCIONES
   ========================================= */
const STATE = {
    // Base simulada
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "5512345678" },
        { Torre: "B", Departamento: "205", Nombre: "Ana Gomez", Número: "5587654321" },
        { Torre: "C", Departamento: "PH1", Nombre: "Luis Miguel", Número: "5500000000" }
    ],
    // Colecciones de la App
    colvisitaOrdenada: [],           
    colpersonalaviso: [],            
    colrecibirunpaqueteOrdenada: [], 
    colEntregasLocales: [],          
    colproveedorOrdenada: [],        
    colPersonalServicio: [], // F2 (Personal Interno)
    
    // Módulos QR
    colQRResidenteEA1: [],
    colQRResidenteEB1: [], 
    colResetNip: [],
    
    // Auxiliares
    photos: {}, 
    signature: null,
    currentContext: "",
    targetInputForQR: "" // Variable para saber a qué input enviar el texto escaneado
};

/* =========================================
   2. MOTOR DE PANTALLAS (HTML TEMPLATES)
   ========================================= */
const SCREENS = {
    'INICIO': `
        <div class="screen active">
            <h2 class="title">PANEL DE CONTROL</h2>
            <div class="grid-menu">
                <div class="menu-card" onclick="navigate('A1')"><i class="fas fa-users"></i><span class="card-text">VISITAS</span></div>
                <div class="menu-card" onclick="navigate('B1')"><i class="fas fa-box-open"></i><span class="card-text">PAQUETERÍA</span></div>
                <div class="menu-card" onclick="navigate('D1')"><i class="fas fa-tools"></i><span class="card-text">PROVEEDORES</span></div>
                <div class="menu-card" onclick="navigate('E1')"><i class="fas fa-qrcode"></i><span class="card-text">MÓDULOS QR</span></div>
                <div class="menu-card full" onclick="navigate('F1')"><i class="fas fa-user-shield"></i><span class="card-text">PERSONAL INTERNO</span></div>
            </div>
        </div>
    `,
    
    // --- MÓDULO A: VISITAS ---
    'A1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">VISITAS</h2>
            <div class="grid-menu">
                <div class="menu-card big" onclick="navigate('AA1')">
                    <i class="fas fa-user-plus"></i><span class="card-text">REGISTRAR VISITA</span>
                </div>
                <div class="menu-card big" style="background:#4a0012" onclick="navigate('AC1')">
                    <i class="fas fa-hard-hat"></i><span class="card-text">PERSONAL SERVICIO</span>
                </div>
            </div>
        </div>
    `,
    'AA1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('A1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">NUEVA VISITA</h2>
            <div class="form-box">
                <div class="input-group"><label>NOMBRE VISITANTE *</label><input type="text" id="aa1-nombre" class="ravens-input"></div>
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
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('AA2')"><span>📋 LIBRETA VISITAS</span></div>
        </div>
    `,
    'AA2': `<div class="screen active"><div class="btn-back" onclick="navigate('AA1')">⬅ VOLVER</div><h2 class="title">LIBRETA VISITAS</h2><div class="gallery-container" id="gal-aa2"></div><div class="view-form" id="detail-aa2"></div></div>`,

    // --- MÓDULO B: PAQUETERÍA ---
    'B1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">PAQUETERÍA</h2>
            <div class="grid-menu">
                <div class="menu-card big" onclick="navigate('BA1')">
                    <i class="fas fa-box"></i><span class="card-text">RECIBIR PAQUETE</span>
                </div>
                <div class="menu-card big blue" onclick="navigate('BB1')">
                    <i class="fas fa-truck-loading"></i><span class="card-text">ENTREGAR PAQUETE</span>
                </div>
            </div>
        </div>
    `,
    'BA1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('B1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">RECIBIR PAQUETE</h2>
            <div class="form-box">
                <div class="input-group"><label>DESTINATARIO *</label><input type="text" id="ba1-nombre" class="ravens-input"></div>
                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="ba1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="ba1-depto" class="ravens-input" readonly></div>
                </div>
                <div class="input-group"><label>RESIDENTE</label><input type="text" id="ba1-res-name" class="ravens-input" readonly></div>
                <button class="btn-save blue" style="margin-bottom:15px" onclick="openResidenteModal('ba1')">🔍 SELECCIONAR RESIDENTE</button>
                <div class="input-group"><label>PAQUETERÍA *</label><input type="text" id="ba1-paqueteria" class="ravens-input"></div>
                <div class="input-group"><label>ESTATUS *</label>
                    <select id="ba1-estatus" class="ravens-input">
                        <option value="Aceptado">Aceptado</option>
                        <option value="Dañado">Dañado</option>
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
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('BA2')"><span>📋 VER LIBRETA</span></div>
        </div>
    `,
    'BA2': `<div class="screen active"><div class="btn-back" onclick="navigate('BA1')">⬅ VOLVER</div><h2 class="title">LIBRETA RECEPCIÓN</h2><div class="gallery-container" id="gal-ba2"></div><div class="view-form" id="detail-ba2"></div></div>`,
    
    'BB1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('B1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--azul)">ENTREGAR PAQUETE</h2>
            <div class="form-box">
                <div class="input-group"><label>RECIBE *</label><input type="text" id="bb1-nombre" class="ravens-input"></div>
                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="bb1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="bb1-depto" class="ravens-input" readonly></div>
                </div>
                <div class="input-group"><label>RESIDENTE (DUEÑO)</label><input type="text" id="bb1-res-name" class="ravens-input" readonly></div>
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
             <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('BB2')"><span>📋 VER LIBRETA</span></div>
        </div>
    `,
    'BB2': `<div class="screen active"><div class="btn-back" onclick="navigate('BB1')">⬅ VOLVER</div><h2 class="title">LIBRETA ENTREGA</h2><div class="gallery-container" id="gal-bb2"></div><div class="view-form" id="detail-bb2"></div></div>`,

    // --- MÓDULO D: PROVEEDORES ---
    'D1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">PROVEEDOR</h2>
            <div class="form-box">
                <div class="input-group"><label>NOMBRE *</label><input type="text" id="d1-nombre" class="ravens-input"></div>
                <div class="input-group"><label>EMPRESA *</label><input type="text" id="d1-empresa" class="ravens-input"></div>
                <div class="input-group"><label>TELÉFONO *</label><input type="tel" id="d1-telefono" class="ravens-input"></div>
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
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('D2')"><span>📓 VER LIBRETA</span></div>
        </div>
    `,
    'D2': `<div class="screen active"><div class="btn-back" onclick="navigate('D1')">⬅ REGISTRO</div><h2 class="title">LIBRETA PROVEEDOR</h2><div class="gallery-container" id="gal-d2"></div><div class="view-form" id="detail-d2"></div></div>`,

    // --- MÓDULO E: QR (Mapeo Completo) ---
    'E1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">MÓDULOS QR</h2>
            <div class="grid-menu">
                <div class="menu-card" onclick="navigate('EA1')"><i class="fas fa-qrcode"></i><span class="card-text">QR RESIDENTE</span></div>
                <div class="menu-card" onclick="navigate('EB1')"><i class="fas fa-qrcode"></i><span class="card-text">QR VISITA</span></div>
                <div class="menu-card" onclick="navigate('EC1')"><i class="fas fa-check-circle"></i><span class="card-text">VALIDAR ACCESO</span></div>
                <div class="menu-card" onclick="navigate('ED1')"><i class="fas fa-key"></i><span class="card-text">RESET NIP</span></div>
            </div>
        </div>
    `,
    'EA1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('E1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">QR RESIDENTE</h2>
            <div class="form-box">
                <div class="input-group"><label>DNI / CÓDIGO *</label><input type="text" id="ea1-dni" class="ravens-input" placeholder="Escanea o escribe"></div>
                <button class="btn-save blue" style="margin-bottom:15px" onclick="startScan('ea1-dni')"><i class="fas fa-camera"></i> ESCANEAR CÓDIGO</button>
                <button class="btn-save" onclick="submitQRResidente()">ASIGNAR</button>
            </div>
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('EA2')"><span>📋 HISTORIAL RESIDENTES</span></div>
        </div>
    `,
    'EA2': `<div class="screen active"><div class="btn-back" onclick="navigate('EA1')">⬅ VOLVER</div><h2 class="title">Historial Residentes</h2><div class="gallery-container" id="gal-ea2"></div><div class="view-form" id="detail-ea2"></div></div>`,
    
    'EB1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('E1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">QR VISITA</h2>
            <div class="form-box">
                <div class="input-group"><label>CÓDIGO VFS *</label><input type="text" id="eb1-code" class="ravens-input" placeholder="Escanea o escribe"></div>
                <button class="btn-save blue" style="margin-bottom:15px" onclick="startScan('eb1-code')"><i class="fas fa-camera"></i> ESCANEAR CÓDIGO</button>
                <button class="btn-save" onclick="submitQRVisita()">ASIGNAR</button>
            </div>
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('EB2')"><span>📋 HISTORIAL VFS</span></div>
        </div>
    `,
    'EB2': `<div class="screen active"><div class="btn-back" onclick="navigate('EB1')">⬅ VOLVER</div><h2 class="title">Historial Visitas</h2><div class="gallery-container" id="gal-eb2"></div><div class="view-form" id="detail-eb2"></div></div>`,

    'EC1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('E1')">⬅ VOLVER</div>
            <h2 class="title">VALIDAR ACCESO</h2>
            <div class="form-box" style="text-align:center;">
                 <p style="color:#aaa; margin-bottom:20px;">Escanea el QR para validar el acceso inmediatamente.</p>
                 <button class="btn-save" onclick="startValidationScan()"><i class="fas fa-qrcode"></i> INICIAR ESCÁNER</button>
            </div>
        </div>
    `,
    'ED1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('E1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">RESET NIP</h2>
            <div class="form-box">
                <div class="input-group"><label>USUARIO / DNI *</label><input type="text" id="ed1-user" class="ravens-input"></div>
                <button class="btn-save blue" style="margin-bottom:15px" onclick="startScan('ed1-user')"><i class="fas fa-camera"></i> ESCANEAR DNI</button>
                <button class="btn-save" onclick="submitResetNip()">RESETEAR</button>
            </div>
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('ED2')"><span>📋 HISTORIAL RESET</span></div>
        </div>
    `,
    'ED2': `<div class="screen active"><div class="btn-back" onclick="navigate('ED1')">⬅ VOLVER</div><h2 class="title">Historial NIP</h2><div class="gallery-container" id="gal-ed2"></div><div class="view-form" id="detail-ed2"></div></div>`,

    // --- MÓDULO F: PERSONAL INTERNO (MAPEO CORREGIDO) ---
    'F1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div>
            <h2 class="title">PERSONAL INTERNO</h2>
            <div class="form-box">
                <div class="input-group"><label>ID PERSONAL *</label><input type="text" id="f1-id" class="ravens-input" placeholder="Escanea el gafete"></div>
                
                <button class="btn-save" style="background:#333; margin-bottom:20px;" onclick="startScan('f1-id')"><i class="fas fa-camera"></i> ESCANEAR GAFETE</button>
                
                <div class="row">
                    <button class="btn-save" onclick="submitPersonalInterno('Entrada')">ENTRADA</button>
                    <button class="btn-save blue" onclick="submitPersonalInterno('Salida')">SALIDA</button>
                </div>
            </div>
            <div class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('F2')"><span>📋 BITÁCORA PERSONAL</span></div>
        </div>
    `,
    'F2': `<div class="screen active"><div class="btn-back" onclick="navigate('F1')">⬅ VOLVER</div><h2 class="title">Bitácora Interna</h2><div class="gallery-container" id="gal-f2"></div><div class="view-form" id="detail-f2"></div></div>`,

    // --- MÓDULO AC: PERSONAL DE SERVICIO ---
    'AC1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('A1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">PERSONAL SERVICIO</h2>
            <div class="form-box">
                <div class="input-group"><label>NOMBRE *</label><input type="text" id="ac1-nombre" class="ravens-input"></div>
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
    'SUCCESS': `<div class="screen active" style="text-align:center; padding-top:100px;"><i class="fas fa-check-circle fa-5x" style="color:var(--verde)"></i><h2>ÉXITO</h2></div>`,
    'FAILURE': `<div class="screen active" style="text-align:center; padding-top:100px;"><i class="fas fa-times-circle fa-5x" style="color:var(--rojo)"></i><h2>DENEGADO</h2></div>`
};

/* =========================================
   3. MOTOR LÓGICO & NAVEGACIÓN
   ========================================= */
let signaturePad;
let html5QrCode;

function navigate(screen) {
    if(html5QrCode && html5QrCode.isScanning) {
         html5QrCode.stop().then(() => { html5QrCode.clear(); }).catch(err => {});
    }
    
    document.getElementById('viewport').innerHTML = SCREENS[screen] || SCREENS['INICIO'];
    
    // Inits
    if(screen === 'BB1') initSignature();
    if(screen === 'AA2') renderGallery('colvisitaOrdenada', 'gal-aa2');
    if(screen === 'AC2') renderGallery('colpersonalaviso', 'gal-ac2');
    if(screen === 'D2') renderGallery('colproveedorOrdenada', 'gal-d2');
    if(screen === 'BA2') renderGallery('colrecibirunpaqueteOrdenada', 'gal-ba2');
    if(screen === 'BB2') renderGallery('colEntregasLocales', 'gal-bb2');
    if(screen === 'EA2') renderGallery('colQRResidenteEA1', 'gal-ea2');
    if(screen === 'EB2') renderGallery('colQRResidenteEB1', 'gal-eb2');
    if(screen === 'ED2') renderGallery('colResetNip', 'gal-ed2');
    if(screen === 'F2') renderGallery('colPersonalServicio', 'gal-f2');
    
    if(screen === 'SUCCESS' || screen === 'FAILURE') setTimeout(() => navigate('INICIO'), 2000);
    window.scrollTo(0,0);
}

// --- MODAL RESIDENTE ---
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
    const p = STATE.currentContext; 
    const item = STATE.colBaserFiltrada.find(i => i.Nombre === document.getElementById('sel-nombre').value);
    
    STATE[p] = { residente: item.Nombre, numero: item.Número, torre: item.Torre, depto: item.Departamento };
    if(document.getElementById(`${p}-torre`)) document.getElementById(`${p}-torre`).value = item.Torre;
    if(document.getElementById(`${p}-depto`)) document.getElementById(`${p}-depto`).value = item.Departamento;
    if(document.getElementById(`${p}-res-name`)) document.getElementById(`${p}-res-name`).value = item.Nombre;
    
    closeResidenteModal();
}

function closeResidenteModal() { document.getElementById('modal-selector').classList.remove('active'); }

// --- FIRMA & FOTO ---
function initSignature() {
    setTimeout(() => {
        const canvas = document.getElementById('sig-canvas');
        if(canvas) {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgb(255, 255, 255)' });
        }
    }, 300);
}

function clearSignature() { if(signaturePad) signaturePad.clear(); }

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

// --- LOGICA DE ESCÁNER QR (POWER APPS LOGIC) ---
function startScan(targetInputId) {
    STATE.targetInputForQR = targetInputId;
    document.getElementById('qr-modal').classList.add('active');
    
    html5QrCode = new Html5Qrcode("qr-reader-view");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            // AL DETECTAR:
            // 1. Detener escáner
            html5QrCode.stop().then(() => html5QrCode.clear());
            document.getElementById('qr-modal').classList.remove('active');
            
            // 2. Llenar el input objetivo (Simula poner el valor en el TextInput)
            if(STATE.targetInputForQR && document.getElementById(STATE.targetInputForQR)) {
                document.getElementById(STATE.targetInputForQR).value = decodedText;
            }
        },
        (errorMessage) => { /* ignora frames vacíos */ }
    ).catch(err => {
        alert("Error iniciando cámara: " + err);
        document.getElementById('qr-modal').classList.remove('active');
    });
}

function startValidationScan() {
    // Para EC1: Validar inmediatamente al escanear
    document.getElementById('qr-modal').classList.add('active');
    html5QrCode = new Html5Qrcode("qr-reader-view");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            html5QrCode.stop().then(() => html5QrCode.clear());
            document.getElementById('qr-modal').classList.remove('active');
            
            // Simulación de lógica de validación
            if(decodedText.length > 5) navigate('SUCCESS');
            else navigate('FAILURE');
        },
        () => {}
    );
}

function closeQRScanner() {
    if(html5QrCode) html5QrCode.stop().then(() => html5QrCode.clear()).catch(()=>{});
    document.getElementById('qr-modal').classList.remove('active');
}


// --- SUBMITS ---
async function submitAviso(p) {
    const nom = document.getElementById(p+'-nombre').value;
    if(!nom || !STATE[p]?.residente) return alert("Faltan datos");
    
    const record = { 
        Nombre: nom, Torre: STATE[p].torre, Depto: STATE[p].depto, 
        Placa: document.getElementById(p+'-placa')?.value || "",
        Estatus: "Nuevo", Fecha: new Date().toLocaleString() 
    };
    STATE[p === 'aa1' ? 'colvisitaOrdenada' : 'colpersonalaviso'].unshift(record);
    navigate('SUCCESS');
}

async function submitProveedor() {
    const nombre = document.getElementById('d1-nombre').value;
    if(!nombre) return alert("Faltan datos");
    const record = {
        Nombre: nombre, Empresa: document.getElementById('d1-empresa').value,
        Torre: STATE['d1']?.torre || "", Departamento: STATE['d1']?.depto || "",
        Estatus: "Nuevo", 'Fecha y hora': new Date().toLocaleString()
    };
    STATE.colproveedorOrdenada.unshift(record);
    navigate('SUCCESS');
}

async function submitRecepcionPaquete() {
    const nom = document.getElementById('ba1-nombre').value;
    if(!nom || !STATE['ba1']?.residente) return alert("Faltan datos");
    STATE.colrecibirunpaqueteOrdenada.unshift({
        Nombre: nom, Torre: STATE['ba1'].torre, Departamento: STATE['ba1'].depto,
        Paqueteria: document.getElementById('ba1-paqueteria').value,
        Estatus: document.getElementById('ba1-estatus').value,
        Foto: STATE.photos['ba1'], Fechayhora: new Date().toLocaleString()
    });
    navigate('SUCCESS');
}

async function submitEntregaPaquete() {
    const nom = document.getElementById('bb1-nombre').value;
    if(!nom || !STATE['bb1']?.residente || signaturePad.isEmpty()) return alert("Faltan datos");
    STATE.colEntregasLocales.unshift({
        Nombre: nom, Residente: STATE['bb1'].residente,
        Torre: STATE['bb1'].torre, Departamento: STATE['bb1'].depto,
        FotoBase64: STATE.photos['bb1'], FirmaBase64: signaturePad.toDataURL(),
        Fechayhora: new Date().toLocaleString()
    });
    navigate('SUCCESS');
}

// LÓGICA MÓDULOS QR Y PERSONAL
function submitQRResidente() {
    const val = document.getElementById('ea1-dni').value;
    if(!val) return alert("Escanea o escribe un código");
    STATE.colQRResidenteEA1.unshift({ Nombre: "Residente", DNI: val, Fecha: new Date().toLocaleString() });
    navigate('SUCCESS');
}

function submitQRVisita() {
    const val = document.getElementById('eb1-code').value;
    if(!val) return alert("Escanea o escribe un código");
    STATE.colQRResidenteEB1.unshift({ Nombre: "Visita", Codigo: val, Fecha: new Date().toLocaleString() });
    navigate('SUCCESS');
}

function submitResetNip() {
    const val = document.getElementById('ed1-user').value;
    if(!val) return alert("Escanea o escribe usuario");
    STATE.colResetNip.unshift({ Usuario: val, Estatus: "Reseteado", Fecha: new Date().toLocaleString() });
    navigate('SUCCESS');
}

function submitPersonalInterno(tipo) {
    const id = document.getElementById('f1-id').value;
    if(!id) return alert("Primero escanea el gafete o ingresa ID");
    
    // Aquí está la lógica de F1: ID -> Acción
    STATE.colPersonalServicio.unshift({
        Nombre: "Personal ID: " + id,
        Accion: tipo, // Entrada o Salida
        Fecha: new Date().toLocaleString()
    });
    navigate('SUCCESS');
}

// --- RENDERIZADO GALERÍAS ---
function renderGallery(colName, elementId) {
    const container = document.getElementById(elementId);
    const collection = STATE[colName];
    if(!collection || collection.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#555">Sin registros.</div>`;
        return;
    }
    container.innerHTML = collection.map((item, idx) => `
        <div class="gallery-item" onclick="showDetail('${colName}', ${idx}, '${elementId.replace('gal','detail')}')">
            <div class="gallery-text">
                <h4>${item.Nombre || item.Usuario || 'Registro'}</h4>
                <p>${item.Accion || item.Torre || item.Estatus || ''} • ${item.Fecha || item['Fecha y hora'] || item.Fechayhora}</p>
            </div>
            <i class="fas fa-chevron-right" style="color:#555"></i>
        </div>
    `).join('');
}

function showDetail(colName, idx, targetId) {
    const item = STATE[colName][idx];
    const target = document.getElementById(targetId);
    let html = "";
    
    // Personal Interno F2
    if(colName === 'colPersonalServicio') {
        html = `<div class="data-field"><label>ID / NOMBRE</label><span>${item.Nombre}</span></div>
                <div class="data-field"><label>MOVIMIENTO</label><span class="${item.Accion==='Entrada'?'status-aceptado':'status-rechazado'}">${item.Accion}</span></div>
                <div class="data-field"><label>FECHA</label><span>${item.Fecha}</span></div>`;
    }
    // Genérico
    else {
        html = `<div class="data-field"><label>INFO</label><span>${item.Nombre || item.Usuario}</span></div>
                <div class="data-field"><label>DETALLE</label><span>${item.Torre || item.Empresa || item.DNI || item.Codigo || ''}</span></div>
                <div class="data-field"><label>FECHA</label><span>${item.Fecha || item['Fecha y hora'] || item.Fechayhora}</span></div>`;
    }
    target.innerHTML = html;
}

window.onload = () => navigate('INICIO');
