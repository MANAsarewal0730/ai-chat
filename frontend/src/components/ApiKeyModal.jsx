import React, { useState, useEffect } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { getStoredSettings, saveSettings } from '../services/api';

export default function ApiKeyModal({ isOpen, onClose, onSaved }) {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredSettings();
      setProvider(current.provider || 'gemini');
      setApiKey(current.apiKey || '');
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings({ provider, apiKey: apiKey.trim() });
    setStatusMsg({ type: 'success', text: 'Settings saved successfully!' });
    if (onSaved) onSaved({ provider, apiKey: apiKey.trim() });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setApiKey('');
    saveSettings({ provider, apiKey: '' });
    setStatusMsg({ type: 'info', text: 'API Key cleared. Using backend .env default.' });
    if (onSaved) onSaved({ provider, apiKey: '' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Key className="text-accent-indigo" size={22} color="#6366f1" />
            <h2 className="modal-title">LLM API Configuration</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Configure your LLM provider and API key. Your key is stored securely in your local browser session and sent to the local LangChain backend.
        </p>

        {statusMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
            color: statusMsg.type === 'success' ? '#6ee7b7' : '#a5b4fc',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldCheck size={16} />
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label">Select LLM Provider</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${provider === 'gemini' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.65rem' }}
                onClick={() => setProvider('gemini')}
              >
                ✨ Google Gemini (Recommended)
              </button>
              <button
                type="button"
                className={`btn ${provider === 'openai' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.65rem' }}
                onClick={() => setProvider('openai')}
              >
                ⚡ OpenAI (GPT-4o)
              </button>
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label">
                {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
              </label>
              {provider === 'gemini' ? (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                >
                  Get free Gemini Key <ExternalLink size={12} />
                </a>
              ) : (
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-emerald)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                >
                  Get OpenAI Key <ExternalLink size={12} />
                </a>
              )}
            </div>
            <input
              type="password"
              className="text-input"
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoFocus
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tip: You can also set <code>GEMINI_API_KEY</code> or <code>OPENAI_API_KEY</code> in <code>backend/.env</code>.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            {apiKey && (
              <button type="button" className="btn btn-secondary" onClick={handleClear}>
                Clear
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="save-api-key-btn">
              <Check size={16} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
