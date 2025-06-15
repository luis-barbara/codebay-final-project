// frontend/registrations/auth.js
// Funções para validar token, logout, pegar token do storage, etc.


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
  if (!token) return false;
  return true;
}

export function logout() {
  clearTokens();
  window.location.href = '/signin.html'; 
}
