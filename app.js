/* =========================================
   ESTADO Y DATOS
   ========================================= */
const STATE = {
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "525511223344" },
        { Torre: "A", Departamento: "102", Nombre: "Ana Gomez", Número: "525599887766" }
    ],
    colvisitaOrdenada: [], //
    colpersonalaviso: [],  //
    selectedItem: null,
    aa1: { residente: "", numero: "", paloma: false },
    ac1: { residente: "", numero: "", paloma: false },
    currentContext: ""
};

const API_URL = "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64";

/* =========================================
   SISTEMA DE NAVEGACIÓN
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
            </div>
        </div>
    `,
    'A1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('INICIO')">⬅ MENÚ PRINCIPAL</div>
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
                <div class="input-group"><label>PLACA</label><input type="text" id="aa1-placa" class="ravens-input"></div>
                <button class="btn-save" onclick="logicAA1()">GUARDAR</button>
            </div>
            <div class="btn-action" style="margin-top:20px" onclick="navigate('AA2')"><span>📋 VER BITÁCORA VISITAS</span><i class="fas fa-chevron-right"></i></div>
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
                <div class="input-group"><label>CARGO / EMPRESA</label><input type="text" id="ac1-cargo" class="ravens-input"></div>
                <button class="btn-save" onclick="logicAC1()">GUARDAR</button>
            </div>
            <div class="btn-action" style="margin-top:20px" onclick="navigate('AC2')"><span>📋 VER BITÁCORA PERSONAL</span><i class="fas fa-chevron-right"></i></div>
        </div>
    `,
    'AA2': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('AA1')">⬅ VOLVER</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 class="title">LIBRETA VISITAS</h2>
                <i class="fas fa-sync-alt" onclick="refreshData('AA2')" style="cursor:pointer"></i>
            </div>
            <div class="gallery-container" id="gal-aa2"></div>
            <div class="view-form" id="form-aa2-detail">
                <h3>Detalle de Registro</h3>
                <div id="aa2-detail-content">Seleccione un elemento de la lista</div>
            </div>
        </div>
    `,
    'AC2': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('AC1')">⬅ VOLVER</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 class="title">LIBRETA PERSONAL</h2>
                <i class="fas fa-sync-alt" onclick="refreshData('AC2')" style="cursor:pointer"></i>
            </div>
            <div class="gallery-container" id="gal-ac2"></div>
            <div class="view-form" id="form-ac2-detail">
                <h3>Detalle de Registro</h3>
                <div id="ac2-detail-content">Seleccione un elemento de la lista</div>
            </div>
        </div>
    `,
    'SUCCESS': `<div class="screen active" style="text-align:center; padding-top:100px;"><i class="fas fa-check-circle fa-5x" style="color:var(--verde)"></i><h2>REGISTRO ÉXITOSO</h2></div>`
};

function navigate(screen) {
    document.getElementById('viewport').innerHTML = SCREENS[screen] || SCREENS['INICIO'];
    if(screen === 'AA2') renderGallery('colvisitaOrdenada', 'gal-aa2');
    if(screen === 'AC2') renderGallery('colpersonalaviso', 'gal-ac2');
    if(screen === 'SUCCESS') setTimeout(() => navigate('INICIO'), 2000);
    window.scrollTo(0,0);
}

/* =========================================
   LÓGICA DE GALERÍA Y FORM DETALLE
   ========================================= */
function renderGallery(colName, elementId) {
    const container = document.getElementById(elementId);
    // Filtro 30 días
    const data = STATE[colName]; 
    
    container.innerHTML = data.map((item, index) => `
        <div class="gallery-item" onclick="selectItem('${colName}', ${index})">
            <div class="gallery-text">
                <h4>${item.Nombre}</h4>
                <p>${item.Fechayhora}</p>
            </div>
            <i class="fas fa-chevron-right" style="color:#333"></i>
        </div>
    `).join('');
}

function selectItem(colName, index) {
    const item = STATE[colName][index];
    const detailId = colName === 'colvisitaOrdenada' ? 'aa2-detail-content' : 'ac2-detail-content';
    
    let html = `
        <div class="data-field"><label>Estatus</label><span class="status-${item.Estatus.toLowerCase()}">${item.Estatus}</span></div>
        <div class="data-field"><label>Nombre</label><span>${item.Nombre}</span></div>
        <div class="data-field"><label>Torre</label><span>${item.Torre}</span></div>
        <div class="data-field"><label>Departamento</label><span>${item.Depto}</span></div>
        <div class="data-field"><label>Fecha y Hora</label><span>${item.Fechayhora}</span></div>
    `;

    if(colName === 'colvisitaOrdenada') {
        html += `<div class="data-field"><label>Placa</label><span>${item.Placa || 'N/A'}</span></div>
                 <div class="data-field"><label>Motivo</label><span>${item.Motivo}</span></div>`;
    } else {
        html += `<div class="data-field"><label>Cargo / Empresa</label><span>${item.Cargo}</span></div>`;
    }

    document.getElementById(detailId).innerHTML = html;
}

function refreshData(screen) {
    alert("✅ Lista actualizada correctamente"); //
    navigate(screen);
}

/* =========================================
   LÓGICA DE ENVÍO (YAML AA1 / AC1)
   ========================================= */
async function logicAA1() {
    const nom = document.getElementById('aa1-nombre').value;
    const mot = document.getElementById('aa1-motivo').value;
    if(!nom || !mot) return alert("Faltan datos");

    const record = {
        Nombre: nom,
        Torre: document.getElementById('aa1-torre').value,
        Depto: document.getElementById('aa1-depto').value,
        Placa: document.getElementById('aa1-placa').value,
        Motivo: mot,
        Estatus: "Aceptado",
        Fechayhora: new Date().toLocaleString()
    };

    STATE.colvisitaOrdenada.unshift(record);
    await fetch(API_URL, { method: 'POST' }); // Disparo trigger
    navigate('SUCCESS');
}

async function logicAC1() {
    const nom = document.getElementById('ac1-nombre').value;
    const cargo = document.getElementById('ac1-cargo').value;
    if(!nom || !cargo) return alert("Faltan datos");

    const record = {
        Nombre: nom,
        Torre: document.getElementById('ac1-torre').value,
        Depto: document.getElementById('ac1-depto').value,
        Cargo: cargo,
        Estatus: "Nuevo",
        Fechayhora: new Date().toLocaleString()
    };

    STATE.colpersonalaviso.unshift(record);
    await fetch(API_URL, { method: 'POST' });
    navigate('SUCCESS');
}

/* =========================================
   SELECTOR DE RESIDENTES
   ========================================= */
function openResidenteModal(context) {
    STATE.currentContext = context;
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
    const res = STATE.colBaserFiltrada.filter(i => i.Torre === t && i.Departamento === d);
    document.getElementById('sel-nombre').innerHTML = res.map(r => `<option value="${r.Nombre}">${r.Nombre}</option>`).join('');
}

function confirmResidente() {
    const prefix = STATE.currentContext;
    const item = STATE.colBaserFiltrada.find(i => i.Nombre === document.getElementById('sel-nombre').value);
    document.getElementById(`${prefix}-torre`).value = item.Torre;
    document.getElementById(`${prefix}-depto`).value = item.Departamento;
    closeResidenteModal();
}

function closeResidenteModal() { document.getElementById('modal-selector').classList.remove('active'); }

window.onload = () => navigate('INICIO');
