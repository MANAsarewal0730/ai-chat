import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import BackgroundAnimation from './components/BackgroundAnimation';
import StudyPlushie from './components/StudyPlushie';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import TopicExplainerPage from './pages/TopicExplainerPage';
import QuizGeneratorPage from './pages/QuizGeneratorPage';
import NotesSummarizerPage from './pages/NotesSummarizerPage';
import DocumentRagPage from './pages/DocumentRagPage';
import LangChainGuidePage from './pages/LangChainGuidePage';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    // Check backend health
    api.checkHealth()
      .then(data => setBackendHealth(data))
      .catch(err => console.warn('Backend health check error:', err));
  }, []);

  return (
    <div className="app-container">
      {/* Codédex Retro Animated Starfield & Aurora Background */}
      <BackgroundAnimation />

      {/* Interactive Animal Plushie Study Buddy Mascot */}
      <StudyPlushie />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
        {activeTab === 'chat' && (
          <ChatPage onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {activeTab === 'explain' && (
          <TopicExplainerPage onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {activeTab === 'quiz' && (
          <QuizGeneratorPage onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {activeTab === 'summarize' && (
          <NotesSummarizerPage onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {activeTab === 'rag' && (
          <DocumentRagPage onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {activeTab === 'guide' && (
          <LangChainGuidePage />
        )}
      </main>

      {/* API Key / Provider Configuration Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          api.checkHealth().then(data => setBackendHealth(data));
        }}
      />

      {/* Footer */}
      <footer style={{
        padding: '1.25rem 1.5rem',
        borderTop: '2px solid var(--border-codedex)',
        background: '#120f1d',
        marginTop: '2.5rem',
        boxShadow: '0 -4px 0 #000000'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👾 <strong>Your Study Assistant</strong> • Built with React, Express & LangChain.js 🎮</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: backendHealth ? '#2cb67d' : 'var(--accent-gold)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: backendHealth ? '#2cb67d' : '#ffd803' }} />
              Backend: {backendHealth ? 'Online (Port 5000)' : 'Connecting...'}
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'underline' }}
            >
              Configure API Keys
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
