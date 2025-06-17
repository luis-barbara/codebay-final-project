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

  const emailError = emailInput.parentElement.querySelector('.error-message');
  const passwordError = passwordInput.parentElement.querySelector('.error-message');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateEmail() {
    const email = emailInput.value.trim();
    if (!email) {
      emailError.textContent = 'Email is required.';
      emailError.style.display = 'block';
      return false;
    } else if (!emailRegex.test(email)) {
      emailError.textContent = 'Please enter a valid email.';
      emailError.style.display = 'block';
      return false;
    } else {
      emailError.textContent = '';
      emailError.style.display = 'none';
      return true;
    }
  }

  function validatePassword() {
    const password = passwordInput.value;
    if (!password) {
      passwordError.textContent = 'Password is required.';
      passwordError.style.display = 'block';
      return false;
    } else {
      passwordError.textContent = '';
      passwordError.style.display = 'none';
      return true;
    }
  }

  function validateForm() {
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    submitBtn.disabled = !(emailValid && passwordValid);
    return emailValid && passwordValid;
  }

  // Toggle visibilidade da password
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });

  // Validar em tempo real
  emailInput.addEventListener('input', () => {
    validateEmail();
    validateForm();
  });

  passwordInput.addEventListener('input', () => {
    validatePassword();
    validateForm();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

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
        // Mostrar erro no campo de email ou senha
        if (message.toLowerCase().includes('email')) {
          emailError.textContent = message;
          emailError.style.display = 'block';
        } else if (message.toLowerCase().includes('password')) {
          passwordError.textContent = message;
          passwordError.style.display = 'block';
        } else {
          // Se não for possível determinar, mostra nos dois
          emailError.textContent = message;
          emailError.style.display = 'block';
          passwordError.textContent = message;
          passwordError.style.display = 'block';
        }
        throw new Error(message);
      }

      const data = await response.json();

      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      window.location.href = '/index.html';

    } catch (err) {
      // O erro já é exibido nos campos, aqui só desabilita o botão
      console.error(err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Inicializa o estado do botão e mensagens
  validateForm();
});
