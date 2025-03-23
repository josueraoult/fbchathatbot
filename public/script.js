const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");

// Afficher le chatbot dès le chargement
document.body.classList.add("show-chatbot");

// Données utilisateur
const userData = {
  message: null,
  file: { data: null, mime_type: null, url: null },
};

// Historique des messages
const initialInputHeight = messageInput.scrollHeight;

// Créer un élément message
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Filtrer les réponses inutiles
const filterResponse = (responseText) => {
  const uselessResponses = [
    "Hi there! How can I assist you today?",
    "Hello! How can I help you?",
    "How can I assist you today?"
  ];
  return uselessResponses.some((phrase) => responseText.includes(phrase)) ?
    "Sorry, I didn't understand that. Could you clarify?" :
    responseText;
};

// Gérer la réponse du bot
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");
  
  try {
    let apiResponseText;
    
    if (userData.file.url) {
      // Envoi à l'API ChipAI pour analyse d'image avec l'URL ImgBB
      const response = await fetch(
        `https://jonell01-ccprojectsapihshs.hf.space/api/chipai?ask=${encodeURIComponent(userData.message)}&imageUrl=${encodeURIComponent(userData.file.url)}`
      );
      const data = await response.json(); // ChipAI retourne un JSON
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'analyse de l'image");
      apiResponseText = filterResponse(data.result); // On filtre la réponse de ChipAI
    } else {
      // Envoi à l'API GPT-4 pour une simple question texte
      const response = await fetch(
        `https://jonell01-ccprojectsapihshs.hf.space/api/gpt4?ask=${encodeURIComponent(userData.message)}&id=1`
      );
      if (!response.ok) throw new Error("Erreur lors de la génération de la réponse");
      apiResponseText = await response.text(); // GPT-4 retourne un texte brut
    }
    
    // Affichage de la réponse
    messageElement.innerText = apiResponseText;
    
  } catch (error) {
    console.error(error);
    messageElement.innerText = "❌ Erreur : Impossible d'obtenir une réponse.";
    messageElement.style.color = "#ff0000";
  } finally {
    // Réinitialiser les données du fichier
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// Envoi d'un message
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  if (!userData.message && !userData.file.data) return;
  
  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));
  fileUploadWrapper.classList.remove("file-uploaded");
  
  // Afficher le message de l'utilisateur
  const messageContent = `<div class="message-text"></div>${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;
  
  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  
  // Simulation d'attente avant réponse
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

// Ajustement hauteur champ input
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// Envoi message avec Entrée
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && userData.message && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

// Gestion upload d'image via ImgBB
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];
    
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
    
    // Upload de l'image via ImgBB
    const imgBBApiKey = "73b626aa50add2cee1e07dd2814afa05";
    const formData = new FormData();
    formData.append("image", file);
    
    const uploadResponse = await fetch("https://api.imgbb.com/1/upload?key=" + imgBBApiKey, {
      method: "POST",
      body: formData
    });
    
    const uploadData = await uploadResponse.json();
    if (uploadData.success) {
      userData.file.url = uploadData.data.url; // Récupérer l'URL de l'image téléchargée
    } else {
      console.error("Erreur lors de l'upload de l'image sur ImgBB");
    }
  };
  
  reader.readAsDataURL(file);
});

// Annulation upload
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded");
});

// Envoi via bouton
sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());