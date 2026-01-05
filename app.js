/* =========================================
   1. ESTADO GLOBAL & COLECCIONES
   ========================================= */
const STATE = {
    colBaserFiltrada: [
        { Torre: "A", Departamento: "101", Nombre: "Juan Perez", Número: "5512345678" },
        { Torre: "B", Departamento: "205", Nombre: "Ana Gomez", Número: "5587654321" },
        { Torre: "C", Departamento: "PH1", Nombre: "Luis Miguel", Número: "5500000000" }
    ],
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
    photos: {}, 
    signature: null,
    currentContext: "",
    targetInputForQR: ""
};

/* =========================================
   2. MOTOR DE PANTALLAS
   ========================================= */
const SCREENS = {
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
                    <img src="icons/visita.svg" class="custom-icon">
                    <div>Visitas</div>
                </div>
                <div class="menu-item" onclick="navigate('B1')">
                    <img src="icons/paquete1.svg" class="custom-icon">
                    <div>Paquetería</div>
                </div>
                <div class="menu-item" onclick="navigate('D1')">
                    <img src="icons/proveedor.svg" class="custom-icon">
                    <div>Proveedor</div>
                </div>
                <div class="menu-item" onclick="navigate('E1')">
                    <img src="icons/qr.svg" class="custom-icon">
                    <div>Módulos QR</div>
                </div>
                <div class="menu-item full" onclick="navigate('F1')">
                    <img src="icons/servicio.svg" class="custom-icon">
                    <div>Personal Interno</div>
                </div>
            </main>
        </div>
    `,

    'A1': `
        <div class="screen">
            <header class="header-app">
                <div class="header-logo"><span class="header-logo-text">VISITAS</span></div>
                <div class="cursor-pointer" onclick="navigate('INICIO')">
                    <img src="icons/home.svg" class="header-icon-img">
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

    'AA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Visitas</h2><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('AA1')"></div><div class="form-container"><div id="gal-aa2" class="gallery-container"></div><div id="detail-aa2" class="detail-view"></div></div></div>`,

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
                <div class="input-group"><label>Destinatario</label><input type="text" id="ba1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('ba1')"><i class="fas fa-search"></i> Seleccionar Residente</button>
                <div class="input-group" style="margin-top:15px"><label>Paquetería *</label><input type="text" id="ba1-paqueteria" class="form-input"></div>
                <div class="input-group"><label>Foto</label>
                    <div class="photo-placeholder" onclick="document.getElementById('cam-ba1').click()">
                        <input type="file" id="cam-ba1" hidden accept="image/*" capture="environment" onchange="previewImg(this, 'ba1')">
                        <div id="prev-ba1" class="photo-preview hidden"></div>
                        <span><i class="fas fa-camera"></i> Cámara</span>
                    </div>
                </div>
                <button class="btn-save" onclick="submitRecepcionPaquete()">Guardar</button>
            </div>
        </div>
    `,

    'BA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Recepción</h2><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('BA1')"></div><div class="form-container"><div id="gal-ba2" class="gallery-container"></div><div id="detail-ba2" class="detail-view"></div></div></div>`,

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
                <div class="input-group"><label>Residente</label><input type="text" id="bb1-res-name" class="form-input" readonly></div>
                <button class="btn-primary" onclick="openResidenteModal('bb1')">Buscar</button>
                <div class="input-group"><label>Firma</label>
                    <div class="signature-wrapper"><canvas id="sig-canvas"></canvas><i class="fas fa-times-circle clear-sig" onclick="clearSignature()"></i></div>
                </div>
                <button class="btn-save" onclick="submitEntregaPaquete()">Confirmar Entrega</button>
            </div>
        </div>
    `,

    'BB2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Entregas</h2><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('BB1')"></div><div class="form-container"><div id="gal-bb2" class="gallery-container"></div><div id="detail-bb2" class="detail-view"></div></div></div>`,

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
                <div class="input-group"><label>Proveedor *</label><input type="text" id="d1-nombre" class="form-input"></div>
                <div class="input-group"><label>Empresa *</label><input type="text" id="d1-empresa" class="form-input"></div>
                <button class="btn-primary" onclick="openResidenteModal('d1')">Residente</button>
                <button class="btn-save" onclick="submitProveedor()">Guardar</button>
            </div>
        </div>
    `,

    'D2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Libreta Proveedor</h2><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('D1')"></div><div class="form-container"><div id="gal-d2" class="gallery-container"></div><div id="detail-d2" class="detail-view"></div></div></div>`,

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
                <input type="text" id="ea1-dni" class="form-input" placeholder="DNI / Código">
                <button class="btn-primary" onclick="startScan('ea1-dni')">Escanear</button>
                <button class="btn-save" onclick="submitQRResidente()">Asignar</button>
            </div>
        </div>
    `,

    'EA2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Historial QR</h2><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('EA1')"></div><div class="form-container"><div id="gal-ea2" class="gallery-container"></div><div id="detail-ea2" class="detail-view"></div></div></div>`,

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
                <input type="text" id="f1-id" class="form-input" placeholder="ID Personal">
                <button class="btn-save" onclick="submitPersonalInterno('Entrada')">Entrada</button>
                <button class="btn-secondary" onclick="submitPersonalInterno('Salida')">Salida</button>
            </div>
        </div>
    `,

    'F2': `<div class="screen form-page"><div class="form-title-section"><h2 class="form-title">Bitácora Interna</h2><img src="icons/home.svg" class="header-icon-img cursor-pointer" onclick="navigate('F1')"></div><div class="form-container"><div id="gal-f2" class="gallery-container"></div><div id="detail-f2" class="detail-view"></div></div></div>`,

    'SUCCESS': `<div class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column"><i class="fas fa-check-circle fa-5x status-success"></i><h2 class="form-title" style="margin-top:20px">ÉXITO</h2></div>`,
    'FAILURE': `<div class="screen" style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column"><i class="fas fa-times-circle fa-5x status-error"></i><h2 class="form-title" style="margin-top:20px">DENEGADO</h2></div>`
};

/* --- Lógica Auxiliar --- */
let signaturePad;
let html5QrCode;

function navigate(screen) {
    if(html5QrCode && html5QrCode.isScanning) {
         html5QrCode.stop().then(() => { html5QrCode.clear(); }).catch(err => {});
    }
    document.getElementById('viewport').innerHTML = SCREENS[screen] || SCREENS['INICIO'];
    if(screen === 'BB1') initSignature();
    if(screen.includes('2')) { /* Renderizado de galerías según pantalla */ }
    if(screen === 'SUCCESS' || screen === 'FAILURE') setTimeout(() => navigate('INICIO'), 2000);
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

window.onload = () => navigate('INICIO');
