// frontend/registrations/signin.js
// Só para login, armazenar tokens e redirecionar

document.addEventListener('DOMContentLoaded', () => {
  if (typeof loadHeader === 'function') {
    loadHeader();
  }

  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const submitBtn = form.querySelector('button[type="submit"]');

  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
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
      const response = await fetch('/api/accounts/token/', {
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

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

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
