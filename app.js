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

    // LISTA 'UsuariosApp' (Base de Datos Local descargada)
    colBaserFiltrada: [], 

    // Estado temporal para UI
    photos: {}, 
    signature: null,
    currentContext: "",
    targetInputForQR: "",
    
    // Almacenamiento temporal del historial para ver detalles
    tempHistory: [] 
};

/* =========================================
   2. MOTOR DE PANTALLAS (UI COMPLETA)
   ========================================= */
const SCREENS = {
    // --- LOGIN SCREEN ---
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

    // --- MENÚ PRINCIPAL ---
    'INICIO': `
        <div class="screen">
            <header class="header-app">
                <div class="header-logo">
                    <img src="icons/logo.png" alt="Logo" style="height: 40px; margin-right: 15px;">
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

    // --- MÓDULO A: VISITAS ---
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
            <div class="form-title-section"><h2 class="form-title">Nueva Visita</h2><div class="header-icons"><i class="fas fa-arrow-left fa-lg cursor-pointer" onclick="navigate('A1')"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('AA2')"></div></div>
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
                    <button class="btn-clean" onclick="resetForm('aa1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,
    'AA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Visitas</h2><div class="cursor-pointer" onclick="navigate('AA1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-aa2" class="gallery-container"></div></div></div>`,
    
    'AC1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Personal Servicio</h2><div class="header-icons"><i class="fas fa-arrow-left fa-lg cursor-pointer" onclick="navigate('A1')"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('AC2')"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Nombre *</label><input type="text" id="ac1-nombre" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="ac1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="ac1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Residente</label><input type="text" id="ac1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('ac1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div class="input-group" style="margin-top:15px"><label>Cargo *</label><input type="text" id="ac1-cargo" class="form-input"></div>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitAviso('ac1')">Guardar</button><button class="btn-clean" onclick="resetForm('ac1')"><i class="fas fa-eraser"></i> Limpiar</button></div>
            </div>
        </div>
    `,
    'AC2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Personal</h2><div class="cursor-pointer" onclick="navigate('AC1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-ac2" class="gallery-container"></div></div></div>`,

    // --- MÓDULO B: PAQUETERÍA ---
    'B1': `
        <div class="screen"><header class="header-app"><div class="header-logo"><span class="header-logo-text">PAQUETERÍA</span></div><div class="cursor-pointer" onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img"></div></header>
            <main class="main-menu-grid">
                <div class="menu-item" onclick="navigate('BA1')"><img src="icons/paquete2.svg" class="custom-icon"><div>Recibir</div></div>
                <div class="menu-item" onclick="navigate('BB1')"><img src="icons/paquete3.svg" class="custom-icon"><div>Entregar</div></div>
            </main>
        </div>
    `,
    'BA1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Recibir Paquete</h2><div class="header-icons"><i class="fas fa-arrow-left fa-lg cursor-pointer" onclick="navigate('B1')"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('BA2')"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Torre</label><input type="text" id="ba1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Departamento</label><input type="text" id="ba1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Destinatario (Residente)</label><input type="text" id="ba1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('ba1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div class="input-group" style="margin-top:15px"><label>Paquetería *</label><input type="text" id="ba1-paqueteria" class="form-input"></div>
                <div class="input-group"><label>Estatus</label><select id="ba1-estatus" class="form-input"><option>Aceptado</option><option>Dañado</option></select></div>
                <div class="input-group"><label>Foto</label>
                    <div class="photo-placeholder" onclick="document.getElementById('cam-ba1').click()">
                        <input type="file" id="cam-ba1" hidden accept="image/*" capture="environment" onchange="previewImg(this, 'ba1')">
                        <div id="prev-ba1" class="photo-preview hidden"></div><span><i class="fas fa-camera"></i> Cámara</span>
                    </div>
                </div>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitRecepcionPaquete()">Guardar</button><button class="btn-clean" onclick="resetForm('ba1')"><i class="fas fa-eraser"></i> Limpiar</button></div>
            </div>
        </div>
    `,
    'BA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Recepción</h2><div class="cursor-pointer" onclick="navigate('BA1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-ba2" class="gallery-container"></div></div></div>`,
    
    'BB1': `
        <div class="screen form-page">
            <div class="form-title-section"><h2 class="form-title">Entregar Paquete</h2><div class="header-icons"><i class="fas fa-arrow-left fa-lg cursor-pointer" onclick="navigate('B1')"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('BB2')"></div></div>
            <div class="form-container">
                <div class="input-group"><label>Quien Recibe *</label><input type="text" id="bb1-nombre" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="bb1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="bb1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Dueño (Residente)</label><input type="text" id="bb1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('bb1')"><i class="fas fa-search"></i> Seleccionar Dueño</button>
                <div class="input-group" style="margin-top:15px"><label>Foto Evidencia</label>
                    <div class="photo-placeholder" onclick="document.getElementById('cam-bb1').click()"><input type="file" id="cam-bb1" hidden accept="image/*" capture="environment" onchange="previewImg(this, 'bb1')"><div id="prev-bb1" class="photo-preview hidden"></div><span><i class="fas fa-camera"></i> Cámara</span></div>
                </div>
                <div class="input-group"><label>Firma</label><div class="signature-wrapper"><canvas id="sig-canvas"></canvas><i class="fas fa-times-circle clear-sig" onclick="clearSignature()"></i></div></div>
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitEntregaPaquete()">Guardar</button><button class="btn-clean" onclick="resetForm('bb1')"><i class="fas fa-eraser"></i> Limpiar</button></div>
            </div>
        </div>
    `,
    'BB2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Entregas</h2><div class="cursor-pointer" onclick="navigate('BB1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-bb2" class="gallery-container"></div></div></div>`,

    // --- MÓDULO D: PROVEEDOR ---
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
                <div style="margin-top: 20px;"><button class="btn-save" onclick="submitProveedor()">Guardar</button><button class="btn-clean" onclick="resetForm('d1')"><i class="fas fa-eraser"></i> Limpiar</button></div>
            </div>
        </div>
    `,
    'D2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Proveedor</h2><div class="cursor-pointer" onclick="navigate('D1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-d2" class="gallery-container"></div></div></div>`,

    // --- MÓDULO E: QR ---
    'E1': `
        <div class="screen"><header class="header-app"><div class="header-logo"><span class="header-logo-text">MÓDULOS QR</span></div><div class="cursor-pointer" onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img"></div></header>
            <main class="main-menu-grid">
                <div class="menu-item" onclick="navigate('EA1')"><img src="icons/residente.svg" class="custom-icon"><div>QR Residente</div></div>
                <div class="menu-item" onclick="navigate('EB1')"><img src="icons/visita.svg" class="custom-icon"><div>QR Visita</div></div>
                <div class="menu-item" onclick="navigate('EC1')"><img src="icons/evento.svg" class="custom-icon"><div>Eventos</div></div>
                <div class="menu-item" onclick="navigate('ED1')"><img src="icons/proveedor.svg" class="custom-icon"><div>Proveedor NIP</div></div>
            </main>
        </div>
    `,
    'EA1': `
        <div class="screen form-page"><div class="form-title-section"><h2 class="form-title">QR Residente</h2><div class="header-icons"><i class="fas fa-arrow-left fa-lg cursor-pointer" onclick="navigate('E1')"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('EA2')"></div></div>
        <div class="form-container"><div class="input-group"><label>DNI / Código *</label><input type="text" id="ea1-dni" class="form-input"></div><button class="btn-primary" onclick="startScan('ea1-dni')"><i class="fas fa-camera"></i> Escanear Código</button>
        <div style="margin-top: 20px;"><button class="btn-save" onclick="submitQRResidente()">Asignar</button><button class="btn-clean" onclick="resetForm('ea1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div></div>`,
    'EA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Historial QR</h2><div class="cursor-pointer" onclick="navigate('EA1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-ea2" class="gallery-container"></div></div></div>`,
    'EB1': `
        <div class="screen form-page"><div class="form-title-section"><h2 class="form-title">QR Visita</h2><div class="header-icons"><i class="fas fa-arrow-left fa-lg cursor-pointer" onclick="navigate('E1')"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('EB2')"></div></div>
        <div class="form-container"><div class="input-group"><label>Código VFS *</label><input type="text" id="eb1-code" class="form-input"></div><button class="btn-primary" onclick="startScan('eb1-code')"><i class="fas fa-camera"></i> Escanear Código</button>
        <div style="margin-top: 20px;"><button class="btn-save" onclick="submitQRVisita()">Asignar</button><button class="btn-clean" onclick="resetForm('eb1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div></div>`,
    'EB2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Historial VFS</h2><div class="cursor-pointer" onclick="navigate('EB1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-eb2" class="gallery-container"></div></div></div>`,
    'EC1': `
        <div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Validar Evento</h2><div class="cursor-pointer" onclick="navigate('E1')"><img src="icons/home.svg" class="header-icon-img"></div></div>
        <div class="form-container"><div class="input-group"><label>Código Evento *</label><input type="text" id="ec1-code" class="form-input"></div><button class="btn-primary" onclick="startScan('ec1-code')"><i class="fas fa-camera"></i> Escanear QR</button>
        <div style="margin-top: 20px;"><button class="btn-save" onclick="submitEvento()">Validar Acceso</button><button class="btn-clean" onclick="resetForm('ec1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div></div>`,
    'ED1': `
        <div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Proveedor NIP</h2><div class="header-icons"><i class="fas fa-arrow-left fa-lg cursor-pointer" onclick="navigate('E1')"></i><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('ED2')"></div></div>
        <div class="form-container"><div class="input-group"><label>NIP / DNI *</label><input type="text" id="ed1-nip" class="form-input"></div>
        <div style="margin-top: 20px;"><button class="btn-save" onclick="submitProveedorNIP()">Validar</button><button class="btn-clean" onclick="resetForm('ed1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div></div>`,
    'ED2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Historial NIP</h2><div class="cursor-pointer" onclick="navigate('ED1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-ed2" class="gallery-container"></div></div></div>`,

    // --- PERSONAL INTERNO ---
    'F1': `
        <div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Personal Interno</h2><div class="header-icons"><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('INICIO')"><img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('F2')"></div></div>
        <div class="form-container"><div class="input-group"><label>ID Personal *</label><input type="text" id="f1-id" class="form-input" placeholder="Escanea gafete"></div>
        <button class="btn-primary" style="background:#333" onclick="startScan('f1-id')"><i class="fas fa-camera"></i> Escanear Gafete</button>
        <div style="display:flex; gap:10px; margin-top:20px;"><button class="btn-save" onclick="submitPersonalInterno('Entrada')">Entrada</button><button class="btn-secondary" style="background:#3860B2" onclick="submitPersonalInterno('Salida')">Salida</button></div><button class="btn-clean" onclick="resetForm('f1')"><i class="fas fa-eraser"></i> Limpiar</button></div></div>`,
    'F2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Bitácora Interna</h2><div class="cursor-pointer" onclick="navigate('F1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-f2" class="gallery-container"></div></div></div>`,

    'SUCCESS': `<div class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column"><i class="fas fa-check-circle fa-5x status-success"></i><h2 class="form-title" style="margin-top:20px">ÉXITO</h2></div>`,
    'FAILURE': `<div class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column"><i class="fas fa-times-circle fa-5x status-error"></i><h2 class="form-title" style="margin-top:20px">DENEGADO</h2></div>`
};

/* =========================================
   3. MOTOR LÓGICO Y FUNCIONES
   ========================================= */
let signaturePad;
let html5QrCode;

// --- A. FUNCIÓN MAESTRA DE CONEXIÓN BACKEND ---
async function callBackend(action, extraData = {}) {
    console.log(`📡 Solicitando backend: ${action}...`);
    
    if (!STATE.session.condominioId) {
        const saved = localStorage.getItem('ravensUser');
        if (saved) {
            STATE.session = JSON.parse(saved);
        } else {
            console.error("❌ No hay sesión activa para realizar peticiones.");
            return null;
        }
    }

    const loadingBtn = document.querySelector('.btn-save') || document.querySelector('.btn-primary');
    if(loadingBtn) { 
        loadingBtn.dataset.originalText = loadingBtn.innerText;
        loadingBtn.disabled = true; 
        loadingBtn.innerText = "Procesando..."; 
    }

    try {
        const payload = {
            action: action, 
            condominio: STATE.session.condominioId,
            usuario: STATE.session.usuario || "guardia_web",
            ...extraData
        };

        const response = await fetch(CONFIG.API_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const result = await response.json();
        console.log("📥 Datos recibidos:", result);
        
        if(loadingBtn) { 
            loadingBtn.disabled = false; 
            loadingBtn.innerText = loadingBtn.dataset.originalText || "Guardar"; 
        }

        if (result && result.success) return result;
        throw new Error(result.message || "Error en el servidor");

    } catch (error) {
        if(loadingBtn) { 
            loadingBtn.disabled = false; 
            loadingBtn.innerText = "Error"; 
            setTimeout(() => { loadingBtn.innerText = loadingBtn.dataset.originalText || "Guardar"; }, 3000);
        }
        console.error("❌ Error de comunicación:", error);
        return null; 
    }
}

// --- B. LOGIN Y CARGA DE RESIDENTES ---
async function doLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('login-error');
    const btn = document.querySelector('.login-box .btn-primary');

    if(!user || !pass) return;

    btn.innerText = "Verificando...";
    btn.disabled = true;
    errorMsg.style.display = "none";

    try {
        const response = await fetch(CONFIG.API_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username: user, password: pass })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            STATE.session.isLoggedIn = true;
            STATE.session.condominioId = data.condominioId || data.data?.condominio; 
            STATE.session.usuario = user;

            if (!STATE.session.condominioId) {
                throw new Error("El usuario no tiene un condominio asignado.");
            }

            localStorage.setItem('ravensUser', JSON.stringify(STATE.session));
            console.log(`✅ Login OK: ${STATE.session.condominioId}`);
            
            await loadResidentesList();
            navigate('INICIO');
        } else {
            throw new Error(data.message || "Credenciales incorrectas.");
        }
    } catch (error) {
        errorMsg.innerText = error.message;
        errorMsg.style.display = "block";
    } finally {
        btn.innerText = "INICIAR SESIÓN";
        btn.disabled = false;
    }
}

async function loadResidentesList() {
    console.log("🔄 Iniciando descarga de lista de residentes...");
    const res = await callBackend('get_history', { tipo_lista: 'USUARIOS_APP' });
    
    if(!res) {
        console.error("❌ No se pudo descargar la lista de residentes.");
        return;
    }

    if(res.data && res.data.length > 0) {
        STATE.colBaserFiltrada = res.data.map(item => {
            const rawTel = item['Número'] || item.Numero || item.Celular || item.Telefono || "";
            let cleanTel = rawTel ? rawTel.toString().replace(/\D/g, '') : "";
            if(cleanTel.startsWith('52') && cleanTel.length > 10) { cleanTel = cleanTel.substring(2); }

            return {
                ...item, 
                Nombre: item.Nombre || item.OData_Nombre || item.Title || "Sin Nombre",
                Torre: item.Torre || item.OData_Torre || "N/A", 
                Departamento: item.Departamento || item.OData_Departamento || "N/A",
                Número: cleanTel, 
                Condominio: item.Condominio || item.OData_Condominio
            };
        }).filter(item => {
            if(!item.Condominio) return false; 
            const dbCond = item.Condominio.toString().toUpperCase().trim();
            const sesCond = STATE.session.condominioId.toString().toUpperCase().trim();
            return dbCond === sesCond;
        });
        console.log(`✅ ${STATE.colBaserFiltrada.length} Residentes cargados.`);
    }
}

function doLogout() {
    STATE.session = { isLoggedIn: false, condominioId: null, usuario: null };
    localStorage.removeItem('ravensUser');
    navigate('LOGIN');
}

function checkSession() {
    const savedSession = localStorage.getItem('ravensUser');
    if (savedSession) {
        STATE.session = JSON.parse(savedSession);
        console.log("🔐 Sesión recuperada para:", STATE.session.usuario);
        loadResidentesList();
        navigate('INICIO');
    } else {
        navigate('LOGIN');
    }
}

// --- C. NAVEGACIÓN Y HISTORIAL ---
function navigate(screen) {
    if(html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => { html5QrCode.clear(); }).catch(err => {});
    }
    const viewport = document.getElementById('viewport');
    if (viewport) {
        viewport.innerHTML = SCREENS[screen] || SCREENS['LOGIN'];
    }
    
    // --- LÓGICA DE RETORNO AUTOMÁTICO AL INICIO ---
    if(screen === 'SUCCESS') {
        setTimeout(() => {
            navigate('INICIO');
        }, 2000); // Espera 2 segundos y regresa al Inicio
    }
    
    if(screen === 'BB1') initSignature();
    
    if(screen.endsWith('2')) {
        const map = {
            'AA2': 'VISITA', 'AC2': 'PERSONAL_DE_SERVICIO', 'BA2': 'PAQUETERIA_RECEPCION',
            'BB2': 'PAQUETERIA_ENTREGA', 'D2': 'PROVEEDOR', 'EA2': 'QR_RESIDENTE',
            'EB2': 'QR_VISITA', 'ED2': 'NIP_PROVEEDOR', 'F2': 'PERSONAL_INTERNO'
        };
        if(map[screen]) loadHistory(map[screen], `gal-${screen.toLowerCase()}`);
    }
}

async function loadHistory(tipo, elementId) {
    const container = document.getElementById(elementId);
    if(!container) return;
    container.innerHTML = '<div style="padding:20px; text-align:center;">Cargando...</div>';
    
    const response = await callBackend('get_history', { tipo_lista: tipo });
    if(response && response.data) {
        renderRemoteGallery(response.data, elementId);
    } else {
        container.innerHTML = '<div style="padding:20px; text-align:center;">Sin datos.</div>';
    }
}

function renderRemoteGallery(data, elementId) {
    const container = document.getElementById(elementId);
    if (!data || data.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#555">Sin registros recientes.</div>`;
        return;
    }

    // --- GUARDAMOS LOS DATOS EN EL ESTADO GLOBAL PARA ACCEDER DESPUÉS ---
    STATE.tempHistory = data;

    container.innerHTML = data.map((item, index) => {
        // 1. Formatear Fecha
        let fechaLegible = "Reciente";
        if (item.Fecha || item.Created) {
            const dateObj = new Date(item.Fecha || item.Created);
            if (!isNaN(dateObj)) {
                fechaLegible = dateObj.toLocaleString('es-MX', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit', hour12: true
                });
            }
        }

        // 2. Definir Título y Subtítulo
        const titulo = item.Nombre || item.Title || item.Visitante || 'Registro';
        const detalle = item.Detalle || item.Torre ? `Torre ${item.Torre} - ${item.Departamento}` : '';
        const estatus = item.Estatus ? `<span style="font-weight:bold; color:#2563eb"> • ${item.Estatus}</span>` : '';

        // 3. Crear el HTML clicable
        return `
        <div class="gallery-item" onclick="showDetails(${index})" style="border-bottom:1px solid #eee; padding: 10px 0; cursor:pointer;">
            <div class="gallery-text">
                <h4 style="margin:0; font-size:1rem; color:#333;">${titulo}</h4>
                <p style="margin:4px 0 0; font-size:0.85rem; color:#666;">
                    ${detalle} ${estatus}
                </p>
                <p style="margin:2px 0 0; font-size:0.75rem; color:#999;">${fechaLegible}</p>
            </div>
            <div style="color:#ccc;"><i class="fas fa-chevron-right"></i></div>
        </div>
    `;
    }).join('');
}

// --- FUNCIÓN NUEVA: MOSTRAR DETALLES EN MODAL ---
function showDetails(index) {
    const item = STATE.tempHistory[index];
    if(!item) return;

    // Generar contenido dinámico
    let content = '<div style="text-align:left;">';
    for (const [key, value] of Object.entries(item)) {
        // Filtros: Ocultar campos técnicos o irrelevantes si quieres
        if(key !== 'odata.type' && key !== 'Foto' && key !== 'FotoBase64' && key !== 'FirmaBase64' && value) {
             content += `<p style="margin:5px 0; font-size:0.9rem;"><strong>${key}:</strong> ${value}</p>`;
        }
    }
    content += '</div>';

    // Manejo de Imágenes (Foto/Firma)
    if(item.Foto || item.FotoBase64) {
         const imgUrl = item.Foto || item.FotoBase64;
         // Si es base64 puro sin prefijo, agregarlo (simple check)
         const src = imgUrl.startsWith('http') || imgUrl.startsWith('data:') ? imgUrl : 'data:image/png;base64,'+imgUrl;
         content += `<div style="text-align:center; margin-top:15px; border-top:1px solid #eee; padding-top:10px;">
                        <p style="font-weight:bold; margin-bottom:5px;">Evidencia:</p>
                        <img src="${src}" style="max-width:100%; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                     </div>`;
    }
    
    // HTML del Modal
    const modalHtml = `
        <div id="detail-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999; display:flex; justify-content:center; align-items:flex-end;">
            <div style="background:white; width:100%; max-width:500px; max-height:85vh; overflow-y:auto; padding:25px; border-radius:20px 20px 0 0; position:relative; animation: slideUp 0.3s ease-out;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                    <h3 style="margin:0; color:#333;">Detalles</h3>
                    <i class="fas fa-times" onclick="document.getElementById('detail-modal').remove()" style="font-size:1.5rem; color:#666; cursor:pointer;"></i>
                </div>
                <div style="color:#444;">${content}</div>
                <button onclick="document.getElementById('detail-modal').remove()" style="margin-top:20px; width:100%; padding:15px; background:#111; color:white; border:none; border-radius:12px; font-weight:bold; font-size:1rem;">Cerrar</button>
            </div>
        </div>
        <style>@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }</style>
    `;
    
    // Inyectar en el body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// --- D. ENVÍO DE FORMULARIOS ---

async function submitAviso(p) {
    const nom = document.getElementById(p+'-nombre').value;
    const motivo = document.getElementById(p+'-motivo')?.value;
    const cargo = document.getElementById(p+'-cargo')?.value; // Capturamos el cargo
    
    if(!nom || !STATE[p]?.residente) { return alert("Faltan datos obligatorios."); }
    
    // Validaciones específicas
    if(p === 'aa1' && !motivo) { return alert("El motivo es obligatorio."); }
    if(p === 'ac1' && !cargo) { return alert("El cargo es obligatorio."); } // Validación nueva

    const data = {
        Nombre: nom,
        Residente: STATE[p].residente,
        Torre: STATE[p].torre,
        Depto: STATE[p].depto,
        Telefono: STATE[p].telefono || "",
        Tipo_Lista: p === 'aa1' ? 'VISITA' : 'ENTRADA',
        Cargo: cargo || "N/A",
        Motivo: motivo || "Servicio",
        Placa: document.getElementById(p+'-placa')?.value || "N/A"
    };

    const res = await callBackend('submit_form', { formulario: 'AVISOG', data: data });
    if (res && res.success) { resetForm(p); navigate('SUCCESS'); }
}

async function submitProveedor() {
    const nom = document.getElementById('d1-nombre').value;
    const asunto = document.getElementById('d1-asunto').value;
    if(!nom || !STATE['d1']?.residente || !asunto) return alert("Faltan datos.");

    const data = {
        Nombre: nom,
        Residente: STATE['d1'].residente,
        Torre: STATE['d1'].torre,
        Depto: STATE['d1'].depto,
        Telefono: STATE['d1']?.telefono || "",
        Tipo_Lista: 'PROVEEDOR',
        Empresa: document.getElementById('d1-empresa').value || "Genérica",
        Asunto: asunto,
        Motivo: asunto
    };

    const res = await callBackend('submit_form', { formulario: 'AVISOG', data: data });
    if (res && res.success) { resetForm('d1'); navigate('SUCCESS'); }
}

async function submitRecepcionPaquete() {
    if(!STATE['ba1']?.residente) return alert("Selecciona un residente.");
    const data = {
        Residente: STATE['ba1'].residente, 
        Torre: STATE['ba1'].torre, 
        Departamento: STATE['ba1'].depto,
        Telefono: STATE['ba1']?.telefono || "", 
        Paqueteria: document.getElementById('ba1-paqueteria').value,
        Estatus: document.getElementById('ba1-estatus').value, 
        FotoBase64: STATE.photos['ba1'] || ""
    };
    const res = await callBackend('submit_form', { formulario: 'PAQUETERIA_RECEPCION', data: data });
    if (res && res.success) { resetForm('ba1'); navigate('SUCCESS'); }
}

async function submitEntregaPaquete() {
    const nom = document.getElementById('bb1-nombre').value;
    if(!nom || !STATE['bb1']?.residente) return alert("Datos incompletos.");
    const data = {
        Recibio: nom, 
        Residente: STATE['bb1'].residente, 
        Torre: STATE['bb1'].torre,
        Departamento: STATE['bb1'].depto, 
        FotoBase64: STATE.photos['bb1'] || "",
        FirmaBase64: signaturePad ? signaturePad.toDataURL() : ""
    };
    const res = await callBackend('submit_form', { formulario: 'PAQUETERIA_ENTREGA', data: data });
    if (res && res.success) { resetForm('bb1'); navigate('SUCCESS'); }
}

async function submitPersonalInterno(accion) {
    const id = document.getElementById('f1-id').value;
    if(!id) return alert("Escanea ID.");
    const res = await callBackend('submit_form', { formulario: 'PERSONAL_INTERNO', data: { ID_Personal: id, Accion: accion } });
    if (res && res.success) { resetForm('f1'); navigate('SUCCESS'); }
}

async function validarAccesoQR(tipo, inputId, formId) {
    const codigo = document.getElementById(inputId).value;
    if(!codigo) return alert("Código vacío.");
    const res = await callBackend('validate_qr', { tipo_validacion: tipo, codigo_leido: codigo });
    if (res && res.autorizado) { resetForm(formId); navigate('SUCCESS'); } else { navigate('FAILURE'); }
}

function submitQRResidente() { validarAccesoQR('RESIDENTE', 'ea1-dni', 'ea1'); }
function submitQRVisita() { validarAccesoQR('VISITA', 'eb1-code', 'eb1'); }
function submitEvento() { validarAccesoQR('EVENTO', 'ec1-code', 'ec1'); }
function submitProveedorNIP() { validarAccesoQR('NIP_PROVEEDOR', 'ed1-nip', 'ed1'); }


// --- F. UTILIDADES UI (MODALES, ORDENAMIENTO Y CÁMARA) ---

function resetForm(prefix) {
    // 1. Limpiar inputs de texto
    document.querySelectorAll(`[id^="${prefix}-"]`).forEach(i => i.value = '');
    
    // 2. Limpiar estado
    STATE[prefix] = {};
    
    // 3. Limpiar fotos y estado UI
    if(STATE.photos[prefix] !== undefined) {
        delete STATE.photos[prefix];
    }
    
    const prev = document.getElementById('prev-' + prefix);
    if(prev) {
        prev.style.backgroundImage = '';
        prev.classList.add('hidden');
        if (prev.nextElementSibling) {
            // RESTAURAR ÍCONO DE CÁMARA
            prev.nextElementSibling.style.display = 'block'; 
            prev.nextElementSibling.innerHTML = '<i class="fas fa-camera"></i> Cámara';
        }
    }
    
    // 4. Limpiar Firma (solo si es entrega de paquete)
    if(prefix === 'bb1') clearSignature();
}

function openResidenteModal(ctx) {
    STATE.currentContext = ctx;
    if(STATE.colBaserFiltrada.length === 0) {
        alert("Lista de residentes vacía o cargando...");
        return;
    }
    const torres = [...new Set(STATE.colBaserFiltrada.map(i => i.Torre))].sort();
    const selTorre = document.getElementById('sel-torre');
    if (selTorre) {
        selTorre.innerHTML = '<option value="">Selecciona...</option>' + torres.map(t => `<option value="${t}">${t}</option>`).join('');
        updateDeptos();
        document.getElementById('modal-selector').classList.add('active');
    }
}

function updateDeptos() {
    const t = document.getElementById('sel-torre').value;
    const deptos = [...new Set(STATE.colBaserFiltrada.filter(i => i.Torre == t).map(i => i.Departamento))].sort();
    const selDepto = document.getElementById('sel-depto');
    if (selDepto) {
        selDepto.innerHTML = '<option value="">Selecciona...</option>' + deptos.map(d => `<option value="${d}">${d}</option>`).join('');
        updateResidentes();
    }
}

function updateResidentes() {
    const t = document.getElementById('sel-torre').value;
    const d = document.getElementById('sel-depto').value;
    const res = STATE.colBaserFiltrada.filter(i => i.Torre == t && i.Departamento == d).map(r => r.Nombre).sort();
    const selNombre = document.getElementById('sel-nombre');
    if (selNombre) {
        selNombre.innerHTML = '<option value="">Selecciona...</option>' + res.map(n => `<option value="${n}">${n}</option>`).join('');
    }
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
                // Mostrar imagen de fondo
                prev.style.backgroundImage = `url(${e.target.result})`; 
                prev.classList.remove('hidden'); 
                
                // MOSTRAR PALOMITA VERDE Y TEXTO DE ÉXITO
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
        }, () => {}
    ).catch(err => {
        alert("Error cámara: " + err);
        document.getElementById('qr-modal').classList.remove('active');
    });
}

function closeQRScanner() {
    if(html5QrCode) html5QrCode.stop().then(() => html5QrCode.clear()).catch(()=>{});
    document.getElementById('qr-modal').classList.remove('active');
}

// ARRANQUE
window.onload = () => {
    console.log("🚀 Ravens Access iniciada.");
    checkSession();
};
