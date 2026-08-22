import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, MessageCircle, X, Shuffle, RefreshCw } from 'lucide-react';

export const PLUSHIES = [
  {
    id: 'capybara',
    name: 'Cappy Capybara',
    icon: '🦫',
    tag: 'Zen Master',
    bg: '#ffd803',
    quotes: [
      "No stress, just chill vibes & clean code. You're doing amazing! ✨",
      "One concept at a time. Slow and steady wins the quest! 🌿",
      "Drink some water, stretch your paws, and let's conquer this! 🧋",
      "Even complex bugs melt away when you stay calm. 🦫"
    ]
  },
  {
    id: 'cat',
    name: 'Mochi Pixel Cat',
    icon: '🐱',
    tag: 'Purrfect Reviewer',
    bg: '#ff5470',
    quotes: [
      "Purr-fect syntax detected! Keep going! 🐾",
      "I believe in you! Meow is the time to ace your studies! 💖",
      "Take a mini 2-minute break if you get stuck. Then jump right back! 🧶",
      "You're becoming a legendary developer one line at a time! 🐱"
    ]
  },
  {
    id: 'bunny',
    name: 'Boba Bunny',
    icon: '🐰',
    tag: 'Study Sprinter',
    bg: '#e879f9',
    quotes: [
      "Hop into your study session! Let's generate a 5-question quiz! 🥕",
      "Your brain is leveling up with every prompt! 🌟",
      "You've got this! Hopping through concepts with ease! ✨",
      "Remember: practice makes permanent! Keep learning! 🐰"
    ]
  },
  {
    id: 'shiba',
    name: 'Shiba Doge',
    icon: '🐕',
    tag: 'Cheerleader',
    bg: '#f97316',
    quotes: [
      "Much study! Very intelligence! Wow! 🐕",
      "Such clean LangChain pipeline! So fast! 🌟",
      "High-five! You're making awesome progress today! 🐾",
      "Best student ever! Treat yourself after finishing this chapter! 🦴"
    ]
  },
  {
    id: 'frog',
    name: 'Froggy Sage',
    icon: '🐸',
    tag: 'Deep Thinker',
    bg: '#2cb67d',
    quotes: [
      "Ribbit! Deep breaths! Break big problems into tiny leaps! 🍃",
      "Every master coder was once a beginner tadpole. 🐸",
      "Use the Topic Explainer to see real-life analogies! 💡",
      "Leap forward with confidence today! 🌟"
    ]
  },
  {
    id: 'penguin',
    name: 'Pippin Penguin',
    icon: '🐧',
    tag: 'Quest Guide',
    bg: '#00ebc7',
    quotes: [
      "Slide smoothly through any tough topic! ❄️",
      "Ready to explore the Document RAG Quest with me? 📚",
      "Cool as ice! Your study streak is looking awesome! 🐧",
      "Together we can master any algorithm! 🧊"
    ]
  },
  {
    id: 'panda',
    name: 'Bao Bao Panda',
    icon: '🐼',
    tag: 'Snack Master',
    bg: '#38bdf8',
    quotes: [
      "Munching on bamboo & algorithms! Learning is fun! 🎋",
      "Consistency is your greatest superpower! 🐼",
      "Did you know LangChain connects LLMs to your documents? Cool, right! 🤖",
      "Stay curious and happy studying! 🌸"
    ]
  },
  {
    id: 'duck',
    name: 'Ducky Debugger',
    icon: '🦆',
    tag: 'Rubber Ducky',
    bg: '#ffd803',
    quotes: [
      "Quack! Explain your code to me out loud, line by line! 🦆",
      "Rubber duck debugging always works like magic! 💡",
      "Found a bug? Don't worry, it's just a learning moment! 🌟",
      "Quack quack! You're unstoppable today! 🦆"
    ]
  }
];

export default function StudyPlushie() {
  const [selectedId, setSelectedId] = useState('capybara');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);

  const activePlushie = PLUSHIES.find(p => p.id === selectedId) || PLUSHIES[0];

  const handleNextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % activePlushie.quotes.length);
    setShowSpeechBubble(true);
  };

  const handleSelectPlushie = (id) => {
    setSelectedId(id);
    setCurrentQuoteIndex(0);
    setShowSpeechBubble(true);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Floating Mascot Companion in Bottom Right */}
      <div className="plushie-floating-container">
        {/* Speech Bubble */}
        {showSpeechBubble && (
          <div className="plushie-speech-bubble" onClick={handleNextQuote} title="Click to hear another cheer quote!">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {activePlushie.name} 💬
              </span>
              <button
                className="plushie-bubble-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeechBubble(false);
                }}
                aria-label="Close speech bubble"
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#fffffe', lineHeight: 1.45, fontWeight: 600 }}>
              "{activePlushie.quotes[currentQuoteIndex]}"
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                click for next tip ➔
              </span>
            </div>
          </div>
        )}

        {/* Mascot Avatar Button */}
        <div className="plushie-avatar-btn-wrapper">
          <button
            className="plushie-avatar-btn"
            style={{ borderColor: activePlushie.bg }}
            onClick={() => setIsModalOpen(true)}
            title={`Your Study Buddy: ${activePlushie.name} (Click to switch buddy!)`}
          >
            <span className="plushie-emoji">{activePlushie.icon}</span>
            <span className="plushie-mini-badge" style={{ background: activePlushie.bg }}>
              BUDDY
            </span>
          </button>
        </div>
      </div>

      {/* Plushie Selector Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content plushie-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.6rem' }}>🧸</span>
                <div>
                  <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>Choose Your Study Plushie Buddy</h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Pick an adorable companion to accompany your study quests & cheer you on!
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Plushies Grid */}
            <div className="plushie-grid">
              {PLUSHIES.map((plushie) => {
                const isSelected = plushie.id === selectedId;
                return (
                  <div
                    key={plushie.id}
                    className={`plushie-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectPlushie(plushie.id)}
                  >
                    <div className="plushie-card-emoji-box" style={{ background: plushie.bg }}>
                      <span style={{ fontSize: '2rem' }}>{plushie.icon}</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fffffe' }}>
                          {plushie.name}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'var(--accent-gold)', color: '#000', padding: '1px 6px', borderRadius: '4px', border: '1px solid #000' }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        {plushie.tag}
                      </span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px', fontStyle: 'italic' }}>
                        "{plushie.quotes[0]}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--border-codedex)', paddingTop: '1rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const random = PLUSHIES[Math.floor(Math.random() * PLUSHIES.length)];
                  handleSelectPlushie(random.id);
                }}
              >
                <Shuffle size={14} /> Random Buddy
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Let's Study! 🌟
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
