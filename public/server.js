const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

// Configuration
const GEMINI_API_KEY = "AIzaSyAArErZGDDJx7DJwExgY_pPWmN7Tjai8nk";

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint API
app.get('/api/chat', async (req, res) => {
    try {
        const userMessage = req.query.input;
        
        if (!userMessage) {
            return res.status(400).json({ error: "Le paramètre 'input' est requis" });
        }

        const aiResponse = await getGeminiResponse(userMessage);
        res.json({ response: aiResponse });
        
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

// Fonction pour appeler l'API Gemini
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

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
