/**
 * RAVENS ACCESS WEB - LOGIC CORE
 * Basado en archivos .pa.yaml de Power Apps
 */

// 1. CONFIGURACIÓN DE ENDPOINTS (Extraídos de tus YAML)
const API = {
    // URL del Trigger en AA1.pa.yaml
    VISITA: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Aviso_GET%2Frun&sv=1.0&sig=JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64",
    
    // URL del Trigger en BA1.pa.yaml
    RECIBIR: "https://prod-12.mexicocentral.logic.azure.com:443/workflows/974146d8a5cc450aa5687f5710d95e8a/triggers/Recibir_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FRecibir_Paquete_HTTP%2Frun&sv=1.0&sig=fF8pX4HPrHO1wCUY4097ARXMLgQ1gTaQ0zhC28wAtko",
    
    // URL del Trigger en BB1.pa.yaml
    ENTREGAR: "https://prod-30.mexicocentral.logic.azure.com:443/workflows/58581c1247984f83b83d030640287167/triggers/Entregar_Paquete_HTTP/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FEntregar_Paquete_HTTP%2Frun&sv=1.0&sig=Nce4hIr59n137JvNnSheVZN_UX_VGrR-uX-fbISjg9k"
};

// Variables Globales
let signaturePad = null;
let html5QrCode = null;
let currentPhotoBase64 = null;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Configurar Canvas de Firma para BB1
    const canvas = document.getElementById('sig-canvas');
    if(canvas) {
        signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgb(255, 255, 255)' });
        // Ajuste de tamaño para retina
        resizeCanvas(canvas);
    }
});

function resizeCanvas(canvas) {
    const ratio =  Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
}

// --- NAVEGACIÓN (Función Navigate de Power Apps) ---
function nav(screenId) {
    // Detener cámara si está activa
    if(html5QrCode && html5QrCode.isScanning) { 
        html5QrCode.stop().then(() => html5QrCode.clear()); 
    }

    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    
    // Mostrar la deseada
    const target = document.getElementById(screenId);
    if(target) {
        target.classList.remove('hidden');
        window.scrollTo(0,0);
    }
}

// --- LÓGICA MÓDULO A: VISITAS (AA1) ---
async function submitAA1() {
    // 1. Recolectar datos
    const nombre = document.getElementById('aa1-nombre').value;
    const torre = document.getElementById('aa1-torre').value;
    const depto = document.getElementById('aa1-depto').value;
    const motivo = document.getElementById('aa1-motivo').value;
    // Residente seleccionado
    const nomRes = document.getElementById('aa1-residente-nombre').value; 
    const telRes = document.getElementById('aa1-residente-tel').value; // Simularemos este dato

    if(!nombre || !motivo) return alert("Faltan datos obligatorios");

    showModal('loading', 'Enviando Aviso...', 'Por favor espere');

    // 2. Construir URL (Igual que en tu YAML AA1)
    const url = `${API.VISITA}&Nombre=${encodeURIComponent(nombre)}&Torre=${encodeURIComponent(torre)}&Depto=${encodeURIComponent(depto)}&Motivo=${encodeURIComponent(motivo)}&Telefono=${encodeURIComponent(telRes)}&Tipo_Lista=VISITA`;

    try {
        // 3. Enviar a Azure Logic App
        const res = await fetch(url, { method: 'POST' }); // Usualmente POST o GET según config del trigger
        
        if(res.ok) {
            showModal('success', 'Aviso Enviado', 'El residente ha sido notificado por WhatsApp.');
            document.getElementById('form-aa1').reset();
        } else {
            throw new Error("Error Azure");
        }
    } catch (err) {
        console.error(err);
        showModal('error', 'Error de Conexión', 'Intente nuevamente.');
    }
}

// Simulación de búsqueda de Residente (Power Apps LookUp)
function searchResident(prefix) {
    const t = document.getElementById(`${prefix}-torre`).value;
    const d = document.getElementById(`${prefix}-depto`).value;
    
    if(t && d) {
        // Aquí conectarías con tu lista de usuarios real. Por ahora simulamos éxito:
        document.getElementById(`${prefix}-residente-nombre`).value = `Residente ${t}-${d}`;
        document.getElementById(`${prefix}-residente-tel`).value = "+525512345678"; // Sin el '1' como pediste
        alert(`✅ Residente encontrado para Torre ${t} Depto ${d}`);
    } else {
        alert("Ingrese Torre y Depto para buscar");
    }
}

// --- LÓGICA MÓDULO B: PAQUETERÍA (BA1 - Recibir) ---
async function submitBA1() {
    const nombre = document.getElementById('ba1-nombre').value;
    const empresa = document.getElementById('ba1-paqueteria').value;
    const estatus = document.getElementById('ba1-estatus').value;
    
    // Validar Foto
    if(!currentPhotoBase64) return alert("⚠️ Debe tomar una foto del paquete");

    showModal('loading', 'Registrando...', 'Subiendo evidencia');

    // Construir Payload para Azure (BA1 Trigger)
    // Nota: Como es JSON grande por la foto, usamos POST body en lugar de URL params si tu Logic App lo permite.
    // Si tu Logic App BA1 espera todo en URL (GET), la foto base64 romperá el límite.
    // Asumiré que envías metadatos en URL y guardas foto aparte, o usas POST.
    
    const url = `${API.RECIBIR}&Nombre=${encodeURIComponent(nombre)}&Motivo=${encodeURIComponent(empresa)}&Estatus=${encodeURIComponent(estatus)}`;

    try {
        await fetch(url, { 
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ foto: currentPhotoBase64 }) // Enviamos la foto en el cuerpo
        });
        showModal('success', 'Paquete Recibido', 'Notificación enviada al residente.');
        nav('screen-b1');
    } catch (e) {
        showModal('error', 'Error', 'No se pudo registrar.');
    }
}

// --- LÓGICA MÓDULO B: ENTREGA (BB1) ---
async function submitBB1() {
    if(signaturePad.isEmpty()) return alert("⚠️ Se requiere firma de recibido");
    
    const nombre = document.getElementById('bb1-nombre').value;
    const firmaBase64 = signaturePad.toDataURL(); // Imagen firma

    showModal('loading', 'Entregando...', 'Guardando firma digital');

    const url = `${API.ENTREGAR}&Nombre=${encodeURIComponent(nombre)}`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ firma: firmaBase64 })
        });
        showModal('success', 'Entrega Exitosa', 'Proceso cerrado correctamente.');
        signaturePad.clear();
        nav('screen-b1');
    } catch (e) {
        showModal('error', 'Error', 'Fallo al guardar firma.');
    }
}

function clearSignature() {
    signaturePad.clear();
}

// --- UTILIDADES: CÁMARA ---
// Simulación simple de cámara con input file para web móvil (más estable que getUserMedia directo sin HTTPS configurado)
// Si prefieres cámara en vivo, se usa video stream. Aquí uso el enfoque híbrido.
function startCamera(prefix) {
    // Crear input invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Usa cámara trasera
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            currentPhotoBase64 = event.target.result;
            // Mostrar preview
            const container = document.getElementById(`cam-preview-${prefix}`);
            if(container) {
                container.innerHTML = `<img src="${currentPhotoBase64}" class="h-full object-contain">`;
                container.classList.remove('bg-black');
                container.classList.add('bg-zinc-800');
            }
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// --- UTILIDADES: MODAL FEEDBACK ---
function showModal(type, title, desc) {
    const modal = document.getElementById('modal-feedback');
    const icon = document.getElementById('fb-icon');
    const t = document.getElementById('fb-title');
    const d = document.getElementById('fb-desc');

    modal.classList.remove('hidden');

    if(type === 'loading') {
        icon.innerHTML = '<i class="fas fa-circle-notch fa-spin text-blue-500"></i>';
        t.innerText = title;
        t.style.color = 'white';
    } else if (type === 'success') {
        icon.innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
        t.innerText = title;
        t.style.color = '#36b04b';
        // Auto cerrar como en EAV.pa.yaml
        setTimeout(() => closeModal(), 3000);
    } else {
        icon.innerHTML = '<i class="fas fa-times-circle text-red-500"></i>';
        t.innerText = title;
        t.style.color = '#b80000';
    }
    d.innerText = desc;
}

function closeModal() {
    document.getElementById('modal-feedback').classList.add('hidden');
}

// --- LÓGICA QR (Módulo E) ---
function initQR(type) {
    alert("Iniciando escáner para módulo: " + type);
    // Aquí iría la lógica de html5-qrcode si estuvieras en HTTPS
    // Por seguridad de navegador, la cámara web requiere HTTPS o localhost.
}
