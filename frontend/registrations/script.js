document.addEventListener('DOMContentLoaded', function () {
    const signInModal = document.getElementById('signInModal');
    const signUpModal = document.getElementById('signUpModal');

    const signInButton = document.querySelector('.signin');
    const signUpButton = document.querySelector('.signup');
    const closeButtons = document.querySelectorAll('.close');

    // Show modals
    if (signInButton) {
        signInButton.addEventListener('click', (e) => {
            e.preventDefault();
            signInModal.style.display = 'block';
        });
    }

    if (signUpButton) {
        signUpButton.addEventListener('click', (e) => {
            e.preventDefault();
            signUpModal.style.display = 'block';
        });
    }

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (signInModal) signInModal.style.display = 'none';
            if (signUpModal) signUpModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === signInModal) signInModal.style.display = 'none';
        if (e.target === signUpModal) signUpModal.style.display = 'none';
    });

    // Handle login
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('signInEmail').value;
            const password = document.getElementById('signInPassword').value;

            try {
                const response = await fetch('https://teu-backend.com/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '/dashboard.html';
                } else {
                    Swal.fire("Login Failed", data.message || "Invalid credentials", "error");
                }
            } catch (error) {
                console.error("Login error:", error);
                Swal.fire("Oops!", "Something went wrong", "error");
            }
        });
    }

    // Handle signup
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const name = document.getElementById('signUpName').value;
            const email = document.getElementById('signUpEmail').value;
            const password = document.getElementById('signUpPassword').value;
            const confirmPassword = document.getElementById('signUpConfirmPassword').value;

            if (password !== confirmPassword) {
                Swal.fire("Error!", "Passwords do not match!", "error");
                return;
            }

            try {
                const response = await fetch('https://teu-backend.com/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire("Success!", "Account created successfully!", "success");
                    signUpModal.style.display = 'none';
                } else {
                    Swal.fire("Error!", data.message || "Failed to register", "error");
                }
            } catch (error) {
                console.error("Sign up error:", error);
                Swal.fire("Oops!", "Something went wrong", "error");
            }
        });
    }

    // Handle forgot password
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function (e) {
            e.preventDefault();
            Swal.fire({
                title: 'Reset Password',
                html: `
                    <p>Enter your email to receive a password reset link:</p>
                    <input type="email" id="resetEmail" class="swal2-input" placeholder="Your email">
                `,
                showCancelButton: true,
                confirmButtonText: 'Send Link',
                cancelButtonText: 'Cancel',
                focusConfirm: false,
                preConfirm: () => {
                    const email = Swal.getPopup().querySelector('#resetEmail').value;
                    if (!email) {
                        Swal.showValidationMessage('Please enter your email');
                    }
                    return { email };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await fetch('https://teu-backend.com/api/forgot-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ email: result.value.email })
                        });

                        if (response.ok) {
                            Swal.fire("Email Sent!", "Check your inbox for the password reset link.", "success");
                        } else {
                            Swal.fire("Error!", "Failed to send reset link.", "error");
                        }
                    } catch (error) {
                        console.error("Forgot password error:", error);
                        Swal.fire("Oops!", "Something went wrong", "error");
                    }
                }
            });
        });
    }
});
