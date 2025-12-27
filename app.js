/* =========================================
   ESTADO Y DATOS (colBaserFiltrada)
   ========================================= */
const STATE = {
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "5512345678" },
        { Torre: "A", Departamento: "102", Nombre: "Ana Gomez", Número: "5587654321" },
        { Torre: "B", Departamento: "201", Nombre: "Carlos Ruiz", Número: "5522334455" }
    ],
    colvisitaOrdenada: [],
    varNumeroSeleccionado1: "",
    VarNombreSeleccionado1: "",
    varmostrarpaloma1: false,
    varProcesandoAA1: false
};

const API = {
    VISITA: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64"
};

/* =========================================
   SISTEMA DE NAVEGACIÓN
   ========================================= */
const SCREENS = {
    'INICIO': `
        <div class="screen active">
            <h2 class="title">PANEL DE CONTROL</h2>
            <p class="subtitle">Módulos Ravens</p>
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
                <div class="btn-action primary" onclick="navigate('AA1')"><span>➕ REGISTRAR VISITA</span></div>
                <div class="btn-action" onclick="navigate('AA2')"><span>📋 VER BITÁCORA</span></div>
            </div>
        </div>
    `,
    'AA1': `
        <div class="screen active">
            <div class="btn-back" onclick="navigate('A1')">⬅ VOLVER</div>
            <h2 class="title" style="color:var(--guinda)">REGISTRO VISITA</h2>
            <div class="form-box">
                <div class="input-group">
                    <label>NOMBRE VISITANTE</label>
                    <input type="text" id="aa1-nombre" class="ravens-input" placeholder="Escriba aquí">
                </div>
                <div class="row">
                    <div class="input-group"><label>TORRE</label><input type="text" id="aa1-torre" class="ravens-input" readonly></div>
                    <div class="input-group"><label>DEPTO</label><input type="text" id="aa1-depto" class="ravens-input" readonly></div>
                </div>
                <button class="btn-save" style="background:var(--azul); margin-bottom:15px;" onclick="openResidenteModal()">
                    🔍 SELECCIONAR RESIDENTE
                </button>
                <div class="input-group">
                    <label>RESIDENTE SELECCIONADO</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="text" id="aa1-res-name" class="ravens-input" readonly style="background:#080808; color:#888;">
                        <span id="check-aa1" style="display:none;">✅</span>
                    </div>
                </div>
                <div class="input-group"><label>MOTIVO</label><input type="text" id="aa1-motivo" class="ravens-input"></div>
                <button class="btn-save" id="btn-save-aa1" onclick="logicAA1()">GUARDAR REGISTRO</button>
            </div>
        </div>
    `,
    'AA2': `<div class="screen active"><div class="btn-back" onclick="navigate('A1')">⬅ VOLVER</div><h2 class="title">BITÁCORA</h2><div id="list-aa2"></div></div>`,
    'SUCCESS': `<div class="screen active" style="text-align:center; padding-top:100px;"><i class="fas fa-check-circle fa-5x" style="color:var(--verde)"></i><h2>REGISTRO ÉXITOSO</h2></div>`
};

function navigate(screen) {
    const vp = document.getElementById('viewport');
    vp.innerHTML = SCREENS[screen] || SCREENS['INICIO'];
    if(screen === 'AA1') syncAA1();
    if(screen === 'AA2') renderLogs();
    if(screen === 'SUCCESS') setTimeout(() => navigate('INICIO'), 2500);
}

/* =========================================
   LÓGICA SELECTOR RESIDENTES (YAML AA1)
   ========================================= */
function openResidenteModal() {
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
    const nombre = document.getElementById('sel-nombre').value;
    const item = STATE.colBaserFiltrada.find(i => i.Nombre === nombre);
    
    STATE.VarNombreSeleccionado1 = item.Nombre;
    STATE.varNumeroSeleccionado1 = item.Número;
    STATE.varmostrarpaloma1 = true;

    // Actualizar UI de AA1
    document.getElementById('aa1-torre').value = item.Torre;
    document.getElementById('aa1-depto').value = item.Departamento;
    document.getElementById('aa1-res-name').value = item.Nombre;
    document.getElementById('check-aa1').style.display = 'block';
    
    closeResidenteModal();
}

function closeResidenteModal() { document.getElementById('modal-selector').classList.remove('active'); }

function syncAA1() {
    if(STATE.VarNombreSeleccionado1) {
        document.getElementById('aa1-res-name').value = STATE.VarNombreSeleccionado1;
        document.getElementById('check-aa1').style.display = 'block';
    }
}

/* =========================================
   GUARDAR REGISTRO (LOGIC APP TRIGGER)
   ========================================= */
async function logicAA1() {
    const nombreVis = document.getElementById('aa1-nombre').value;
    const motivo = document.getElementById('aa1-motivo').value;

    if(!nombreVis || !motivo || !STATE.VarNombreSeleccionado1) {
        alert("⚠️ Complete todos los campos y seleccione un residente.");
        return;
    }

    STATE.varProcesandoAA1 = true;
    document.getElementById('btn-save-aa1').disabled = true;

    const record = {
        ID: Date.now(),
        Nombre: nombreVis,
        Número: STATE.varNumeroSeleccionado1,
        Torre: document.getElementById('aa1-torre').value,
        Departamento: document.getElementById('aa1-depto').value,
        Motivo: motivo,
        Hora: new Date().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})
    };

    // Colección local (AA2)
    STATE.colvisitaOrdenada.unshift(record);

    // URL FANTASMA (Azure) - Parámetros exactos del YAML
    const url = `${API.VISITA}&Nombre=${encodeURIComponent(record.Nombre)}&Telefono=${encodeURIComponent(record.Número)}&Torre=${encodeURIComponent(record.Torre)}&Depto=${encodeURIComponent(record.Departamento)}&Motivo=${encodeURIComponent(record.Motivo)}&Condominio=RAVENS_RESIDENCIAL&Hora=${record.Hora}&ID_Item=${record.ID}&Tipo_Lista=VISITA`;

    try {
        await fetch(url, { method: 'POST' });
        STATE.VarNombreSeleccionado1 = "";
        STATE.varmostrarpaloma1 = false;
        navigate('SUCCESS');
    } catch(e) {
        alert("Error de conexión con el servidor.");
        document.getElementById('btn-save-aa1').disabled = false;
    }
}

function renderLogs() {
    const container = document.getElementById('list-aa2');
    container.innerHTML = STATE.colvisitaOrdenada.map(v => `
        <div class="log-item" style="border-left-color:var(--verde)">
            <div class="log-header"><span>${v.Nombre}</span><span>${v.Hora}</span></div>
            <div class="log-sub">Visita a: ${v.Torre}-${v.Departamento} • ${v.Motivo}</div>
        </div>
    `).join('');
}

window.onload = () => navigate('INICIO');
