/* =========================================
   ESTADO GLOBAL Y CONFIGURACIÓN
   ========================================= */
const API = {
    VISITA: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64"
};

const STATE = {
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "525512345678" },
        { Torre: "A", Departamento: "102", Nombre: "Ana Gomez", Número: "525587654321" },
        { Torre: "B", Departamento: "201", Nombre: "Carlos Ruiz", Número: "525522334455" }
    ],
    colvisitaOrdenada: [],
    varNumeroSeleccionado1: "",
    VarNombreSeleccionado1: "",
    varmostrarpaloma1: false
};

/* =========================================
   DEFINICIÓN DE PANTALLAS (HTML)
   ========================================= */
const SCREENS = {
    'INICIO': `
        <div class="screen active">
            <h2 class="title">PANEL DE CONTROL</h2>
            <p class="subtitle">SELECCIONE MÓDULO OPERATIVO</p>
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
            <button class="btn-back" onclick="navigate('INICIO')"><i class="fas fa-chevron-left"></i> MENÚ PRINCIPAL</button>
            <h2 class="title">VISITAS</h2>
            <div class="action-list">
                <div class="btn-action primary" onclick="navigate('AA1')"><span>➕ REGISTRAR VISITA</span></div>
                <div class="btn-action" onclick="navigate('AA2')"><span>📋 VER BITÁCORA</span></div>
            </div>
        </div>
    `,
    'AA1': `
        <div class="screen active">
            <button class="btn-back" onclick="navigate('A1')"><i class="fas fa-chevron-left"></i> VOLVER</button>
            <h2 class="title" style="color:var(--guinda)">NUEVA VISITA</h2>
            <div class="form-box">
                <div class="input-group"><label>NOMBRE VISITANTE</label><input type="text" id="aa1-nombre" class="ravens-input"></div>
                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="aa1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="aa1-depto" class="ravens-input" readonly></div>
                </div>
                <button class="btn-save" style="background:var(--azul); margin-bottom:15px;" onclick="openResidenteModal()">
                    <i class="fas fa-search"></i> SELECCIONAR RESIDENTE
                </button>
                <div class="input-group">
                    <label>RESIDENTE ASIGNADO</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="text" id="aa1-residente" class="ravens-input" style="background:#080808; color:#888;" readonly>
                        <span id="check-paloma" style="display:none; color:var(--verde); font-size:1.5rem;">✅</span>
                    </div>
                </div>
                <div class="input-group"><label>MOTIVO</label><input type="text" id="aa1-motivo" class="ravens-input"></div>
                <button class="btn-save" id="btn-aa1-save" onclick="logicAA1()">GUARDAR Y NOTIFICAR</button>
            </div>
        </div>
    `
    // Agrega aquí el resto de pantallas (AA2, BA1, etc.) siguiendo el mismo formato
};

/* =========================================
   MOTOR LÓGICO
   ========================================= */
function navigate(screen) {
    document.getElementById('viewport').innerHTML = SCREENS[screen] || SCREENS['INICIO'];
    if(screen === 'AA1') {
        document.getElementById('aa1-residente').value = STATE.VarNombreSeleccionado1;
        document.getElementById('check-paloma').style.display = STATE.varmostrarpaloma1 ? 'block' : 'none';
    }
    window.scrollTo(0,0);
}

// LÓGICA DE SELECTOR (MODAL)
function openResidenteModal() {
    const torres = [...new Set(STATE.colBaserFiltrada.map(i => i.Torre))].sort();
    document.getElementById('sel-torre').innerHTML = torres.map(t => `<option value="${t}">${t}</option>`).join('');
    updateDeptos();
    document.getElementById('modal-selector').classList.add('active');
}

function updateDeptos() {
    const torre = document.getElementById('sel-torre').value;
    const deptos = STATE.colBaserFiltrada.filter(i => i.Torre === torre).map(i => i.Departamento);
    document.getElementById('sel-depto').innerHTML = deptos.map(d => `<option value="${d}">${d}</option>`).join('');
    updateResidentes();
}

function updateResidentes() {
    const torre = document.getElementById('sel-torre').value;
    const depto = document.getElementById('sel-depto').value;
    const residents = STATE.colBaserFiltrada.filter(i => i.Torre === torre && i.Departamento === depto).map(i => i.Nombre);
    document.getElementById('sel-nombre').innerHTML = residents.map(n => `<option value="${n}">${n}</option>`).join('');
}

function confirmResidente() {
    const torre = document.getElementById('sel-torre').value;
    const depto = document.getElementById('sel-depto').value;
    const nombre = document.getElementById('sel-nombre').value;
    const item = STATE.colBaserFiltrada.find(i => i.Nombre === nombre);

    STATE.VarNombreSeleccionado1 = nombre;
    STATE.varNumeroSeleccionado1 = item.Número;
    STATE.varmostrarpaloma1 = true;

    // Actualizar campos en el formulario AA1 si estamos ahí
    const aa1Torre = document.getElementById('aa1-torre');
    if(aa1Torre) {
        aa1Torre.value = torre;
        document.getElementById('aa1-depto').value = depto;
        document.getElementById('aa1-residente').value = nombre;
        document.getElementById('check-paloma').style.display = 'block';
    }
    closeResidenteModal();
}

function closeResidenteModal() { document.getElementById('modal-selector').classList.remove('active'); }

async function logicAA1() {
    const nombreVis = document.getElementById('aa1-nombre').value;
    const motivo = document.getElementById('aa1-motivo').value;

    if(!nombreVis || !motivo || !STATE.VarNombreSeleccionado1) {
        alert("⚠️ Por favor seleccione un residente y llene los campos.");
        return;
    }

    const url = `${API.VISITA}&Nombre=${encodeURIComponent(nombreVis)}&Telefono=${encodeURIComponent(STATE.varNumeroSeleccionado1)}&Torre=${encodeURIComponent(document.getElementById('aa1-torre').value)}&Depto=${encodeURIComponent(document.getElementById('aa1-depto').value)}&Motivo=${encodeURIComponent(motivo)}&Hora=${new Date().toLocaleTimeString()}`;

    try {
        await fetch(url, { method: 'POST' });
        alert("✅ Aviso enviado correctamente");
        navigate('INICIO');
    } catch(e) { alert("❌ Error al enviar"); }
}

window.onload = () => navigate('INICIO');
