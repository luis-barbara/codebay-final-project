// frontend/registrations/auth.js
// Módulo de autenticação: gestão de tokens + fetch autenticado

// Salvar tokens no localStorage
export function saveTokens(access, refresh) {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

// Obter token de acesso
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// Limpar tokens do localStorage
export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Verifica se o utilizador está autenticado
export function isLoggedIn() {
  return !!getAccessToken();
}

// Logout: apaga tokens e redireciona para login
export function logout() {
  clearTokens();
  window.location.href = '../registrations/signin.html';
}

// Wrapper para fetch com token no header + tratamento de 401
export async function authFetch(url, options = {}) {
  const token = getAccessToken();

  if (!options.headers) options.headers = {};
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    logout(); // Token expirado
  }

  return response;
}
