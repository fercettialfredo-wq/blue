/* =========================================
   1. CONFIGURACIÓN Y ESTADO GLOBAL
   ========================================= */
const CONFIG = {
    // Asegúrate de que esta sea la URL correcta de tu Azure Function
    API_PROXY_URL: 'https://proxyoperador.azurewebsites.net/api/ravens-proxy'
};

const STATE = {
    // Sesión de Usuario
    session: {
        isLoggedIn: false,
        condominioId: null,
        usuario: null
    },
    // Datos locales
    colBaserFiltrada: [], 
    // Estado temporal para UI
    photos: {}, 
    signature: null,
    currentContext: "",
    targetInputForQR: "",
    // Historial temporal
    tempHistory: [] 
};

/* =========================================
   2. MOTOR DE PANTALLAS (UI COMPLETA)
   ========================================= */

function formatearFechaBonita(fechaRaw) {
    if (!fechaRaw) return "Pendiente";
    const dateObj = new Date(fechaRaw);
    if (isNaN(dateObj)) return fechaRaw;
    return dateObj.toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    }).replace(',', ''); 
}

const getHeaderLibreta = (titulo, funcionRecarga, pantallaRegreso) => `
    <div class="form-title-section" style="display:flex; justify-content:space-between; align-items:center; padding: 10px 0;">
        <h2 class="form-title" style="margin:0; font-size:1.4rem;">${titulo}</h2>
        <div class="header-icons" style="display:flex; align-items:center; gap:20px;">
            <i class="fas fa-sync-alt fa-2x cursor-pointer" style="color:#3860B2;" onclick="${funcionRecarga}"></i>
            <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('INICIO')" style="height:40px;">
            <i class="fas fa-arrow-left fa-2x cursor-pointer" onclick="navigate('${pantallaRegreso}')" style="color:#ef4444;"></i>
        </div>
    </div>
`;

const SCREENS = {
    'LOGIN': `
        <div class="screen login-screen-container">
            <div class="login-box">
                <div style="text-align:center; margin-bottom:40px;">
                    <img src="icons/logo.png" style="width:100px; margin-bottom:20px;">
                    <h1 style="color:white; font-size:1.5rem; margin:0;">RAVENS ACCESS</h1>
                </div>
                <div class="input-group"><label class="login-label">Usuario</label><input type="text" id="login-user" class="form-input" placeholder="Ej. guardia1"></div>
                <div class="input-group"><label class="login-label">Contraseña</label><input type="password" id="login-pass" class="form-input" placeholder="••••••"></div>
                <button class="btn-primary" onclick="doLogin()">INICIAR SESIÓN</button>
                <p id="login-error" style="color:#ef4444; text-align:center; margin-top:20px; display:none; font-weight:bold;"></p>
            </div>
        </div>`,
    'INICIO': `
        <div class="screen">
            <header class="header-app">
                <div class="header-logo"><img src="icons/logo.png" alt="Logo" style="height: 40px; margin-right: 15px;"><span class="header-logo-text">RAVENS ACCESS</span></div>
                <div onclick="doLogout()" style="cursor:pointer; color:#ef4444;"><i class="fas fa-sign-out-alt fa-lg"></i></div>
            </header>
            <main class="main-menu-grid">
                <div class="menu-item" onclick="navigate('A1')"><img src="icons/visita.svg" class="custom-icon"><div>Visitas</div></div>
                <div class="menu-item" onclick="navigate('B1')"><img src="icons/paquete1.svg" class="custom-icon"><div>Paquetería</div></div>
                <div class="menu-item" onclick="navigate('D1')"><img src="icons/proveedor.svg" class="custom-icon"><div>Proveedor</div></div>
                <div class="menu-item" onclick="navigate('E1')"><img src="icons/qr.svg" class="custom-icon"><div>Módulos QR</div></div>
                <div class="menu-item full" onclick="navigate('F1')"><img src="icons/servicio.svg" class="custom-icon"><div>Personal Interno</div></div>
            </main>
        </div>`,
    
    // VISITAS
    'A1': `<div class="screen"><header class="header-app"><div class="header-logo"><span class="header-logo-text">VISITAS</span></div><div class="cursor-pointer" onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img" style="height:40px;"></div></header><main class="main-menu-grid"><div class="menu-item" onclick="navigate('AA1')"><img src="icons/visita.svg" class="custom-icon"><div>Registrar Visita</div></div><div class="menu-item" onclick="navigate('AC1')"><img src="icons/servicio2.svg" class="custom-icon"><div>Personal Servicio</div></div></main></div>`,
    'AA1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Nueva Visita</h2><div class="header-icons"><i class="fas fa-arrow-left fa-2x cursor-pointer" onclick="navigate('A1')" style="color:#ef4444;"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('AA2')" style="height:40px;"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Nombre Visitante *</label><input type="text" id="aa1-nombre" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="aa1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Departamento</label><input type="text" id="aa1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Residente</label><input type="text" id="aa1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('aa1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div class="input-group" style="margin-top:15px"><label>Placa</label><input type="text" id="aa1-placa" class="form-input"></div>
                <div class="input-group"><label>Motivo *</label><input type="text" id="aa1-motivo" class="form-input"></div>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitAviso('aa1')">Guardar</button><button class="btn-clean" onclick="resetForm('aa1')"><i class="fas fa-eraser"></i> Limpiar</button></div>
            </div>
        </div>`,
    'AA2': `<div class="screen form-page">${getHeaderLibreta('Libreta Visitas', "loadHistory('VISITA', 'gal-aa2')", 'AA1')}<div class="form-container"><div id="gal-aa2" class="gallery-container"></div></div></div>`,
    
    // PERSONAL
    'AC1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Personal Servicio</h2><div class="header-icons"><i class="fas fa-arrow-left fa-2x cursor-pointer" onclick="navigate('A1')" style="color:#ef4444;"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('AC2')" style="height:40px;"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Nombre *</label><input type="text" id="ac1-nombre" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="ac1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="ac1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Residente</label><input type="text" id="ac1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('ac1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div class="input-group" style="margin-top:15px"><label>Cargo *</label><input type="text" id="ac1-cargo" class="form-input"></div>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitAviso('ac1')">Guardar</button><button class="btn-clean" onclick="resetForm('ac1')"><i class="fas fa-eraser"></i> Limpiar</button></div>
            </div>
        </div>`,
    'AC2': `<div class="screen form-page">${getHeaderLibreta('Libreta Personal', "loadHistory('PERSONAL_DE_SERVICIO', 'gal-ac2')", 'AC1')}<div class="form-container"><div id="gal-ac2" class="gallery-container"></div></div></div>`,

    // PAQUETERIA
    'B1': `<div class="screen"><header class="header-app"><div class="header-logo"><span class="header-logo-text">PAQUETERÍA</span></div><div class="cursor-pointer" onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img" style="height:40px;"></div></header><main class="main-menu-grid"><div class="menu-item" onclick="navigate('BA1')"><img src="icons/paquete2.svg" class="custom-icon"><div>Recibir</div></div><div class="menu-item" onclick="navigate('BB1')"><img src="icons/paquete3.svg" class="custom-icon"><div>Entregar</div></div></main></div>`,
    'BA1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Recibir Paquete</h2><div class="header-icons"><i class="fas fa-arrow-left fa-2x cursor-pointer" onclick="navigate('B1')" style="color:#ef4444;"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('BA2')" style="height:40px;"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Torre</label><input type="text" id="ba1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Departamento</label><input type="text" id="ba1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Destinatario (Residente)</label><input type="text" id="ba1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('ba1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div class="input-group" style="margin-top:15px"><label>Paquetería *</label><input type="text" id="ba1-paqueteria" class="form-input"></div>
                <div class="input-group"><label>Estatus</label><select id="ba1-estatus" class="form-input"><option>Aceptado</option><option>Dañado</option></select></div>
                <div class="input-group"><label>Foto</label><div class="photo-placeholder" onclick="document.getElementById('cam-ba1').click()"><input type="file" id="cam-ba1" hidden accept="image/*" capture="environment" onchange="previewImg(this, 'ba1')"><div id="prev-ba1" class="photo-preview hidden"></div><span><i class="fas fa-camera"></i> Cámara</span></div></div>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitRecepcionPaquete()">Guardar</button><button class="btn-clean" onclick="resetForm('ba1')"><i class="fas fa-eraser"></i> Limpiar</button></div>
            </div>
        </div>`,
    'BA2': `<div class="screen form-page">${getHeaderLibreta('Libreta Recepción', "loadHistory('PAQUETERIA_RECEPCION', 'gal-ba2')", 'BA1')}<div class="form-container"><div id="gal-ba2" class="gallery-container"></div></div></div>`,
    'BB1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Entregar Paquete</h2><div class="header-icons"><i class="fas fa-arrow-left fa-2x cursor-pointer" onclick="navigate('B1')" style="color:#ef4444;"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('BB2')" style="height:40px;"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Quien Recibe *</label><input type="text" id="bb1-nombre" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="bb1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="bb1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Dueño (Residente)</label><input type="text" id="bb1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('bb1')"><i class="fas fa-search"></i> Seleccionar Dueño</button>
                <div class="input-group" style="margin-top:15px"><label>Foto Evidencia</label><div class="photo-placeholder" onclick="document.getElementById('cam-bb1').click()"><input type="file" id="cam-bb1" hidden accept="image/*" capture="environment" onchange="previewImg(this, 'bb1')"><div id="prev-bb1" class="photo-preview hidden"></div><span><i class="fas fa-camera"></i> Cámara</span></div></div>
                <div class="input-group"><label>Firma</label><div class="signature-wrapper"><canvas id="sig-canvas"></canvas><i class="fas fa-times-circle clear-sig" onclick="clearSignature()"></i></div></div>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitEntregaPaquete()">Guardar</button><button class="btn-clean" onclick="resetForm('bb1')"><i class="fas fa-eraser"></i> Limpiar</button></div>
            </div>
        </div>`,
    'BB2': `<div class="screen form-page">${getHeaderLibreta('Libreta Entregas', "loadHistory('PAQUETERIA_ENTREGA', 'gal-bb2')", 'BB1')}<div class="form-container"><div id="gal-bb2" class="gallery-container"></div></div></div>`,

    // PROVEEDOR
    'D1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Proveedor</h2><div class="header-icons"><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('INICIO')" style="height:40px;"><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('D2')" style="height:40px;"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Nombre Proveedor *</label><input type="text" id="d1-nombre" class="form-input"></div>
                <div class="input-group"><label>Empresa *</label><input type="text" id="d1-empresa" class="form-input"></div>
                <div class="input-group"><label>Asunto *</label><input type="text" id="d1-asunto" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="d1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="d1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Residente</label><input type="text" id="d1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('d1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitProveedor()">Guardar</button><button class="btn-clean" onclick="resetForm('d1')"><i class="fas fa-eraser"></i> Limpiar</button></div>
            </div>
        </div>`,
    'D2': `<div class="screen form-page">${getHeaderLibreta('Libreta Proveedor', "loadHistory('PROVEEDOR', 'gal-d2')", 'D1')}<div class="form-container"><div id="gal-d2" class="gallery-container"></div></div></div>`,

    // QR
    'E1': `<div class="screen"><header class="header-app"><div class="header-logo"><span class="header-logo-text">MÓDULOS QR</span></div><div class="cursor-pointer" onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img" style="height:40px;"></div></header><main class="main-menu-grid"><div class="menu-item" onclick="navigate('EA1')"><img src="icons/residente.svg" class="custom-icon"><div>QR Residente</div></div><div class="menu-item" onclick="navigate('EB1')"><img src="icons/visita.svg" class="custom-icon"><div>QR Visita</div></div><div class="menu-item" onclick="navigate('EC1')"><img src="icons/evento.svg" class="custom-icon"><div>Eventos</div></div><div class="menu-item" onclick="navigate('ED1')"><img src="icons/proveedor.svg" class="custom-icon"><div>Proveedor NIP</div></div></main></div>`,
    'EA1': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">QR Residente</h2><div class="header-icons"><i class="fas fa-arrow-left fa-2x cursor-pointer" onclick="navigate('E1')" style="color:#ef4444;"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('EA2')" style="height:40px;"></div></div><div class="form-container"><div class="input-group"><input type="text" id="ea1-dni" class="form-input" placeholder=""></div><button class="btn-primary" onclick="startScan('ea1-dni')"><i class="fas fa-camera"></i> Escanear</button><div style="margin-top: 20px;"><button class="btn-save" onclick="submitQRResidente()">Validar</button><button class="btn-clean" onclick="resetForm('ea1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div></div>`,
    'EA2': `<div class="screen form-page">${getHeaderLibreta('Historial QR', "loadHistory('QR_RESIDENTE', 'gal-ea2')", 'EA1')}<div class="form-container"><div id="gal-ea2" class="gallery-container"></div></div></div>`,
    'EB1': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">QR Visita</h2><div class="header-icons"><i class="fas fa-arrow-left fa-2x cursor-pointer" onclick="navigate('E1')" style="color:#ef4444;"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('EB2')" style="height:40px;"></div></div><div class="form-container"><div class="input-group"><input type="text" id="eb1-code" class="form-input" placeholder=""></div><button class="btn-primary" onclick="startScan('eb1-code')"><i class="fas fa-camera"></i> Escanear</button><div style="margin-top: 20px;"><button class="btn-save" onclick="submitQRVisita()">Validar</button><button class="btn-clean" onclick="resetForm('eb1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div></div>`,
    'EB2': `<div class="screen form-page">${getHeaderLibreta('Historial QR Visita', "loadHistory('QR_VISITA', 'gal-eb2')", 'EB1')}<div class="form-container"><div id="gal-eb2" class="gallery-container"></div></div></div>`,
    'EC1': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Validar Evento</h2><div class="cursor-pointer" onclick="navigate('E1')"><img src="icons/home.svg" class="header-icon-img" style="height:40px;"></div></div><div class="form-container"><div class="input-group"><input type="text" id="ec1-code" class="form-input" placeholder=""></div><button class="btn-primary" onclick="startScan('ec1-code')"><i class="fas fa-camera"></i> Escanear</button><div style="margin-top: 20px;"><button class="btn-save" onclick="submitEvento()">Validar</button><button class="btn-clean" onclick="resetForm('ec1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div></div>`,
    'ED1': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Proveedor NIP</h2><div class="header-icons"><i class="fas fa-arrow-left fa-2x cursor-pointer" onclick="navigate('E1')" style="color:#ef4444;"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('ED2')" style="height:40px;"></div></div><div class="form-container"><div class="input-group"><input type="text" id="ed1-nip" class="form-input" placeholder=""></div><div style="margin-top: 20px;"><button class="btn-save" onclick="submitProveedorNIP()">Validar</button><button class="btn-clean" onclick="resetForm('ed1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div></div>`,
    'ED2': `<div class="screen form-page">${getHeaderLibreta('Historial NIP', "loadHistory('NIP_PROVEEDOR', 'gal-ed2')", 'ED1')}<div class="form-container"><div id="gal-ed2" class="gallery-container"></div></div></div>`,

    // PERSONAL INTERNO
    'F1': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Personal Interno</h2><div class="header-icons"><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('INICIO')" style="height:40px;"><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('F2')" style="height:40px;"></div></div><div class="form-container"><div class="input-group"><input type="text" id="f1-id" class="form-input" placeholder=""></div><button class="btn-primary" style="background:#333" onclick="startScan('f1-id')"><i class="fas fa-camera"></i> Escanear</button><div style="display:flex; gap:10px; margin-top:20px;"><button class="btn-save" onclick="submitPersonalInterno('Entrada')">Entrada</button><button class="btn-secondary" style="background:#3860B2" onclick="submitPersonalInterno('Salida')">Salida</button></div><button class="btn-clean" onclick="resetForm('f1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div>`,
    'F2': `<div class="screen form-page">${getHeaderLibreta('Bitácora Interna', "loadHistory('PERSONAL_INTERNO', 'gal-f2')", 'F1')}<div class="form-container"><div id="gal-f2" class="gallery-container"></div></div></div>`
};

/* =========================================
   3. MOTOR LÓGICO Y FUNCIONES
   ========================================= */
let signaturePad;
let html5QrCode;

// --- A. BACKEND CALL (CORREGIDO PARA MANEJAR ERRORES SIN FEALDAD) ---
async function callBackend(action, extraData = {}) {
    if (!STATE.session.condominioId) {
        const saved = localStorage.getItem('ravensUser');
        if (saved) { STATE.session = JSON.parse(saved); } else { return null; }
    }
    const loadingBtn = document.querySelector('.btn-save') || document.querySelector('.btn-primary');
    if(loadingBtn) { loadingBtn.dataset.originalText = loadingBtn.innerText; loadingBtn.disabled = true; loadingBtn.innerText = "Procesando..."; }

    try {
        const payload = { action, condominio: STATE.session.condominioId, usuario: STATE.session.usuario || "guardia_web", ...extraData };
        const response = await fetch(CONFIG.API_PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        
        // Intentamos leer JSON siempre, incluso si es error (400, 404, 500)
        let result;
        try {
            result = await response.json();
        } catch (e) {
            // Si falla el parseo, es un error fatal de servidor (HTML)
            throw new Error(`Error Fatal (${response.status})`);
        }

        if(loadingBtn) { loadingBtn.disabled = false; loadingBtn.innerText = loadingBtn.dataset.originalText || "Guardar"; }

        // Si la Logic App devolvió success: false (ej. código no encontrado o ya usado)
        // Devolvemos el objeto tal cual para que el frontend decida qué mensaje mostrar
        if (result && result.success === false) {
            return result;
        }

        // Si es otro error HTTP no controlado por Logic App
        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }

        return result;

    } catch (error) {
        if(loadingBtn) { loadingBtn.disabled = false; loadingBtn.innerText = "Error"; setTimeout(() => { loadingBtn.innerText = loadingBtn.dataset.originalText || "Guardar"; }, 3000); }
        console.error("❌ Error de comunicación:", error);
        return { success: false, message: error.message || "Error de conexión" };
    }
}

// --- B. SESIÓN ---
async function doLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('login-error');
    if(!user || !pass) return;
    try {
        const response = await fetch(CONFIG.API_PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', username: user, password: pass }) });
        const data = await response.json();
        if (response.ok && data.success) {
            STATE.session.isLoggedIn = true; STATE.session.condominioId = data.condominioId || data.data?.condominio; STATE.session.usuario = user;
            localStorage.setItem('ravensUser', JSON.stringify(STATE.session)); await loadResidentesList(); navigate('INICIO');
        } else { throw new Error(data.message || "Credenciales incorrectas."); }
    } catch (error) { errorMsg.innerText = error.message; errorMsg.style.display = "block"; }
}

async function loadResidentesList() {
    const res = await callBackend('get_history', { tipo_lista: 'USUARIOS_APP' });
    if(res && res.data) {
        STATE.colBaserFiltrada = res.data.map(item => {
            let cleanTel = item['Número'] ? item['Número'].toString().replace(/\D/g, '') : "";
            if(cleanTel.startsWith('52') && cleanTel.length > 10) cleanTel = cleanTel.substring(2);
            return { ...item, Nombre: item.Nombre || item.OData_Nombre || item.Title || "Sin Nombre", Torre: item.Torre || "N/A", Departamento: item.Departamento || "N/A", Número: cleanTel, Condominio: item.Condominio };
        }).filter(item => item.Condominio && item.Condominio.toString().toUpperCase().trim() === STATE.session.condominioId.toString().toUpperCase().trim());
    }
}

function doLogout() { STATE.session = { isLoggedIn: false, condominioId: null, usuario: null }; localStorage.removeItem('ravensUser'); navigate('LOGIN'); }
function checkSession() { const saved = localStorage.getItem('ravensUser'); if (saved) { STATE.session = JSON.parse(saved); loadResidentesList(); navigate('INICIO'); } else { navigate('LOGIN'); } }

// --- C. NAVEGACIÓN Y GALERÍAS ---
function navigate(screen) {
    if(html5QrCode && html5QrCode.isScanning) { html5QrCode.stop().then(() => html5QrCode.clear()).catch(err => {}); }
    document.getElementById('viewport').innerHTML = SCREENS[screen] || SCREENS['LOGIN'];
    if(screen === 'BB1') initSignature();
    const map = { 'AA2': 'VISITA', 'AC2': 'PERSONAL_DE_SERVICIO', 'BA2': 'PAQUETERIA_RECEPCION', 'BB2': 'PAQUETERIA_ENTREGA', 'D2': 'PROVEEDOR', 'EA2': 'QR_RESIDENTE', 'EB2': 'QR_VISITA', 'ED2': 'NIP_PROVEEDOR', 'F2': 'PERSONAL_INTERNO' };
    if(map[screen]) loadHistory(map[screen], `gal-${screen.toLowerCase()}`);
}

async function loadHistory(tipo, elementId) {
    const container = document.getElementById(elementId);
    if(!container) return; container.innerHTML = '<div style="padding:20px; text-align:center;">Cargando...</div>';
    const response = await callBackend('get_history', { tipo_lista: tipo });
    if(response && response.data) { renderRemoteGallery(response.data, elementId); } else { container.innerHTML = '<div style="padding:20px; text-align:center;">Sin datos.</div>'; }
}

function getStatusColor(status) {
    if (!status) return '#2563eb'; const s = status.toString().toLowerCase().trim();
    if(['aceptado', 'entrada', 'autorizado', 'con registro', 'registrado'].includes(s)) return '#2ecc71';
    if(['rechazado', 'salida', 'dañado', 'sin registro', 'denegado'].includes(s)) return '#e74c3c';
    if(['nuevo'].includes(s)) return '#3498db'; return '#2563eb';
}

function renderRemoteGallery(data, elementId) {
    const container = document.getElementById(elementId);
    if (!data || data.length === 0) { container.innerHTML = `<div style="padding:20px; text-align:center; color:#555">Sin registros recientes.</div>`; return; }
    STATE.tempHistory = data;
    
    // --- FILTRO APLICADO AQUÍ ---
    // Oculta items donde Estatus sea "nuevo" o esté vacío
    const filteredData = data.filter(item => {
        const s = (item.Estatus || item.TipoMarca || "").toString().toLowerCase().trim();
        return s !== "" && s !== "nuevo";
    });

    if (filteredData.length === 0) { 
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#555">Sin registros procesados.</div>`; 
        return; 
    }

    container.innerHTML = filteredData.map((item, index) => {
        let fechaLegible = formatearFechaBonita(item.Fecha || item.Created || item.Fechayhora);
        let titulo = item.Nombre || item.Nombre0 || item.Title || item.Visitante || 'Registro';
        if (item.Recibio) titulo = item.Recibio; 
        if (item.Residente && !item.Nombre && !item.Recibio && !item.Nombre0) titulo = item.Residente; 

        let lineasDetalle = [];
        if (item.Empresa) { let txt = `Empresa: ${item.Empresa}`; if(item.Asunto) txt += ` (${item.Asunto})`; lineasDetalle.push(txt); }
        else if (item.Paqueteria) { lineasDetalle.push(`Paq: ${item.Paqueteria}`); }
        else if (item.Recibio) { lineasDetalle.push(`Recibió: ${item.Recibio}`); }
        else if (item.Cargo) { lineasDetalle.push(item.Cargo); }
        else if (item.Motivo) { lineasDetalle.push(item.Motivo); }
        if (item.Torre || item.Departamento) { lineasDetalle.push(`T: ${item.Torre || '?'} D: ${item.Departamento || '?'}`); }

        let detalle = lineasDetalle.join(' | ');
        const rawStatus = item.Estatus || item.TipoMarca;
        const statusColor = getStatusColor(rawStatus);
        const estatusHtml = rawStatus ? `<span style="font-weight:bold; color:${statusColor}"> • ${rawStatus}</span>` : '';

        // Nota: El índice 'index' ahora refiere a la data original filtrada para que el click funcione
        // Necesitamos encontrar el índice real en tempHistory, pero para simplicidad 
        // actualizaremos tempHistory con lo filtrado si queremos que el detalle abra lo correcto
        // O mejor, pasamos el objeto directamente.
        // Solución rápida: Reemplazamos tempHistory por filteredData para esta vista
        STATE.tempHistory = filteredData;

        return `<div class="gallery-item" onclick="showDetails(${index})" style="border-bottom:1px solid #eee; padding: 15px 0; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
            <div class="gallery-text"><h4 style="margin:0; font-size:1.1rem; color:#333;">${titulo}</h4><p style="margin:4px 0 0; font-size:0.9rem; color:#666;">${detalle} ${estatusHtml}</p><p style="margin:4px 0 0; font-size:0.85rem; color:#000; font-weight:bold;">${fechaLegible}</p></div>
            <div style="color:#3860B2;"><i class="fas fa-chevron-right fa-lg"></i></div>
        </div>`;
    }).join('');
}

function showDetails(index) {
    const item = STATE.tempHistory[index];
    if(!item) return;
    const labelMap = { 'Nombre0': 'Nombre', 'Recibio': 'Quien Recibió', 'Residente': 'Destinatario/Residente', 'Nombre': 'Nombre', 'Fechayhora': 'Fecha y Hora', 'Fecha': 'Fecha y Hora', 'Estatus': 'Estatus', 'Paqueteria': 'Paquetería', 'Empresa': 'Empresa', 'Asunto': 'Asunto', 'Torre': 'Torre', 'Departamento': 'Departamento', 'Cargo': 'Cargo', 'Placa': 'Placa', 'DiasTrabajo': 'Días de Trabajo', 'HoraEntrada': 'Hora de Entrada', 'HoraSalida': 'Hora de Salida', 'RequiereRevision': 'Requiere Revisión', 'TipoMarca': 'Tipo de Marca', 'PuedeSalirCon': 'Puede Salir Con', 'D_x00ed_asdeTrabajo': 'Días de Trabajo', 'RequiereRevisi_x00f3_n': 'Requiere Revisión' };
    let content = '<div style="text-align:left;">';
    for (const [key, value] of Object.entries(item)) {
        if(key !== 'odata.type' && key !== 'Foto' && key !== 'FotoBase64' && key !== 'FirmaBase64' && value) {
             let displayValue = value;
             if(key === 'Fecha' || key === 'Fechayhora' || key === 'Created') { displayValue = formatearFechaBonita(value); }
             if(key === 'RequiereRevisi_x00f3_n') { displayValue = (value === true || value === 'true') ? 'SÍ' : 'NO'; }
             if(key === 'Estatus' || key === 'TipoMarca') { const color = getStatusColor(value); displayValue = `<span style="color:${color}; font-weight:bold;">${value}</span>`; }
             const label = labelMap[key] || key;
             content += `<p style="margin:8px 0; font-size:1rem; border-bottom:1px solid #f0f0f0; padding-bottom:5px;"><strong style="color:#555;">${label}:</strong> <span style="color:#000;">${displayValue}</span></p>`;
        }
    }
    content += '</div>';
    let imagesHtml = '';
    if(item.FirmaBase64) { const firmaSrc = item.FirmaBase64.startsWith('http') || item.FirmaBase64.startsWith('data:') ? item.FirmaBase64 : 'data:image/png;base64,'+item.FirmaBase64; imagesHtml += `<div style="text-align:center; margin-top:15px; padding-top:10px;"><p style="font-weight:bold; margin-bottom:5px; color:#333;">Firma:</p><img src="${firmaSrc}" style="max-width:100%; border:1px solid #ccc; border-radius:8px; padding:5px;"></div>`; }
    const fotoUrl = item.Foto || item.FotoBase64;
    if(fotoUrl && fotoUrl !== "null") { const fotoSrc = fotoUrl.startsWith('http') || fotoUrl.startsWith('data:') ? fotoUrl : 'data:image/png;base64,'+fotoUrl; imagesHtml += `<div style="text-align:center; margin-top:15px; padding-top:10px;"><p style="font-weight:bold; margin-bottom:5px; color:#333;">Evidencia:</p><img src="${fotoSrc}" style="max-width:100%; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);"></div>`; }
    const modalHtml = `<div id="detail-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999; display:flex; justify-content:center; align-items:flex-end;"><div style="background:white; width:100%; max-width:500px; max-height:90vh; overflow-y:auto; padding:25px; border-radius:20px 20px 0 0; position:relative; animation: slideUp 0.3s ease-out;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:15px;"><h2 style="margin:0; color:#333; font-size:1.5rem;">Detalles</h2><i class="fas fa-times" onclick="document.getElementById('detail-modal').remove()" style="font-size:1.8rem; color:#666; cursor:pointer;"></i></div><div style="color:#444;">${content}</div>${imagesHtml}<button onclick="document.getElementById('detail-modal').remove()" style="margin-top:25px; width:100%; padding:15px; background:#2ecc71; color:white; border:none; border-radius:12px; font-weight:bold; font-size:1.1rem; cursor:pointer; box-shadow: 0 4px 6px rgba(46, 204, 113, 0.3);">Cerrar</button></div></div><style>@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }</style>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// --- D. ENVÍO DE FORMULARIOS Y QR (LOGIC APP + PANTALLAS DINÁMICAS) ---

// 1. Visitas (AA1) y Personal (AC1)
async function submitAviso(p) {
    const nom = document.getElementById(p+'-nombre').value;
    const motivo = document.getElementById(p+'-motivo')?.value;
    const cargo = document.getElementById(p+'-cargo')?.value; 
    
    if(!nom || !STATE[p]?.residente) { return alert("Faltan datos obligatorios."); }
    if(p === 'aa1' && !motivo) { return alert("El motivo es obligatorio."); }
    if(p === 'ac1' && !cargo) { return alert("El cargo es obligatorio."); } 

    let tipoLista = '';
    let nextScreen = '';
    if (p === 'aa1') { tipoLista = 'VISITA'; nextScreen = 'AA2'; }
    if (p === 'ac1') { tipoLista = 'PERSONALAVISO'; nextScreen = 'AC2'; }

    const data = { 
        Nombre: nom, Residente: STATE[p].residente, Torre: STATE[p].torre, Departamento: STATE[p].depto, 
        Telefono: STATE[p].telefono || "", Tipo_Lista: tipoLista, Cargo: cargo || "N/A", 
        Motivo: motivo || "Servicio", Placa: document.getElementById(p+'-placa')?.value || "N/A" 
    };

    const res = await callBackend('submit_form', { formulario: 'AVISOG', data: data });
    if (res && res.success) { 
        resetForm(p); 
        showSuccessScreen(res.message || "Registro Guardado", "Correcto", nextScreen); 
    } else {
        showFailureScreen(res.message || "Error al guardar", p.toUpperCase());
    }
}

// 2. Proveedores (D1)
async function submitProveedor() {
    const nom = document.getElementById('d1-nombre').value;
    const asunto = document.getElementById('d1-asunto').value;
    const empresa = document.getElementById('d1-empresa').value;

    if(!nom || !STATE['d1']?.residente || !asunto) return alert("Faltan datos.");

    const data = { 
        Nombre: nom, Residente: STATE['d1'].residente, Torre: STATE['d1'].torre, Departamento: STATE['d1'].depto, 
        Telefono: STATE['d1']?.telefono || "", Tipo_Lista: 'PROVEEDOR', Empresa: empresa || "Genérica", 
        Asunto: asunto, Motivo: asunto 
    };

    const res = await callBackend('submit_form', { formulario: 'AVISOG', data: data });
    if (res && res.success) { 
        resetForm('d1'); 
        showSuccessScreen(res.message || "Proveedor Registrado", "Éxito", 'D2'); 
    } else {
        showFailureScreen(res.message, 'D1');
    }
}

// 3. Paquetería Recepción
async function submitRecepcionPaquete() {
    if(!STATE['ba1']?.residente) return alert("Selecciona un residente.");
    const data = { Residente: STATE['ba1'].residente, Torre: STATE['ba1'].torre, Departamento: STATE['ba1'].depto, Telefono: STATE['ba1']?.telefono || "", Paqueteria: document.getElementById('ba1-paqueteria').value, Estatus: document.getElementById('ba1-estatus').value, FotoBase64: STATE.photos['ba1'] || "" };
    const res = await callBackend('submit_form', { formulario: 'PAQUETERIA_RECEPCION', data: data });
    if (res && res.success) { 
        resetForm('ba1'); 
        showSuccessScreen("Paquete Recibido", "Guardado", 'BA2');
    } else {
        showFailureScreen(res.message, 'BA1');
    }
}

// 4. Paquetería Entrega
async function submitEntregaPaquete() {
    const nom = document.getElementById('bb1-nombre').value;
    if(!nom || !STATE['bb1']?.residente) return alert("Datos incompletos.");
    const data = { Recibio: nom, Residente: STATE['bb1'].residente, Torre: STATE['bb1'].torre, Departamento: STATE['bb1'].depto, FotoBase64: STATE.photos['bb1'] || "", FirmaBase64: signaturePad ? signaturePad.toDataURL() : "" };
    const res = await callBackend('submit_form', { formulario: 'PAQUETERIA_ENTREGA', data: data });
    if (res && res.success) { 
        resetForm('bb1'); 
        showSuccessScreen("Paquete Entregado", "Firmado", 'BB2');
    } else {
        showFailureScreen(res.message, 'BB1');
    }
}

// 5. Personal Interno
async function submitPersonalInterno(accion) {
    const id = document.getElementById('f1-id').value;
    if(!id) return alert("Escanea ID.");
    
    // NOTA: Personal Interno envía a Logic App pero la navegación es especial
    const res = await callBackend('submit_form', { formulario: 'PERSONAL_INTERNO', data: { ID_Personal: id, Accion: accion } });
    
    if (res && res.success) { 
        resetForm('f1'); 
        // Si entra, va a libreta (F2), si sale también
        showSuccessScreen(res.message || "Movimiento registrado", accion, 'F2');
    } else {
        showFailureScreen(res.message || "Error personal", 'F1');
    }
}

// 6. Validaciones QR (Core Logic con Navegación Dinámica)
// param: nextScreen -> Pantalla de Libreta si es éxito (ej. 'EB2')
// param: failScreen -> Pantalla de Escáner si falla (ej. 'EB1')
async function validarAccesoQR(tipo, inputId, formId, nextScreen, failScreen) {
    const codigo = document.getElementById(inputId).value;
    if(!codigo) return alert("Código vacío.");
    
    // Llamada al Backend
    const res = await callBackend('validate_qr', { tipo_validacion: tipo, codigo_leido: codigo });
    
    if (res && res.success) {
        resetForm(formId);
        // Extraemos datos para mostrar en la pantalla verde
        const nombre = res.data?.nombre || "Autorizado";
        const movimiento = res.data?.tipo || "ACCESO";
        const mensaje = res.message || "Acceso Permitido";
        
        showSuccessScreen(mensaje, `${movimiento}: ${nombre}`, nextScreen);
    } else {
        // Fallo: Mostramos pantalla roja y el botón regresa al escáner
        let errorMsg = res ? res.message : "Código no válido";
        const msgLower = errorMsg.toLowerCase();

        // --- FILTROS DE MENSAJES DE ERROR PARA QR VISITA ---
        
        // Caso 1: Código no encontrado (404)
        if (msgLower.includes("404") || msgLower.includes("not found") || msgLower.includes("no existe") || msgLower.includes("no encontrado")) {
             errorMsg = "🚫 Código no encontrado - Acceso Denegado";
        }
        // Caso 2: Código ya usado (400)
        else if (msgLower.includes("ya usado") || msgLower.includes("vencido") || msgLower.includes("salida")) {
             errorMsg = "⚠️ Este código ya fue validado anteriormente.";
        }

        showFailureScreen(errorMsg, failScreen);
    }
}

// Wrappers para llamar a la función genérica con las rutas correctas
function submitQRResidente() { validarAccesoQR('QR_RESIDENTE', 'ea1-dni', 'ea1', 'EA2', 'EA1'); }
function submitQRVisita() { validarAccesoQR('QR_VISITA', 'eb1-code', 'eb1', 'EB2', 'EB1'); } // Éxito -> EB2 (Libreta), Error -> EB1 (Scanner)
function submitEvento() { validarAccesoQR('EVENTO', 'ec1-code', 'ec1', 'EC1', 'EC1'); } // Eventos se queda en scanner si es éxito (no hay libreta definida en menú)
function submitProveedorNIP() { validarAccesoQR('NIP_PROVEEDOR', 'ed1-nip', 'ed1', 'ED2', 'ED1'); }

// --- E. PANTALLAS DINÁMICAS (Éxito / Fracaso) ---

function showSuccessScreen(titulo, subtitulo, nextScreen) {
    const old = document.getElementById('status-modal');
    if(old) old.remove();

    const html = `
        <div id="status-modal" class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; text-align:center; background-color:#f0fdf4; animation: fadeIn 0.4s ease-out; position:fixed; top:0; left:0; width:100%; z-index:99999;">
            <div style="background:white; padding:40px; border-radius:20px; box-shadow:0 10px 25px rgba(0,0,0,0.1); max-width:90%; width: 400px;">
                <div style="width:80px; height:80px; background:#dcfce7; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
                    <i class="fas fa-check fa-3x" style="color:#2ecc71;"></i>
                </div>
                <h1 style="font-size:1.8rem; margin:0 0 10px; color:#166534;">${titulo}</h1>
                <p style="font-size:1.2rem; color:#555; margin-bottom:30px;">${subtitulo}</p>
                <button class="btn-primary" style="width:100%; font-size:1.1rem; padding:12px;" onclick="document.getElementById('status-modal').remove(); navigate('${nextScreen}')">Continuar</button>
            </div>
        </div>
        <style>@keyframes fadeIn { from { opacity:0; transform: scale(0.9); } to { opacity:1; transform: scale(1); } }</style>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

function showFailureScreen(motivo, retryScreen) {
    const old = document.getElementById('status-modal');
    if(old) old.remove();

    const html = `
        <div id="status-modal" class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; text-align:center; background-color:#fef2f2; animation: shake 0.4s ease-in-out; position:fixed; top:0; left:0; width:100%; z-index:99999;">
            <div style="background:white; padding:40px; border-radius:20px; box-shadow:0 10px 25px rgba(0,0,0,0.1); max-width:90%; width: 400px;">
                <div style="width:80px; height:80px; background:#fee2e2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
                    <i class="fas fa-times fa-3x" style="color:#ef4444;"></i>
                </div>
                <h1 style="font-size:1.8rem; margin:0 0 10px; color:#991b1b;">DENEGADO</h1>
                <p style="font-size:1.1rem; color:#666; margin-bottom:30px; font-weight:500;">${motivo}</p>
                <button class="btn-primary" style="width:100%; background-color:#333; font-size:1.1rem; padding:12px;" onclick="document.getElementById('status-modal').remove(); navigate('${retryScreen}')">Intentar de nuevo</button>
            </div>
        </div>
        <style>
            @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

// --- F. UTILIDADES DEL FORMULARIO Y CÁMARA (RESTITUIDAS) ---

function resetForm(prefix) {
    document.querySelectorAll(`[id^="${prefix}-"]`).forEach(i => i.value = '');
    STATE[prefix] = {};
    if(STATE.photos[prefix] !== undefined) delete STATE.photos[prefix];
    const prev = document.getElementById('prev-' + prefix);
    if(prev) { 
        prev.style.backgroundImage = ''; 
        prev.classList.add('hidden'); 
        if (prev.nextElementSibling) { 
            prev.nextElementSibling.style.display = 'block'; 
            prev.nextElementSibling.innerHTML = '<i class="fas fa-camera"></i> Cámara'; 
        } 
    }
    if(prefix === 'bb1') clearSignature();
}

function openResidenteModal(ctx) {
    STATE.currentContext = ctx;
    if(STATE.colBaserFiltrada.length === 0) { alert("Lista vacía"); return; }
    const torres = [...new Set(STATE.colBaserFiltrada.map(i => i.Torre))].sort();
    const selTorre = document.getElementById('sel-torre');
    
    // Si el HTML del modal ya existe (asumido en tu index.html), lo usamos
    // Si no, deberías inyectarlo aquí. Usando el ID estándar 'sel-torre'
    if (selTorre) { 
        selTorre.innerHTML = '<option value="">Selecciona...</option>' + torres.map(t => `<option value="${t}">${t}</option>`).join(''); 
        updateDeptos(); 
        document.getElementById('modal-selector').classList.add('active'); 
    } else {
        // Fallback básico si falta el HTML del modal en el index.html
        alert("Error: Estructura del modal no encontrada.");
    }
}

function updateDeptos() {
    const t = document.getElementById('sel-torre').value;
    const deptos = [...new Set(STATE.colBaserFiltrada.filter(i => i.Torre == t).map(i => i.Departamento))].sort();
    document.getElementById('sel-depto').innerHTML = '<option value="">Selecciona...</option>' + deptos.map(d => `<option value="${d}">${d}</option>`).join('');
    updateResidentes();
}

function updateResidentes() {
    const t = document.getElementById('sel-torre').value;
    const d = document.getElementById('sel-depto').value;
    const res = STATE.colBaserFiltrada.filter(i => i.Torre == t && i.Departamento == d).map(r => r.Nombre).sort();
    document.getElementById('sel-nombre').innerHTML = '<option value="">Selecciona...</option>' + res.map(n => `<option value="${n}">${n}</option>`).join('');
}

function confirmResidente() {
    const p = STATE.currentContext; 
    const nombreSel = document.getElementById('sel-nombre').value;
    const item = STATE.colBaserFiltrada.find(i => i.Nombre === nombreSel);
    if(item) {
        STATE[p] = { residente: item.Nombre, torre: item.Torre, depto: item.Departamento, telefono: item.Número };
        if(document.getElementById(`${p}-torre`)) document.getElementById(`${p}-torre`).value = item.Torre;
        if(document.getElementById(`${p}-depto`)) document.getElementById(`${p}-depto`).value = item.Departamento;
        if(document.getElementById(`${p}-res-name`)) document.getElementById(`${p}-res-name`).value = item.Nombre;
    }
    document.getElementById('modal-selector').classList.remove('active');
}

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
            if(prev) { 
                prev.style.backgroundImage = `url(${e.target.result})`; 
                prev.classList.remove('hidden'); 
                if (prev.nextElementSibling) { 
                    prev.nextElementSibling.style.display = 'block'; 
                    prev.nextElementSibling.innerHTML = '<i class="fas fa-check-circle" style="color:#2ecc71; font-size:1.5em;"></i><br><span style="color:#2ecc71; font-weight:bold;">¡Foto Lista!</span>'; 
                } 
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function startScan(targetInputId) {
    STATE.targetInputForQR = targetInputId;
    document.getElementById('qr-modal').classList.add('active');
    html5QrCode = new Html5Qrcode("qr-reader-view");
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 },
        (decodedText) => { 
            html5QrCode.stop().then(() => html5QrCode.clear()); 
            document.getElementById('qr-modal').classList.remove('active'); 
            const input = document.getElementById(STATE.targetInputForQR); 
            if(input) input.value = decodedText; 
        }, 
        () => {}
    ).catch(err => { 
        alert("Error cámara: " + err); 
        document.getElementById('qr-modal').classList.remove('active'); 
    });
}

function closeQRScanner() { 
    if(html5QrCode) html5QrCode.stop().then(() => html5QrCode.clear()).catch(()=>{}); 
    document.getElementById('qr-modal').classList.remove('active'); 
}

window.onload = () => { console.log("🚀 Ravens Access iniciada."); checkSession(); };
