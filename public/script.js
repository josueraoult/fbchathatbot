document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.querySelector("input[type='text']");
    const fileInput = document.querySelector("input[type='file']");
    const sendButton = document.querySelector("button#send");
    const chatBox = document.querySelector(".chat-box");

    sendButton.addEventListener("click", async function () {
        const message = chatInput.value.trim();
        const file = fileInput.files[0];

        if (message === "" && !file) {
            alert("Veuillez entrer un message ou sélectionner une image.");
            return;
        }

        addMessageToChat("Vous", message || "[Image envoyée]");

        if (file) {
            // 1. Télécharger l'image et obtenir une URL publique
            const imageUrl = await uploadImage(file);

            if (!imageUrl) {
                addMessageToChat("Bot", "Erreur lors du téléchargement de l'image.");
                return;
            }

            // 2. Envoyer l'image et la question à l'API chipai
            const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/chipai?ask=${encodeURIComponent(message)}&imageUrl=${encodeURIComponent(imageUrl)}`;
            fetchAPIResponse(apiUrl);
        } else {
            // 3. Envoyer seulement le texte à GPT-4
            const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/gpt4?ask=${encodeURIComponent(message)}&id=1`;
            fetchAPIResponse(apiUrl);
        }

        // Vider l'input après envoi
        chatInput.value = "";
        fileInput.value = "";
    });

    async function fetchAPIResponse(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.result) {
                addMessageToChat("Bot", data.result);
            } else if (typeof data === "string") {
                addMessageToChat("Bot", data);
            } else {
                addMessageToChat("Bot", "Réponse inattendue de l'API.");
            }
        } catch (error) {
            addMessageToChat("Bot", "Erreur API. Veuillez réessayer.");
            console.error("Erreur API :", error);
        }
    }

    function addMessageToChat(sender, message) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function uploadImage(file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("https://api.imgbb.com/1/upload?key=VOTRE_CLE_API", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            return data.data.url; // URL de l'image
        } catch (error) {
            console.error("Erreur lors du téléchargement de l'image :", error);
            return null;
        }
    }
});
