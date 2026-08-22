/**
 * ============================================================================
 * FEATURE 3: Topic Explainer
 * ============================================================================
 * 
 * LANGCHAIN CONCEPTS USED:
 * - PromptTemplate: Dynamic prompt with placeholder variables ({topic}, {level}).
 * - JsonOutputParser / Output Parsing: Instructs LLM to return JSON adhering to schema
 *   and safely parses it into a JavaScript Object.
 * - LCEL (LangChain Expression Language) or Chain Pipeline:
 *   PromptTemplate -> ChatModel -> JsonOutputParser
 */

import express from 'express';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { getChatModel } from '../config/llm.js';

const router = express.Router();

// Define the output parser for structured JSON output
const parser = new JsonOutputParser();

// Create the LangChain Prompt Template
const topicPromptTemplate = PromptTemplate.fromTemplate(`
You are an expert AI educator. Explain the topic: "{topic}" at a {level} level.

You MUST respond strictly with a valid JSON object (no markdown code blocks, no backticks, just raw JSON) with the exact following structure:
{{
  "topic": "{topic}",
  "definition": "A precise, crystal-clear 1-2 sentence definition of the concept.",
  "easyExplanation": "A beginner-friendly breakdown explaining how and why it works in simple plain language.",
  "realLifeExample": "A relatable real-world analogy or everyday scenario demonstrating the concept.",
  "codeExample": "A clear, well-commented code snippet demonstrating practical usage.",
  "codeLanguage": "javascript",
  "importantPoints": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "commonMistakes": [
    "Common pitfall or misunderstanding 1 and how to avoid it",
    "Common pitfall 2"
  ],
  "practiceQuestion": "A mini challenge or question for the student to test their understanding."
}}
`);

router.post('/', async (req, res) => {
  try {
    const {
      topic,
      level = 'beginner',
      provider = 'gemini',
      apiKey
    } = req.body;

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    // 1. Get Chat Model
    const model = getChatModel({ provider, apiKey, temperature: 0.3 });

    // 2. Create the LangChain Chain: Prompt -> Model -> OutputParser
    const chain = topicPromptTemplate.pipe(model).pipe(parser);

    // 3. Format the prompt and run the chain
    let result;
    const formattedPrompt = await topicPromptTemplate.format({ topic, level });

    try {
      result = await chain.invoke({ topic, level });
    } catch (parseError) {
      console.warn('JSON output parser fallback attempt:', parseError.message);
      // Fallback: invoke model directly and extract JSON regex if output contained markdown wrappers
      const rawResponse = await model.invoke(formattedPrompt);
      const rawText = typeof rawResponse.content === 'string' ? rawResponse.content : JSON.stringify(rawResponse.content);
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse structured response from AI model.');
      }
    }

    res.json({
      success: true,
      data: result,
      debug: {
        langchainComponents: ['PromptTemplate', 'ChatModel', 'JsonOutputParser', 'LCEL Pipe (|)'],
        formattedPromptSnippet: formattedPrompt.slice(0, 300) + '...',
        level,
        topic
      }
    });

  } catch (error) {
    console.error('Error in /api/explain:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to explain topic',
      missingKey: error.missingKey || false,
      provider: error.provider
    });
  }
});

export default router;
