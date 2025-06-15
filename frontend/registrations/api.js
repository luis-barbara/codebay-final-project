// frontend/registrations/auth.js
// Wrapper para fetch que já envia o token no header e trata erros (ex: token expirado)



import { getAccessToken, logout } from './auth.js';

export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  if (!options.headers) options.headers = {};
  options.headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, options);

  if (response.status === 401) {
    // Token inválido ou expirado
    logout();
  }

  return response;
}
