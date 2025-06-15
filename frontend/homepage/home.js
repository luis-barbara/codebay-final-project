// frontend/homepage/home.js

// Verificar se o utilizador está autenticado — se não estiver, redireciona para o login
// Fazer requisições protegidas para buscar dados da API usando o token JWT
// Renderizar esses dados na página (ex: mostrar produtos, posts, perfil, etc)
// Tratar ações do utilizador, como logout, cliques em botões, navegação, etc




import { isAuthenticated, fetchWithAuth, handleLogout } from './auth-fetch.js';

if (!isAuthenticated()) {
  window.location.href = '../registrations/signin.html';
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  handleLogout();
});

async function loadProtectedData() {
  try {
    const response = await fetchWithAuth('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    document.getElementById('dataDisplay').textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    alert(error.message);
  }
}

loadProtectedData();
