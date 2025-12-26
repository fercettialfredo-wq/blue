// URL de tu Trigger HTTP de Power Automate / Logic Apps
const AZURE_API_URL = "TU_URL_AQUI"; 

let html5QrCode;

// Configuración del escáner
const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

function startScanner() {
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, 
        qrConfig,
        onScanSuccess
    ).catch(err => {
        console.error("Error al iniciar cámara: ", err);
        document.getElementById('status-msg').innerText = "Error: No se pudo acceder a la cámara";
    });
}

// Función que se ejecuta cuando escanea algo
async function onScanSuccess(decodedText) {
    if (decodedText) {
        // Pausamos el escaneo para no procesar el mismo código 10 veces
        html5QrCode.pause();
        await procesarAcceso(decodedText);
    }
}

async function procesarAcceso(dni) {
    showToast(`Validando DNI: ${dni}...`);
    
    try {
        const response = await fetch(AZURE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                dni: dni,
                timestamp: new Date().toISOString(),
                dispositivo: "WebScanner_Guardia"
            })
        });

        const data = await response.json();
        
        // Manejo de Respuesta (Lógica de Power Apps LookUp/Patch)
        if (data.autorizado) {
            showResult('success', data);
        } else {
            // Aquí entra el Anti-passback o acceso denegado
            showResult('denied', data);
        }
    } catch (error) {
        console.error("Error API:", error);
        showResult('error', { mensaje: "Error de conexión con el servidor" });
    }
}

// Interfaz de resultados
function showResult(type, data) {
    const modal = document.getElementById('result-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const icon = document.getElementById('modal-icon');
    const details = document.getElementById('user-details');

    if (type === 'success') {
        icon.innerHTML = '✅';
        icon.className = "text-green-500 text-6xl mb-4";
        title.innerText = "ACCESO PERMITIDO";
        title.className = "text-2xl font-bold text-green-500 mb-2";
        desc.innerText = data.mensaje || "Registro actualizado correctamente.";
        
        // Mostrar detalles
        details.classList.remove('hidden');
        document.getElementById('res-nombre').innerText = data.nombre || "N/A";
        document.getElementById('res-tipo').innerText = data.tipo || "Visitante";
        document.getElementById('res-dni').innerText = data.dni || "";
    } else if (type === 'denied') {
        icon.innerHTML = '❌';
        icon.className = "text-red-500 text-6xl mb-4";
        title.innerText = "ACCESO DENEGADO";
        title.className = "text-2xl font-bold text-red-500 mb-2";
        desc.innerText = data.mensaje || "El usuario ya está dentro (Anti-passback) o no existe.";
        details.classList.add('hidden');
    } else {
        icon.innerHTML = '⚠️';
        title.innerText = "ERROR DE SISTEMA";
        desc.innerText = data.mensaje;
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('result-modal').classList.add('hidden');
    document.getElementById('manual-dni').value = "";
    // Reanudar el escáner
    html5QrCode.resume();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
}

function validarManual() {
    const dni = document.getElementById('manual-dni').value;
    if (dni) procesarAcceso(dni);
}

// Iniciar al cargar
window.addEventListener('DOMContentLoaded', startScanner);
