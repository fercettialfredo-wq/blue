/* =========================================
   1. DATOS Y ESTADO (Simulación SharePoint)
   ========================================= */
const STATE = {
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "525511223344" },
        { Torre: "B", Departamento: "205", Nombre: "Ana Gomez", Número: "525599887766" }
    ],
    colvisitaOrdenada: [], //
    colpersonalaviso: [],  //
    
    // UI Context
    aa1: { residente: "", numero: "", torre: "", depto: "" },
    ac1: { residente: "", numero: "", torre: "", depto: "" },
    currentContext: "",
    selectedItem: null
};

const API_URL = "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64";

/* =========================================
   2. NAVEGACIÓN Y PANTALLAS
   ========================================= */
const SCREENS = {
    'INICIO': `
        <div class="screen active">
            <h2 class="title">PANEL DE CONTROL</h2>
            <div class="grid-menu">
                <div class="menu-card" onclick="navigate('A1')"><i class="fas fa-users card-icon"></i><span class="card-text">VISITAS</span></div>
                <div class="menu-card" onclick="navigate('B1')"><i class="fas fa-box-open card-icon"></i><span class="card-text">PAQUETERÍA</span></div>
                <div class="menu-card" onclick="navigate('D1')"><i class="fas fa-tools card-icon"></i><span class="card-text">PROVEEDORES</span></div>
                <div class="menu-card" onclick="navigate('E1')"><i class="fas fa-qrcode card-icon"></i><span class="card-text">ACCESO QR</span></div>
                <div class="menu-card full" onclick="navigate('F1')"><i class="fas fa-user-shield card-icon"></i><span class="card-text">PERSONAL INTERNO</span></div>
            </div>
        </div>
    `,
    'A1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ PRINCIPAL</div>
            <h2 class="title">VISITAS</h2>
            <div class="action-list">
                <button class="btn-action primary" onclick="navigate('AA1')"><span>➕ REGISTRAR VISITA</span><i class="fas fa-chevron-right"></i></button>
                <button class="btn-action primary" style="background:#4a0012" onclick="navigate('AC1')"><span>👷 PERSONAL DE SERVICIO</span><i class="fas fa-chevron-right"></i></button>
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
                <div class="input-group"><label>RESIDENTE ASIGNADO</label><input type="text" id="aa1-res-name" class="ravens-input" readonly style="color:#888;"></div>
                <div class="input-group"><label>MOTIVO</label><input type="text" id="aa1-motivo" class="ravens-input"></div>
                <div class="input-group"><label>PLACA</label><input type="text" id="aa1-placa" class="ravens-input"></div>
                <button class="btn-save" id="btn-save-aa1" onclick="logicAA1()">GUARDAR REGISTRO</button>
            </div>
            <button class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('AA2')"><span>📋 VER LIBRETA VISITAS</span><i class="fas fa-chevron-right"></i></button>
        </div>
    `,
    'AC1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('A1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">PERSONAL DE SERVICIO</h2>
            <div class="form-box">
                <div class="input-group"><label>NOMBRE TRABAJADOR</label><input type="text" id="ac1-nombre" class="ravens-input"></div>
                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="ac1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="ac1-depto" class="ravens-input" readonly></div>
                </div>
                <button class="btn-save" style="background:var(--azul); margin-bottom:15px;" onclick="openResidenteModal('ac1')">🔍 SELECCIONAR RESIDENTE</button>
                <div class="input-group"><label>RESIDENTE QUE AUTORIZA</label><input type="text" id="ac1-res-name" class="ravens-input" readonly style="color:#888;"></div>
                <div class="input-group"><label>CARGO / EMPRESA</label><input type="text" id="ac1-cargo" class="ravens-input"></div>
                <button class="btn-save" id="btn-save-ac1" onclick="logicAC1()">GUARDAR REGISTRO</button>
            </div>
            <button class="btn-action" style="margin-top:20px; background:#111" onclick="navigate('AC2')"><span>📋 VER LIBRETA PERSONAL</span><i class="fas fa-chevron-right"></i></button>
        </div>
    `,
    'AA2': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('AA1')">⬅ VOLVER</div>
            <div class="gallery-header"><h2 class="title">Libreta Visitas</h2><i class="fas fa-sync" onclick="refresh('AA2')"></i></div>
            <div class="gallery-container" id="gal-aa2"></div>
            <div class="view-form" id="detail-aa2">
                <h3>Detalle de Registro</h3>
                <div id="content-aa2">Seleccione un elemento</div>
            </div>
        </div>
    `,
    'AC2': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('AC1')">⬅ VOLVER</div>
            <div class="gallery-header"><h2 class="title">Libreta Personal</h2><i class="fas fa-sync" onclick="refresh('AC2')"></i></div>
            <div class="gallery-container" id="gal-ac2"></div>
            <div class="view-form" id="detail-ac2">
                <h3>Detalle de Registro</h3>
                <div id="content-ac2">Seleccione un elemento</div>
            </div>
        </div>
    `,
    'SUCCESS': `<div class="screen active" style="text-align:center; padding-top:100px;"><i class="fas fa-check-circle fa-5x" style="color:var(--verde)"></i><h2 style="margin-top:20px">AVISO ENVIADO</h2></div>`
};

/* =========================================
   3. MOTOR LÓGICO (CORE)
   ========================================= */
function navigate(screen) {
    document.getElementById('viewport').innerHTML = SCREENS[screen] || SCREENS['INICIO'];
    if(screen === 'AA1') syncForm('aa1');
    if(screen === 'AC1') syncForm('ac1');
    if(screen === 'AA2') renderGal('colvisitaOrdenada', 'gal-aa2');
    if(screen === 'AC2') renderGal('colpersonalaviso', 'gal-ac2');
    if(screen === 'SUCCESS') setTimeout(() => navigate('INICIO'), 2500);
}

function renderGal(col, elementId) {
    const container = document.getElementById(elementId);
    const data = STATE[col]; // Filtro 30 días simulado (la colección ya viene filtrada)
    if(data.length === 0) return container.innerHTML = `<p style="text-align:center; padding-top:100px; color:#444;">Sin registros</p>`;
    
    container.innerHTML = data.map((item, idx) => `
        <div class="gallery-item" onclick="showDetail('${col}', ${idx}, this)">
            <div class="gallery-text"><h4>${item.Nombre}</h4><p>${item.Torre}-${item.Depto} • ${item.Fecha}</p></div>
            <i class="fas fa-chevron-right" style="color:#222"></i>
        </div>
    `).join('');
}

function showDetail(col, idx, el) {
    document.querySelectorAll('.gallery-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    const item = STATE[col][idx];
    const contentId = col === 'colvisitaOrdenada' ? 'content-aa2' : 'content-ac2';
    
    // Mapeo de campos YAML Form2_1 / Form2_9
    let html = `
        <div class="data-field"><label>Estatus</label><span class="status-${item.Estatus.toLowerCase()}">${item.Estatus}</span></div>
        <div class="data-field"><label>Nombre</label><span>${item.Nombre}</span></div>
        <div class="data-field"><label>Torre</label><span>${item.Torre}</span></div>
        <div class="data-field"><label>Departamento</label><span>${item.Depto}</span></div>
        <div class="data-field"><label>Fecha y Hora</label><span>${item.Fecha}</span></div>
    `;
    if(col === 'colvisitaOrdenada') {
        html += `<div class="data-field"><label>Placa</label><span>${item.Placa || 'N/A'}</span></div><div class="data-field"><label>Motivo</label><span>${item.Motivo}</span></div>`;
    } else {
        html += `<div class="data-field"><label>Cargo / Empresa</label><span>${item.Cargo}</span></div>`;
    }
    document.getElementById(contentId).innerHTML = html;
}

/* =========================================
   4. SELECTOR DE RESIDENTES
   ========================================= */
function openResidenteModal(ctx) {
    STATE.currentContext = ctx;
    const torres = [...new Set(STATE.colBaserFiltrada.map(i => i.Torre))].sort();
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
    const prefix = STATE.currentContext;
    const item = STATE.colBaserFiltrada.find(i => i.Nombre === document.getElementById('sel-nombre').value);
    STATE[prefix] = { residente: item.Nombre, numero: item.Número, torre: item.Torre, depto: item.Departamento };
    document.getElementById(`${prefix}-torre`).value = item.Torre;
    document.getElementById(`${prefix}-depto`).value = item.Departamento;
    document.getElementById(`${prefix}-res-name`).value = item.Nombre;
    closeResidenteModal();
}

function closeResidenteModal() { document.getElementById('modal-selector').classList.remove('active'); }
function syncForm(p) { if(STATE[p].residente) document.getElementById(`${p}-res-name`).value = STATE[p].residente; }

/* =========================================
   5. LÓGICA DE ENVÍO
   ========================================= */
async function logicAA1() {
    const n = document.getElementById('aa1-nombre').value;
    const m = document.getElementById('aa1-motivo').value;
    if(!n || !m || !STATE.aa1.residente) return alert("Faltan datos");
    
    const rec = { Nombre: n, Torre: STATE.aa1.torre, Depto: STATE.aa1.depto, Motivo: m, Placa: document.getElementById('aa1-placa').value, Estatus: "Aceptado", Fecha: new Date().toLocaleString() };
    STATE.colvisitaOrdenada.unshift(rec);
    await fetch(API_URL, { method: 'POST' });
    navigate('SUCCESS');
}

async function logicAC1() {
    const n = document.getElementById('ac1-nombre').value;
    const c = document.getElementById('ac1-cargo').value;
    if(!n || !c || !STATE.ac1.residente) return alert("Faltan datos");
    
    const rec = { Nombre: n, Torre: STATE.ac1.torre, Depto: STATE.ac1.depto, Cargo: c, Estatus: "Nuevo", Fecha: new Date().toLocaleString() };
    STATE.colpersonalaviso.unshift(rec);
    await fetch(API_URL, { method: 'POST' });
    navigate('SUCCESS');
}

function refresh(scr) { alert("✅ Lista actualizada correctamente"); navigate(scr); }

window.onload = () => navigate('INICIO');
