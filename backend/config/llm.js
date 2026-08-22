/**
 * ============================================================================
 * LLM Configuration & LangChain Model Initializer
 * ============================================================================
 * 
 * In LangChain.js, "Chat Models" are the core interface to talk with modern LLMs.
 * They take a list of structured messages (SystemMessage, HumanMessage, AIMessage)
 * and return an AIMessage response.
 * 
 * This file handles:
 * 1. Selecting the provider (Google Gemini or OpenAI)
 * 2. Instantiating the Chat Model instance
 * 3. Instantiating the Embedding Model for RAG
 * 4. Graceful error handling if API keys are missing
 */

import dotenv from 'dotenv';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

dotenv.config();

/**
 * Resolves the API key and provider from request headers / options or .env
 */
export function resolveProviderConfig(options = {}) {
  const provider = options.provider || process.env.DEFAULT_PROVIDER || 'gemini';
  let apiKey = options.apiKey;

  if (!apiKey) {
    if (provider === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY;
    } else if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY;
    }
  }

  return { provider, apiKey };
}

/**
 * Initializes and returns a LangChain Chat Model
 * 
 * @param {Object} options - { provider: 'gemini'|'openai', apiKey: string, temperature?: number }
 * @returns {ChatGoogleGenerativeAI | ChatOpenAI}
 */
export function getChatModel(options = {}) {
  const { provider, apiKey } = resolveProviderConfig(options);
  const temperature = options.temperature ?? 0.7;

  if (!apiKey || apiKey.trim() === '') {
    const error = new Error(
      `No API key found for provider "${provider}". Please add ${provider.toUpperCase()}_API_KEY to backend/.env or configure it in the UI Settings modal.`
    );
    error.statusCode = 401;
    error.missingKey = true;
    error.provider = provider;
    throw error;
  }

  if (provider === 'gemini') {
    // Uses Google's Gemini models via LangChain's @langchain/google-genai
    return new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      modelName: 'gemini-3.6-flash',
      maxOutputTokens: 2048,
      temperature: temperature,
    });
  } else if (provider === 'openai') {
    // Uses OpenAI models via LangChain's @langchain/openai
    return new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o-mini',
      temperature: temperature,
    });
  } else {
    throw new Error(`Unsupported LLM provider: "${provider}". Use "gemini" or "openai".`);
  }
}

/**
 * Initializes and returns a LangChain Embeddings Model
 * Used in RAG (Retrieval-Augmented Generation) to convert text chunks into numerical vectors.
 * 
 * @param {Object} options - { provider: 'gemini'|'openai', apiKey: string }
 * @returns {GoogleGenerativeAIEmbeddings | OpenAIEmbeddings}
 */
export function getEmbeddingsModel(options = {}) {
  const { provider, apiKey } = resolveProviderConfig(options);

  if (!apiKey || apiKey.trim() === '') {
    const error = new Error(
      `No API key found for embeddings (${provider}). Please add API key in .env or UI Settings.`
    );
    error.statusCode = 401;
    error.missingKey = true;
    throw error;
  }

  if (provider === 'gemini') {
    return new GoogleGenerativeAIEmbeddings({
      apiKey: apiKey,
      modelName: 'models/gemini-embedding-001',
    });
  } else if (provider === 'openai') {
    return new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: 'text-embedding-3-small',
    });
  } else {
    throw new Error(`Unsupported Embeddings provider: "${provider}"`);
  }
}
