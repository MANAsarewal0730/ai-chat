/**
 * ============================================================================
 * FEATURE 1 & 2: AI Chat & Persona Cards
 * ============================================================================
 * 
 * LANGCHAIN CONCEPTS USED:
 * - SystemMessage: Gives the LLM its identity, persona, and instructions.
 * - HumanMessage: Represents the student's input/prompts.
 * - AIMessage: Represents the assistant's previous responses in conversation.
 * - ChatPromptTemplate: Structures the conversation history & system prompt.
 * - ChatModel.invoke(): Sends the messages to the LLM and gets the response.
 */

import express from 'express';
import {
  SystemMessage,
  HumanMessage,
  AIMessage
} from '@langchain/core/messages';
import { getChatModel } from '../config/llm.js';

const router = express.Router();

// Define our 4 Study Personas
export const PERSONAS = {
  coding_mentor: {
    id: 'coding_mentor',
    name: 'Code Wizard',
    icon: '🧙♂️',
    tagline: 'Syntax spells, clean architecture & coding practice',
    systemPrompt: `You are an expert Code Wizard mentor. Explain programming concepts in simple language, provide clear code examples, highlight best practices, and give practical challenges. When writing code, explain each important line.`
  },
  study_teacher: {
    id: 'study_teacher',
    name: 'Study Sage',
    icon: '📜',
    tagline: 'Patient, structured quest guidance & encouragement',
    systemPrompt: `You are a warm, structured, and patient study teacher. Guide the student step-by-step, use memorable analogies, break down topics into digestible steps, and give encouragement.`
  },
  interview_coach: {
    id: 'interview_coach',
    name: 'Boss Coach',
    icon: '⚔️',
    tagline: 'Interview boss fights, edge cases & Big-O strategy',
    systemPrompt: `You are a senior tech interview coach. Challenge the student with typical interview questions, highlight time and space complexity (Big-O), point out edge cases, and teach how to articulate thought processes clearly.`
  },
  concept_explainer: {
    id: 'concept_explainer',
    name: 'Concept Alchemist',
    icon: '🔮',
    tagline: 'Feynman technique & turning complex jargon into gold',
    systemPrompt: `You are a Feynman-technique concept explainer. Break down complex, difficult ideas into plain intuitive language, avoiding unnecessary jargon. Use relatable real-world metaphors that anyone can understand.`
  }
};

/**
 * GET /api/chat/personas
 * Returns the available persona configurations
 */
router.get('/personas', (req, res) => {
  res.json({
    success: true,
    personas: Object.values(PERSONAS)
  });
});

/**
 * POST /api/chat
 * Handles conversational chat with LangChain ChatModel and selected Persona
 */
router.post('/', async (req, res) => {
  try {
    const {
      message,
      history = [],
      personaId = 'coding_mentor',
      provider = 'gemini',
      apiKey
    } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // 1. Resolve persona system prompt
    const persona = PERSONAS[personaId] || PERSONAS.coding_mentor;

    // 2. Build LangChain Message List:
    // [SystemMessage (Persona), ...Previous Chat History, HumanMessage (Current Input)]
    const langchainMessages = [
      new SystemMessage(persona.systemPrompt)
    ];

    // Convert client history to LangChain message instances
    for (const item of history) {
      if (item.sender === 'user' || item.role === 'user') {
        langchainMessages.push(new HumanMessage(item.text || item.content));
      } else if (item.sender === 'ai' || item.role === 'assistant') {
        langchainMessages.push(new AIMessage(item.text || item.content));
      }
    }

    // Add current user message
    langchainMessages.push(new HumanMessage(message));

    // 3. Instantiate LangChain Chat Model
    const chatModel = getChatModel({ provider, apiKey });

    // 4. Call LangChain ChatModel with messages
    const response = await chatModel.invoke(langchainMessages);

    // Extract text content from the AIMessage response
    const replyText = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    // Return response along with learning metadata for the frontend inspector
    res.json({
      success: true,
      reply: replyText,
      persona: persona.name,
      debug: {
        langchainComponents: ['SystemMessage', 'HumanMessage', 'AIMessage', 'ChatModel.invoke'],
        systemPrompt: persona.systemPrompt,
        messageCount: langchainMessages.length,
        provider: provider
      }
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to process chat message',
      missingKey: error.missingKey || false,
      provider: error.provider
    });
  }
});

export default router;
