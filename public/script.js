const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const closeChatbot = document.querySelector("#close-chatbot");

// Afficher le chatbot par défaut
document.body.classList.add("show-chatbot");

// Initialisation des données utilisateur
const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

// Historique des messages
const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// Créer un élément de message avec des classes dynamiques
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Générer une réponse du bot en utilisant l'API GPT-4
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");
  
  try {
    let apiResponseText;
    
    if (userData.file.data) {
      // Si une image est envoyée, utiliser l'API Chipp AI Image Analyzer
      const response = await fetch(
        `https://jonenu1-ccprojectsapinsns.nr.space/api/gpt4?ask=${encodeURIComponent(userData.message)}&imageUrl=data:${userData.file.mime_type};base64,${userData.file.data}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'analyse de l'image");
      apiResponseText = data.response;
    } else {
      // Si seul un message texte est envoyé, utiliser l'API GPT-4
      const response = await fetch(
        `https://jonell01-ccprojectsapihshs.hf.space/api/gpt4?ask=${encodeURIComponent(userData.message)}&id=1`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de la génération de la réponse");
      apiResponseText = data.response;
    }
    
    // Afficher la réponse du bot
    messageElement.innerText = apiResponseText;
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    messageElement.innerText = "Désolé, une erreur s'est produite. Veuillez réessayer.";
    messageElement.style.color = "#ff0000";
  } finally {
    // Réinitialiser les données de fichier et arrêter l'indicateur de réflexion
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// Gérer l'envoi de messages
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  if (!userData.message && !userData.file.data) return; // Ignorer si aucun message ou fichier
  
  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  fileUploadWrapper.classList.remove("file-uploaded");
  
  // Créer et afficher le message de l'utilisateur
  const messageContent = `<div class="message-text"></div>
                          ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;
  
  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  
  // Simuler une réponse du bot avec un indicateur de réflexion
  setTimeout(() => {
    const messageContent = `<img class="bot-avatar" src="robotic.png" alt="Chatbot Logo" width="50" height="50">
                            <div class="message-text">
                              <div class="thinking-indicator">
                                <div class="dot"></div>
                                <div class="dot"></div>
                                <div class="dot"></div>
                              </div>
                            </div>`;
    
    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// Ajuster la hauteur du champ de saisie
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// Gérer l'appui sur la touche Entrée pour envoyer un message
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && !e.shiftKey && userMessage && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

// Gérer la sélection de fichier
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];
    
    // Stocker les données du fichier
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
  };
  
  reader.readAsDataURL(file);
});

// Annuler l'upload de fichier
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded");
});

// Gérer l'envoi de message via le bouton
sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));                                                                                                                                                                                                                                                                                                                                                 