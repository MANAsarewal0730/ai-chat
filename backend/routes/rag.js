/**
 * ============================================================================
 * FEATURE 6, 7 & 8: Document Upload, Text Splitting & RAG Vector Q&A
 * ============================================================================
 * 
 * LANGCHAIN CONCEPTS USED:
 * - Document Loaders: Extracting text & metadata from files (PDF / TXT).
 * - RecursiveCharacterTextSplitter: Splitting large documents into smaller chunks
 *   with configurable chunkSize & chunkOverlap so chunks fit within LLM context
 *   and preserve semantic continuity.
 * - Embeddings Model: Converting text chunks into high-dimensional vectors.
 * - MemoryVectorStore: Storing embeddings and calculating cosine similarity.
 * - Retriever & RAG Prompt: Finding the most relevant chunks for a user question
 *   and feeding them as context into the LLM.
 */

import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { getChatModel, getEmbeddingsModel, resolveProviderConfig } from '../config/llm.js';

const router = express.Router();

// Configure Multer for in-memory file uploads (max 15MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

// In-Memory Document Store session state
let activeDocumentState = {
  documentName: null,
  rawText: '',
  totalCharacters: 0,
  chunkSize: 500,
  chunkOverlap: 50,
  chunks: [], // Array of LangChain Document objects
  vectorStore: null,
  uploadedAt: null
};

// Custom lightweight Fallback Vector Store using TF-IDF / Token Cosine Similarity
// Ensures students can test the full RAG pipeline even without an Embeddings API key!
class SimpleFallbackVectorStore {
  constructor(docs = []) {
    this.docs = docs;
  }

  async similaritySearchWithScore(query, k = 3) {
    const queryTerms = query.toLowerCase().split(/\W+/).filter(Boolean);
    const scored = this.docs.map((doc, idx) => {
      const text = doc.pageContent.toLowerCase();
      let matchCount = 0;
      for (const term of queryTerms) {
        if (text.includes(term)) matchCount++;
      }
      const score = queryTerms.length > 0 ? matchCount / queryTerms.length : 0;
      return [doc, score];
    });

    scored.sort((a, b) => b[1] - a[1]);
    return scored.slice(0, k);
  }

  async similaritySearch(query, k = 3) {
    const scored = await this.similaritySearchWithScore(query, k);
    return scored.map(([doc]) => doc);
  }
}

/**
 * Helper to split text using LangChain RecursiveCharacterTextSplitter
 */
async function splitTextIntoChunks(text, docName, chunkSize = 500, chunkOverlap = 50) {
  // 1. Initialize LangChain RecursiveCharacterTextSplitter
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: Number(chunkSize) || 500,
    chunkOverlap: Number(chunkOverlap) || 50,
    separators: ["\n\n", "\n", " ", ""]
  });

  // 2. Create base LangChain Document
  const rawDoc = new Document({
    pageContent: text,
    metadata: { source: docName || 'Uploaded Document' }
  });

  // 3. Split into chunk Documents
  const splitDocs = await textSplitter.splitDocuments([rawDoc]);

  // Add chunk index metadata for UI inspection
  return splitDocs.map((doc, index) => {
    doc.metadata = {
      ...doc.metadata,
      chunkIndex: index + 1,
      chunkSize: doc.pageContent.length
    };
    return doc;
  });
}

/**
 * POST /api/rag/upload
 * Accepts PDF upload, text file, or pasted text; splits into chunks and creates vector store.
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const {
      pastedText,
      documentTitle = 'Study Document',
      chunkSize = 500,
      chunkOverlap = 50,
      provider = 'gemini',
      apiKey
    } = req.body;

    let extractedText = '';
    let fileName = documentTitle;

    // Handle File Upload (PDF or Text)
    if (req.file) {
      fileName = req.file.originalname;
      const isPdf = req.file.mimetype === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        // Parse PDF buffer using pdf-parse
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
      } else {
        // Plain text / markdown
        extractedText = req.file.buffer.toString('utf-8');
      }
    } else if (pastedText && pastedText.trim() !== '') {
      extractedText = pastedText;
      fileName = documentTitle || 'Pasted Notes Document';
    } else {
      return res.status(400).json({ error: 'Please upload a PDF/text file or paste study text.' });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'Extracted text was empty or could not be read.' });
    }

    // Split text into chunks with LangChain RecursiveCharacterTextSplitter
    const chunks = await splitTextIntoChunks(extractedText, fileName, chunkSize, chunkOverlap);

    // Build Vector Store
    let vectorStore = null;
    let vectorStoreType = 'MemoryVectorStore';

    try {
      const embeddings = getEmbeddingsModel({ provider, apiKey });
      vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
      vectorStoreType = `MemoryVectorStore (${provider} text-embedding)`;
    } catch (embErr) {
      console.warn('Embeddings API unavailable, utilizing fallback vector store:', embErr.message);
      vectorStore = new SimpleFallbackVectorStore(chunks);
      vectorStoreType = 'Educational In-Memory Similarity Store';
    }

    // Save in state
    activeDocumentState = {
      documentName: fileName,
      rawText: extractedText,
      totalCharacters: extractedText.length,
      chunkSize: Number(chunkSize),
      chunkOverlap: Number(chunkOverlap),
      chunks: chunks,
      vectorStore: vectorStore,
      vectorStoreType: vectorStoreType,
      uploadedAt: new Date().toISOString()
    };

    // Return chunks preview
    const chunkPreviews = chunks.map((doc, idx) => ({
      chunkIndex: idx + 1,
      charCount: doc.pageContent.length,
      snippet: doc.pageContent
    }));

    res.json({
      success: true,
      documentName: fileName,
      totalCharacters: extractedText.length,
      totalChunks: chunks.length,
      chunkSize: Number(chunkSize),
      chunkOverlap: Number(chunkOverlap),
      vectorStoreType,
      chunks: chunkPreviews,
      debug: {
        langchainComponents: ['RecursiveCharacterTextSplitter', 'Document', 'MemoryVectorStore', 'Embeddings'],
        splitStrategy: 'Recursive Character Splitting (separators: [\\n\\n, \\n, space, empty])'
      }
    });

  } catch (error) {
    console.error('Error in /api/rag/upload:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process document'
    });
  }
});

/**
 * POST /api/rag/query
 * Question answering using RAG (Retrieval-Augmented Generation)
 */
router.post('/query', async (req, res) => {
  try {
    const {
      question,
      topK = 3,
      provider = 'gemini',
      apiKey
    } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Please enter a question to ask.' });
    }

    if (!activeDocumentState.vectorStore || activeDocumentState.chunks.length === 0) {
      return res.status(400).json({
        error: 'No active document loaded. Please upload a PDF or study notes first in the Document Upload section.'
      });
    }

    // 1. Vector Retrieval: Find top-K most relevant chunks
    const retrievedDocsWithScores = await activeDocumentState.vectorStore.similaritySearchWithScore
      ? await activeDocumentState.vectorStore.similaritySearchWithScore(question, Number(topK) || 3)
      : (await activeDocumentState.vectorStore.similaritySearch(question, Number(topK) || 3)).map(d => [d, 1]);

    const retrievedChunks = retrievedDocsWithScores.map(([doc, score]) => ({
      chunkIndex: doc.metadata?.chunkIndex || 1,
      source: doc.metadata?.source || activeDocumentState.documentName,
      text: doc.pageContent,
      score: typeof score === 'number' ? Number(score.toFixed(3)) : null
    }));

    // 2. Build Context String from Retrieved Chunks
    const contextText = retrievedChunks
      .map((c, i) => `[Source Chunk ${c.chunkIndex}]:\n${c.text}`)
      .join('\n\n---\n\n');

    // 3. Create RAG Prompt Template
    const ragPromptTemplate = PromptTemplate.fromTemplate(`
You are an expert AI Study Tutor answering student questions using the provided document context.

DOCUMENT CONTEXT:
"""
{context}
"""

STUDENT QUESTION:
{question}

INSTRUCTIONS:
1. Answer the question thoroughly and clearly using the provided document context.
2. If the context mentions specific facts or definitions, cite the source chunk (e.g. "[Source Chunk 2]").
3. If the provided context does not contain enough information to answer the question, state that clearly and provide helpful guidance.
4. Keep the explanation student-friendly with clear bullet points where helpful.
`);

    const formattedPrompt = await ragPromptTemplate.format({
      context: contextText,
      question: question
    });

    // 4. Send to LangChain Chat Model
    const model = getChatModel({ provider, apiKey, temperature: 0.3 });
    const response = await model.invoke(formattedPrompt);

    const answerText = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    res.json({
      success: true,
      question,
      answer: answerText,
      documentName: activeDocumentState.documentName,
      retrievedChunks,
      debug: {
        langchainComponents: ['VectorStore.similaritySearch', 'PromptTemplate', 'ChatModel.invoke'],
        topK: Number(topK) || 3,
        retrievedCount: retrievedChunks.length,
        provider
      }
    });

  } catch (error) {
    console.error('Error in /api/rag/query:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to answer question using RAG',
      missingKey: error.missingKey || false,
      provider: error.provider
    });
  }
});

/**
 * GET /api/rag/status
 * Returns current loaded document status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    hasActiveDocument: !!activeDocumentState.vectorStore,
    documentName: activeDocumentState.documentName,
    totalCharacters: activeDocumentState.totalCharacters,
    totalChunks: activeDocumentState.chunks.length,
    chunkSize: activeDocumentState.chunkSize,
    chunkOverlap: activeDocumentState.chunkOverlap,
    vectorStoreType: activeDocumentState.vectorStoreType,
    uploadedAt: activeDocumentState.uploadedAt
  });
});

/**
 * POST /api/rag/clear
 * Resets active document state
 */
router.post('/clear', (req, res) => {
  activeDocumentState = {
    documentName: null,
    rawText: '',
    totalCharacters: 0,
    chunkSize: 500,
    chunkOverlap: 50,
    chunks: [],
    vectorStore: null,
    uploadedAt: null
  };
  res.json({ success: true, message: 'Active document cleared.' });
});

export default router;
