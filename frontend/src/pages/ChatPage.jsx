import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User, Sparkles, Copy, Check, Info } from 'lucide-react';
import { api } from '../services/api';
import LearningInspector from '../components/LearningInspector';

const DEFAULT_PERSONAS = [
  {
    id: 'coding_mentor',
    name: 'Code Wizard',
    icon: '🧙♂️',
    tagline: 'Syntax spells, clean architecture & coding practice',
    systemPrompt: 'You are an expert Code Wizard mentor. Explain programming concepts in simple language, provide clear code examples, highlight best practices, and give practical challenges.'
  },
  {
    id: 'study_teacher',
    name: 'Study Sage',
    icon: '📜',
    tagline: 'Patient, structured quest guidance & encouragement',
    systemPrompt: 'You are a warm, structured, and patient study teacher. Guide the student step-by-step, use memorable analogies, break down topics into digestible steps, and give encouragement.'
  },
  {
    id: 'interview_coach',
    name: 'Boss Coach',
    icon: '⚔️',
    tagline: 'Interview boss fights, edge cases & Big-O strategy',
    systemPrompt: 'You are a senior tech interview coach. Challenge the student with typical interview questions, highlight time and space complexity (Big-O), point out edge cases, and teach how to articulate thought processes clearly.'
  },
  {
    id: 'concept_explainer',
    name: 'Concept Alchemist',
    icon: '🔮',
    tagline: 'Feynman technique & turning complex jargon into gold',
    systemPrompt: 'You are a Feynman-technique concept explainer. Break down complex, difficult ideas into plain intuitive language, avoiding unnecessary jargon.'
  }
];

export default function ChatPage({ onOpenSettings }) {
  const [personas, setPersonas] = useState(DEFAULT_PERSONAS);
  const [selectedPersona, setSelectedPersona] = useState('coding_mentor');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I'm your AI Study Assistant powered by LangChain.js. Choose a persona above and ask me any concept, code question, or topic you're studying!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [lastDebug, setLastDebug] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch personas from backend if available
    api.getPersonas()
      .then(res => {
        if (res.personas && res.personas.length > 0) {
          setPersonas(res.personas);
        }
      })
      .catch(err => console.warn('Using local fallback personas:', err.message));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activePersonaObj = personas.find(p => p.id === selectedPersona) || personas[0];

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setErrorMessage(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for LangChain
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          sender: m.sender,
          text: m.text
        }));

      const res = await api.sendChatMessage({
        message: text,
        history: historyPayload,
        personaId: selectedPersona
      });

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        persona: res.persona,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      if (res.debug) {
        setLastDebug(res.debug);
      }
    } catch (err) {
      console.error('Chat error:', err);
      if (err.missingKey) {
        setErrorMessage('Missing API Key. Click the Settings icon in the top right to enter your Google Gemini or OpenAI key.');
      } else {
        setErrorMessage(err.message || 'Failed to get response from AI.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Switched to ${activePersonaObj.name}. How can I help you learn today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-badge">
          <Sparkles size={13} /> Features 1 & 2 • LangChain Chat & Dynamic Personas
        </span>
        <h1 className="page-title">Interactive AI Study Chat</h1>
        <p className="page-subtitle">
          Select an AI persona to configure the system prompt. LangChain.js converts your persona into a <code>SystemMessage</code> and manages conversation history with <code>HumanMessage</code> and <code>AIMessage</code>.
        </p>
      </div>

      {/* Persona Cards Grid */}
      <div className="personas-grid">
        {personas.map((persona) => {
          const isSelected = selectedPersona === persona.id;
          return (
            <div
              key={persona.id}
              id={`persona-${persona.id}`}
              className={`persona-card ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedPersona(persona.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="persona-icon">{persona.icon}</span>
                {isSelected && (
                  <span style={{ fontSize: '0.7rem', background: 'var(--accent-indigo)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    Active
                  </span>
                )}
              </div>
              <div className="persona-name">{persona.name}</div>
              <div className="persona-tagline">{persona.tagline}</div>
            </div>
          );
        })}
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-active-persona">
            <span style={{ fontSize: '1.3rem' }}>{activePersonaObj.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activePersonaObj.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                System Prompt: "{activePersonaObj.systemPrompt.slice(0, 60)}..."
              </div>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClearChat}
            title="Reset Conversation"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>

        {/* Message Stream */}
        <div className="chat-messages">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
                <div className="message-meta">
                  {isUser ? (
                    <><span>You</span> <User size={12} /></>
                  ) : (
                    <><Bot size={12} /> <span>{msg.persona || activePersonaObj.name}</span></>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>
                <div className="message-content">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  {!isUser && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.6rem', padding: '2px 8px', fontSize: '0.72rem' }}
                      onClick={() => handleCopy(msg.text, msg.id)}
                    >
                      {copiedId === msg.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="message-bubble ai">
              <div className="message-meta"><Bot size={12} /> Thinking with LangChain...</div>
              <div className="message-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="animate-spin">⚙️</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Processing prompt through {activePersonaObj.name}...
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div style={{
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fda4af',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <span>{errorMessage}</span>
              <button className="btn btn-primary btn-sm" onClick={onOpenSettings}>
                Open Settings
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div style={{ padding: '0.5rem 1.25rem', background: 'rgba(13, 18, 30, 0.6)', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>💡 Quick Questions to Try:</div>
          <div className="quick-tags">
            <button className="quick-tag" onClick={() => handleSendMessage('What is JavaScript closure?')}>
              "What is JavaScript closure?"
            </button>
            <button className="quick-tag" onClick={() => handleSendMessage('Explain the difference between let, const, and var')}>
              "let vs const vs var"
            </button>
            <button className="quick-tag" onClick={() => handleSendMessage('How does React useEffect dependency array work?')}>
              "React useEffect deps"
            </button>
            <button className="quick-tag" onClick={() => handleSendMessage('What is Big-O notation with simple examples?')}>
              "Big-O notation"
            </button>
          </div>
        </div>

        {/* Input bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            id="chat-input-field"
            type="text"
            placeholder={`Ask ${activePersonaObj.name} anything... (e.g. "What is JavaScript closure?")`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            id="chat-send-btn"
            type="submit"
            className="btn btn-primary"
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>

      {/* Educational LangChain Inspector */}
      <LearningInspector
        title="AI Chat & Dynamic Personas"
        pipeline={['Persona SystemPrompt', 'SystemMessage', 'HumanMessage History', 'ChatModel.invoke()', 'AIMessage Response']}
        components={['SystemMessage', 'HumanMessage', 'AIMessage', 'ChatGoogleGenerativeAI / ChatOpenAI']}
        rawPrompt={activePersonaObj.systemPrompt}
        details="In LangChain.js, chat conversations are built with a sequence of messages. The SystemMessage defines the persona's personality and instructions, HumanMessage holds the student questions, and AIMessage stores past assistant responses to preserve context across turns."
      />
    </div>
  );
}
