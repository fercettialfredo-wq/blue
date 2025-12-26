/* LÓGICA RAVENS ACCESS */

const API = {
    VISITA: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64",
    RECIBIR: "https://prod-12.mexicocentral.logic.azure.com:443/workflows/974146d8a5cc450aa5687f5710d95e8a/triggers/Recibir_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Paquete_HTTP%2Frun&sv=1.0&sig=fF8pX4HPrHO1wCUY4097ARXMLgQ1gTaQ0zhC28wAtko",
    ENTREGAR: "https://prod-30.mexicocentral.logic.azure.com:443/workflows/58581c1247984f83b83d030640287167/triggers/Entregar_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FEntregar_Paquete_HTTP%2Frun&sv=1.0&sig=Nce4hIr59n137JvNnSheVZN_UX_VGrR-uX-fbISjg9k"
};

let signaturePad;
let photos = { ba1: null };
let qrScanner = null;

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    // Config Canvas Firma (Crítico)
    const canvas = document.getElementById('sig-canvas');
    if (canvas) {
        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);
        }
        window.onresize = resizeCanvas;
        resizeCanvas();
        signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgb(255, 255, 255)' });
    }
});

// NAVEGACIÓN
function nav(screenId) {
    if (qrScanner) { qrScanner.stop().catch(()=>{}); }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'hidden'));
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    
    const target = document.getElementById(screenId);
    target.style.display = 'block';
    setTimeout(() => target.classList.add('active'), 10);
    window.scrollTo(0,0);
}

// CÁMARA
function handlePhoto(input, module) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photos[module] = e.target.result;
            document.getElementById(`${module}-preview`).style.backgroundImage = `url(${e.target.result})`;
            document.getElementById(`${module}-preview`).classList.remove('hidden');
            document.getElementById(`${module}-placeholder`).style.opacity = 0;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// ENVIAR VISITA (AA1)
async function submitAA1() {
    const nombre = document.getElementById('aa1-nombre').value;
    const torre = document.getElementById('aa1-torre').value || "--";
    const depto = document.getElementById('aa1-depto').value || "--";
    const motivo = document.getElementById('aa1-motivo').value;

    if(!nombre || !motivo) return showModal('error', 'Faltan Datos');

    showModal('loading', 'Enviando...');
    const url = `${API.VISITA}&Nombre=${encodeURIComponent(nombre)}&Torre=${encodeURIComponent(torre)}&Depto=${encodeURIComponent(depto)}&Motivo=${encodeURIComponent(motivo)}&Hora=${new Date().toLocaleTimeString()}`;

    try {
        await fetch(url, { method: 'POST' });
        showModal('success', 'Registro Exitoso');
        document.getElementById('form-aa1').reset();
    } catch(e) { showModal('error', 'Error Conexión'); }
}

// RECIBIR PAQUETE (BA1)
async function submitBA1() {
    const nombre = document.getElementById('ba1-nombre').value;
    if(!photos.ba1) return showModal('error', 'Falta Foto');

    showModal('loading', 'Subiendo...');
    const url = `${API.RECIBIR}&Nombre=${encodeURIComponent(nombre)}&Estatus=${encodeURIComponent(document.getElementById('ba1-estatus').value)}`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ foto: photos.ba1 })
        });
        showModal('success', 'Paquete Recibido');
        photos.ba1 = null;
        document.getElementById('form-ba1').reset();
        nav('screen-b1');
    } catch(e) { showModal('error', 'Error al guardar'); }
}

// ENTREGAR PAQUETE (BB1)
async function submitBB1() {
    if(signaturePad.isEmpty()) return showModal('error', 'Falta Firma');
    
    showModal('loading', 'Finalizando...');
    const url = `${API.ENTREGAR}&Nombre=${encodeURIComponent(document.getElementById('bb1-nombre').value)}`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ firma: signaturePad.toDataURL() })
        });
        showModal('success', 'Entrega Completa');
        signaturePad.clear();
        document.getElementById('form-bb1').reset();
        nav('screen-b1');
    } catch(e) { showModal('error', 'Fallo al guardar'); }
}

function clearSignature() { signaturePad.clear(); }

// QR
function startScanner(type) {
    const reader = document.getElementById('qr-reader');
    if(!reader) return;
    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (text) => {
        qrScanner.stop();
        showModal('success', 'Código Leído: ' + text);
    });
}

// MODAL UI
function showModal(type, title, desc = "") {
    const modal = document.getElementById('modal-feedback');
    const icon = document.getElementById('fb-icon');
    const t = document.getElementById('fb-title');
    const d = document.getElementById('fb-desc');
    
    modal.classList.remove('hidden');
    
    if(type === 'loading') {
        icon.innerHTML = '<i class="fas fa-spinner fa-spin" style="color:#007bff"></i>';
        t.innerText = title;
    } else if(type === 'success') {
        icon.innerHTML = '<i class="fas fa-check-circle" style="color:#36b04b"></i>';
        t.innerText = title;
        t.style.color = '#36b04b';
        setTimeout(closeModal, 2500);
    } else {
        icon.innerHTML = '<i class="fas fa-times-circle" style="color:#b80000"></i>';
        t.innerText = title;
        t.style.color = '#b80000';
    }
    d.innerText = desc;
}

function closeModal() { document.getElementById('modal-feedback').classList.add('hidden'); }
