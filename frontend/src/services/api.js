/**
 * ============================================================================
 * Frontend API Service
 * ============================================================================
 * Handles communication between React UI and the Express backend.
 * Automatically injects configured API keys and provider from localStorage.
 */

const API_BASE = '/api';

export function getStoredSettings() {
  try {
    const saved = localStorage.getItem('ai_study_assistant_settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading settings from localStorage:', e);
  }
  return {
    provider: 'gemini',
    apiKey: ''
  };
}

export function saveSettings(settings) {
  try {
    localStorage.setItem('ai_study_assistant_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

async function request(endpoint, options = {}) {
  const settings = getStoredSettings();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const bodyData = options.body ? JSON.parse(options.body) : {};
  // Inject stored API key and provider if not explicitly provided
  if (!bodyData.apiKey && settings.apiKey) {
    bodyData.apiKey = settings.apiKey;
  }
  if (!bodyData.provider) {
    bodyData.provider = settings.provider || 'gemini';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(bodyData) : undefined
  });

  const data = await response.json().catch(() => ({
    error: `Server returned ${response.status}: ${response.statusText}`
  }));

  if (!response.ok || data.success === false) {
    const error = new Error(data.error || 'An unexpected error occurred.');
    error.statusCode = response.status;
    error.missingKey = data.missingKey || false;
    error.provider = data.provider;
    throw error;
  }

  return data;
}

export const api = {
  // Backend Health check
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  // Feature 1 & 2: Chat & Personas
  getPersonas: async () => {
    const res = await fetch(`${API_BASE}/chat/personas`);
    return await res.json();
  },

  sendChatMessage: async ({ message, history, personaId }) => {
    return await request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, personaId })
    });
  },

  // Feature 3: Topic Explainer
  explainTopic: async ({ topic, level }) => {
    return await request('/explain', {
      method: 'POST',
      body: JSON.stringify({ topic, level })
    });
  },

  // Feature 4: Quiz Generator
  generateQuiz: async ({ topic, difficulty }) => {
    return await request('/quiz', {
      method: 'POST',
      body: JSON.stringify({ topic, difficulty })
    });
  },

  // Feature 5: Notes Summarizer
  summarizeNotes: async ({ notes, format }) => {
    return await request('/summarize', {
      method: 'POST',
      body: JSON.stringify({ notes, format })
    });
  },

  // Feature 6, 7 & 8: Document RAG
  uploadDocument: async (formData) => {
    const settings = getStoredSettings();
    if (settings.apiKey && !formData.has('apiKey')) {
      formData.append('apiKey', settings.apiKey);
    }
    if (settings.provider && !formData.has('provider')) {
      formData.append('provider', settings.provider);
    }

    const response = await fetch(`${API_BASE}/rag/upload`, {
      method: 'POST',
      body: formData // multipart/form-data
    });

    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'Failed to upload document.');
    }
    return data;
  },

  queryDocument: async ({ question, topK }) => {
    return await request('/rag/query', {
      method: 'POST',
      body: JSON.stringify({ question, topK })
    });
  },

  getRagStatus: async () => {
    const res = await fetch(`${API_BASE}/rag/status`);
    return await res.json();
  },

  clearDocument: async () => {
    const res = await fetch(`${API_BASE}/rag/clear`, { method: 'POST' });
    return await res.json();
  }
};
