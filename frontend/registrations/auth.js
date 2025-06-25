// frontend/registrations/auth.js
// Módulo de autenticação: gestão de tokens + fetch autenticado com refresh automático

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Salvar tokens no localStorage
export function saveTokens(access, refresh) {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    console.log("Tokens saved: Access=", access ? "YES" : "NO", "Refresh=", refresh ? "YES" : "NO");
}

// Obter token de acesso
export function getAccessToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    return token;
}

// Obter refresh token
export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Limpar tokens do localStorage
export function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log("Tokens cleared from localStorage.");
}

// Verifica se o utilizador está autenticado (tem um access token)
export function isLoggedIn() {
    return !!getAccessToken();
}

// URL do endpoint de refresh de token e da página de login
const TOKEN_REFRESH_URL = "http://localhost:8000/api/token/refresh/";
const LOGIN_URL = "http://localhost:5500/frontend/registrations/signin.html"; 

// Logout: apaga tokens e redireciona para login
export function logout() {
    console.log("Logging out: Clearing tokens and redirecting to login.");
    clearTokens();
    window.location.href = LOGIN_URL;
}

// Função para tentar refrescar o access token usando o refresh token
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        console.warn("No refresh token available. User needs to log in again.");
        logout(); // Se não há refresh token, força logout
        return null;
    }

    console.log("Attempting to refresh access token...");
    try {
        const response = await fetch(TOKEN_REFRESH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to refresh token (server response):", response.status, errorData);
            logout(); 
            return null;
        }

        const data = await response.json();
        saveTokens(data.access, data.refresh);
        console.log("Token refreshed successfully. New Access Token obtained.");
        return data.access; 
    } catch (error) {
        console.error("Network error during token refresh:", error);
        logout(); 
        return null;
    }
}

// Wrapper para fetch 
export async function authFetch(url, options = {}, isRetry = false) { 
    let accessToken = getAccessToken();
    const headers = {
        ...options.headers,
    };

    // Lógica para adicionar o token ao header 
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (!isRetry) { 
        console.warn("AuthFetch called without initial access token. Attempting refresh.");
        accessToken = await refreshAccessToken(); 
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`; 
        } else {
            console.error("Cannot proceed: No valid token after initial refresh attempt.");
            return new Response(JSON.stringify({ detail: "Authentication required" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
    } else { 
        console.error("Cannot proceed: No valid token after retry attempt.");
        return new Response(JSON.stringify({ detail: "Authentication required (retry failed)" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    let response = await fetch(url, {
        ...options,
        headers,
    });


    if ((response.status === 401 || response.status === 403) && !isRetry) {
        console.warn(`AuthFetch received ${response.status}. Token might be expired or invalid. Attempting to refresh token and retry original request.`);
        const newAccessToken = await refreshAccessToken(); 

        if (newAccessToken) {
            return authFetch(url, options, true); 
        } else {
            console.error("Token refresh failed. User needs to log in again.");
            return response; 
        }
    }

    return response;
}
