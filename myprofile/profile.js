function loadheader() {
    fetch('../components/header_logged_in.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('head').innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));
}

function loadfooter() {
    fetch('../components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('foot').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    loadheader();
    loadfooter();


    // View option buttons
    const viewButtons = document.querySelectorAll('.view-options .btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function () {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // README logic
    const editBtn = document.querySelector('.edit-readme-btn');
    const readmeContent = document.querySelector('.readme-content');

    if (localStorage.getItem('userReadme')) {
        readmeContent.innerHTML = localStorage.getItem('userReadme');
    }

    editBtn.addEventListener('click', () => {
        const isEditable = readmeContent.getAttribute('contenteditable') === 'true';
        if (isEditable) {
            readmeContent.setAttribute('contenteditable', 'false');
            editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Edit';
            localStorage.setItem('userReadme', readmeContent.innerHTML);
        } else {
            readmeContent.setAttribute('contenteditable', 'true');
            readmeContent.focus();
            editBtn.innerHTML = '<i class="fas fa-check"></i> Save';
        }
    });
});
