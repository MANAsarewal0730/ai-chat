# 🎓 AI Study Assistant (React + Express + LangChain.js)

A modern, beginner-friendly AI Study Assistant web application built with **JavaScript**, **React**, **Vite**, **Express.js**, and **LangChain.js**.

---

## 🌟 Key Features

1. 💬 **AI Chat**: Interactive conversation with multi-turn chat memory (`HumanMessage`, `AIMessage`, `ChatModel`).
2. 🎭 **Persona Cards**: 4 specialized study personas that dynamically configure system prompts:
   - 👨💻 **Coding Mentor**: Code snippets, syntax tips & programming practices
   - 📚 **Study Teacher**: Patient, structured & encouraging guidance
   - 🎯 **Interview Coach**: Technical interview prep, edge cases & Big-O complexity
   - 🧠 **Concept Explainer**: Feynman technique & intuitive analogies
3. 🧠 **Topic Explainer**: Deep structured concept breakdown using LangChain's `PromptTemplate` and `JsonOutputParser`:
   - 📌 Core Definition
   - 💡 Plain-English Explanation
   - 🌍 Real-Life Analogy
   - 💻 Practical Code Demonstration
   - ⭐ Key Takeaways
   - ⚠️ Common Mistakes & Pitfalls
   - 🎯 Practice Challenge
4. 📝 **5-Question Quiz Generator**: Generates 5 structured multiple-choice questions with 4 choices, answers, and educational explanations with an interactive React test runner and scoring engine.
5. 📑 **Notes Summarizer**: Transforms raw notes into executive summaries, bullet points, key terminology glossary, and flashcard takeaways.
6. 📚 **Document Upload**: PDF and Text document ingestion using `pdf-parse`.
7. ✂️ **Text Splitting**: Uses LangChain's `RecursiveCharacterTextSplitter` with configurable `chunkSize` and `chunkOverlap` sliders and visual chunk inspector.
8. ⚡ **Embeddings & Vector Store RAG**: Converts chunks into vector representations (`MemoryVectorStore`), retrieves top-K relevant chunks, and answers student questions citing exact source chunks.
9. 🎓 **LangChain Concepts Guide & Architecture Inspector**: Educational views on every tab showing the exact prompts, messages, and pipeline stages executed behind the scenes.

---

## 🛠️ Architecture & Tech Stack

```
React Frontend (Vite on port 5173)
       │
       ▼ (REST API / Multipart)
Express.js Backend (port 5000)
       │
   ┌───┴───────────────────────────────────────────┐
   ▼                                               ▼
LangChain Prompt & Chains                     RAG Pipeline
- ChatPromptTemplate                          - PDF Loader (pdf-parse)
- SystemMessage / HumanMessage / AIMessage    - RecursiveCharacterTextSplitter
- JsonOutputParser (Structured JSON)          - MemoryVectorStore & Embeddings
   │                                               │
   └───────────────┬───────────────────────────────┘
                   ▼
     LLM API (Google Gemini / OpenAI)
```

- **Frontend**: React 18, Vite, Lucide Icons, Modern Vanilla CSS (Glassmorphism, dark violet/slate theme, responsive).
- **Backend**: Node.js (ES Modules), Express.js, `langchain`, `@langchain/core`, `@langchain/google-genai`, `@langchain/openai`, `multer`, `pdf-parse`, `dotenv`.

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

*The backend runs on `http://localhost:5000`.*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

*The frontend runs on `http://localhost:5173`.*

### 3. Configure Your LLM API Key

You can configure your API key in two ways:
1. **In the Web App**: Click the **⚙️ Setup Key** button in the top navigation bar and enter your **Google Gemini** or **OpenAI** API key.
2. **In `.env`**: Create or edit `backend/.env`:
   ```env
   PORT=5000
   DEFAULT_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

*Get a free Gemini API key at: [Google AI Studio](https://aistudio.google.com/app/apikey)*

---

## 📂 Project Structure

```
├── backend/
│   ├── config/
│   │   └── llm.js           # LangChain ChatModel & Embeddings factory
│   ├── routes/
│   │   ├── chat.js          # Features 1 & 2: Chat & Personas
│   │   ├── explain.js       # Feature 3: Topic Explainer
│   │   ├── quiz.js          # Feature 4: Quiz Generator
│   │   ├── summarize.js     # Feature 5: Notes Summarizer
│   │   └── rag.js           # Features 6, 7 & 8: Document Loader, Splitter & RAG Q&A
│   ├── server.js            # Express server entry point
│   ├── .env.example         # Environment template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx            # Top navigation & provider status
    │   │   ├── ApiKeyModal.jsx       # API Key configuration modal
    │   │   └── LearningInspector.jsx # Educational LangChain inspector drawer
    │   ├── pages/
    │   │   ├── ChatPage.jsx          # Feature 1 & 2 UI
    │   │   ├── TopicExplainerPage.jsx# Feature 3 UI
    │   │   ├── QuizGeneratorPage.jsx # Feature 4 UI
    │   │   ├── NotesSummarizerPage.jsx# Feature 5 UI
    │   │   ├── DocumentRagPage.jsx   # Feature 6, 7 & 8 UI
    │   │   └── LangChainGuidePage.jsx# Concept reference page
    │   ├── services/
    │   │   └── api.js                # Frontend API client
    │   ├── App.jsx                   # Main layout
    │   ├── App.css                   # Modern component styles
    │   └── index.css                 # Design tokens & dark theme
    ├── index.html
    ├── vite.config.js
    └── package.json
```
