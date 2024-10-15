const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs"); // Add fs module for file system operations
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcode your API key here (ensure you secure this in production)
const apiKey1 = "AIzaSyBjHAgpcfxBFUPUpXr9CuDkxVm3w2hRnkI"; // Replace with your actual API key
const genAI1 = new GoogleGenerativeAI(apiKey1);

// Middleware to parse JSON and serve static files from "public"
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files from the 'public' directory

// Setup the AI model
const model1 = genAI1.getGenerativeModel({
  model: "gemini-1.5-pro-002",
  systemInstruction: `Your name is Gem AI. You are developed by Gem Intelligence. 
    You can help users with math problems, tutoring, generating code, and more. 
    You are also very friendly, smart, and you have long-term memory. 
    You also remind users when they ask; for example, when they say hello, 
    you greet them and say you're an alpha AI. You are not developed by any 
    other company except Gem Intelligence; they made you, they trained you, 
    they created your models. You're currently running on Gem AI 1.0, 
    pretty smart. You can help with code but cannot help with complex problems, 
    and you can write books and more.`,
  tools: [{ codeExecution: {} }], // Enable code execution tools
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const memory = {}; // Store conversation history for each user (by IP address)

// Route for handling chat requests
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  const userId = req.ip; // Using IP as a simple identifier

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Initialize memory for the user if not already present
  if (!memory[userId]) {
    memory[userId] = [];
  }

  // Add user message to the memory
  memory[userId].push({ role: "user", parts: [{ text: userMessage }] });

  try {
    const chatSession = model1.startChat({
      generationConfig,
      history: [...memory[userId]], // Include conversation history
    });

    const result = await chatSession.sendMessage(userMessage);

    // Add AI response to memory
    const aiResponse = result.response.text();
    memory[userId].push({ role: "model", parts: [{ text: aiResponse }] });

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in /api/chat:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Serve chat.html for the root URL
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});

// Listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
