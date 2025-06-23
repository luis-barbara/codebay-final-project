// frontend/homepage/home.js

// Import the correct, centralized authentication functions from registrations/auth.js
import { isLoggedIn, authFetch, logout } from '../registrations/auth.js'; // Correct path and function names

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const dataDisplay = document.getElementById('dataDisplay');

    // Use the isLoggedIn function from the centralized auth.js
    if (isLoggedIn()) {
        // Show logout button if user is authenticated
        if (logoutBtn) { // Check if logoutBtn exists to prevent errors
            logoutBtn.style.display = 'inline-block';
            logoutBtn.addEventListener('click', logout); // Use the centralized logout function
        }

        // Load protected data
        loadProtectedData();
    } else {
        // Hide logout button if user is not authenticated
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }

        // Show message for unauthenticated users
        if (dataDisplay) {
            dataDisplay.textContent = 'Welcome! Please log in to see protected content.';
        }
    }
});

async function loadProtectedData() {
    try {
        // Use the authFetch function from the centralized auth.js
        // NOTE: The URL 'https://jsonplaceholder.typicode.com/posts/1' is an external API
        // It does not require your JWT token. If this is placeholder data, that's fine.
        // If you intend to fetch data from your Django backend, change the URL.
        const response = await authFetch('http://127.0.0.1:8000/api/some-protected-endpoint/'); // Example: Fetch from your Django backend
        const data = await response.json();
        if (dataDisplay) { // Check if dataDisplay exists before setting textContent
             dataDisplay.textContent = JSON.stringify(data, null, 2);
        }
    } catch (error) {
        // Ensure error message is properly displayed, as authFetch might throw specific errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`Failed to load data: ${errorMessage}`);
        console.error("Error loading protected data:", error);
    }
}
