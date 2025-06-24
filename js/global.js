// -------------------- CONFIGURACIÓN DE API --------------------

function detectarAmbiente() {
  const origin = window.location.origin;

  if (origin.includes('onrender.com')) return 'prod';
  if (origin.includes('nuvexa-test.local')) return 'test';
  if (origin.includes('nuvexa.local')) return 'dev';

  return 'dev'; // fallback (podés cambiarlo a 'test' si preferís)
}

const AMBIENTE = detectarAmbiente();

const API_BASES = {
  dev: {
    personal: 'http://nuvexa.local:30123/api',
    vehiculos: 'http://nuvexa.local:30124/api'
  },
  test: {
    personal: 'http://nuvexa-test.local:30123/api',
    vehiculos: 'http://nuvexa-test.local:30124/api'
  },
  prod: {
    personal: 'https://nuvexa-ms-personal.onrender.com/api',
    vehiculos: 'https://nuvexa-ms-vehiculos.onrender.com/api'
  }
};

const API_URLS = API_BASES[AMBIENTE];


// Determinar la base URL dependiendo de dónde se carga el script
function getBasePath() {
  const path = window.location.pathname;
  // Si estamos en una ruta que contiene '/frontend', ajustamos la base
  if (path.includes('/frontend/')) return '/frontend';
  if (path.includes('/templates/')) return '/templates';
  return '';
}

const BASE_PATH = getBasePath();

// -------------------- AUTENTICACIÓN Y ACCESO --------------------
function verificarAcceso() {
  const ruta = window.location.pathname;
  if (ruta.includes('/frontend/templates/logueo.html') || ruta.includes('/templates/logueo.html')) return;

  const token = localStorage.getItem('token');
  const verificado = sessionStorage.getItem("verificacion_completa") === "true";

  if (!token || !verificado) {
    sessionStorage.clear();
    localStorage.clear();
    const esLocal = window.location.origin.includes('127.0.0.1') || window.location.origin.includes('localhost');
    const rutaLogout = esLocal ? '/frontend/templates/logueo.html' : '/templates/logueo.html';

    window.location.replace(rutaLogout);
  }
}

function cerrarSesion() {
  sessionStorage.clear();
  localStorage.clear();

  const esLocal = window.location.origin.includes('127.0.0.1') || window.location.origin.includes('localhost');
  const rutaLogout = esLocal ? '/frontend/templates/logueo.html' : '/templates/logueo.html';

  window.location.href = rutaLogout;
}

// -------------------- FETCH GENERAL --------------------
async function fetchAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    // Determinar a cuál API llamar
    let baseURL = API_URLS.personal; // por defecto
    if (endpoint.startsWith('vehiculos')) baseURL = API_URLS.vehiculos;

    console.log(`Enviando ${method} a ${baseURL}/${endpoint}`, options);

    const res = await fetch(`${baseURL}/${endpoint}`, options);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Error en la solicitud: ${res.status} ${res.statusText}`, errorText);
      throw new Error(errorText || `Error ${res.status}: ${res.statusText}`);
    }

    const responseData = await res.json();
    console.log(`Respuesta de ${endpoint}:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`Error en fetchAPI para ${endpoint}:`, error);
    throw error;
  }
}

// -------------------- UTILIDADES  --------------------
function formatearFecha(fecha) {
  if (!fecha) return 'No especificada';
  
  const date = new Date(fecha);
  // Ajuste manual: compensar la diferencia horaria para evitar el desfase de día
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  
  return adjustedDate.toLocaleDateString('es-AR');
}

// -------------------- INIT --------------------
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM cargado, inicializando aplicación...");
  console.log("Ruta actual:", window.location.pathname);

  verificarAcceso();

  const salirBtn = document.getElementById('CerrarSesion');
  if (salirBtn) {
    console.log("Configurando botón de salir");
    salirBtn.addEventListener('click', cerrarSesion);
  }

  console.log("Inicialización global completa");
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    verificarAcceso();
  }
});
