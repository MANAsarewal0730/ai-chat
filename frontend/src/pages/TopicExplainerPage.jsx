import React, { useState } from 'react';
import { Sparkles, BookOpen, Lightbulb, Globe, Code, CheckCircle, AlertTriangle, HelpCircle, Copy, Check, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import LearningInspector from '../components/LearningInspector';

export default function TopicExplainerPage({ onOpenSettings }) {
  const [topic, setTopic] = useState('React useState');
  const [level, setLevel] = useState('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [debugData, setDebugData] = useState(null);

  const sampleTopics = [
    'React useState',
    'JavaScript Closures',
    'Event Loop & Call Stack',
    'Promises & Async/Await',
    'CSS Flexbox vs Grid',
    'REST APIs & HTTP Methods'
  ];

  const handleExplain = async (customTopic) => {
    const targetTopic = customTopic || topic;
    if (!targetTopic.trim() || isLoading) return;

    if (customTopic) setTopic(customTopic);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.explainTopic({
        topic: targetTopic,
        level: level
      });
      setResult(res.data);
      if (res.debug) setDebugData(res.debug);
    } catch (err) {
      console.error('Topic explain error:', err);
      if (err.missingKey) {
        setError('Missing API Key. Please click Settings to configure your Google Gemini or OpenAI key.');
      } else {
        setError(err.message || 'Failed to explain topic.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (codeStr) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-badge">
          <Sparkles size={13} /> Feature 3 • LangChain Structured Topic Explainer
        </span>
        <h1 className="page-title">Topic Explainer & Concept Breakdown</h1>
        <p className="page-subtitle">
          Enter any programming or computer science topic. LangChain's <code>PromptTemplate</code> formats the request, and <code>JsonOutputParser</code> guarantees a structured educational response.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleExplain(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', alignItems: 'end' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="topic-input">Enter Topic to Explain</label>
              <input
                id="topic-input"
                type="text"
                className="text-input"
                placeholder="e.g. React useState, JavaScript Closures, Binary Search..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Complexity Level</label>
              <select
                id="level-select"
                className="select-input"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={isLoading}
              >
                <option value="beginner">🌱 Beginner (Simple & intuitive)</option>
                <option value="intermediate">⚡ Intermediate (Deeper mechanics)</option>
                <option value="advanced">🔥 Advanced (Under the hood)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="quick-tags">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Popular:</span>
              {sampleTopics.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="quick-tag"
                  onClick={() => handleExplain(sample)}
                  disabled={isLoading}
                >
                  {sample}
                </button>
              ))}
            </div>

            <button
              id="explain-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={!topic.trim() || isLoading}
            >
              {isLoading ? (
                <><span className="animate-spin">⚙️</span> Generating Breakdown...</>
              ) : (
                <><Sparkles size={16} /> Explain Concept</>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          color: '#fda4af',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <span>{error}</span>
          <button className="btn btn-primary btn-sm" onClick={onOpenSettings}>
            Open Settings
          </button>
        </div>
      )}

      {/* Structured Result Cards */}
      {result && (
        <div className="explainer-results-grid">
          {/* Header & Definition */}
          <div className="explainer-card" style={{ borderLeft: '4px solid var(--accent-indigo)' }}>
            <div className="explainer-card-header">
              <BookOpen size={20} color="#6366f1" />
              <h3>1. Core Definition</h3>
              <span className="explainer-pill">{result.topic}</span>
            </div>
            <p style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 500, lineHeight: 1.6 }}>
              {result.definition}
            </p>
          </div>

          {/* Easy Explanation & Real Life Metaphor (Side by Side) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="explainer-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
              <div className="explainer-card-header">
                <Lightbulb size={20} color="#06b6d4" />
                <h3>2. Easy Plain-English Explanation</h3>
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {result.easyExplanation}
              </p>
            </div>

            <div className="explainer-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
              <div className="explainer-card-header">
                <Globe size={20} color="#10b981" />
                <h3>3. Real-Life Analogy</h3>
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {result.realLifeExample}
              </p>
            </div>
          </div>

          {/* Code Example */}
          {result.codeExample && (
            <div className="explainer-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
              <div className="explainer-card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Code size={20} color="#8b5cf6" />
                  <h3>4. Practical Code Demonstration</h3>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopyCode(result.codeExample)}
                >
                  {copiedCode ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Code</>}
                </button>
              </div>
              <pre>
                <code>{result.codeExample}</code>
              </pre>
            </div>
          )}

          {/* Key Points & Common Mistakes (Side by Side) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="explainer-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
              <div className="explainer-card-header">
                <CheckCircle size={20} color="#f59e0b" />
                <h3>5. Important Takeaways</h3>
              </div>
              <ul className="bullets-list">
                {result.importantPoints?.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="explainer-card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
              <div className="explainer-card-header">
                <AlertTriangle size={20} color="#f43f5e" />
                <h3>6. Common Pitfalls & Mistakes</h3>
              </div>
              <ul className="bullets-list mistakes-list">
                {result.commonMistakes?.map((mstk, idx) => (
                  <li key={idx}>{mstk}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Practice Question */}
          {result.practiceQuestion && (
            <div className="explainer-card" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
              <div className="explainer-card-header">
                <HelpCircle size={20} color="#a5b4fc" />
                <h3 style={{ color: '#c7d2fe' }}>7. Practice Challenge / Self Check</h3>
              </div>
              <p style={{ color: '#e0e7ff', fontSize: '0.95rem', fontWeight: 500 }}>
                {result.practiceQuestion}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Educational LangChain Inspector */}
      <LearningInspector
        title="Topic Explainer Structured Pipeline"
        pipeline={['PromptTemplate.fromTemplate()', 'PromptTemplate.pipe(ChatModel)', 'pipe(JsonOutputParser)', 'Structured JavaScript Object']}
        components={['PromptTemplate', 'JsonOutputParser', 'ChatModel', 'LCEL Pipe (|)']}
        rawPrompt={debugData?.formattedPromptSnippet || 'PromptTemplate: You are an expert AI educator. Explain {topic} at a {level} level in structured JSON...'}
        details="LangChain's LCEL (LangChain Expression Language) allows chaining the prompt, the LLM model, and the OutputParser together using the .pipe() syntax. The JsonOutputParser automatically instructs the model to return JSON conforming to the requested schema and parses it safely into a JavaScript Object."
      />
    </div>
  );
}
