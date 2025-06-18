// frontend/registrations/auth.js
// Funções para validar token, logout, ir buscar token do storage, etc.


export function saveTokens(access, refresh) {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function isLoggedIn() {
  const token = getAccessToken();
  return !!token;
}

export function logout() {
  clearTokens();
  window.location.href = '../registrations/signin.html';
}

// authFetch: fetch que adiciona token no header e trata 401
export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  if (!options.headers) options.headers = {};
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    logout();  // token inválido ou expirado
  }

  return response;
}
