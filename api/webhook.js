require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

// Configuration Gemini
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

// Vérification du webhook
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.MESSENGER_VERIFY_TOKEN) {
    console.log("Webhook vérifié");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Échec de la vérification. Tokens invalides.");
    res.sendStatus(403);
  }
});

// Gestion des messages
app.post('/webhook', async (req, res) => {
  const body = req.body;
  
  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        if (event.message) {
          await handleMessage(event);
        } else if (event.postback) {
          await handlePostback(event);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Gestion des messages entrants
async function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;
  
  try {
    // Appel à l'API Gemini
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
          text: messageText
        }]
      }]
    });
    
    const geminiResponse = response.data.candidates[0].content.parts[0].text;
    
    await sendMessage(senderId, geminiResponse);
  } catch (error) {
    console.error("Erreur avec Gemini:", error);
    await sendMessage(senderId, "Désolé, je n'ai pas pu traiter votre demande.");
  }
}

// Gestion des postbacks (boutons)
async function handlePostback(event) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;
  
  if (payload === 'GET_STARTED') {
    await sendWelcomeMessage(senderId);
  }
}

// Envoi du message de bienvenue avec bouton
async function sendWelcomeMessage(recipientId) {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Bienvenue sur notre chatbot!",
            image_url: "https://example.com/welcome-image.jpg",
            subtitle: "Comment puis-je vous aider aujourd'hui?",
            buttons: [{
              type: "postback",
              title: "Parler à l'IA",
              payload: "TALK_TO_AI"
            }]
          }]
        }
      }
    }
  };
  
  await callSendAPI(messageData);
}

// Envoi de message texte simple
async function sendMessage(recipientId, messageText) {
  const messageData = {
    recipient: { id: recipientId },
    message: { text: messageText }
  };
  
  await callSendAPI(messageData);
}

// Appel de l'API d'envoi de Messenger
async function callSendAPI(messageData) {
  try {
    await axios.post(`https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.MESSENGER_PAGE_ACCESS_TOKEN}`, messageData);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error.response.data);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook écoutant sur le port ${PORT}`);
});
