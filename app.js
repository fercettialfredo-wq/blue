/**
 * RAVENS ACCESS - Lógica Completa
 * Reconstrucción de Power Apps a Web
 */

// CONFIGURACIÓN DE ENDPOINTS (Extraídos de tus YAML)
const API = {
    // Visitas [AA1]
    VISITA: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64",
    // Recibir Paquete [BA1]
    RECIBIR: "https://prod-12.mexicocentral.logic.azure.com:443/workflows/974146d8a5cc450aa5687f5710d95e8a/triggers/Recibir_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Paquete_HTTP%2Frun&sv=1.0&sig=fF8pX4HPrHO1wCUY4097ARXMLgQ1gTaQ0zhC28wAtko",
    // Entregar Paquete [BB1]
    ENTREGAR: "https://prod-30.mexicocentral.logic.azure.com:443/workflows/58581c1247984f83b83d030640287167/triggers/Entregar_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FEntregar_Paquete_HTTP%2Frun&sv=1.0&sig=Nce4hIr59n137JvNnSheVZN_UX_VGrR-uX-fbISjg9k"
};

// Variables de Estado
let signaturePad;
let photos = { ba1: null };
let qrScanner = null;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Configurar Canvas de Firma (BB1)
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
    
    // Cargar historial simulado (AA2)
    loadHistoryAA2();
});

// --- NAVEGACIÓN ---
function nav(screenId) {
    if (qrScanner) { qrScanner.stop().catch(()=>{}); qrScanner.clear(); }
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    window.scrollTo(0,0);
}

// --- FOTOS (Cámara Nativa) ---
function handlePhoto(input, module) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photos[module] = e.target.result; // Base64
            const status = document.getElementById(`${module}-foto-status`);
            status.innerText = "✅ FOTO LISTA";
            status.classList.remove('text-zinc-400');
            status.classList.add('text-green-500', 'font-bold');
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// --- MÓDULO A: VISITAS (AA1) ---
async function submitAA1() {
    const nombre = document.getElementById('aa1-nombre').value;
    const torre = document.getElementById('aa1-torre').value;
    const depto = document.getElementById('aa1-depto').value;
    const motivo = document.getElementById('aa1-motivo').value;

    if(!nombre || !motivo) return alert("Faltan datos obligatorios");

    showFeedback('loading', 'Enviando Aviso...');

    // URL Parametrizada (GET)
    const url = `${API.VISITA}&Nombre=${encodeURIComponent(nombre)}&Torre=${encodeURIComponent(torre)}&Depto=${encodeURIComponent(depto)}&Motivo=${encodeURIComponent(motivo)}&Hora=${new Date().toLocaleTimeString()}&Tipo_Lista=VISITA`;

    try {
        await fetch(url, { method: 'POST' });
        showFeedback('success', 'Aviso Enviado', 'Residente notificado por WhatsApp');
        document.getElementById('form-aa1').reset();
    } catch(e) {
        showFeedback('error', 'Error Conexión', 'Intente de nuevo');
    }
}

// --- MÓDULO B: PAQUETERÍA (BA1 - Recibir) ---
async function submitBA1() {
    const nombre = document.getElementById('ba1-nombre').value;
    const estatus = document.getElementById('ba1-estatus').value;
    
    if(!photos.ba1) return alert("⚠️ Falta la foto del paquete");

    showFeedback('loading', 'Registrando...');

    const url = `${API.RECIBIR}&Nombre=${encodeURIComponent(nombre)}&Estatus=${encodeURIComponent(estatus)}&Motivo=${encodeURIComponent(document.getElementById('ba1-paqueteria').value)}`;

    try {
        // Enviamos Foto en Body (POST) para no romper la URL
        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ foto: photos.ba1 }) 
        });
        showFeedback('success', 'Paquete Recibido', 'Registro guardado exitosamente');
        photos.ba1 = null;
        document.getElementById('ba1-foto-status').innerText = "Tocar para FOTO EVIDENCIA";
        document.getElementById('form-ba1').reset();
        nav('screen-b1');
    } catch(e) {
        showFeedback('error', 'Error', 'No se pudo guardar');
    }
}

// --- MÓDULO B: ENTREGA (BB1 - Firma) ---
async function submitBB1() {
    if(signaturePad.isEmpty()) return alert("⚠️ Falta la firma de recibido");
    
    const nombre = document.getElementById('bb1-nombre').value;
    showFeedback('loading', 'Guardando Entrega...');

    const url = `${API.ENTREGAR}&Nombre=${encodeURIComponent(nombre)}`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ firma: signaturePad.toDataURL() }) // Firma Base64
        });
        showFeedback('success', 'Entrega Exitosa', 'Proceso cerrado');
        signaturePad.clear();
        document.getElementById('form-bb1').reset();
        nav('screen-b1');
    } catch(e) {
        showFeedback('error', 'Error', 'Fallo al guardar');
    }
}

function clearSignature() { signaturePad.clear(); }

// --- MÓDULO E: QR SCANNER ---
function startScanner(type) {
    const qrRegion = document.getElementById('qr-reader');
    if(!qrRegion) return;
    
    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            qrScanner.stop();
            // Lógica de validación (Simulada para Web)
            if(type === 'EA1') showFeedback('success', 'Acceso Permitido', 'Residente Validado: ' + decodedText);
            if(type === 'EC1') showFeedback('success', 'Código Válido', 'Pase único aceptado');
        }
    ).catch(err => alert("Error cámara: " + err));
}

// --- UTILIDADES ---
function showFeedback(type, title, desc = "") {
    const modal = document.getElementById('feedback-modal');
    const icon = document.getElementById('fb-icon');
    const t = document.getElementById('fb-title');
    const d = document.getElementById('fb-desc');

    modal.classList.remove('hidden');

    if(type === 'loading') {
        icon.innerHTML = '<i class="fas fa-circle-notch fa-spin text-blue-500"></i>';
        t.style.color = 'white';
    } else if(type === 'success') {
        icon.innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
        t.style.color = '#36b04b';
        setTimeout(closeModal, 3000); // Auto-cerrar 3s
    } else {
        icon.innerHTML = '<i class="fas fa-times-circle text-red-500"></i>';
        t.style.color = '#b80000';
    }
    t.innerText = title;
    d.innerText = desc;
}

function closeModal() {
    document.getElementById('feedback-modal').classList.add('hidden');
}

// Datos de prueba para historial AA2
function loadHistoryAA2() {
    const list = document.getElementById('list-aa2');
    if(!list) return;
    // Esto vendría de tu API en producción
    list.innerHTML = `
        <div class="bg-zinc-900 p-4 rounded-xl border-l-4 border-green-500">
            <div class="flex justify-between"><span class="font-bold">Juan Pérez</span><span class="text-xs text-zinc-500">10:45 AM</span></div>
            <p class="text-xs text-zinc-400 mt-1">Torre A - 101 • Visita Familiar</p>
        </div>
        <div class="bg-zinc-900 p-4 rounded-xl border-l-4 border-red-500">
            <div class="flex justify-between"><span class="font-bold">Uber Eats</span><span class="text-xs text-zinc-500">09:12 AM</span></div>
            <p class="text-xs text-zinc-400 mt-1">Acceso Denegado (Anti-passback)</p>
        </div>
    `;
}
