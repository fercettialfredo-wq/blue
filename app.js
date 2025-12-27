/* =========================================
   1. ESTADO GLOBAL & COLECCIONES
   ========================================= */
const STATE = {
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "525511223344" },
        { Torre: "B", Departamento: "205", Nombre: "Ana Gomez", Número: "525599887766" }
    ],
    colvisitaOrdenada: [],      // AA2
    colpersonalaviso: [],       // AC2
    colrecibirunpaquete: [],    // BA2
    colEntregasLocales: [],     // BB2
    colproveedorOrdenada: [],   // D2
    colPersonalServicio: [],    // F2
    photos: {}, 
    signature: null,
    currentContext: ""
};

const API = {
    VISITA: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64",
    PAQUETE: "https://prod-12.mexicocentral.logic.azure.com:443/workflows/974146d8a5cc450aa5687f5710d95e8a/triggers/Recibir_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Paquete_HTTP%2Frun&sv=1.0&sig=fF8pX4HPrHO1wCUY4097ARXMLgQ1gTaQ0zhC28wAtko",
    ENTREGA: "https://prod-30.mexicocentral.logic.azure.com:443/workflows/58581c1247984f83b83d030640287167/triggers/Entregar_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FEntregar_Paquete_HTTP%2Frun&sv=1.0&sig=Nce4hIr59n137JvNnSheVZN_UX_VGrR-uX-fbISjg9k"
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
                <button class="btn-save" style="background:var(--azul); margin-bottom:15px;" onclick="openResidenteModal('aa1')">🔍 SELECCIONAR RESIDENTE</button>
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
    // --- OTROS MÓDULOS ---
    'D1': `<div class="screen active"><div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div><h2 class="title">PROVEEDORES</h2><div class="form-box"><div class="input-group"><label>EMPRESA</label><input type="text" id="d1-emp" class="ravens-input"></div><div class="input-group"><label>NOMBRE</label><input type="text" id="d1-nom" class="ravens-input"></div><button class="btn-save" onclick="navigate('SUCCESS')">REGISTRAR</button></div></div>`,
    'E1': `<div class="screen active"><div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div><h2 class="title">QR ACCESO</h2><div id="qr-reader"></div><div class="row" style="margin-top:20px"><button class="btn-save" onclick="startQR()">ACTIVAR</button></div></div>`,
    'F1': `<div class="screen active"><div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ</div><h2 class="title">PERSONAL</h2><div class="form-box"><input type="text" placeholder="ID PERSONAL" class="ravens-input"><div class="row"><button class="btn-save">ENTRADA</button><button class="btn-save" style="background:var(--azul)">SALIDA</button></div></div></div>`,
    
    // --- FEEDBACK ---
    'SUCCESS': `<div class="screen active" style="text-align:center; padding-top:100px;"><i class="fas fa-check-circle fa-5x" style="color:var(--verde)"></i><h2>ÉXITO</h2></div>`,
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
                <button class="btn-save" style="background:var(--azul); margin-bottom:15px;" onclick="openResidenteModal('ac1')">🔍 BUSCAR RESIDENTE</button>
                <div class="input-group"><label>CARGO</label><input type="text" id="ac1-cargo" class="ravens-input"></div>
                <button class="btn-save" onclick="submitAviso('ac1')">GUARDAR</button>
            </div>
        </div>
    `,
    'AC2': `<div class="screen active"><div class="btn-back" onclick="navigate('AC1')">⬅ VOLVER</div><h2 class="title">Libreta Personal</h2><div class="gallery-container" id="gal-ac2"></div><div class="view-form" id="detail-ac2"></div></div>`,
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
    document.getElementById(`${p}-torre`).value = item.Torre;
    document.getElementById(`${p}-depto`).value = item.Departamento;
    document.getElementById(`${p}-res-name`).value = item.Nombre;
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

// ENVÍOS
async function submitAviso(p) {
    const nom = document.getElementById(p+'-nombre').value;
    if(!nom || !STATE[p].residente) return alert("Faltan datos");
    
    const record = { Nombre: nom, Torre: STATE[p].torre, Depto: STATE[p].depto, Estatus: "Aceptado", Fecha: new Date().toLocaleString() };
    const col = p === 'aa1' ? 'colvisitaOrdenada' : 'colpersonalaviso';
    STATE[col].unshift(record);
    
    await fetch(API.VISITA, { method: 'POST' });
    navigate('SUCCESS');
}

// GALERÍAS
function renderGallery(col, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = STATE[col].map((item, idx) => `
        <div class="gallery-item" onclick="showDetail('${col}', ${idx}, '${elementId === 'gal-aa2' ? 'detail-aa2' : 'detail-ac2'}')">
            <div class="gallery-text"><h4>${item.Nombre}</h4><p>${item.Torre}-${item.Depto} • ${item.Fecha}</p></div>
            <i class="fas fa-chevron-right"></i>
        </div>
    `).join('');
}

function showDetail(col, idx, target) {
    const item = STATE[col][idx];
    document.getElementById(target).innerHTML = `
        <div class="view-form">
            <h3>Detalles</h3>
            <div class="data-field"><label>Nombre</label><span>${item.Nombre}</span></div>
            <div class="data-field"><label>Estatus</label><span class="status-aceptado">${item.Estatus}</span></div>
            <div class="data-field"><label>Ubicación</label><span>Torre ${item.Torre} - Depto ${item.Depto}</span></div>
        </div>`;
}

window.onload = () => navigate('INICIO');
