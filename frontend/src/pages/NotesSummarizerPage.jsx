import React, { useState } from 'react';
import { FileText, Sparkles, Key, Bookmark, Lightbulb, Copy, Check, BookOpen, Layers } from 'lucide-react';
import { api } from '../services/api';
import LearningInspector from '../components/LearningInspector';

const SAMPLE_NOTES = `JavaScript Asynchronous Programming & Promises:
JavaScript is single-threaded, meaning it has only one call stack and executes one command at a time.
To handle time-consuming tasks like network requests, timers (setTimeout), or database queries without freezing the UI, JavaScript uses the Event Loop.

A Promise is an object representing the eventual completion or failure of an asynchronous operation.
A Promise can be in one of three states:
1. Pending: Initial state, neither fulfilled nor rejected.
2. Fulfilled: The operation completed successfully.
3. Rejected: The operation failed with an error.

The async/await syntax introduced in ES2017 provides syntactic sugar on top of Promises, making asynchronous code look and behave like synchronous code.
When using await, always wrap calls inside a try...catch block to properly handle rejected promises and avoid uncaught runtime exceptions.`;

export default function NotesSummarizerPage({ onOpenSettings }) {
  const [notes, setNotes] = useState('');
  const [format, setFormat] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!notes.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSummaryData(null);

    try {
      const res = await api.summarizeNotes({
        notes: notes,
        format: format
      });
      setSummaryData(res.data);
    } catch (err) {
      console.error('Summarizer error:', err);
      if (err.missingKey) {
        setError('Missing API Key. Click Settings to configure your Google Gemini or OpenAI key.');
      } else {
        setError(err.message || 'Failed to summarize study notes.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setNotes(SAMPLE_NOTES);
  };

  const handleCopySummary = () => {
    if (!summaryData) return;
    const formatted = `## Executive Summary\n${summaryData.shortSummary}\n\n## Key Points\n${summaryData.keyPoints?.map(p => `- ${p}`).join('\n')}\n\n## Important Terms\n${summaryData.importantTerms?.map(t => `- **${t.term}**: ${t.definition}`).join('\n')}\n\n## Things To Remember\n${summaryData.thingsToRemember?.map(r => `- ${r}`).join('\n')}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-badge">
          <FileText size={13} /> Feature 5 • LangChain Notes Summarizer
        </span>
        <h1 className="page-title">Smart Notes Summarizer</h1>
        <p className="page-subtitle">
          Paste your study notes or textbook excerpts. LangChain formats the structured summarization prompt and uses <code>JsonOutputParser</code> to extract executive takeaways, key terms, and high-yield memory points.
        </p>
      </div>

      <div className="summary-container">
        {/* Input Column */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Input Study Notes</h2>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLoadSample}
            >
              <BookOpen size={13} /> Load Sample Notes
            </button>
          </div>

          <div className="input-group">
            <textarea
              id="notes-textarea"
              className="text-area"
              style={{ minHeight: '260px', fontSize: '0.9rem' }}
              placeholder="Paste your study notes, lecture transcripts, or textbook chapters here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>{notes.length} characters</span>
              <span>{notes.trim() ? notes.trim().split(/\s+/).length : 0} words</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            <select
              className="select-input"
              style={{ width: 'auto', flex: 1 }}
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              disabled={isLoading}
            >
              <option value="standard">⚡ Standard Summary (Balanced)</option>
              <option value="concise">🎯 High-Yield Bullet Points (Fast)</option>
              <option value="deep">📚 Comprehensive Study Breakdown (Detailed)</option>
            </select>

            <button
              id="summarize-btn"
              type="button"
              className="btn btn-primary"
              onClick={handleSummarize}
              disabled={!notes.trim() || isLoading}
            >
              {isLoading ? (
                <><span className="animate-spin">⚙️</span> Summarizing...</>
              ) : (
                <><Sparkles size={16} /> Summarize Notes</>
              )}
            </button>
          </div>

          {error && (
            <div style={{
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fda4af',
              fontSize: '0.85rem',
              marginTop: '1rem'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Output Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {summaryData ? (
            <>
              {/* Short Summary Card */}
              <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-indigo)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} color="#6366f1" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Executive Summary</h3>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={handleCopySummary}>
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy All</>}
                  </button>
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {summaryData.shortSummary}
                </p>
              </div>

              {/* Key Points */}
              <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <Key size={18} color="#10b981" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Key Study Points</h3>
                </div>
                <ul className="bullets-list">
                  {summaryData.keyPoints?.map((kp, idx) => (
                    <li key={idx}>{kp}</li>
                  ))}
                </ul>
              </div>

              {/* Important Terms Glossary */}
              {summaryData.importantTerms && summaryData.importantTerms.length > 0 && (
                <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <Bookmark size={18} color="#06b6d4" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Important Terms & Glossary</h3>
                  </div>
                  <div className="terms-grid">
                    {summaryData.importantTerms.map((item, idx) => (
                      <div key={idx} className="term-card">
                        <div className="term-name">{item.term}</div>
                        <div className="term-def">{item.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Things to Remember */}
              {summaryData.thingsToRemember && summaryData.thingsToRemember.length > 0 && (
                <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <Lightbulb size={18} color="#f59e0b" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Things to Remember (Flashcards)</h3>
                  </div>
                  <ul className="bullets-list">
                    {summaryData.thingsToRemember.map((tr, idx) => (
                      <li key={idx}>{tr}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '320px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={42} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Summary Generated Yet</h3>
              <p style={{ fontSize: '0.88rem', maxWidth: '320px' }}>
                Paste your notes on the left or click "Load Sample Notes" and click Summarize to see structured takeaways.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Educational LangChain Inspector */}
      <LearningInspector
        title="Notes Summarization Pipeline"
        pipeline={['Notes Input ({notes})', 'PromptTemplate with JSON schema', 'ChatModel.invoke()', 'JsonOutputParser', 'Categorized Summaries']}
        components={['PromptTemplate', 'JsonOutputParser', 'ChatModel']}
        rawPrompt="You are an expert tutor. Summarize student study notes into shortSummary, keyPoints, importantTerms [ { term, definition } ], and thingsToRemember."
        details="By asking the LLM to categorize notes into structured entities (executive summaries, key points, glossary terms, and flashcard memories), students get far better retention than reading a monolithic paragraph of text."
      />
    </div>
  );
}
