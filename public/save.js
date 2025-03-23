// Fonction pour sauvegarder la conversation dans le localStorage
const saveConversation = (message, sender) => {
  // Récupérer la conversation existante depuis le localStorage
  const conversation = JSON.parse(localStorage.getItem("chatHistory")) || [];

  // Ajouter le nouveau message à la conversation
  conversation.push({
    sender: sender, // "user" ou "bot"
    message: message, // Contenu du message
    timestamp: new Date().toISOString(), // Horodatage du message
  });

  // Sauvegarder la conversation mise à jour dans le localStorage
  localStorage.setItem("chatHistory", JSON.stringify(conversation));
};

// Fonction pour charger la conversation depuis le localStorage
const loadConversation = () => {
  const conversation = JSON.parse(localStorage.getItem("chatHistory")) || [];
  return conversation;
};

// Fonction pour afficher la conversation chargée dans l'interface
const displaySavedConversation = () => {
  const chatBody = document.querySelector(".chat-body");
  const conversation = loadConversation();

  // Effacer le contenu actuel du chat
  chatBody.innerHTML = "";

  // Afficher chaque message dans le chat
  conversation.forEach((msg) => {
    const messageClass = msg.sender === "user" ? "user-message" : "bot-message";
    const messageContent = `
      <div class="message ${messageClass}">
        <div class="message-text">${msg.message}</div>
      </div>
    `;
    chatBody.innerHTML += messageContent;
  });

  // Faire défiler vers le bas pour voir le dernier message
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
};

// Intégration avec le code existant
document.addEventListener("DOMContentLoaded", () => {
  // Afficher la conversation sauvegardée au chargement de la page
  displaySavedConversation();

  // Modifier la fonction handleOutgoingMessage pour sauvegarder les messages de l'utilisateur
  const handleOutgoingMessage = (e) => {
    e.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage && !userData.file.data) return; // Ignorer si aucun message ou fichier

    // Sauvegarder le message de l'utilisateur
    saveConversation(userMessage, "user");

    // Envoyer le message et générer une réponse du bot
    // (Votre code existant pour envoyer le message et afficher la réponse du bot)
  };

  // Modifier la fonction generateBotResponse pour sauvegarder les messages du bot
  const generateBotResponse = async (incomingMessageDiv) => {
    // (Votre code existant pour générer la réponse du bot)

    // Sauvegarder la réponse du bot
    const botMessage = incomingMessageDiv.querySelector(".message-text").innerText;
    saveConversation(botMessage, "bot");
  };
});