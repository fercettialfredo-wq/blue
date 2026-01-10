/* =========================================
   1. CONFIGURACIÓN Y ESTADO GLOBAL
   ========================================= */
const CONFIG = {
    // URL de tu Proxy en Azure
    API_PROXY_URL: 'https://proxyoperador.azurewebsites.net/api/ravens-proxy'
};

const STATE = {
    // Sesión de Usuario
    session: {
        isLoggedIn: false,
        condominioId: null,
        usuario: null
    },

    // Base de Datos Local de Residentes
    colBaserFiltrada: [], 

    // Estado temporal para UI y Formas
    photos: {}, 
    signature: null,
    currentContext: "",
    targetInputForQR: ""
};

/* =========================================
   2. MOTOR DE PANTALLAS (HTML TEMPLATES)
   ========================================= */
const SCREENS = {
    'LOGIN': `
        <div class="screen login-screen-container">
            <div class="login-box">
                <div style="text-align:center; margin-bottom:40px;">
                    <img src="icons/logo.png" style="width:100px; margin-bottom:20px;">
                    <h1 style="color:white; font-size:1.5rem; margin:0;">RAVENS ACCESS</h1>
                </div>
                <div class="input-group">
                    <label class="login-label">Usuario</label>
                    <input type="text" id="login-user" class="form-input" placeholder="Ej. guardia1">
                </div>
                <div class="input-group">
                    <label class="login-label">Contraseña</label>
                    <input type="password" id="login-pass" class="form-input" placeholder="••••••">
                </div>
                <button class="btn-primary" onclick="doLogin()">INICIAR SESIÓN</button>
                <p id="login-error" style="color:#ef4444; text-align:center; margin-top:20px; display:none; font-weight:bold;"></p>
            </div>
        </div>
    `,

    'INICIO': `
        <div class="screen">
            <header class="header-app">
                <div class="header-logo">
                    <img src="icons/logo.png" style="height: 40px; margin-right: 15px;">
                    <span class="header-logo-text">RAVENS ACCESS</span>
                </div>
                <div onclick="doLogout()" style="cursor:pointer; color:#ef4444;">
                    <i class="fas fa-sign-out-alt fa-lg"></i>
                </div>
            </header>
            <main class="main-menu-grid">
                <div class="menu-item" onclick="navigate('A1')">
                    <img src="icons/visita.svg" class="custom-icon"><div>Visitas</div>
                </div>
                <div class="menu-item" onclick="navigate('B1')">
                    <img src="icons/paquete1.svg" class="custom-icon"><div>Paquetería</div>
                </div>
                <div class="menu-item" onclick="navigate('D1')">
                    <img src="icons/proveedor.svg" class="custom-icon"><div>Proveedor</div>
                </div>
                <div class="menu-item" onclick="navigate('E1')">
                    <img src="icons/qr.svg" class="custom-icon"><div>Módulos QR</div>
                </div>
                <div class="menu-item full" onclick="navigate('F1')">
                    <img src="icons/servicio.svg" class="custom-icon"><div>Personal Interno</div>
                </div>
            </main>
        </div>
    `,

    'A1': `
        <div class="screen">
            <header class="header-app"><div class="header-logo"><span class="header-logo-text">VISITAS</span></div><div class="cursor-pointer" onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img"></div></header>
            <main class="main-menu-grid">
                <div class="menu-item" onclick="navigate('AA1')"><img src="icons/visita.svg" class="custom-icon"><div>Registrar Visita</div></div>
                <div class="menu-item" onclick="navigate('AC1')"><img src="icons/servicio2.svg" class="custom-icon"><div>Personal Servicio</div></div>
            </main>
        </div>
    `,

    'AA1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">Nueva Visita</h2>
                <div class="header-icons">
                    <i class="fas fa-arrow-left fa-lg cursor-pointer" onclick="navigate('A1')"></i>
                    <img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('AA2')">
                </div>
            </div>
            <div class="form-container">
                <div class="input-group"><label>Nombre Visitante *</label><input type="text" id="aa1-nombre" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="aa1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Departamento</label><input type="text" id="aa1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Residente</label><input type="text" id="aa1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('aa1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div class="input-group" style="margin-top:15px"><label>Placa</label><input type="text" id="aa1-placa" class="form-input"></div>
                <div class="input-group"><label>Motivo *</label><input type="text" id="aa1-motivo" class="form-input"></div>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitAviso('aa1')">Guardar</button>
                    <button class="btn-clean" onclick="resetForm('aa1')">Limpiar</button>
                </div>
            </div>
        </div>
    `,

    'AC1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Personal Servicio</h2><div class="header-icons"><i class="fas fa-arrow-left fa-lg cursor-pointer" onclick="navigate('A1')"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('AC2')"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Nombre *</label><input type="text" id="ac1-nombre" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="ac1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="ac1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Residente</label><input type="text" id="ac1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('ac1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div class="input-group" style="margin-top:15px"><label>Cargo</label><input type="text" id="ac1-cargo" class="form-input"></div>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitAviso('ac1')">Guardar</button><button class="btn-clean" onclick="resetForm('ac1')">Limpiar</button></div>
            </div>
        </div>
    `,

    'D1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Proveedor</h2><div class="header-icons"><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('INICIO')"><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('D2')"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Nombre Proveedor *</label><input type="text" id="d1-nombre" class="form-input"></div>
                <div class="input-group"><label>Empresa *</label><input type="text" id="d1-empresa" class="form-input"></div>
                <div class="input-group"><label>Asunto *</label><input type="text" id="d1-asunto" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="d1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="d1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Residente</label><input type="text" id="d1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('d1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitProveedor()">Guardar</button><button class="btn-clean" onclick="resetForm('d1')">Limpiar</button></div>
            </div>
        </div>
    `,

    // Pantallas de Historial
    'AA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Visitas</h2><div onclick="navigate('AA1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-aa2" class="gallery-container"></div></div></div>`,
    'AC2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Personal</h2><div onclick="navigate('AC1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-ac2" class="gallery-container"></div></div></div>`,
    'D2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Proveedor</h2><div onclick="navigate('D1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-d2" class="gallery-container"></div></div></div>`,

    // Módulos Adicionales (B, E, F)
    'B1': `<div class="screen"><header class="header-app"><div class="header-logo"><span class="header-logo-text">PAQUETERÍA</span></div><div onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img"></div></header><main class="main-menu-grid"><div class="menu-item" onclick="navigate('BA1')"><img src="icons/paquete2.svg" class="custom-icon"><div>Recibir</div></div><div class="menu-item" onclick="navigate('BB1')"><img src="icons/paquete3.svg" class="custom-icon"><div>Entregar</div></div></main></div>`,
    'E1': `<div class="screen"><header class="header-app"><div class="header-logo"><span class="header-logo-text">MÓDULOS QR</span></div><div onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img"></div></header><main class="main-menu-grid"><div class="menu-item" onclick="navigate('EA1')"><img src="icons/residente.svg" class="custom-icon"><div>QR Residente</div></div><div class="menu-item" onclick="navigate('EB1')"><img src="icons/visita.svg" class="custom-icon"><div>QR Visita</div></div></main></div>`,
    'F1': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Personal Interno</h2><div onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div class="input-group"><label>ID Personal *</label><input type="text" id="f1-id" class="form-input"></div><button class="btn-primary" onclick="startScan('f1-id')">Escanear Gafete</button><div style="display:flex; gap:10px; margin-top:20px;"><button class="btn-save" onclick="submitPersonalInterno('Entrada')">Entrada</button><button class="btn-secondary" onclick="submitPersonalInterno('Salida')">Salida</button></div></div></div>`,

    // Estados Finales
    'SUCCESS': `<div class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column"><i class="fas fa-check-circle fa-5x status-success"></i><h2 class="form-title" style="margin-top:20px">ÉXITO</h2></div>`,
    'FAILURE': `<div class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column"><i class="fas fa-times-circle fa-5x status-error"></i><h2 class="form-title" style="margin-top:20px">DENEGADO</h2></div>`
};

/* =========================================
   3. MOTOR LÓGICO Y FUNCIONES
   ========================================= */
let signaturePad;
let html5QrCode;

// --- A. FUNCIÓN MAESTRA DE CONEXIÓN ---
async function callBackend(action, extraData = {}) {
    if (!STATE.session.condominioId) return alert("Sesión inválida.");
    const loadingBtn = document.querySelector('.btn-save') || document.querySelector('.btn-primary');
    if(loadingBtn) { loadingBtn.disabled = true; loadingBtn.dataset.originalText = loadingBtn.innerText; loadingBtn.innerText = "Procesando..."; }

    try {
        const payload = { action, condominio: STATE.session.condominioId, usuario: STATE.session.usuario, ...extraData };
        const response = await fetch(CONFIG.API_PROXY_URL, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        const result = await response.json();
        if(loadingBtn) { loadingBtn.disabled = false; loadingBtn.innerText = loadingBtn.dataset.originalText; }
        return result;
    } catch (error) {
        if(loadingBtn) { loadingBtn.disabled = false; loadingBtn.innerText = "Error"; }
        return null;
    }
}

// --- B. AUTH Y CARGA DE DATOS ---
async function doLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    if(!user || !pass) return;
    try {
        const response = await fetch(CONFIG.API_PROXY_URL, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ action: 'login', username: user, password: pass }) 
        });
        const data = await response.json();
        if (response.ok && data.success) {
            STATE.session = { isLoggedIn: true, condominioId: data.condominioId || "GARDENIAS", usuario: user };
            localStorage.setItem('ravensUser', JSON.stringify(STATE.session));
            await loadResidentesList();
            navigate('INICIO');
        } else { alert(data.message || "Credenciales incorrectas"); }
    } catch (e) { alert("Error de conexión"); }
}

async function loadResidentesList() {
    const res = await callBackend('get_history', { tipo_lista: 'USUARIOS_APP' });
    if(res && res.data) {
        STATE.colBaserFiltrada = res.data.map(item => ({
            ...item, 
            Nombre: item.Nombre || item.OData_Nombre || item.Title || "Sin Nombre",
            Torre: item.Torre || item.OData_Torre || "N/A", 
            Departamento: item.Departamento || item.OData_Departamento || "N/A",
            Número: (item['Número'] || item.Numero || "").toString().replace(/\D/g, '').replace(/^52/, ''),
            Condominio: item.Condominio || item.OData_Condominio
        })).filter(item => !item.Condominio || item.Condominio.toString().toUpperCase() === STATE.session.condominioId.toString().toUpperCase());
    }
}

function doLogout() { STATE.session = { isLoggedIn: false }; localStorage.removeItem('ravensUser'); navigate('LOGIN'); }

// --- C. NAVEGACIÓN ---
function navigate(screen) {
    if(html5QrCode?.isScanning) html5QrCode.stop().then(()=>html5QrCode.clear());
    const viewport = document.getElementById('viewport');
    if(viewport) viewport.innerHTML = SCREENS[screen] || SCREENS['LOGIN'];
    
    if(screen.endsWith('2')) {
        const map = { 'AA2': 'VISITA', 'AC2': 'PERSONAL_DE_SERVICIO', 'D2': 'PROVEEDOR' };
        if(map[screen]) loadHistory(map[screen], `gal-${screen.toLowerCase()}`);
    }
}

async function loadHistory(tipo, elId) {
    const container = document.getElementById(elId);
    if(!container) return;
    container.innerHTML = 'Cargando registros...';
    const res = await callBackend('get_history', { tipo_lista: tipo });
    if(res?.data) {
        container.innerHTML = res.data.map(item => `<div class="gallery-item"><h4>${item.Title || item.Nombre || 'Registro'}</h4><p>${item.Created || item.Fecha || ''}</p></div>`).join('');
    } else { container.innerHTML = 'Sin registros recientes.'; }
}

// --- D. SUBMITS (INTEGRACIÓN AVISOG POST) ---
async function submitAviso(p) {
    const nom = document.getElementById(p+'-nombre').value;
    const motivo = document.getElementById(p+'-motivo')?.value;
    if(!nom || !STATE[p]?.residente) return alert("Faltan datos obligatorios.");

    const data = {
        Nombre: nom,
        Residente: STATE[p].residente,
        Torre: STATE[p].torre,
        Depto: STATE[p].depto,
        Telefono: STATE[p].telefono || "",
        Tipo_Lista: p === 'aa1' ? 'VISITA' : 'ENTRADA',
        Cargo: document.getElementById(p+'-cargo')?.value || "N/A",
        Motivo: motivo || "Servicio",
        Placa: document.getElementById(p+'-placa')?.value || "N/A",
        Empresa: "N/A",
        Asunto: "N/A"
    };

    const res = await callBackend('submit_form', { formulario: 'AVISOG', data });
    if (res?.success) { resetForm(p); navigate('SUCCESS'); }
}

async function submitProveedor() {
    const nom = document.getElementById('d1-nombre').value;
    const asunto = document.getElementById('d1-asunto').value;
    if(!nom || !STATE['d1']?.residente || !asunto) return alert("Faltan datos obligatorios.");
    
    const data = {
        Nombre: nom,
        Residente: STATE['d1'].residente,
        Torre: STATE['d1'].torre,
        Depto: STATE['d1'].depto,
        Telefono: STATE['d1']?.telefono || "",
        Tipo_Lista: 'PROVEEDOR',
        Empresa: document.getElementById('d1-empresa').value || "Genérica",
        Cargo: "Proveedor",
        Asunto: asunto,
        Motivo: asunto,
        Placa: "N/A"
    };

    const res = await callBackend('submit_form', { formulario: 'AVISOG', data });
    if (res?.success) { resetForm('d1'); navigate('SUCCESS'); }
}

// --- E. SELECTOR DE RESIDENTES ---
function resetForm(pre) { document.querySelectorAll(`[id^="${pre}-"]`).forEach(i => i.value = ''); STATE[pre] = {}; }

function openResidenteModal(ctx) { 
    STATE.currentContext = ctx; 
    const torres = [...new Set(STATE.colBaserFiltrada.map(i => i.Torre))].sort(); 
    document.getElementById('sel-torre').innerHTML = '<option value="">Selecciona...</option>' + torres.map(t => `<option value="${t}">${t}</option>`).join('');
    document.getElementById('modal-selector').classList.add('active'); 
}

function updateDeptos() { 
    const t = document.getElementById('sel-torre').value; 
    const deptos = [...new Set(STATE.colBaserFiltrada.filter(i => i.Torre == t).map(i => i.Departamento))].sort(); 
    document.getElementById('sel-depto').innerHTML = '<option value="">Selecciona...</option>' + deptos.map(d => `<option value="${d}">${d}</option>`).join(''); 
}

function updateResidentes() { 
    const t = document.getElementById('sel-torre').value, d = document.getElementById('sel-depto').value; 
    const res = STATE.colBaserFiltrada.filter(i => i.Torre == t && i.Departamento == d).map(i => i.Nombre).sort(); 
    document.getElementById('sel-nombre').innerHTML = '<option value="">Selecciona...</option>' + res.map(n => `<option value="${n}">${n}</option>`).join(''); 
}

function confirmResidente() {
    const p = STATE.currentContext, n = document.getElementById('sel-nombre').value, i = STATE.colBaserFiltrada.find(x => x.Nombre === n);
    if(i) {
        STATE[p] = { residente: i.Nombre, torre: i.Torre, depto: i.Departamento, telefono: i.Número };
        if(document.getElementById(`${p}-torre`)) document.getElementById(`${p}-torre`).value = i.Torre;
        if(document.getElementById(`${p}-depto`)) document.getElementById(`${p}-depto`).value = i.Departamento;
        if(document.getElementById(`${p}-res-name`)) document.getElementById(`${p}-res-name`).value = i.Nombre;
    }
    document.getElementById('modal-selector').classList.remove('active');
}

// --- F. UTILIDADES (CÁMARA / QR) ---
function startScan(id) { 
    STATE.targetInputForQR = id; 
    document.getElementById('qr-modal').classList.add('active'); 
    html5QrCode = new Html5Qrcode("qr-reader-view"); 
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (txt) => { 
        html5QrCode.stop(); 
        document.getElementById('qr-modal').classList.remove('active'); 
        document.getElementById(STATE.targetInputForQR).value = txt; 
    }).catch(e => alert("Error cámara")); 
}

function previewImg(input, id) { 
    if(input.files?.[0]) { 
        const r = new FileReader(); 
        r.onload = e => { 
            STATE.photos[id] = e.target.result; 
            const p = document.getElementById('prev-'+id); 
            if(p) { p.style.backgroundImage = `url(${e.target.result})`; p.classList.remove('hidden'); }
        }; 
        r.readAsDataURL(input.files[0]); 
    } 
}

// ARRANQUE DE APP
window.onload = () => { 
    const s = localStorage.getItem('ravensUser'); 
    if(s) { 
        STATE.session = JSON.parse(s); 
        loadResidentesList(); 
        navigate('INICIO'); 
    } else { 
        navigate('LOGIN'); 
    } 
};
