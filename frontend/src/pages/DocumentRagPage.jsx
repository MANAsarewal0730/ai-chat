import React, { useState, useEffect } from 'react';
import { Upload, FileText, BookOpen, Layers, Search, Sparkles, Database, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Trash2, Cpu } from 'lucide-react';
import { api } from '../services/api';
import LearningInspector from '../components/LearningInspector';

const SAMPLE_DOCUMENT_TEXT = `Operating Systems & Process Management Study Guide

Chapter 1: Process Concept & Lifecycle
A process is a program in execution. It contains the program counter, stack, data section, and heap memory.
A process transitions through five primary states during its lifetime:
1. New: The process is being created.
2. Ready: The process is loaded into main memory and waiting for the CPU scheduler to allocate processor time.
3. Running: Instructions are currently being executed by the CPU.
4. Waiting (Blocked): The process is waiting for some external event (such as I/O completion or signal).
5. Terminated: The process has finished execution and system resources are deallocated.

Chapter 2: Context Switching & PCB
The Process Control Block (PCB) is a data structure maintained by the Operating System for every active process.
The PCB stores:
- Process Identification Number (PID)
- CPU registers and Program Counter
- CPU Scheduling Information (priority, scheduling queue pointers)
- Memory Management Information (page tables, base/limit registers)
- Accounting and I/O status information (list of open files)

A Context Switch is the mechanism of saving the state of the currently running process (into its PCB) and loading the saved state of a new process from its PCB.
Context switching is pure overhead because the CPU performs no useful application work while switching.

Chapter 3: Deadlocks and Conditions
A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by another process.
According to Coffman (1971), four conditions must hold simultaneously for a deadlock to occur:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources held by other processes.
3. No Preemption: Resources cannot be forcibly preempted; they can only be released voluntarily by the process holding them.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource that is needed by the next process in the chain.`;

export default function DocumentRagPage({ onOpenSettings }) {
  const [activeTab, setActiveTab] = useState('sample'); // 'file' | 'paste' | 'sample'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [docTitle, setDocTitle] = useState('Operating Systems Guide');

  // Text Splitter Config
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);

  // Status & Chunks
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentStats, setDocumentStats] = useState(null);
  const [chunksPreview, setChunksPreview] = useState([]);
  const [error, setError] = useState(null);

  // RAG Q&A
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);

  useEffect(() => {
    // Check if a document is already loaded on backend
    api.getRagStatus()
      .then(res => {
        if (res.hasActiveDocument) {
          setDocumentStats(res);
        }
      })
      .catch(e => console.warn('RAG status check error:', e.message));
  }, []);

  const handleProcessDocument = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('chunkSize', chunkSize);
      formData.append('chunkOverlap', chunkOverlap);

      if (activeTab === 'file' && selectedFile) {
        formData.append('file', selectedFile);
        formData.append('documentTitle', selectedFile.name);
      } else if (activeTab === 'paste' && pastedText.trim()) {
        formData.append('pastedText', pastedText);
        formData.append('documentTitle', docTitle || 'Pasted Notes');
      } else if (activeTab === 'sample') {
        formData.append('pastedText', SAMPLE_DOCUMENT_TEXT);
        formData.append('documentTitle', 'Operating Systems Study Guide');
      } else {
        throw new Error('Please select a file or paste study text.');
      }

      const res = await api.uploadDocument(formData);
      setDocumentStats(res);
      setChunksPreview(res.chunks || []);
      setQaHistory([]);
    } catch (err) {
      console.error('RAG ingest error:', err);
      setError(err.message || 'Failed to process document and build vector store.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAskQuestion = async (customQ) => {
    const query = customQ || question;
    if (!query.trim() || isAsking) return;

    if (customQ) setQuestion(customQ);
    setIsAsking(true);
    setError(null);

    try {
      const res = await api.queryDocument({
        question: query,
        topK: 3
      });

      setQaHistory(prev => [
        {
          id: Date.now(),
          question: query,
          answer: res.answer,
          retrievedChunks: res.retrievedChunks,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
      setQuestion('');
    } catch (err) {
      console.error('RAG query error:', err);
      if (err.missingKey) {
        setError('Missing API Key. Click Settings to configure your Google Gemini or OpenAI key.');
      } else {
        setError(err.message || 'Failed to query document.');
      }
    } finally {
      setIsAsking(false);
    }
  };

  const handleClearDocument = async () => {
    await api.clearDocument();
    setDocumentStats(null);
    setChunksPreview([]);
    setQaHistory([]);
    setSelectedFile(null);
    setPastedText('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-badge">
          <BookOpen size={13} /> Features 6, 7 & 8 • Document Loader, Text Splitting & RAG Vector Search
        </span>
        <h1 className="page-title">Document RAG & Vector Q&A</h1>
        <p className="page-subtitle">
          Upload a PDF or paste notes. LangChain splits the document with <code>RecursiveCharacterTextSplitter</code>, stores embeddings in a <code>MemoryVectorStore</code>, and retrieves relevant chunks to answer your questions with citations.
        </p>
      </div>

      <div className="rag-layout">
        {/* Left Column: Document Ingestion & Chunking Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Upload / Ingestion Card */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={18} color="#6366f1" /> Ingest Study Document
            </h2>

            {/* Source Tab Selector */}
            <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(13, 18, 30, 0.8)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'sample' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setActiveTab('sample')}
              >
                Sample CS Guide
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setActiveTab('file')}
              >
                Upload PDF / Text
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'paste' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setActiveTab('paste')}
              >
                Paste Text
              </button>
            </div>

            {/* Source Options */}
            {activeTab === 'sample' && (
              <div style={{ padding: '0.85rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1rem', fontSize: '0.83rem' }}>
                📖 <strong>Included Sample:</strong> Operating Systems (Processes, PCBs, Context Switching, Deadlock Conditions). Ready to chunk and query!
              </div>
            )}

            {activeTab === 'file' && (
              <div className="upload-dropzone" onClick={() => document.getElementById('rag-file-input').click()}>
                <input
                  id="rag-file-input"
                  type="file"
                  accept=".pdf,.txt,.md"
                  style={{ display: 'none' }}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <FileText size={32} color="#6366f1" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                  {selectedFile ? selectedFile.name : 'Click to select a PDF or Text file'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supports .pdf, .txt, .md files (up to 15MB)
                </div>
              </div>
            )}

            {activeTab === 'paste' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Document Title (e.g. Data Structures Notes)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
                <textarea
                  className="text-area"
                  style={{ minHeight: '130px', fontSize: '0.85rem' }}
                  placeholder="Paste study material here..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                />
              </div>
            )}

            {/* Feature 7: Text Splitting Configuration Sliders */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={15} color="#06b6d4" /> LangChain Text Splitter Settings
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    <span>chunkSize (Characters)</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{chunkSize}</strong>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1500"
                    step="50"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Maximum characters allowed per chunk.
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    <span>chunkOverlap (Characters)</span>
                    <strong style={{ color: 'var(--accent-indigo)' }}>{chunkOverlap}</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="25"
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-indigo)' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Overlap between neighboring chunks to preserve contextual flow.
                  </div>
                </div>
              </div>
            </div>

            <button
              id="ingest-doc-btn"
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem' }}
              onClick={handleProcessDocument}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <><span className="animate-spin">⚙️</span> Chunking & Embedding...</>
              ) : (
                <><Database size={16} /> Split Text & Build Vector Store</>
              )}
            </button>
          </div>

          {/* Active Vector Store Status & Chunks Viewer */}
          {documentStats && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Active Vector Store</span>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={handleClearDocument}
                  title="Unload Document"
                >
                  <Trash2 size={12} /> Unload
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(13, 18, 30, 0.7)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DOCUMENT</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {documentStats.documentName}
                  </div>
                </div>
                <div style={{ background: 'rgba(13, 18, 30, 0.7)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL CHUNKS</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {documentStats.totalChunks || chunksPreview.length} Chunks
                  </div>
                </div>
              </div>

              {/* Chunks Inspector list */}
              {chunksPreview.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    GENERATED CHUNKS (FEATURE 7):
                  </div>
                  <div className="chunks-scroller">
                    {chunksPreview.map((chunk) => (
                      <div key={chunk.chunkIndex} className="chunk-card">
                        <div className="chunk-card-header">
                          <span>Chunk #{chunk.chunkIndex}</span>
                          <span>{chunk.charCount} chars</span>
                        </div>
                        <div>{chunk.snippet}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: RAG Document Q&A */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} color="#8b5cf6" /> Ask Questions About the Document (RAG)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Ask specific questions. LangChain performs similarity search on your vector store, injects the top-matching chunks into the prompt context, and returns an answer citing the exact source chunks.
            </p>

            {/* Quick Sample Questions */}
            {documentStats && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>💡 Quick Questions for this Document:</div>
                <div className="quick-tags">
                  <button className="quick-tag" onClick={() => handleAskQuestion('What are the 5 states of a process lifecycle?')}>
                    "Process 5 states"
                  </button>
                  <button className="quick-tag" onClick={() => handleAskQuestion('What is stored inside a Process Control Block (PCB)?')}>
                    "What is inside a PCB?"
                  </button>
                  <button className="quick-tag" onClick={() => handleAskQuestion('What are the 4 conditions required for a deadlock?')}>
                    "4 Deadlock conditions"
                  </button>
                  <button className="quick-tag" onClick={() => handleAskQuestion('Why is context switching considered pure overhead?')}>
                    "Context switch overhead"
                  </button>
                </div>
              </div>
            )}

            {/* Query Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleAskQuestion(); }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  id="rag-question-input"
                  type="text"
                  className="text-input"
                  placeholder={documentStats ? "Ask a question about the uploaded document..." : "Please ingest a document first on the left"}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={!documentStats || isAsking}
                />
                <button
                  id="rag-query-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={!documentStats || !question.trim() || isAsking}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isAsking ? (
                    <><span className="animate-spin">⚙️</span> Retrieving...</>
                  ) : (
                    <><Sparkles size={16} /> Ask RAG</>
                  )}
                </button>
              </div>
            </form>

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

          {/* Q&A History & Retrieved Source Citations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {qaHistory.map((item) => (
              <div key={item.id} className="glass-card" style={{ borderLeft: '4px solid var(--accent-indigo)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                    Q: {item.question}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.timestamp}</span>
                </div>

                <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                  {item.answer}
                </div>

                {/* Retrieved Context Chunks */}
                {item.retrievedChunks && item.retrievedChunks.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: '0.4rem' }}>
                      📚 RETRIEVED SOURCE CHUNKS (RAG CONTEXT):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {item.retrievedChunks.map((chunk, idx) => (
                        <div key={idx} className="retrieved-source-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#a5b4fc', marginBottom: '2px' }}>
                            <span>Source Chunk #{chunk.chunkIndex}</span>
                            {chunk.score && <span>Relevance: {(chunk.score * 100).toFixed(0)}%</span>}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            "{chunk.text}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Educational LangChain Inspector */}
      <LearningInspector
        title="Document RAG Pipeline (Features 6, 7 & 8)"
        pipeline={[
          'Document Loader (pdf-parse / text)',
          'RecursiveCharacterTextSplitter(chunkSize, chunkOverlap)',
          'Embeddings Model (Vectors)',
          'MemoryVectorStore.fromDocuments()',
          'similaritySearch(query, topK=3)',
          'PromptTemplate({context, question})',
          'ChatModel.invoke() (Answer with Citations)'
        ]}
        components={[
          'Document',
          'RecursiveCharacterTextSplitter',
          'GoogleGenerativeAIEmbeddings / OpenAIEmbeddings',
          'MemoryVectorStore',
          'PromptTemplate',
          'ChatModel'
        ]}
        rawPrompt="You are an AI Study Tutor. DOCUMENT CONTEXT: {context}. STUDENT QUESTION: {question}. Answer using the context and cite source chunks."
        details="RAG (Retrieval-Augmented Generation) prevents hallucination by grounding the LLM's answers in your specific uploaded study materials. The text is split into chunks, embedded into vector space, and the most mathematically similar chunks are injected into the prompt as factual context."
      />
    </div>
  );
}
