/* =========================================
   ESTADO GLOBAL (Mapeo de Variables YAML)
   ========================================= */
const STATE = {
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "525511223344" },
        { Torre: "A", Departamento: "102", Nombre: "Ana Gomez", Número: "525599887766" },
        { Torre: "B", Departamento: "201", Nombre: "Carlos Ruiz", Número: "525555443322" }
    ],
    // Variables para Visitas (AA1)
    aa1: { residente: "", numero: "", procesando: false, paloma: false },
    // Variables para Personal (AC1)
    ac1: { residente: "", numero: "", procesando: false, paloma: false },
    
    colvisitaOrdenada: [],
    colpersonalaviso: [],
    currentContext: "" // Para saber qué modal abrir
};

const API_URL = "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64";

/* =========================================
   PANTALLAS (HTML)
   ========================================= */
const SCREENS = {
    'INICIO': `
        <div class="screen active">
            <h2 class="title">PANEL DE CONTROL</h2>
            <p class="subtitle">Seleccione un módulo</p>
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
                <div class="btn-action primary" onclick="navigate('AA1')"><span>➕ REGISTRAR VISITA</span><i class="fas fa-chevron-right"></i></div>
                <div class="btn-action primary" style="background:#4a0012" onclick="navigate('AC1')"><span>👷 PERSONAL DE SERVICIO</span><i class="fas fa-chevron-right"></i></div>
                <div class="btn-action" onclick="navigate('AA2')"><span>📋 VER BITÁCORA</span><i class="fas fa-chevron-right"></i></div>
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
                <div class="input-group">
                    <label>RESIDENTE ASIGNADO</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="text" id="aa1-res-name" class="ravens-input" readonly style="background:#080808; color:#888;">
                        <span id="check-aa1" style="display:none;">✅</span>
                    </div>
                </div>
                <div class="input-group"><label>MOTIVO</label><input type="text" id="aa1-motivo" class="ravens-input"></div>
                <div class="btn-row">
                    <button class="btn-save btn-new" onclick="resetFormAA1()">NUEVO</button>
                    <button class="btn-save" id="btn-save-aa1" onclick="logicAA1()">GUARDAR</button>
                </div>
            </div>
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
                <div class="input-group">
                    <label>RESIDENTE QUE AUTORIZA</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="text" id="ac1-res-name" class="ravens-input" readonly style="background:#080808; color:#888;">
                        <span id="check-ac1" style="display:none;">✅</span>
                    </div>
                </div>
                <div class="input-group"><label>CARGO / EMPRESA</label><input type="text" id="ac1-cargo" class="ravens-input"></div>
                <div class="btn-row">
                    <button class="btn-save btn-new" onclick="resetFormAC1()">NUEVO</button>
                    <button class="btn-save" id="btn-save-ac1" onclick="logicAC1()">GUARDAR</button>
                </div>
            </div>
        </div>
    `,
    'AA2': `<div class="screen active"><div class="btn-back" onclick="navigate('A1')">⬅ VOLVER</div><h2 class="title">BITÁCORA</h2><div id="list-logs"></div></div>`,
    'SUCCESS': `<div class="screen active" style="text-align:center; padding-top:100px;"><i class="fas fa-check-circle fa-5x" style="color:var(--verde)"></i><h2 style="margin-top:20px;">REGISTRO ÉXITOSO</h2><p>Aviso enviado correctamente</p></div>`,
    'ERROR': `<div class="screen active" style="text-align:center; padding-top:100px;"><i class="fas fa-times-circle fa-5x" style="color:var(--rojo)"></i><h2 style="margin-top:20px;">ERROR</h2><p>Llene los campos obligatorios</p></div>`
};

/* =========================================
   MOTOR DE NAVEGACIÓN Y SELECTOR
   ========================================= */
function navigate(screen) {
    const vp = document.getElementById('viewport');
    vp.innerHTML = SCREENS[screen] || SCREENS['INICIO'];
    
    // Sync UI states
    if(screen === 'AA1') syncUI('aa1');
    if(screen === 'AC1') syncUI('ac1');
    if(screen === 'AA2') renderLogs();
    if(screen === 'SUCCESS' || screen === 'ERROR') setTimeout(() => navigate('INICIO'), 2500);
    
    window.scrollTo(0,0);
}

function syncUI(prefix) {
    const data = STATE[prefix];
    if(data.residente) {
        document.getElementById(`${prefix}-res-name`).value = data.residente;
        document.getElementById(`check-${prefix}`).style.display = 'block';
    }
}

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
    const nombre = document.getElementById('sel-nombre').value;
    const item = STATE.colBaserFiltrada.find(i => i.Nombre === nombre);
    
    STATE[prefix].residente = item.Nombre;
    STATE[prefix].numero = item.Número;
    STATE[prefix].paloma = true;

    // Actualizar Formulario activo
    document.getElementById(`${prefix}-torre`).value = item.Torre;
    document.getElementById(`${prefix}-depto`).value = item.Departamento;
    document.getElementById(`${prefix}-res-name`).value = item.Nombre;
    document.getElementById(`check-${prefix}`).style.display = 'block';
    
    closeResidenteModal();
}

function closeResidenteModal() { document.getElementById('modal-selector').classList.remove('active'); }

/* =========================================
   LÓGICA DE REGISTRO (Mapeo de OnSuccess)
   ========================================= */

// AA1: Visita
async function logicAA1() {
    const nombreVis = document.getElementById('aa1-nombre').value;
    const motivo = document.getElementById('aa1-motivo').value;
    const prefix = 'aa1';

    if(!nombreVis || !motivo || !STATE[prefix].residente) return navigate('ERROR');

    document.getElementById('btn-save-aa1').disabled = true;
    
    const params = {
        Nombre: nombreVis,
        Telefono: STATE[prefix].numero,
        Torre: document.getElementById('aa1-torre').value,
        Depto: document.getElementById('aa1-depto').value,
        Motivo: motivo,
        Tipo_Lista: "VISITA"
    };

    sendToAzure(params, prefix);
}

// AC1: Personal de Servicio
async function logicAC1() {
    const nombreTra = document.getElementById('ac1-nombre').value;
    const cargo = document.getElementById('ac1-cargo').value;
    const prefix = 'ac1';

    if(!nombreTra || !cargo || !STATE[prefix].residente) return navigate('ERROR');

    document.getElementById('btn-save-ac1').disabled = true;

    const params = {
        Nombre: nombreTra,
        Telefono: STATE[prefix].numero,
        Torre: document.getElementById('ac1-torre').value,
        Depto: document.getElementById('ac1-depto').value,
        Cargo: cargo,
        Motivo: "Personal de Servicio",
        Tipo_Lista: "PERSONALAVISO"
    };

    sendToAzure(params, prefix);
}

async function sendToAzure(p, prefix) {
    const hora = new Date().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'});
    const url = `${API_URL}&Nombre=${encodeURIComponent(p.Nombre)}&Telefono=${encodeURIComponent(p.Telefono)}&Torre=${encodeURIComponent(p.Torre)}&Depto=${encodeURIComponent(p.Depto)}&Motivo=${encodeURIComponent(p.Motivo)}&Condominio=RAVENS_ACCESS&Hora=${hora}&Ignorar=${Date.now()}&ID_Item=${Date.now()}&Tipo_Lista=${p.Tipo_Lista}${p.Cargo ? `&Cargo=${encodeURIComponent(p.Cargo)}` : ''}`;

    try {
        await fetch(url, { method: 'POST' });
        // Limpiar como en YAML OnSuccess
        STATE[prefix].residente = "";
        STATE[prefix].paloma = false;
        navigate('SUCCESS');
    } catch(e) {
        alert("Error de conexión");
        document.getElementById(`btn-save-${prefix}`).disabled = false;
    }
}

function resetFormAA1() { STATE.aa1 = { residente: "", numero: "", procesando: false, paloma: false }; navigate('AA1'); }
function resetFormAC1() { STATE.ac1 = { residente: "", numero: "", procesando: false, paloma: false }; navigate('AC1'); }

function renderLogs() {
    const container = document.getElementById('list-logs');
    container.innerHTML = `<p style="text-align:center; color:#555; padding:20px;">Historial cargado desde SharePoint...</p>`;
}

window.onload = () => navigate('INICIO');
