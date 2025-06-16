// frontend/homepage/home.js

// Verificar se o utilizador está autenticado — se não estiver, redireciona para o login
// Fazer requisições protegidas para buscar dados da API usando o token JWT
// Renderizar esses dados na página (ex: mostrar produtos, posts, perfil, etc)
// Tratar ações do utilizador, como logout, cliques em botões, navegação, etc



import { isAuthenticated, fetchWithAuth, handleLogout } from './auth-fetch.js';

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  const dataDisplay = document.getElementById('dataDisplay');

  if (isAuthenticated()) {
    // Show logout button if user is authenticated
    logoutBtn.style.display = 'inline-block';

    logoutBtn.addEventListener('click', handleLogout);

    // Load protected data
    loadProtectedData();
  } else {
    // Hide logout button if user is not authenticated
    logoutBtn.style.display = 'none';

    // Show message for unauthenticated users
    if (dataDisplay) {
      dataDisplay.textContent = 'Welcome! Please log in to see protected content.';
    }
  }
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
