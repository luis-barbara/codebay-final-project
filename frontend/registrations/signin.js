// frontend/registrations/signin.js
// Só para login, armazenar tokens e redirecionar

document.addEventListener('DOMContentLoaded', () => {
  // Se já tiver token, redireciona para a página principal
  if (localStorage.getItem('accessToken')) {
    window.location.href = '/index.html';
    return;  
  }

  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const submitBtn = form.querySelector('button[type="submit"]');

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Please fill in all fields',
      });
      return;
    }

    submitBtn.disabled = true;

    try {
      const response = await fetch('http://localhost:8000/api/accounts/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const message = errData.error || 'Invalid email or password';
        throw new Error(message);
      }

      const data = await response.json();

      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      window.location.href = '/index.html';

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login failed',
        text: err.message,
      });
    } finally {
      submitBtn.disabled = false;
    }
  });
});
