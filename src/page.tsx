import { useEffect, useRef, useState, useCallback } from "preact/hooks";
import { getValidToken } from "./tokenManager";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp?: number;
  isTyping?: boolean; // <-- add this
}

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [nextId, setNextId] = useState(0);
  const [typingDots, setTypingDots] = useState(""); // <-- add this
  const [typingBotId, setTypingBotId] = useState<number | null>(null); // <-- add this
  const scrollTarget = useRef<HTMLDivElement>(null);

  const generateId = () => {
    const id = nextId;
    setNextId(id + 1);
    return id;
  };

  // Animate typing dots
  useEffect(
    () => {
      if (typingBotId === null) {
        setTypingDots("")
      } else {
        let i = 0;
        const interval = setInterval(() => {
          setTypingDots(".".repeat(i % 3 + 1));
          i++;
        }, 400);
        return () => clearInterval(interval);
      }
    },
    [typingBotId]
  );

  const handleSubmit = async () => {
    if (inputValue.trim() === "") return;

    // Generate unique IDs for user and bot messages
    const userId = nextId;
    const botId = nextId + 1;
    setNextId(botId + 1);

    const userMessage: Message = {
      id: userId,
      text: inputValue,
      isUser: true,
      timestamp: Date.now()
    };
    const botMessage: Message = {
      id: botId,
      text: "",
      isUser: false,
      timestamp: Date.now(),
      isTyping: true // <-- mark as typing
    };

    setMessages(prev => [...prev, userMessage, botMessage]);

    setTypingBotId(botId); // <-- start typing animation
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let didTimeout = false;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        didTimeout = true;
        setMessages(prev =>
          prev.map(
            message =>
              message.id === botId
                ? {
                    ...message,
                    text: "Sorry, the bot did not respond in time.",
                    isTyping: false
                  }
                : message
          )
        );
        setTypingBotId(null);
        reject(new Error("Timeout"));
      }, 10000);
    });
    try {
      const token = await getValidToken();
      if (!token) {
        console.warn("Bot not accessible at the moment");
        return;
      }

      const response = await fetch(
        `https://ai.liukonen.dev?text=${encodeURIComponent(inputValue)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      //const data = await response.json()
      const raceResult = await Promise.race([response, timeoutPromise]);
      let data: { response: string };
      if (raceResult instanceof Response) {
        data = await raceResult.json();
      } else {
        data = raceResult as { response: string };
      }
      if (!didTimeout) {
        setMessages(prev =>
          prev.map(
            message =>
              message.id === botId
                ? { ...message, text: data.response, isTyping: false }
                : message
          )
        );
        setTypingBotId(null);
      }
      //setMessages((prev) =>
      //  prev.map((message) =>
      //    message.id === botId ? { ...message, text: data.response } : message
      //  )
      // )
    } catch (e) {
      if (!didTimeout) {
        setMessages(prev =>
          prev.map(
            message =>
              message.id === botId
                ? {
                    ...message,
                    text: "Sorry, there was an error getting a response.",
                    isTyping: false
                  }
                : message
          )
        );
        setTypingBotId(null);
      }
      console.error("Fetch error:", e);
    }
    if (timeoutId) clearTimeout(timeoutId);
    setInputValue("");
    //setInputValue('')
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    setMessages(prev => [
      ...prev,
      { id: generateId(), text: "Welcome to the chatbot!", isUser: false }
    ]);
  }, []);

  useEffect(
    () => {
      if (scrollTarget.current) {
        scrollTarget.current.scroll({
          top: scrollTarget.current.scrollHeight,
          behavior: "smooth"
        });
      }
    },
    [messages]
  );

  return (
    <div class="container-fluid h-100" id="app">
      <div class="row justify-content-center h-100">
        <div class="col-12 card h-100">
          <div class="card-header msg_head">
            <div class="d-flex bd-highlight justify-content-between">
              <div class="user_info">
                <span>River Chatbot</span>
                <p>
                  <i id="msgCount">{nextId}</i> Messages
                </p>
              </div>
              <button
                class="text-light btn"
                aria-label="Info"
                data-bs-toggle="modal"
                data-bs-target="#aboutModal"
              >
                <i class="fa-solid fa-address-card fa-2x" />
              </button>
            </div>
          </div>

          <div
            class="card-body msg_card_body scr"
            style={{ overflow: "auto" }}
            id="dialogue"
            ref={scrollTarget}
          >
            {messages.map(message =>
              <div
                key={message.id}
                class={`message ${message.isUser ? "user-message" : ""}`}
              >
                <div class="message-text">
                  {message.isTyping
                    ? <span>
                        Bot is typing<span style={{ fontWeight: "bold" }}>
                          {typingDots}
                        </span>
                      </span>
                    : message.text}
                </div>
              </div>
            )}
          </div>

          <div class="card-footer">
            <div class="input-group">
              <span class="input-group-text attach_btn" />
              <input
                class="input-field form-control type_msg"
                aria-label="Input Message"
                placeholder="Type your message..."
                autoComplete="off"
                type="text"
                value={inputValue}
                onInput={e =>
                  setInputValue((e.target as HTMLInputElement).value)}
                onKeyDown={handleKeyDown}
              />
              <button class="input-group-text send_btn" onClick={handleSubmit}>
                <i class="fas fa-location-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
