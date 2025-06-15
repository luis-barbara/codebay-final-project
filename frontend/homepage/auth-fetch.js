// frontend/homepage/auth-fetch.js

// Verifica se o token está presente e válido (pode expandir para verificar expiração)
function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

// Requisição fetch com token JWT no header Authorization
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('access_token');

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

// Logout: remove tokens e redireciona
function handleLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/frontend/registrations/signin.html';
}
