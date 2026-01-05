/* =========================================
   1. ESTADO GLOBAL & COLECCIONES
   ========================================= */
const STATE = {
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "5512345678" },
        { Torre: "B", Departamento: "205", Nombre: "Ana Gomez", Número: "5587654321" },
        { Torre: "C", Departamento: "PH1", Nombre: "Luis Miguel", Número: "5500000000" }
    ],
    // Colecciones
    colvisitaOrdenada: [],            
    colpersonalaviso: [],              
    colrecibirunpaqueteOrdenada: [], 
    colEntregasLocales: [],           
    colproveedorOrdenada: [],        
    colPersonalServicio: [], 
    colQRResidenteEA1: [],
    colQRResidenteEB1: [], 
    colEventos: [], 
    colResetNip: [],
    
    // Auxiliares
    photos: {}, 
    signature: null,
    currentContext: "",
    targetInputForQR: ""
};

/* =========================================
   2. MOTOR DE PANTALLAS
   ========================================= */
const SCREENS = {
    // --- MENÚ PRINCIPAL ---
    'INICIO': `
        <div class="screen">
            <header class="header-app">
                <div class="header-logo">
                    <img src="icons/logo.svg" class="header-main-logo" alt="Logo">
                    <span class="header-logo-text">RAVENS ACCESS</span>
                </div>
            </header>
            <main class="main-menu-grid">
                <div class="menu-item" onclick="navigate('A1')">
                    <img src="icons/visita.svg" class="custom-icon" alt="Visitas">
                    <div>Visitas</div>
                </div>
                <div class="menu-item" onclick="navigate('B1')">
                    <img src="icons/paquete1.svg" class="custom-icon" alt="Paquetería">
                    <div>Paquetería</div>
                </div>
                <div class="menu-item" onclick="navigate('D1')">
                    <img src="icons/proveedor.svg" class="custom-icon" alt="Proveedor">
                    <div>Proveedor</div>
                </div>
                <div class="menu-item" onclick="navigate('E1')">
                    <img src="icons/qr.svg" class="custom-icon" alt="Módulos QR">
                    <div>Módulos QR</div>
                </div>
                <div class="menu-item full" onclick="navigate('F1')">
                    <img src="icons/servicio.svg" class="custom-icon" alt="Personal Interno">
                    <div>Personal Interno</div>
                </div>
            </main>
        </div>
    `,

    // --- MÓDULO A: VISITAS ---
    'A1': `
        <div class="screen">
            <header class="header-app">
                <div class="header-logo"><span class="header-logo-text">VISITAS</span></div>
                <div class="cursor-pointer" onclick="navigate('INICIO')">
                    <img src="icons/home.svg" class="header-icon-img" alt="Inicio">
                </div>
            </header>
            <main class="main-menu-grid">
                <div class="menu-item" onclick="navigate('AA1')">
                    <img src="icons/visita.svg" class="custom-icon">
                    <div>Registrar Visita</div>
                </div>
                <div class="menu-item" onclick="navigate('AC1')">
                    <img src="icons/servicio2.svg" class="custom-icon">
                    <div>Personal Servicio</div>
                </div>
            </main>
        </div>
    `,
    'AA1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">Nueva Visita</h2>
                <div class="header-icons">
                    <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('A1')">
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
                <div class="input-group"><label>Motivo</label><input type="text" id="aa1-motivo" class="form-input"></div>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitAviso('aa1')">Guardar</button>
                    <button class="btn-clean" onclick="resetForm('aa1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,
    'AA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Visitas</h2><div class="cursor-pointer" onclick="navigate('AA1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-aa2" class="gallery-container"></div><div id="detail-aa2" class="detail-view"></div></div></div>`,

    // --- MÓDULO B: PAQUETERÍA ---
    'B1': `
        <div class="screen">
            <header class="header-app"><div class="header-logo"><span class="header-logo-text">PAQUETERÍA</span></div><div class="cursor-pointer" onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img"></div></header>
            <main class="main-menu-grid">
                <div class="menu-item" onclick="navigate('BA1')">
                    <img src="icons/paquete2.svg" class="custom-icon">
                    <div>Recibir</div>
                </div>
                <div class="menu-item" onclick="navigate('BB1')">
                    <img src="icons/paquete3.svg" class="custom-icon">
                    <div>Entregar</div>
                </div>
            </main>
        </div>
    `,
    'BA1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">Recibir Paquete</h2>
                <div class="header-icons">
                    <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('B1')">
                    <img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('BA2')">
                </div>
            </div>
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
                        <div id="prev-ba1" class="photo-preview hidden"></div>
                        <span><i class="fas fa-camera"></i> Tocar para cámara</span>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitRecepcionPaquete()">Guardar</button>
                    <button class="btn-clean" onclick="resetForm('ba1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,
    'BA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Recepción</h2><div class="cursor-pointer" onclick="navigate('BA1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-ba2" class="gallery-container"></div><div id="detail-ba2" class="detail-view"></div></div></div>`,

    'BB1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">Entregar Paquete</h2>
                <div class="header-icons">
                    <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('B1')">
                    <img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('BB2')">
                </div>
            </div>
            <div class="form-container">
                <div class="input-group"><label>Quien Recibe *</label><input type="text" id="bb1-nombre" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="bb1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="bb1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Dueño (Residente)</label><input type="text" id="bb1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('bb1')"><i class="fas fa-search"></i> Seleccionar Dueño</button>
                <div class="input-group" style="margin-top:15px"><label>Foto Evidencia</label>
                    <div class="photo-placeholder" onclick="document.getElementById('cam-bb1').click()">
                        <input type="file" id="cam-bb1" hidden accept="image/*" capture="environment" onchange="previewImg(this, 'bb1')">
                        <div id="prev-bb1" class="photo-preview hidden"></div>
                        <span><i class="fas fa-camera"></i> Cámara</span>
                    </div>
                </div>
                <div class="input-group"><label>Firma</label>
                    <div class="signature-wrapper"><canvas id="sig-canvas"></canvas><i class="fas fa-times-circle clear-sig" onclick="clearSignature()"></i></div>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitEntregaPaquete()">Guardar</button>
                    <button class="btn-clean" onclick="resetForm('bb1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,
    'BB2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Entregas</h2><div class="cursor-pointer" onclick="navigate('BB1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-bb2" class="gallery-container"></div><div id="detail-bb2" class="detail-view"></div></div></div>`,

    // --- MÓDULO D: PROVEEDOR ---
    'D1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">Proveedor</h2>
                <div class="header-icons">
                    <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('INICIO')">
                    <img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('D2')">
                </div>
            </div>
            <div class="form-container">
                <div class="input-group"><label>Nombre Proveedor *</label><input type="text" id="d1-nombre" class="form-input"></div>
                <div class="input-group"><label>Empresa *</label><input type="text" id="d1-empresa" class="form-input"></div>
                <div class="input-group"><label>Asunto *</label><input type="text" id="d1-asunto" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="d1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="d1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Residente</label><input type="text" id="d1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('d1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitProveedor()">Guardar</button>
                    <button class="btn-clean" onclick="resetForm('d1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,
    'D2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Proveedor</h2><div class="cursor-pointer" onclick="navigate('D1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-d2" class="gallery-container"></div><div id="detail-d2" class="detail-view"></div></div></div>`,

    // --- MÓDULO E: QR ---
    'E1': `
        <div class="screen">
            <header class="header-app"><div class="header-logo"><span class="header-logo-text">MÓDULOS QR</span></div><div class="cursor-pointer" onclick="navigate('INICIO')"><img src="icons/home.svg" class="header-icon-img"></div></header>
            <main class="main-menu-grid">
                <div class="menu-item" onclick="navigate('EA1')">
                    <img src="icons/residente.svg" class="custom-icon">
                    <div>QR Residente</div>
                </div>
                <div class="menu-item" onclick="navigate('EB1')">
                    <img src="icons/visita.svg" class="custom-icon">
                    <div>QR Visita</div>
                </div>
                <div class="menu-item" onclick="navigate('EC1')">
                    <img src="icons/evento.svg" class="custom-icon">
                    <div>Eventos</div>
                </div>
                <div class="menu-item" onclick="navigate('ED1')">
                    <img src="icons/residente.svg" class="custom-icon">
                    <div>Proveedor NIP</div>
                </div>
            </main>
        </div>
    `,
    'EA1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">QR Residente</h2>
                <div class="header-icons">
                    <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('E1')">
                    <img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('EA2')">
                </div>
            </div>
            <div class="form-container">
                <div class="input-group"><label>DNI / Código *</label><input type="text" id="ea1-dni" class="form-input"></div>
                <button class="btn-primary" onclick="startScan('ea1-dni')"><i class="fas fa-camera"></i> Escanear Código</button>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitQRResidente()">Asignar</button>
                    <button class="btn-clean" onclick="resetForm('ea1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,
    'EA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Historial QR</h2><div class="cursor-pointer" onclick="navigate('EA1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-ea2" class="gallery-container"></div><div id="detail-ea2" class="detail-view"></div></div></div>`,
    
    'EB1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">QR Visita</h2>
                <div class="header-icons">
                    <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('E1')">
                    <img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('EB2')">
                </div>
            </div>
            <div class="form-container">
                <div class="input-group"><label>Código VFS *</label><input type="text" id="eb1-code" class="form-input"></div>
                <button class="btn-primary" onclick="startScan('eb1-code')"><i class="fas fa-camera"></i> Escanear Código</button>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitQRVisita()">Asignar</button>
                    <button class="btn-clean" onclick="resetForm('eb1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,
    'EB2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Historial VFS</h2><div class="cursor-pointer" onclick="navigate('EB1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-eb2" class="gallery-container"></div><div id="detail-eb2" class="detail-view"></div></div></div>`,

    // --- MÓDULO EC1: EVENTOS ---
    'EC1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">Validar Evento</h2>
                <div class="cursor-pointer" onclick="navigate('E1')"><img src="icons/home.svg" class="header-icon-img"></div>
            </div>
            <div class="form-container">
                <div class="input-group"><label>Código Evento *</label><input type="text" id="ec1-code" class="form-input"></div>
                <button class="btn-primary" onclick="startScan('ec1-code')"><i class="fas fa-camera"></i> Escanear QR</button>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitEvento()">Validar Acceso</button>
                    <button class="btn-clean" onclick="resetForm('ec1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,

    // --- MÓDULO ED1: PROVEEDOR NIP ---
    'ED1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">Proveedor NIP</h2>
                <div class="header-icons">
                    <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('E1')">
                    <img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('ED2')">
                </div>
            </div>
            <div class="form-container">
                <div class="input-group"><label>NIP / DNI *</label><input type="text" id="ed1-nip" class="form-input"></div>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitProveedorNIP()">Validar</button>
                    <button class="btn-clean" onclick="resetForm('ed1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,
    'ED2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Historial NIP</h2><div class="cursor-pointer" onclick="navigate('ED1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-ed2" class="gallery-container"></div><div id="detail-ed2" class="detail-view"></div></div></div>`,

    // --- PERSONAL INTERNO (F1) ---
    'F1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">Personal Interno</h2>
                <div class="header-icons">
                    <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('INICIO')">
                    <img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('F2')">
                </div>
            </div>
            <div class="form-container">
                <div class="input-group"><label>ID Personal *</label><input type="text" id="f1-id" class="form-input" placeholder="Escanea gafete"></div>
                <button class="btn-primary" style="background:#333" onclick="startScan('f1-id')"><i class="fas fa-camera"></i> Escanear Gafete</button>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn-save" onclick="submitPersonalInterno('Entrada')">Entrada</button>
                    <button class="btn-secondary" style="background:#3860B2" onclick="submitPersonalInterno('Salida')">Salida</button>
                </div>
                <button class="btn-clean" onclick="resetForm('f1')"><i class="fas fa-eraser"></i> Limpiar</button>
            </div>
        </div>
    `,
    'F2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Bitácora Interna</h2><div class="cursor-pointer" onclick="navigate('F1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-f2" class="gallery-container"></div><div id="detail-f2" class="detail-view"></div></div></div>`,

    // --- AC: PERSONAL SERVICIO ---
    'AC1': `
        <div class="screen form-page">
            <div class="form-title-section">
                <h2 class="form-title">Personal Servicio</h2>
                <div class="header-icons">
                    <img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('A1')">
                    <img src="icons/libreta.svg" class="header-icon-img cursor-pointer" onclick="navigate('AC2')">
                </div>
            </div>
            <div class="form-container">
                <div class="input-group"><label>Nombre *</label><input type="text" id="ac1-nombre" class="form-input"></div>
                <div class="input-group"><label>Torre</label><input type="text" id="ac1-torre" class="form-input" readonly></div>
                <div class="input-group"><label>Depto</label><input type="text" id="ac1-depto" class="form-input" readonly></div>
                <div class="input-group"><label>Residente</label><input type="text" id="ac1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('ac1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div class="input-group" style="margin-top:15px"><label>Cargo</label><input type="text" id="ac1-cargo" class="form-input"></div>
                <div style="margin-top: 20px;">
                    <button class="btn-save" onclick="submitAviso('ac1')">Guardar</button>
                    <button class="btn-clean" onclick="resetForm('ac1')"><i class="fas fa-eraser"></i> Limpiar</button>
                </div>
            </div>
        </div>
    `,
    'AC2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Personal</h2><div class="cursor-pointer" onclick="navigate('AC1')"><img src="icons/home.svg" class="header-icon-img"></div></div><div class="form-container"><div id="gal-ac2" class="gallery-container"></div><div id="detail-ac2" class="detail-view"></div></div></div>`,

    'SUCCESS': `<div class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column"><i class="fas fa-check-circle fa-5x status-success"></i><h2 class="form-title" style="margin-top:20px">ÉXITO</h2></div>`,
    'FAILURE': `<div class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column"><i class="fas fa-times-circle fa-5x status-error"></i><h2 class="form-title" style="margin-top:20px">DENEGADO</h2></div>`
};

/* =========================================
   3. MOTOR LÓGICO COMPLETO
   ========================================= */
let signaturePad;
let html5QrCode;

function navigate(screen) {
    if(html5QrCode && html5QrCode.isScanning) {
         html5QrCode.stop().then(() => { html5QrCode.clear(); }).catch(err => {});
    }
    
    document.getElementById('viewport').innerHTML = SCREENS[screen] || SCREENS['INICIO'];
    
    // Inits de lógica por pantalla
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
}

function resetForm(prefix) {
    const inputs = document.querySelectorAll(`[id^="${prefix}-"]`);
    inputs.forEach(input => {
        if(input.tagName === 'SELECT') input.selectedIndex = 0;
        else input.value = '';
    });
    STATE[prefix] = {};
    if(STATE.photos[prefix]) STATE.photos[prefix] = null;
    const prev = document.getElementById(`prev-${prefix}`);
    if(prev) { prev.style.backgroundImage = 'none'; prev.classList.add('hidden'); }
    if(prefix === 'bb1' && signaturePad) signaturePad.clear();
}

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
    STATE[p] = { residente: item.Nombre, torre: item.Torre, depto: item.Departamento };
    if(document.getElementById(`${p}-torre`)) document.getElementById(`${p}-torre`).value = item.Torre;
    if(document.getElementById(`${p}-depto`)) document.getElementById(`${p}-depto`).value = item.Departamento;
    if(document.getElementById(`${p}-res-name`)) document.getElementById(`${p}-res-name`).value = item.Nombre;
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
            prev.style.backgroundImage = `url(${e.target.result})`;
            prev.classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function startScan(targetInputId) {
    STATE.targetInputForQR = targetInputId;
    document.getElementById('qr-modal').classList.add('active');
    html5QrCode = new Html5Qrcode("qr-reader-view");
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (decodedText) => {
        html5QrCode.stop().then(() => html5QrCode.clear());
        document.getElementById('qr-modal').classList.remove('active');
        document.getElementById(STATE.targetInputForQR).value = decodedText;
    }).catch(err => {
        alert("Error cámara: " + err);
        document.getElementById('qr-modal').classList.remove('active');
    });
}

// --- SUBMITS ---
async function submitAviso(p) {
    const nom = document.getElementById(p+'-nombre').value;
    if(!nom || !STATE[p]?.residente) return alert("Faltan datos");
    STATE[p === 'aa1' ? 'colvisitaOrdenada' : 'colpersonalaviso'].unshift({ Nombre: nom, Fecha: new Date().toLocaleString(), Torre: STATE[p].torre });
    resetForm(p); navigate('SUCCESS');
}

async function submitRecepcionPaquete() {
    if(!STATE['ba1']?.residente) return alert("Selecciona residente");
    STATE.colrecibirunpaqueteOrdenada.unshift({ Nombre: STATE['ba1'].residente, Foto: STATE.photos['ba1'], Fechayhora: new Date().toLocaleString() });
    resetForm('ba1'); navigate('SUCCESS');
}

async function submitEntregaPaquete() {
    const nom = document.getElementById('bb1-nombre').value;
    if(!nom || signaturePad.isEmpty()) return alert("Faltan datos");
    STATE.colEntregasLocales.unshift({ Nombre: nom, Fecha: new Date().toLocaleString() });
    resetForm('bb1'); navigate('SUCCESS');
}

function submitQRResidente() {
    const val = document.getElementById('ea1-dni').value;
    if(!val) return alert("Escanea código");
    STATE.colQRResidenteEA1.unshift({ Nombre: "Residente", DNI: val, Fecha: new Date().toLocaleString() });
    resetForm('ea1'); navigate('SUCCESS');
}

function submitQRVisita() {
    const val = document.getElementById('eb1-code').value;
    if(!val) return alert("Escanea código");
    STATE.colQRResidenteEB1.unshift({ Nombre: "Visita", Codigo: val, Fecha: new Date().toLocaleString() });
    resetForm('eb1'); navigate('SUCCESS');
}

function submitPersonalInterno(tipo) {
    const id = document.getElementById('f1-id').value;
    if(!id) return alert("Ingresa ID");
    STATE.colPersonalServicio.unshift({ Nombre: "ID: " + id, Accion: tipo, Fecha: new Date().toLocaleString() });
    resetForm('f1'); navigate('SUCCESS');
}

function renderGallery(colName, elementId) {
    const container = document.getElementById(elementId);
    const collection = STATE[colName];
    if(!collection || collection.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center;">Sin registros.</div>`;
        return;
    }
    container.innerHTML = collection.map((item, idx) => `
        <div class="gallery-item" onclick="showDetail('${colName}', ${idx}, '${elementId.replace('gal','detail')}')">
            <div class="gallery-text">
                <h4>${item.Nombre || 'Registro'}</h4>
                <p>${item.Accion || item.Torre || ''} • ${item.Fecha || item.Fechayhora || ''}</p>
            </div>
            <i class="fas fa-chevron-right"></i>
        </div>
    `).join('');
}

function showDetail(colName, idx, targetId) {
    const item = STATE[colName][idx];
    const target = document.getElementById(targetId);
    target.innerHTML = `<div class="data-row"><span class="data-label">INFO</span><span class="data-value">${item.Nombre}</span></div>
                        <div class="data-row"><span class="data-label">DETALLE</span><span class="data-value">${item.Accion || item.Torre || ''}</span></div>
                        <div class="data-row"><span class="data-label">FECHA</span><span class="data-value">${item.Fecha || item.Fechayhora}</span></div>`;
}

window.onload = () => navigate('INICIO');
