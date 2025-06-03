document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer
    loadheader();
    loadfooter();

    // Set up navigation tabs
    const navItems = document.querySelectorAll('.profile-nav li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set up view options buttons
    const viewButtons = document.querySelectorAll('.view-options .btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// Reuse your existing functions from components/script.js
async function loadheader() {
    const response = await fetch('../components/header_logged_in.html');
    const header = await response.text();
    document.getElementById('head').innerHTML = header;
    setupSidebar();
    setupAvatarSidebar();
}

async function loadfooter() {
    const response = await fetch('../components/footer.html');
    const footer = await response.text();
    document.getElementById('foot').innerHTML = footer;
}