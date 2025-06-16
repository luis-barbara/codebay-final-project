// frontend/homepage/auth-fetch.js

// Verifica se o token está presente e válido 
export function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

// Requisição fetch com token JWT no header Authorization
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    throw new Error('No access token found. User may not be logged in.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expirado ou inválido
    handleLogout();
    throw new Error('Session expired. Redirecting to login.');
  }

  return response;
}

// Logout: remove tokens e redireciona para login
export function handleLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '../registrations/signin.html';
}
