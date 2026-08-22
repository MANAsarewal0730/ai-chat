import React, { useState } from 'react';
import { GraduationCap, BookOpen, Cpu, MessageSquare, Database, Layers, ArrowRight, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LangChainGuidePage() {
  const [activeConcept, setActiveConcept] = useState('messages');

  const concepts = [
    {
      id: 'messages',
      title: '1. Message Types & Chat Models',
      icon: MessageSquare,
      summary: 'How LangChain represents conversational turns with SystemMessage, HumanMessage, and AIMessage.',
      code: `import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({ apiKey: "...", modelName: "gemini-1.5-flash" });

const messages = [
  new SystemMessage("You are a Coding Mentor persona. Explain in simple terms."),
  new HumanMessage("What is a closure in JavaScript?"),
  new AIMessage("A closure is a function bundled with its lexical environment."),
  new HumanMessage("Can you give a short code example?")
];

const response = await model.invoke(messages);
console.log(response.content);`,
      explanation: 'SystemMessage sets the AI behavior/persona. HumanMessage contains user prompts. AIMessage contains past AI responses to preserve memory across multi-turn chats.'
    },
    {
      id: 'prompts',
      title: '2. Prompt Templates',
      icon: Sparkles,
      summary: 'Dynamic templates with variable substitution for clean, reusable prompts.',
      code: `import { PromptTemplate } from "@langchain/core/prompts";

const template = PromptTemplate.fromTemplate(
  "Explain the programming concept: {topic} to a {level} student with a real-life analogy."
);

// Format dynamically:
const formattedPrompt = await template.format({
  topic: "React useEffect",
  level: "beginner"
});`,
      explanation: 'Instead of concatenating strings manually with + or backticks, PromptTemplates allow you to define structured templates with {variables} that can be validated and piped into models.'
    },
    {
      id: 'parsers',
      title: '3. Output Parsers (Structured JSON)',
      icon: Code2,
      summary: 'Transforming unstructured LLM text strings into strongly typed JavaScript objects.',
      code: `import { JsonOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const parser = new JsonOutputParser();

// LangChain Expression Language (LCEL) chain:
const chain = promptTemplate.pipe(model).pipe(parser);

// Result is a parsed JavaScript object, ready for React state!
const quizData = await chain.invoke({ topic: "JavaScript Arrays" });
console.log(quizData[0].question);`,
      explanation: 'JsonOutputParser automatically instructs the LLM to output valid JSON matching your schema and parses the text into a clean JavaScript object or array for React components.'
    },
    {
      id: 'splitters',
      title: '4. RecursiveCharacterTextSplitter',
      icon: Layers,
      summary: 'Chunking long documents intelligently with chunkSize and chunkOverlap.',
      code: `import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,     // Max characters per chunk
  chunkOverlap: 50,   // Characters shared between adjacent chunks
  separators: ["\\n\\n", "\\n", " ", ""]
});

const docs = await splitter.splitDocuments([
  new Document({ pageContent: largePdfText })
]);`,
      explanation: 'LLMs have context window limits and perform better with focused passages. RecursiveCharacterTextSplitter recursively splits on paragraphs (\\n\\n), sentences (\\n), words, and characters to keep semantic units intact.'
    },
    {
      id: 'rag',
      title: '5. Embeddings & Vector Stores (RAG)',
      icon: Database,
      summary: 'Converting text chunks into numerical vectors and performing cosine similarity search.',
      code: `import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: "..." });

// 1. Ingest chunks into vector store:
const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);

// 2. Retrieve top-3 most relevant chunks for student question:
const relevantChunks = await vectorStore.similaritySearch("What causes a deadlock?", 3);

// 3. Inject relevantChunks into QA prompt to ground the LLM's answer!`,
      explanation: 'Embeddings map text to high-dimensional vectors. When a user asks a question, the vector store calculates cosine distance to find the most relevant chunks in milliseconds and feeds them to the LLM as factual context.'
    }
  ];

  const active = concepts.find(c => c.id === activeConcept) || concepts[0];

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-badge">
          <GraduationCap size={13} /> Educational Hub • LangChain.js Core Concepts
        </span>
        <h1 className="page-title">LangChain.js Beginner Learning Guide</h1>
        <p className="page-subtitle">
          Understand the foundational building blocks of LangChain.js powering this study assistant. Click any concept below to see its purpose and practical JavaScript code.
        </p>
      </div>

      {/* Concept Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {concepts.map((item) => {
          const Icon = item.icon;
          const isSelected = activeConcept === item.id;
          return (
            <button
              key={item.id}
              className={`glass-card ${isSelected ? 'active' : ''}`}
              style={{
                textAlign: 'left',
                padding: '1rem',
                border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onClick={() => setActiveConcept(item.id)}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{item.title}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Concept Breakdown */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-indigo)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>{active.title}</h2>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          {active.summary}
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: '0.5rem' }}>
            JAVASCRIPT & LANGCHAIN.JS CODE PATTERN:
          </div>
          <pre>
            <code>{active.code}</code>
          </pre>
        </div>

        <div style={{ background: 'rgba(13, 18, 30, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#67e8f9', fontWeight: 700, fontSize: '0.88rem' }}>
            <CheckCircle2 size={16} /> Why We Use This in AI Study Assistant
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            {active.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
