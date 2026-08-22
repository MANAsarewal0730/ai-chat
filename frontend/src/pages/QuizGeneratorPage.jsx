import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, Sparkles, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import LearningInspector from '../components/LearningInspector';

export default function QuizGeneratorPage({ onOpenSettings }) {
  const [topic, setTopic] = useState('JavaScript Arrays');
  const [difficulty, setDifficulty] = useState('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Quiz State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIdx]: selectedOption }
  const [isFinished, setIsFinished] = useState(false);

  const sampleTopics = [
    'JavaScript Arrays',
    'React Hooks',
    'Async JavaScript & Promises',
    'HTML5 & DOM API',
    'CSS Grid & Flexbox',
    'SQL Database Basics'
  ];

  const handleGenerateQuiz = async (customTopic) => {
    const targetTopic = customTopic || topic;
    if (!targetTopic.trim() || isLoading) return;

    if (customTopic) setTopic(customTopic);
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentIdx(0);
    setUserAnswers({});
    setIsFinished(false);

    try {
      const res = await api.generateQuiz({
        topic: targetTopic,
        difficulty: difficulty
      });
      if (Array.isArray(res.questions) && res.questions.length > 0) {
        setQuestions(res.questions);
      } else {
        throw new Error('No quiz questions returned.');
      }
    } catch (err) {
      console.error('Quiz error:', err);
      if (err.missingKey) {
        setError('Missing API Key. Please configure your Google Gemini or OpenAI key in Settings.');
      } else {
        setError(err.message || 'Failed to generate quiz questions.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    // If already answered this question, do nothing
    if (userAnswers[currentIdx] !== undefined) return;

    setUserAnswers(prev => ({
      ...prev,
      [currentIdx]: option
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setUserAnswers({});
    setCurrentIdx(0);
    setIsFinished(false);
  };

  // Calculate score
  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        score++;
      }
    });
    return score;
  };

  const currentQ = questions[currentIdx];
  const hasAnsweredCurrent = userAnswers[currentIdx] !== undefined;
  const currentSelection = userAnswers[currentIdx];

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-badge">
          <HelpCircle size={13} /> Feature 4 • LangChain 5-Question Quiz Generator
        </span>
        <h1 className="page-title">Interactive AI Quiz Generator</h1>
        <p className="page-subtitle">
          Generate an instant 5-question multiple choice test on any subject. LangChain's <code>JsonOutputParser</code> validates and shapes the questions, options, answers, and educational explanations.
        </p>
      </div>

      {/* Quiz Configuration Form */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleGenerateQuiz(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', alignItems: 'end' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="quiz-topic-input">Quiz Subject / Topic</label>
              <input
                id="quiz-topic-input"
                type="text"
                className="text-input"
                placeholder="e.g. JavaScript Arrays, React Hooks, Node.js Modules..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Difficulty</label>
              <select
                id="quiz-difficulty-select"
                className="select-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isLoading}
              >
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">⚡ Intermediate</option>
                <option value="advanced">🔥 Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="quick-tags">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Try:</span>
              {sampleTopics.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="quick-tag"
                  onClick={() => handleGenerateQuiz(sample)}
                  disabled={isLoading}
                >
                  {sample}
                </button>
              ))}
            </div>

            <button
              id="generate-quiz-btn"
              type="submit"
              className="btn btn-primary"
              disabled={!topic.trim() || isLoading}
            >
              {isLoading ? (
                <><span className="animate-spin">⚙️</span> Building 5 Questions...</>
              ) : (
                <><Sparkles size={16} /> Generate 5-Question Quiz</>
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

      {/* Quiz Runner */}
      {questions.length > 0 && !isFinished && currentQ && (
        <div className="quiz-runner-container">
          {/* Progress Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>
              {Math.round(((currentIdx + 1) / questions.length) * 100)}% Completed
            </span>
          </div>

          <div className="quiz-progress-bar-bg">
            <div
              className="quiz-progress-bar-fill"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Box */}
          <div className="quiz-question-box">
            <div className="quiz-question-text">
              {currentIdx + 1}. {currentQ.question}
            </div>

            {/* Options List */}
            <div className="quiz-options-list">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = currentSelection === opt;
                const isCorrect = opt === currentQ.answer;
                
                let btnClass = 'quiz-option-btn';
                if (hasAnsweredCurrent) {
                  if (isCorrect) btnClass += ' correct';
                  else if (isSelected && !isCorrect) btnClass += ' wrong';
                } else if (isSelected) {
                  btnClass += ' selected';
                }

                return (
                  <button
                    key={optIdx}
                    id={`quiz-option-${optIdx}`}
                    className={btnClass}
                    onClick={() => handleSelectOption(opt)}
                    disabled={hasAnsweredCurrent}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {hasAnsweredCurrent && isCorrect && (
                      <CheckCircle2 size={18} color="#10b981" />
                    )}
                    {hasAnsweredCurrent && isSelected && !isCorrect && (
                      <XCircle size={18} color="#f43f5e" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Explanation Reveal */}
            {hasAnsweredCurrent && (
              <div className="quiz-explanation-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {currentSelection === currentQ.answer ? (
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
                      🎉 Correct!
                    </span>
                  ) : (
                    <span style={{ color: '#f43f5e', fontWeight: 700, fontSize: '0.9rem' }}>
                      ✕ Incorrect. The right answer is: "{currentQ.answer}"
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  💡 <strong>Explanation:</strong> {currentQ.explanation}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    id="quiz-next-btn"
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    {currentIdx < questions.length - 1 ? (
                      <>Next Question <ArrowRight size={16} /></>
                    ) : (
                      <>View Final Results <Award size={16} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Finished Score Screen */}
      {isFinished && (
        <div className="quiz-runner-container">
          <div className="glass-card quiz-score-card">
            <Award size={48} color="#8b5cf6" />
            <div className="score-circle">
              {calculateScore()} / {questions.length}
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              {calculateScore() === questions.length ? '🌟 Perfect Score! Outstanding!' :
               calculateScore() >= 3 ? '👏 Great Job! Solid Mastery!' :
               '💪 Keep Practicing! Learning is a journey!'}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px' }}>
              You answered {calculateScore()} out of {questions.length} questions correctly ({Math.round((calculateScore() / questions.length) * 100)}% accuracy) on "{topic}".
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={handleRestart}>
                <RotateCcw size={16} /> Retake Same Quiz
              </button>
              <button className="btn btn-primary" onClick={() => handleGenerateQuiz()}>
                <Sparkles size={16} /> Generate New Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Educational LangChain Inspector */}
      <LearningInspector
        title="Quiz Generator Pipeline"
        pipeline={['PromptTemplate (JSON Schema specification)', 'ChatModel (Generates 5 MCQs)', 'JsonOutputParser (Validates array)', 'Interactive React Quiz Engine']}
        components={['PromptTemplate', 'JsonOutputParser', 'ChatGoogleGenerativeAI / ChatOpenAI']}
        rawPrompt="You are an expert exam creator. Generate a high-quality 5-question multiple choice quiz on topic: {topic}. Output strictly JSON array matching [{ id, question, options: [4], answer, explanation }]"
        details="By combining PromptTemplate with JsonOutputParser, LangChain guarantees structured data returns. This turns LLM text generation into reliable, structured application state that can power interactive React test steppers and scoring systems."
      />
    </div>
  );
}
