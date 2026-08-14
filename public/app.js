// Kōhi — helpers compartidos por las páginas
const TOKEN_KEY = 'kohi_token';

const auth = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Llama a la API y devuelve { ok, status, data }. Si el servidor no
// responde JSON (o no responde), lo convierte en un mensaje legible.
async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { error: 'Respuesta inesperada del servidor' };
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: 'No se pudo conectar con el servidor' } };
  }
}

function showMessage(el, text, kind = 'error') {
  el.textContent = text;
  el.className = `message visible ${kind}`;
}

function hideMessage(el) {
  el.className = 'message';
}
