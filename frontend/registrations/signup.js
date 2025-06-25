// frontend/registrations/signup.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const fullNameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const submitBtn = form.querySelector('button[type="submit"]');

  const togglePassword = document.getElementById('togglePassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Helpers para mostrar erros
  function setError(input, message) {
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
    }
  }

  function clearError(input) {
    setError(input, '');
  }

  // Valida e atualiza mensagens
  function validateForm() {
    let valid = true;

    if (fullNameInput.value.trim() === '') {
      setError(fullNameInput, 'Full Name is required.');
      valid = false;
    } else {
      clearError(fullNameInput);
    }

    if (!emailRegex.test(emailInput.value.trim())) {
      setError(emailInput, 'Please enter a valid email.');
      valid = false;
    } else {
      clearError(emailInput);
    }

    if (passwordInput.value.length < 6) {
      setError(passwordInput, 'Password must be at least 6 characters.');
      valid = false;
    } else {
      clearError(passwordInput);
    }

    if (confirmPasswordInput.value !== passwordInput.value || confirmPasswordInput.value.length === 0) {
      setError(confirmPasswordInput, 'Passwords must match.');
      valid = false;
    } else {
      clearError(confirmPasswordInput);
    }

    submitBtn.disabled = !valid;
    return valid;
  }

  // Listeners para validar em tempo real
  [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('input', validateForm);
  });

  // Toggle para "Password"
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });

  // Toggle para "Confirm Password"
  toggleConfirmPassword.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    toggleConfirmPassword.classList.toggle('fa-eye');
    toggleConfirmPassword.classList.toggle('fa-eye-slash');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Limpar erros anteriores antes de tentar submeter
    [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(clearError);

    if (!validateForm()) return; 

    const full_name = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm_password = confirmPasswordInput.value;

    try {
      const response = await fetch('http://localhost:8000/api/accounts/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, password, confirm_password }),
      });

      if (response.ok) {
        alert('Account created successfully! Redirecting to login...');
        window.location.href = 'signin.html';
      } else {
        const errorData = await response.json();

        let showedFieldError = false;

        const inputMap = {
          full_name: fullNameInput,
          email: emailInput,
          password: passwordInput,
          confirm_password: confirmPasswordInput
        };

        for (const field in errorData) {
          if (inputMap[field]) {
            setError(inputMap[field], errorData[field].join(' '));
            if (!showedFieldError) {
              inputMap[field].focus();
            }
            showedFieldError = true;
          }
        }

        if (!showedFieldError) {
          alert('Signup Failed: ' + JSON.stringify(errorData));
        }
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });

  validateForm(); 
});

