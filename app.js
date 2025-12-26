/** * LÓGICA DE RAVENS ACCESS
 * Gestión de estados: DENTRO / FUERA
 */

const CONFIG = {
    API_URL: "TU_URL_DE_POWER_AUTOMATE_AQUI", // El HTTP Trigger
    ESTADOS: { ENTRADA: "DENTRO", SALIDA: "FUERA" }
};

let scanner = null;

// --- NAVEGACIÓN ---
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');

    if (screenId === 'screen-scan') {
        initScanner();
    } else if (scanner) {
        scanner.stop();
    }
}

// --- ESCÁNER ---
function initScanner() {
    scanner = new Html5Qrcode("reader");
    scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            scanner.pause();
            validarDNI(decodedText);
        }
    ).catch(err => showToast("Error de cámara"));
}

// --- LÓGICA DE NEGOCIO (Equivalente a tus Patch/LookUp) ---
async function validarDNI(dniFromScanner) {
    const dni = dniFromScanner || document.getElementById('dni-input').value;
    if (!dni) return showToast("Ingrese un DNI");

    showToast("Validando en base de datos...");

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                dni: dni,
                accion: "VALIDAR_ACCESO",
                timestamp: new Date().toISOString()
            }),
            headers: {'Content-Type': 'application/json'}
        });

        const result = await response.json();
        renderResult(result);

    } catch (error) {
        console.error(error);
        showToast("Error de conexión");
        navigateTo('screen-menu');
    }
}

function renderResult(data) {
    const card = document.getElementById('result-card');
    const icon = document.getElementById('res-icon');
    const title = document.getElementById('res-title');
    const desc = document.getElementById('res-desc');

    navigateTo('screen-result');

    // Lógica Anti-passback basada en la respuesta de tu Logic App
    if (data.success) {
        icon.innerHTML = "✅";
        card.style.borderColor = "#16a34a"; // Verde
        title.innerText = "ACCESO AUTORIZADO";
        title.className = "text-3xl font-bold mb-2 text-green-500";
        desc.innerText = `Bienvenido, registro de ${data.tipo} exitoso.`;
    } else {
        icon.innerHTML = "❌";
        card.style.borderColor = "#dc2626"; // Rojo
        title.innerText = "ACCESO DENEGADO";
        title.className = "text-3xl font-bold mb-2 text-red-500";
        desc.innerText = data.error || "El usuario ya se encuentra dentro o no existe.";
    }

    // Llenar datos del usuario
    document.getElementById('data-nombre').innerText = data.nombre || "Desconocido";
    document.getElementById('data-status').innerText = data.estatus || "SINFÍN";
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
}
