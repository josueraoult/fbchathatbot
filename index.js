// index.js
// Main Hub

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = 8080;

// Intégration directe des tokens (remplace les valeurs par tes tokens réels)
const PAGE_ACCESS_TOKEN = "EAGWp4PDBMf4BOzEEDdTe6dDqN5Ry8XBovMvNWW7lZCnVTk1mmJceFThXCxTEFbab5GUNsbL2UJg2swUb1L1CZA8AdcvhVIbh6rISiZBJQVM1x3RWeLtc12ySJ14Qn7wcWsb1IssMUyG6OfZBRytD0ZAmZAs0UxaQMKbL1lrzPd3TtUevS6BPPnoDnfZA1W0c085";
const VERIFY_TOKEN = "openofficeweb";

// Middleware pour parser le JSON
app.use(bodyParser.json());

// Route principale pour le ping UptimeRobot et l'indication en ligne
app.get("/", (req, res) => {
  res.send("🚀 Nano Bot fonctionne !");
});

// Vérification du webhook Messenger (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook vérifié !");
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Forbidden");
});

// Gestion des événements Messenger (POST)
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    // Parcours de chaque entrée
    await Promise.all(
      body.entry.map(async (entry) => {
        // Il est possible qu'il y ait plusieurs événements dans "messaging"
        await Promise.all(
          entry.messaging.map(async (event) => {
            const senderId = event.sender.id;

            // Gestion du bouton "Démarrer"
            if (event.postback && event.postback.payload === "GET_STARTED_PAYLOAD") {
              await sendMessage(senderId, "👋 Bienvenue ! Je suis Nano Bot, une IA avancée. Comment puis-je vous aider ?");
              return;
            }

            // Gestion des messages texte
            if (event.message && event.message.text) {
              const userMessage = event.message.text;

              // Afficher l'indicateur de saisie
              await showTypingIndicator(senderId);
              // Pause pour simuler la réflexion de l'IA (1.5 sec)
              await delay(1500);
              await stopTypingIndicator(senderId);

              // Appel à la nouvelle API pour obtenir une réponse
              const aiResponse = await getAiResponse(userMessage);
              await sendMessage(senderId, aiResponse);
            }
          })
        );
      })
    );
    return res.status(200).send("EVENT_RECEIVED");
  }
  return res.sendStatus(404);
});

// Fonction pour simuler un délai
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Appel à la nouvelle API pour obtenir une réponse
async function getAiResponse(userMessage) {
  try {
    // On encode le message de l'utilisateur pour l'inclure dans l'URL
    const url = `https://jonell01-ccprojectsapihshs.hf.space/api/gpt4?ask=${encodeURIComponent(userMessage)}&id=1`;
    const response = await axios.get(url);
    // On suppose que la réponse est soit dans response.data.response soit directement dans response.data
    return (response.data.response || response.data) || "⚠️ L'IA n'a pas pu répondre.";
  } catch (error) {
    console.error("❌ Erreur API:", error);
    return "⚠️ Impossible de contacter l'IA.";
  }
}

// Fonction pour envoyer un message simple à Messenger
async function sendMessage(senderId, text) {
  const messageData = {
    recipient: { id: senderId },
    message: { text: text },
  };
  await sendMessageToFacebook(messageData);
}

// Fonction pour afficher l'indicateur de saisie ("typing_on")
async function showTypingIndicator(senderId) {
  await sendAction(senderId, "typing_on");
}

// Fonction pour arrêter l'indicateur de saisie ("typing_off")
async function stopTypingIndicator(senderId) {
  await sendAction(senderId, "typing_off");
}

// Fonction pour envoyer une action (ex: typing_on, typing_off)
async function sendAction(senderId, action) {
  const messageData = {
    recipient: { id: senderId },
    sender_action: action,
  };
  await sendMessageToFacebook(messageData);
}

// Envoi du message via l'API Messenger de Facebook
async function sendMessageToFacebook(messageData) {
  const url = `https://graph.facebook.com/v22.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  try {
    const response = await axios.post(url, messageData);
    console.log("📤 Message envoyé :", messageData);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur d'envoi:", error.response ? error.response.data : error.message);
  }
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
