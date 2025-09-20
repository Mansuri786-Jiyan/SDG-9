// script.js – InnoBot: SDG 9 Chatbot powered by Gemini API

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const typingIndicator = document.getElementById("typing");
const clearBtn = document.getElementById("clearChat");

// Replace with your Gemini API key
const API_KEY = "AIzaSyCGE9dY5Zbb5OuDatCegNcoaQn3qQTGcp4";

// Load DOMPurify for safe HTML rendering
const purifyScript = document.createElement('script');
purifyScript.src = 'https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js';
document.head.appendChild(purifyScript);

// Append message to chat (user or bot)
function appendMessage(message, sender) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender === 'user'
    ? 'bg-orange-100 self-end text-right ml-auto'
    : 'bg-yellow-100 mr-auto text-left'
  } p-3 rounded-xl max-w-[75%]`;

  const formatted = message
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  bubble.innerHTML = window.DOMPurify ? DOMPurify.sanitize(formatted) : formatted;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle sending message
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, "user");
  saveToHistory(text, "user");
  userInput.value = "";
  typingIndicator.classList.remove("hidden");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }]
        })
      }
    );

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Sorry, no response from Gemini.";
    appendMessage(reply, "bot");
    saveToHistory(reply, "bot");
  } catch (err) {
    console.error(err);
    appendMessage("❌ Error connecting to Gemini API.", "bot");
  } finally {
    typingIndicator.classList.add("hidden");
  }
}

// Send on Enter key
userInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

// Greet and restore chat history
window.addEventListener("load", () => {
  appendMessage("👋 Welcome to **InnoBot**, your SDG 9 AI guide. Ask me about innovation, smart infrastructure, or sustainable industries!", "bot");
  loadHistory();
});

// Save chat messages locally
function saveToHistory(message, sender) {
  try {
    const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    history.push({ message, sender });
    localStorage.setItem("chatHistory", JSON.stringify(history));
  } catch (e) {
    console.warn("Local storage not supported.");
  }
}

// Load saved chat messages
function loadHistory() {
  try {
    const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    history.forEach(({ message, sender }) => appendMessage(message, sender));
  } catch (e) {
    console.warn("Could not load chat history.");
  }
}

// Clear chat history
clearBtn?.addEventListener("click", () => {
  try {
    localStorage.removeItem("chatHistory");
    chatBox.innerHTML = "";
    appendMessage("🧹 Chat cleared! Start a new conversation with InnoBot.", "bot");
  } catch (e) {
    console.warn("Unable to clear chat.");
  }
});
