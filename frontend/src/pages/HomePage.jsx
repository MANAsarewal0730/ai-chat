import React from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  Zap, 
  Brain, 
  Code, 
  Layers, 
  CheckCircle2,
  Compass
} from 'lucide-react';

export default function HomePage({ setActiveTab, onOpenSettings }) {
  const featureCards = [
    {
      id: 'chat',
      title: 'AI Chat & Mentors',
      tag: '4 Personas',
      tagColor: 'var(--accent-gold)',
      icon: MessageSquare,
      desc: 'Chat with specialized AI study personas: Code Wizard, Study Sage, Boss Coach, or Concept Alchemist.',
      actionText: 'Start Chatting',
      accentColor: '#ffd803',
      quickPrompt: 'Ask about JavaScript Closures'
    },
    {
      id: 'explain',
      title: 'Topic Explainer',
      tag: 'Structured AI',
      tagColor: 'var(--accent-cyan)',
      icon: Sparkles,
      desc: 'Get deep breakdowns: Definition, Plain-English Analogy, Practical Code Demo, Common Traps & Challenges.',
      actionText: 'Explain a Concept',
      accentColor: '#00ebc7',
      quickPrompt: 'Explain React useState'
    },
    {
      id: 'quiz',
      title: '5-Question Quiz',
      tag: 'Interactive Test',
      tagColor: 'var(--accent-pink)',
      icon: HelpCircle,
      desc: 'Generate multiple-choice quizzes on any topic with instant answer reveals and full explanations.',
      actionText: 'Launch Quiz',
      accentColor: '#ff5470',
      quickPrompt: 'Quiz on JS Arrays'
    },
    {
      id: 'summarize',
      title: 'Notes Summarizer',
      tag: 'High Yield',
      tagColor: 'var(--accent-purple)',
      icon: FileText,
      desc: 'Transform raw study notes and lecture transcripts into structured summaries, key points & glossary flashcards.',
      actionText: 'Summarize Notes',
      accentColor: '#8c52ff',
      quickPrompt: 'Paste Async/Await Notes'
    },
    {
      id: 'rag',
      title: 'Document RAG & PDF',
      tag: 'Vector Search',
      tagColor: 'var(--accent-green)',
      icon: BookOpen,
      desc: 'Upload study PDFs or text notes. LangChain splits text and retrieves verified source chunk citations.',
      actionText: 'Explore Documents',
      accentColor: '#2cb67d',
      quickPrompt: 'Upload OS Study Guide'
    },
    {
      id: 'guide',
      title: 'LangChain Codex',
      tag: 'Behind the Scenes',
      tagColor: 'var(--accent-blue)',
      icon: GraduationCap,
      desc: 'Learn how PromptTemplates, Messages, JsonOutputParsers, TextSplitters, and MemoryVectorStores operate.',
      actionText: 'View Guide',
      accentColor: '#38bdf8',
      quickPrompt: 'Inspect LCEL Architecture'
    }
  ];

  const quickPicks = [
    { label: '⚡ Explain React useState', tab: 'explain' },
    { label: '📝 Take JS Array Quiz', tab: 'quiz' },
    { label: '🧙 Chat with Code Wizard', tab: 'chat' },
    { label: '📑 Summarize Sample Notes', tab: 'summarize' },
    { label: '📚 Query OS PDF Guide', tab: 'rag' }
  ];

  return (
    <div className="home-dashboard">
      {/* Hero Banner */}
      <div className="home-hero-card">
        <div className="hero-badge">
          <Zap size={14} color="#000000" fill="#000000" />
          <span>YOUR ALL-IN-ONE AI STUDY COMPANION</span>
        </div>

        <h1 className="hero-title">
          Master Any Topic Faster with <span style={{ color: 'var(--accent-gold)' }}>Your Study Assistant</span>
        </h1>

        <p className="hero-subtitle">
          An interactive, game-inspired study hub powered by <strong>LangChain.js</strong> and modern LLMs. 
          Chat with expert personas, break down complex topics, take instant quizzes, summarize notes, and chat with your study PDFs using RAG.
        </p>

        {/* Quick Launchpad Buttons */}
        <div className="hero-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} /> Open AI Chat
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setActiveTab('explain')}
          >
            <Sparkles size={16} /> Explain a Topic
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setActiveTab('quiz')}
          >
            <HelpCircle size={16} /> Take a Quiz
          </button>
        </div>

        {/* Quick Launch Pills */}
        <div className="quick-launch-row">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            Quick Launch:
          </span>
          <div className="quick-tags">
            {quickPicks.map((pick, idx) => (
              <button
                key={idx}
                className="quick-tag"
                onClick={() => setActiveTab(pick.tab)}
              >
                {pick.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid Section */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fffffe' }}>
              Study Modes & Modules
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Choose a study tool below to boost your learning session.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'var(--accent-purple)', color: '#fff', padding: '3px 9px', borderRadius: 'var(--radius-sm)', border: '2px solid #000', boxShadow: '0 2px 0 #000' }}>
            6 ACTIVE MODULES
          </span>
        </div>

        <div className="feature-grid">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div 
                key={card.id}
                className="feature-card"
                onClick={() => setActiveTab(card.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div 
                    className="feature-card-icon"
                    style={{ background: card.accentColor }}
                  >
                    <Icon size={22} color="#000000" />
                  </div>
                  <span 
                    className="feature-card-tag"
                    style={{ background: card.tagColor }}
                  >
                    {card.tag}
                  </span>
                </div>

                <h3 className="feature-card-title">{card.title}</h3>
                <p className="feature-card-desc">{card.desc}</p>

                <div className="feature-card-footer">
                  <span className="feature-card-action">
                    {card.actionText} <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meet Your Animal Plushies Showcase */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fffffe' }}>
              🧸 Animal Plushie Study Companions
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Your cozy coding mascots cheering you on and offering instant study tips!
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'var(--accent-gold)', color: '#000', padding: '3px 9px', borderRadius: 'var(--radius-sm)', border: '2px solid #000', boxShadow: '0 2px 0 #000' }}>
            8 CUTE BUDDIES
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
          {[
            { name: 'Cappy', icon: '🦫', tag: 'Zen Capy', bg: '#ffd803' },
            { name: 'Mochi', icon: '🐱', tag: 'Pixel Cat', bg: '#ff5470' },
            { name: 'Boba', icon: '🐰', tag: 'Bunny Sprint', bg: '#e879f9' },
            { name: 'Shiba', icon: '🐕', tag: 'Doge Cheer', bg: '#f97316' },
            { name: 'Froggy', icon: '🐸', tag: 'Sage Frog', bg: '#2cb67d' },
            { name: 'Pippin', icon: '🐧', tag: 'Penguin Quest', bg: '#00ebc7' },
            { name: 'Bao Bao', icon: '🐼', tag: 'Panda Zen', bg: '#38bdf8' },
            { name: 'Ducky', icon: '🦆', tag: 'Debugger', bg: '#ffd803' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '1rem 0.75rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: item.bg,
                border: '2px solid #000',
                boxShadow: '0 3px 0 #000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem'
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fffffe', marginTop: '4px' }}>
                {item.name}
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Concept Spotlight Card */}
      <div className="glass-card" style={{ marginTop: '2.5rem', borderLeft: '6px solid var(--accent-gold)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ background: 'var(--accent-gold)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900, border: '1px solid #000' }}>
                💡 STUDY TIP
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fffffe' }}>
                Feynman Technique with LangChain
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '780px', lineHeight: 1.5 }}>
              Use the <strong>Concept Alchemist</strong> persona in AI Chat to explain complex topics like closures, recursion, or event loops as if explaining to a 10-year old. Simplification builds rock-solid intuition!
            </p>
          </div>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('chat')}
          >
            Try Concept Alchemist <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
