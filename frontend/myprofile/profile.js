import { showProfile } from "./show-data.js";

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar token:", e);
        return null;
    }
}

function setupViewOptions() {
    const viewButtons = document.querySelectorAll('.view-options .btn');

    if (!viewButtons.length) {
        console.warn('View option buttons not found');
        return;
    }

    viewButtons.forEach(button => {
        button.addEventListener('click', function () {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Here you would typically load different product views
            const viewType = this.textContent.toLowerCase();
            loadProducts(viewType);
        });
    });
}

/**
 * Loads products based on view type
 */

/**
 * Renders products in the grid
 */
/**
 * Sets up the README editor functionality
 */
function setupReadmeEditor() {
    const editBtn = document.querySelector('.edit-readme-btn');
    const readmeContent = document.querySelector('.readme-content');

    if (!editBtn || !readmeContent) {
        console.warn('README editor elements not found');
        return;
    }

    let isEditing = false;

    editBtn.addEventListener('click', async () => {
        if (isEditing) {
            // === SALVAR NO BACKEND ===
            const newBio = readmeContent.innerText.trim();
            const token = localStorage.getItem("accessToken");

            if (!token) {
                alert("Token não encontrado. Inicie sessão.");
                return;
            }


            try {
                const email = "mopolan547@cristout.com";
                const encodedEmail = encodeURIComponent(email); // bom hábito
                const url = `http://localhost:8000/api/accounts/profile/${encodedEmail}/`;
                const response = await fetch(url, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({ description: newBio })
                });
                console.log(response)

                if (!response.ok) {
                    throw new Error("Erro ao atualizar o README.");
                }

                // Sucesso: desativa edição
                readmeContent.setAttribute('contenteditable', 'false');
                editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Edit';
                isEditing = false;

                // Feedback visual rápido
                editBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                setTimeout(() => {
                    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Edit';
                }, 2000);

            } catch (error) {
                console.error("Erro ao salvar README:", error);
                alert("Ocorreu um erro ao guardar as alterações.");
            }

        } else {
            // === ENTRAR NO MODO DE EDIÇÃO ===
            readmeContent.setAttribute('contenteditable', 'true');
            readmeContent.focus();
            editBtn.innerHTML = '<i class="fas fa-check"></i> Save';
            isEditing = true;
        }
    });
}


// ======================
// INITIALIZATION
// ======================

/**
 * Main initialization function
 */
async function initializeProfilePage() {
    // Load all components

    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error("Token não encontrado.");
        return;
    }
    const payload = parseJwt(token);
    const userId = payload?.user_id;

    if (!userId) {
        console.error("user_id não encontrado no token.");
        return;
    }

    // Load profile info
    await showProfile(); // 👈 Move para aqui

    // Setup profile functionality
    setupViewOptions();
    setupReadmeEditor();


    // Setup any additional components
    if (typeof setupNotificationDropdown === 'function') {
        setupNotificationDropdown();
    }
    if (typeof setupSidebar === 'function') {
        setupSidebar();
    }
    if (typeof setupAvatarSidebar === 'function') {
        setupAvatarSidebar();
    }
}


// Start the page initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeProfilePage);




