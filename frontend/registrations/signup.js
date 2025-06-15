// frontend/registrations/signup.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const fullNameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const full_name = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm_password = confirmPasswordInput.value;

    if (password !== confirm_password) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "Passwords don't match!",
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/accounts/signup/', {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_name, email, password, confirm_password }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Account created successfully! Redirecting to login...',
          timer: 2500,
          timerProgressBar: true,
          willClose: () => {
            window.location.href = 'signin.html';
          }
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: JSON.stringify(errorData),
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
    }
  });
});
