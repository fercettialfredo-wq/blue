/**
 * RAVENS ACCESS - LÓGICA DEFINITIVA
 */

const API = {
    // URLs extraídas de tus archivos YAML
    VISITA: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64",
    RECIBIR: "https://prod-12.mexicocentral.logic.azure.com:443/workflows/974146d8a5cc450aa5687f5710d95e8a/triggers/Recibir_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Paquete_HTTP%2Frun&sv=1.0&sig=fF8pX4HPrHO1wCUY4097ARXMLgQ1gTaQ0zhC28wAtko",
    ENTREGAR: "https://prod-30.mexicocentral.logic.azure.com:443/workflows/58581c1247984f83b83d030640287167/triggers/Entregar_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FEntregar_Paquete_HTTP%2Frun&sv=1.0&sig=Nce4hIr59n137JvNnSheVZN_UX_VGrR-uX-fbISjg9k"
};

let signaturePad;
let photos = { ba1: null };
let qrScanner = null;

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    // Configurar Canvas Firma
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
    
    // Cargar Historial AA2 (Simulado)
    renderHistoryAA2();
});

// NAVEGACIÓN
function nav(screenId) {
    if (qrScanner) { qrScanner.stop().catch(()=>{}); }
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    window.scrollTo(0,0);
}

// MANEJO DE FOTOS
function handlePhoto(input, module) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photos[module] = e.target.result; // Base64
            // Feedback Visual
            document.getElementById(`${module}-foto-status`).innerText = "✅ FOTO LISTA";
            document.getElementById(`${module}-foto-status`).classList.add('text-green-500', 'font-bold');
            // Mostrar Preview
            if(module === 'ba1'){
                const prev = document.getElementById('ba1-preview');
                prev.style.backgroundImage = `url(${e.target.result})`;
                prev.classList.remove('hidden');
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// LOGICA AA1: VISITA
async function submitAA1() {
    const nombre = document.getElementById('aa1-nombre').value;
    const torre = document.getElementById('aa1-torre').value;
    const depto = document.getElementById('aa1-depto').value;
    const motivo = document.getElementById('aa1-motivo').value;

    if(!nombre || !motivo) return alert("Por favor complete Nombre y Motivo");

    showModal('loading', 'Enviando Aviso...');

    // URL PARAMETRIZADA (GET Request)
    const url = `${API.VISITA}&Nombre=${encodeURIComponent(nombre)}&Torre=${encodeURIComponent(torre)}&Depto=${encodeURIComponent(depto)}&Motivo=${encodeURIComponent(motivo)}&Hora=${new Date().toLocaleTimeString()}&Tipo_Lista=VISITA`;

    try {
        await fetch(url, { method: 'POST' }); // Azure a veces prefiere POST aunque sea GET trigger
        showModal('success', 'Aviso Enviado', 'Residente notificado');
        document.getElementById('form-aa1').reset();
    } catch(e) {
        console.error(e);
        showModal('error', 'Error Conexión', 'Intente de nuevo');
    }
}

// LOGICA BA1: RECIBIR PAQUETE
async function submitBA1() {
    const nombre = document.getElementById('ba1-nombre').value;
    const empresa = document.getElementById('ba1-paqueteria').value;
    const estatus = document.getElementById('ba1-estatus').value;

    if(!photos.ba1) return alert("⚠️ Falta la foto del paquete");

    showModal('loading', 'Registrando Paquete...');

    const url = `${API.RECIBIR}&Nombre=${encodeURIComponent(nombre)}&Motivo=${encodeURIComponent(empresa)}&Estatus=${encodeURIComponent(estatus)}`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ foto: photos.ba1 }) 
        });
        showModal('success', 'Paquete Recibido', 'Registro Exitoso');
        photos.ba1 = null;
        document.getElementById('form-ba1').reset();
        nav('screen-b1');
    } catch(e) {
        showModal('error', 'Error', 'No se pudo guardar');
    }
}

// LOGICA BB1: ENTREGAR PAQUETE
async function submitBB1() {
    if(signaturePad.isEmpty()) return alert("⚠️ Falta la firma");
    
    const nombre = document.getElementById('bb1-nombre').value;
    showModal('loading', 'Guardando Entrega...');

    const url = `${API.ENTREGAR}&Nombre=${encodeURIComponent(nombre)}`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ firma: signaturePad.toDataURL() })
        });
        showModal('success', 'Entrega Exitosa', 'Proceso Finalizado');
        signaturePad.clear();
        document.getElementById('form-bb1').reset();
        nav('screen-b1');
    } catch(e) {
        showModal('error', 'Error', 'Fallo al guardar');
    }
}

function clearSignature() { signaturePad.clear(); }

// LOGICA QR (EA1 / EC1)
function startScanner(type) {
    const readerDiv = document.getElementById('qr-reader');
    if(!readerDiv) return;
    
    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            qrScanner.stop();
            // Lógica simulada de validación
            if(type === 'EA1') showModal('success', 'Acceso Residente', `QR: ${decodedText}`);
            if(type === 'EC1') showModal('success', 'Código Válido', 'Pase único aceptado');
        }
    ).catch(err => alert("Active la cámara para escanear"));
}

// UI HELPERS
function showModal(type, title, desc = "") {
    const modal = document.getElementById('modal-feedback');
    const icon = document.getElementById('fb-icon');
    const t = document.getElementById('fb-title');
    const d = document.getElementById('fb-desc');

    modal.classList.remove('hidden');

    if(type === 'loading') {
        icon.innerHTML = '<i class="fas fa-spinner fa-spin text-blue-500"></i>';
        t.style.color = 'white';
    } else if(type === 'success') {
        icon.innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
        t.style.color = '#36b04b';
        setTimeout(closeModal, 3000);
    } else {
        icon.innerHTML = '<i class="fas fa-times-circle text-red-500"></i>';
        t.style.color = '#b80000';
    }
    t.innerText = title;
    d.innerText = desc;
}

function closeModal() {
    document.getElementById('modal-feedback').classList.add('hidden');
}

// RENDERIZADO DE HISTORIAL (AA2)
function renderHistoryAA2() {
    const list = document.getElementById('list-aa2');
    // Datos falsos para que no se vea vacío
    const data = [
        { nombre: "Juan Pérez", torre: "A-101", hora: "10:45 AM", tipo: "Visita", status: "ok" },
        { nombre: "Uber Eats", torre: "B-205", hora: "11:20 AM", tipo: "Paquete", status: "ok" },
        { nombre: "María G.", torre: "C-PH", hora: "12:00 PM", tipo: "Denegado", status: "error" }
    ];

    list.innerHTML = data.map(item => `
        <div class="bg-zinc-900 p-4 rounded-xl border-l-4 ${item.status === 'ok' ? 'border-green-500' : 'border-red-500'}">
            <div class="flex justify-between items-center">
                <span class="font-bold text-sm">${item.nombre}</span>
                <span class="text-[10px] text-zinc-500 font-bold">${item.hora}</span>
            </div>
            <p class="text-xs text-zinc-400 mt-1">${item.torre} • ${item.tipo}</p>
        </div>
    `).join('');
}
