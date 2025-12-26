/** * RAVENS ACCESS - CORE LOGIC
 * Replicando lógica de Power Apps
 */

const ENDPOINTS = {
    VISITA: "https://prod-13.mexicocentral.logic.azure.com:443/workflows/b9c72600a3b64e03b0e34f8ee930ca61/triggers/Recibir_Aviso_GET/paths/invoke",
    RECIBIR: "https://prod-12.mexicocentral.logic.azure.com:443/workflows/974146d8a5cc450aa5687f5710d95e8a/triggers/Recibir_Paquete_HTTP/paths/invoke",
    ENTREGAR: "https://prod-30.mexicocentral.logic.azure.com:443/workflows/58581c1247984f83b83d030640287167/triggers/Entregar_Paquete_HTTP/paths/invoke"
};

// Navegación (Equivalente a Navigate() en YAML)
function nav(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    window.scrollTo(0,0);
}

// Disparador AA1 (Visita)
async function submitAA1() {
    const form = document.getElementById('form-aa1');
    const data = new FormData(form);
    
    // Parámetros exactos del EncodeUrl en AA1.pa.yaml
    const params = new URLSearchParams({
        'api-version': '2016-10-01',
        'sig': 'JsqhAlXVbSjZ5QY-cXMGaAoX5ANtjjAoVM38gGYAG64', // Firma del trigger
        'Nombre': data.get('nombre'),
        'Torre': document.getElementById('aa1-torre').value,
        'Depto': document.getElementById('aa1-depto').value,
        'Motivo': data.get('motivo'),
        'Hora': new Date().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'}),
        'Tipo_Lista': 'VISITA'
    });

    try {
        await fetch(`${ENDPOINTS.VISITA}?${params.toString()}`);
        showResult('success', 'Aviso Enviado', 'El residente ha sido notificado.');
    } catch (e) {
        showResult('error', 'Error de Red', 'No se pudo conectar con el servidor.');
    }
}

// Lógica de Foto y Firma para BA1/BB1
function takePhoto(module) {
    // Aquí se integra la captura de la cámara (varfototomada en YAML)
    console.log(`Capturando para ${module}`);
}

// Pantallas de Éxito (Mapeo de EA1, EAV, EBV, FV)
function showResult(type, title, desc) {
    const overlay = document.getElementById('result-overlay');
    const icon = document.getElementById('res-icon');
    
    icon.innerHTML = type === 'success' ? '✅' : '❌';
    icon.style.color = type === 'success' ? '#36b04b' : '#b80000';
    document.getElementById('res-title').innerText = title;
    document.getElementById('res-desc').innerText = desc;
    
    overlay.classList.remove('hidden');
    
    // Auto-cierre de 3 segundos (Como tus Timers en YAML)
    if(type === 'success') setTimeout(closeResult, 3000);
}

function closeResult() {
    document.getElementById('result-overlay').classList.add('hidden');
    nav('screen-inicio');
}
