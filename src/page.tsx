import { useEffect, useRef, useState } from 'preact/hooks';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp?: number;
}

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [nextId, setNextId] = useState(0);
  const scrollTarget = useRef<HTMLDivElement>(null);

  const generateId = () => {
    const id = nextId;
    setNextId(id + 1);
    return id;
  };

  const handleSubmit = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: generateId(),
      text: inputValue,
      isUser: true,
      timestamp: Date.now(),
    };
    const botMessage: Message = {
      id: generateId(),
      text: '',
      isUser: false,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);

    try {
      const response = await fetch(
        `https://ai.liukonen.dev?text=${encodeURIComponent(inputValue)}`
      );
      const data = await response.json();

      setMessages((prev) =>
        prev.map((message) =>
          message.id === botMessage.id ? { ...message, text: data.response } : message
        )
      );
    } catch (e) {
      console.error('Fetch error:', e);
    }

    setInputValue('');
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  useEffect(() => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), text: 'Welcome to the chatbot!', isUser: false },
    ]);
  }, []);

  useEffect(() => {
    if (scrollTarget.current) {
      scrollTarget.current.scroll({ top: scrollTarget.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

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
            style={{ overflow: 'auto' }}
            id="dialogue"
            ref={scrollTarget}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                class={`message ${message.isUser ? 'user-message' : ''}`}
              >
                <div class="message-text">{message.text}</div>
              </div>
            ))}
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
                onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
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