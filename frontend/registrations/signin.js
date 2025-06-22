// frontend/registrations/signin.js
// Only for login, store tokens and redirect

// Import saveTokens from your auth.js module
import { saveTokens } from './auth.js'; // Assuming auth.js is in the same directory

document.addEventListener('DOMContentLoaded', () => {
    // If already has token, redirects to main page
    // NOTE: This check should ideally be done by the main application logic
    // or after a refresh attempt, not on every signin page load if you expect refresh.
    // However, for initial redirection after a successful manual login, it's fine.
    if (localStorage.getItem('accessToken')) {
        window.location.href = '../homepage/index.html';
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

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Validate in real time
    emailInput.addEventListener('input', () => {
        validateEmail();
        validateForm();
    });

    passwordInput.addEventListener('input', () => {
        validatePassword();
        validateForm();
    });

    // Submit form
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
                
                if (message.toLowerCase().includes('email')) {
                    emailError.textContent = message;
                    emailError.style.display = 'block';
                } else if (message.toLowerCase().includes('password')) {
                    passwordError.textContent = message;
                    passwordError.style.display = 'block';
                } else {
                    emailError.textContent = message;
                    emailError.style.display = 'block';
                    passwordError.textContent = message;
                    passwordError.style.display = 'block';
                }

                throw new Error(message);
            }

            const data = await response.json();
            // Call the centralized saveTokens function from auth.js
            saveTokens(data.access, data.refresh); // <--- THIS IS THE CRITICAL CHANGE

            window.location.href = '../homepage/index.html';

        } catch (err) {
            console.error(err.message);
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Social Login
    const googleLoginBtn = document.querySelector('.oauth-btn.google');
    const githubLoginBtn = document.querySelector('.oauth-btn.github');

    googleLoginBtn?.addEventListener('click', () => {
        window.location.href = 'http://localhost:8000/api/accounts/oauth/google/';
    });

    githubLoginBtn?.addEventListener('click', () => {
        window.location.href = 'http://localhost:8000/api/accounts/oauth/github/';
    });

    // Initialize
    validateForm();
});