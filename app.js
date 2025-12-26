// URL de tu Power Automate / Logic App (Trigger HTTP)
const API_URL = "TU_URL_DE_AZURE_LOGIC_APP_AQUI";

function navigateTo(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    // Mostrar la seleccionada
    document.getElementById(screenId).classList.remove('hidden');
    
    // Si entramos a Servicio, activamos la cámara
    if (screenId === 'screen-service') {
        startScanner('service-reader');
    }
}

// Envío de Formulario (Equivalente al SubmitForm / Patch de Power Apps)
async function submitAppForm(tipoAcceso) {
    const form = document.getElementById('visitor-form');
    const formData = new FormData(form);
    const payload = {
        tipo: tipoAcceso,
        nombre: formData.get('nombre'),
        dni: formData.get('dni'),
        placa: formData.get('placa'),
        motivo: formData.get('motivo'),
        timestamp: new Date().toISOString()
    };

    if (!payload.dni || !payload.nombre) {
        showToast("Por favor complete los campos obligatorios");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        showModal(data.status === 'OK' ? 'success' : 'denied', data.mensaje);
    } catch (e) {
        showModal('error', 'Error de conexión con el servidor');
    }
}

// Configuración del Escáner QR
let html5QrCode;
function startScanner(elementId) {
    if (html5QrCode) html5QrCode.stop();
    html5QrCode = new Html5Qrcode(elementId);
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            html5QrCode.pause();
            document.getElementById('service-dni').value = decodedText;
            validarAccesoPersonal();
        }
    );
}

function showModal(type, msg) {
    const modal = document.getElementById('modal-result');
    const icon = document.getElementById('res-icon');
    const title = document.getElementById('res-title');
    
    if (type === 'success') {
        icon.innerHTML = "✅";
        title.innerText = "REGISTRO EXITOSO";
        title.style.color = "#eab308";
    } else {
        icon.innerHTML = "❌";
        title.innerText = "ACCESO DENEGADO";
        title.style.color = "#ef4444";
    }
    
    document.getElementById('res-msg').innerText = msg;
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-result').classList.add('hidden');
    navigateTo('screen-menu');
}

function showToast(m) { alert(m); } // Simple para pruebas
