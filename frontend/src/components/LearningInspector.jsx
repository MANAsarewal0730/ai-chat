import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, Cpu, Eye, Sparkles } from 'lucide-react';

export default function LearningInspector({ title, components = [], pipeline = [], rawPrompt, details }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="inspector-card">
      <button
        className="inspector-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Code2 size={16} />
          <span>🎓 LangChain Architecture Inspector: <strong>{title}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
            {isOpen ? 'Hide Architecture' : 'Inspect LangChain Flow'}
          </span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="inspector-body">
          {/* Pipeline flow */}
          {pipeline.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                LANGCHAIN EXECUTION PIPELINE:
              </div>
              <div className="pipeline-steps">
                {pipeline.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="pipeline-badge">{step}</span>
                    {idx < pipeline.length - 1 && <span className="pipeline-arrow">➔</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Components */}
          {components.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                LANGCHAIN CLASSES USED:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {components.map((comp, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#67e8f9',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem'
                    }}
                  >
                    import &#123; {comp} &#125;
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Raw Prompt / System Prompt Preview */}
          {rawPrompt && (
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                ACTIVE PROMPT / SYSTEM INSTRUCTION:
              </div>
              <pre style={{ maxHeight: '180px', fontSize: '0.78rem', whiteSpace: 'pre-wrap' }}>
                <code>{rawPrompt}</code>
              </pre>
            </div>
          )}

          {/* Extra Details */}
          {details && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
              💡 <strong>Educational Note:</strong> {details}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
