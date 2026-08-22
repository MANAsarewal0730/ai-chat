import React from 'react';
import { Home, MessageSquare, Sparkles, HelpCircle, FileText, BookOpen, Key, GraduationCap, Gamepad2 } from 'lucide-react';
import { getStoredSettings } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, onOpenSettings }) {
  const settings = getStoredSettings();
  const hasKey = !!settings.apiKey;

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'explain', label: 'Topic Explainer', icon: Sparkles },
    { id: 'quiz', label: 'Quiz Generator', icon: HelpCircle },
    { id: 'summarize', label: 'Notes Summarizer', icon: FileText },
    { id: 'rag', label: 'Document RAG', icon: BookOpen },
    { id: 'guide', label: 'LangChain Guide', icon: GraduationCap },
  ];

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand" onClick={() => setActiveTab('home')}>
          <div className="brand-icon">
            <Gamepad2 size={24} color="#000000" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">Your Study Assistant</span>
              <span className="brand-badge">QUEST HUB</span>
            </div>
          </div>
        </div>

        <nav className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="nav-actions">
          <button
            id="settings-modal-btn"
            className="settings-btn"
            onClick={onOpenSettings}
            title="Configure LLM API Key & Provider"
          >
            <Key size={15} color="#ffd803" />
            <span className={`provider-pill ${settings.provider || 'gemini'}`}>
              {settings.provider === 'openai' ? 'OpenAI' : 'Gemini'}
            </span>
            <span style={{ fontSize: '0.75rem', color: hasKey ? '#2cb67d' : '#a7a9be' }}>
              {hasKey ? '● LVL 100' : '○ Setup Key'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
