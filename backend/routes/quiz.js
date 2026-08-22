/**
 * ============================================================================
 * FEATURE 4: Quiz Generator
 * ============================================================================
 * 
 * LANGCHAIN CONCEPTS USED:
 * - PromptTemplate: Requests 5 structured MCQs based on a student's topic & level.
 * - JsonOutputParser: Enforces JSON array parsing for clean programmatic quiz rendering.
 * - Error Recovery: Safely extracts JSON even if LLM wraps in code fences.
 */

import express from 'express';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { getChatModel } from '../config/llm.js';

const router = express.Router();

const quizPromptTemplate = PromptTemplate.fromTemplate(`
You are an expert technical exam and quiz creator.
Generate a high-quality 5-question multiple choice quiz on the topic: "{topic}".
Target difficulty: {difficulty}.

You MUST respond strictly with a valid JSON array containing exactly 5 objects.
Do not include any intro, outro, or markdown backticks.

Each question object in the array MUST have this exact schema:
[
  {{
    "id": 1,
    "question": "What does the .map() method in JavaScript return?",
    "options": ["A new array with modified elements", "The original array modified in-place", "A boolean value", "Undefined"],
    "answer": "A new array with modified elements",
    "explanation": ".map() creates and returns a new array populated with the results of calling a provided function on every element in the calling array."
  }}
]

Important rules:
1. "options" must contain exactly 4 distinct choices.
2. "answer" MUST match one of the string elements in "options" exactly.
3. "explanation" should be educational and beginner-friendly.
4. Total questions must be 5.
`);

router.post('/', async (req, res) => {
  try {
    const {
      topic,
      difficulty = 'beginner',
      provider = 'gemini',
      apiKey
    } = req.body;

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const model = getChatModel({ provider, apiKey, temperature: 0.4 });
    const parser = new JsonOutputParser();
    const chain = quizPromptTemplate.pipe(model).pipe(parser);

    let questions;
    const formattedPrompt = await quizPromptTemplate.format({ topic, difficulty });

    try {
      questions = await chain.invoke({ topic, difficulty });
    } catch (parseErr) {
      console.warn('Fallback JSON extraction for quiz:', parseErr.message);
      const rawResponse = await model.invoke(formattedPrompt);
      const rawText = typeof rawResponse.content === 'string' ? rawResponse.content : JSON.stringify(rawResponse.content);
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse quiz questions from AI.');
      }
    }

    // Ensure IDs are sequential and validate structure
    if (Array.isArray(questions)) {
      questions = questions.map((q, idx) => ({
        id: q.id || idx + 1,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        answer: q.answer,
        explanation: q.explanation || 'No explanation provided.'
      }));
    }

    res.json({
      success: true,
      topic,
      difficulty,
      questions,
      debug: {
        langchainComponents: ['PromptTemplate', 'ChatModel', 'JsonOutputParser'],
        questionCount: questions.length,
        provider
      }
    });

  } catch (error) {
    console.error('Error in /api/quiz:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to generate quiz',
      missingKey: error.missingKey || false,
      provider: error.provider
    });
  }
});

export default router;
