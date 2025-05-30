document.addEventListener('DOMContentLoaded', function() {

    const signInModal = document.getElementById('signInModal');
    const signUpModal = document.getElementById('signUpModal');
    
    const signInButton = document.querySelector('.signin');
    const signUpButton = document.querySelector('.signup');
    
    const closeButtons = document.querySelectorAll('.close');

    signInButton.addEventListener('click', function(e) {
        e.preventDefault();
        signInModal.style.display = 'block';
    });
    
    signUpButton.addEventListener('click', function(e) {
        e.preventDefault();
        signUpModal.style.display = 'block';
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            signInModal.style.display = 'none';
            signUpModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target === signInModal) {
            signInModal.style.display = 'none';
        }
        if (e.target === signUpModal) {
            signUpModal.style.display = 'none';
        }
    });

    document.getElementById('signInForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;

        console.log('Sign In:', { email, password });

        signInModal.style.display = 'none';
        alert('Sign In functionality would be implemented here');
    });

    document.getElementById('signUpForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signUpName').value;
        const email = document.getElementById('signUpEmail').value;
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('signUpConfirmPassword').value;

        if (password !== confirmPassword) {
            Swal.fire({
                title: "Error!",
                text: "Passwords do not match!",
                icon: "error"
            });
            return;
        }
        console.log('Sign Up:', { name, email, password });
        signUpModal.style.display = 'none';

        Swal.fire({
            text: "Account created successfully!",
            icon: "success",
            draggable: true
        });
    });

    document.getElementById('forgotPassword').addEventListener('click', function(e) {
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
                return { email: email };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Email Sent!',
                    'Check your inbox for the password reset link.',
                    'success'
                );
                console.log('Password reset requested for:', result.value.email);
            }
        });
    });
});