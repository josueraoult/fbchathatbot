document.addEventListener("DOMContentLoaded", () => {
    const deleteBtn = document.getElementById("delete-chatbot");
    const confirmDeleteBtn = document.getElementById("confirmDelete");
    const deleteInput = document.getElementById("deleteInput");
    const errorMessage = document.getElementById("error-message");
    const chatBody = document.querySelector(".chat-body");
    let randomId = Math.floor(10 + Math.random() * 90); // ID aléatoire 2 chiffres

    // Afficher ID dans le popup
    document.getElementById("randomId").innerText = randomId;

    // Ouvrir le modal
    deleteBtn.addEventListener("click", () => {
        new bootstrap.Modal(document.getElementById("deleteModal")).show();
    });

    // Vérification & Suppression
    confirmDeleteBtn.addEventListener("click", () => {
        if (deleteInput.value.trim() === `DELETE ${randomId}`) {
            chatBody.innerHTML = `<div class="message bot-message"><img class="bot-avatar" src="robotic.png" alt="Chatbot Logo" width="40"><div class="message-text">Conversation supprimée.</div></div>`;
            bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
        } else {
            errorMessage.style.display = "block";
        }
    });

    // Réessayer si mauvaise entrée
    deleteInput.addEventListener("input", () => {
        errorMessage.style.display = "none";
    });
});