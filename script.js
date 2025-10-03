const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const typingIndicator = document.getElementById("typingIndicator");
    const clearBtn = document.getElementById("clearChat");

    const API_KEY = "AIzaSyCGE9dY5Zbb5OuDatCegNcoaQn3qQTGcp4";
    
    // Store chat history in memory
    let chatHistory = [];

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Append message to chat
    function appendMessage(message, sender) {
      const messageWrapper = document.createElement("div");
      messageWrapper.className = `flex gap-3 ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

      const avatar = document.createElement("div");
      avatar.className = `avatar ${sender === 'user' ? 'avatar-user order-2' : 'avatar-bot'}`;
      avatar.textContent = sender === 'user' ? '👤' : '🤖';

      const bubble = document.createElement("div");
      bubble.className = `message-${sender} px-5 py-3 max-w-[75%] md:max-w-[65%]`;

      const formatted = message
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      bubble.innerHTML = DOMPurify.sanitize(formatted);
      
      messageWrapper.appendChild(avatar);
      messageWrapper.appendChild(bubble);
      chatBox.appendChild(messageWrapper);
      
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Handle sending message
    async function sendMessage() {
      const text = userInput.value.trim();
      if (!text || sendBtn.disabled) return;

      appendMessage(text, "user");
      chatHistory.push({ message: text, sender: "user" });
      
      userInput.value = "";
      userInput.style.height = 'auto';
      sendBtn.disabled = true;
      typingIndicator.classList.remove("hidden");

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ 
                parts: [{ 
                  text: `You are InnoBot, an AI assistant specialized in SDG 9 (Industry, Innovation, and Infrastructure). Provide helpful, accurate, and engaging responses. User question: ${text}` 
                }] 
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              }
            })
          }
        );

        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Sorry, I couldn't generate a response. Please try again.";
        
        appendMessage(reply, "bot");
        chatHistory.push({ message: reply, sender: "bot" });
      } catch (err) {
        console.error("Error:", err);
        appendMessage("❌ Error connecting to Gemini API. Please check your connection and try again.", "bot");
      } finally {
        typingIndicator.classList.add("hidden");
        sendBtn.disabled = false;
        userInput.focus();
      }
    }

    // Send on Enter (Shift+Enter for new line)
    userInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Send button click
    sendBtn.addEventListener("click", sendMessage);

    // Clear chat
    clearBtn.addEventListener("click", () => {
      chatHistory = [];
      chatBox.innerHTML = "";
      appendMessage("👋 Welcome to **InnoBot**! I'm your SDG 9 AI guide specialized in innovation, smart infrastructure, and sustainable industries. How can I assist you today?", "bot");
    });

    // Initial welcome message
    window.addEventListener("load", () => {
      appendMessage("👋 Welcome to **InnoBot**! I'm your SDG 9 AI guide specialized in innovation, smart infrastructure, and sustainable industries. How can I assist you today?", "bot");
      userInput.focus();
    });