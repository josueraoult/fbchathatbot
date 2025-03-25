require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Ton Token Meta
const VERIFY_TOKEN = "whatsApp";  // 🔹 Token pour le Webhook
const WHATSAPP_TOKEN = "EAGWp4PDBMf4BOwQm2M064dBwGrKLc7sAozIEOUcE2iAbzVvJ2zZBp6lxs0BcqxjdMH8WpZACjsdFOyeGOtIK5zZCKwb1fDgQT4LauEzfQlRzJTpZCx5n4jmW1jImCWZCkQFO4noNl16rCqgDzt1yu1zWuO9RbtVL0Gp54N3KtwN1ZCHqFngNKMdIZBlSITZB9xFAesMZD";
const API_AI_URL = "https://jonell01-ccprojectsapihshs.hf.space/api/gpt4";

app.use(bodyParser.json());

// 🔹 Vérification du Webhook
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("🔗 Webhook vérifié !");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// 🔹 Traitement des messages WhatsApp
app.post("/webhook", async (req, res) => {
    let body = req.body;

    if (body.object === "whatsapp_business_account") {
        let message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (message && message.type === "text") {
            let from = message.from; // Numéro de l'expéditeur
            let userText = message.text.body; // Message reçu

            console.log(`📩 Message reçu de ${from}: ${userText}`);

            // 🔹 Appel API AI
            try {
                let response = await axios.get(`${API_AI_URL}?ask=${encodeURIComponent(userText)}&id=1`);
                let aiResponse = response.data?.response || "Je n'ai pas compris.";

                // 🔹 Envoi de la réponse à WhatsApp
                await sendMessage(from, aiResponse);
            } catch (error) {
                console.error("❌ Erreur API AI:", error);
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// 🔹 Fonction pour envoyer un message WhatsApp
async function sendMessage(to, text) {
    try {
        await axios.post("https://graph.facebook.com/v18.0/me/messages", {
            messaging_product: "whatsapp",
            to: to,
            text: { body: text },
        }, {
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            }
        });

        console.log(`✅ Message envoyé à ${to}: ${text}`);
    } catch (error) {
        console.error("❌ Erreur envoi WhatsApp:", error.response?.data || error.message);
    }
}

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
