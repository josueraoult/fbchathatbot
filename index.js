const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 8080;

// Tokens (tu peux les mettre dans un fichier .env pour plus de sécurité)
const PAGE_ACCESS_TOKEN = "EAGWp4PDBMf4BO5IHhcUwH9PRiaMuSYU0V5TJoLJwkZBrhdByuFp5FBU9QWcPElGTf9OE3swuwMVwOxZAjbDvtFFQGgopMLcTgJodRpv6U63ZB2mSZCvuKY4E91P97Mwj5ZAkE2WDOyxYQJfXjBKEjVR33SPt1eTq86WlMNzOIKuZBUiXErqHsR3dgTeTFmxNVa";
const VERIFY_TOKEN = "fbchatbot";
const GEMINI_API_KEY = "AIzaSyAArErZGDDJx7DJwExgY_pPWmN7Tjai8nk";

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Vérification webhook
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

// Réception des messages
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    await Promise.all(
      body.entry.map(async (entry) => {
        await Promise.all(
          entry.messaging.map(async (event) => {
            const senderId = event.sender.id;

            if (event.postback && event.postback.payload === "GET_STARTED_PAYLOAD") {
              await sendMessage(senderId, "👋 Bienvenue ! Je suis **Chatbot V3**, une IA avancée. Comment puis-je vous aider ?");
              return;
            }

            if (event.message && event.message.text) {
              const userMessage = event.message.text;

              // Réponse instantanée pour activer l'indicateur "en ligne"
              await sendMessage(senderId, "𝙿𝚕𝚎𝚊𝚜𝚎  𝚠𝚊𝚒𝚝 😌...");

              const aiResponse = await getGeminiResponse(userMessage);
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

// Appel à l'API Gemini
async function getGeminiResponse(userMessage) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          parts: [{ text: userMessage }]
        }
      ]
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "⚠️ L'IA n'a pas pu répondre.";
  } catch (error) {
    console.error("❌ Erreur Gemini API:", error.response ? error.response.data : error.message);
    return "⚠️ Erreur lors de la connexion à l'IA.";
  }
}

// Envoi de message à Facebook
async function sendMessage(senderId, text) {
  const messageData = {
    recipient: { id: senderId },
    message: { text: text },
  };
  await sendMessageToFacebook(messageData);
}

// Envoi via API Facebook
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

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 Chatbot V3 en ligne sur le port ${PORT}`);
});
