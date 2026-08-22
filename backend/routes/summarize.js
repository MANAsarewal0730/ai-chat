/**
 * ============================================================================
 * FEATURE 5: Notes Summarizer
 * ============================================================================
 * 
 * LANGCHAIN CONCEPTS USED:
 * - PromptTemplate: Custom structured summarization prompt.
 * - JsonOutputParser: Converts LLM response into organized summary categories
 *   (Short summary, Key points, Important terms, Things to remember).
 */

import express from 'express';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { getChatModel } from '../config/llm.js';

const router = express.Router();

const summarizePromptTemplate = PromptTemplate.fromTemplate(`
You are an expert academic tutor and note summarizer.
Summarize the following student study notes cleanly and thoroughly:

"""
{notes}
"""

Target Summary Depth: {format}

You MUST respond strictly with a valid JSON object matching this schema:
{{
  "shortSummary": "A concise 2-3 sentence executive overview of the notes.",
  "keyPoints": [
    "Crucial insight or concept 1",
    "Crucial insight or concept 2",
    "Crucial insight or concept 3",
    "Crucial insight or concept 4"
  ],
  "importantTerms": [
    {{
      "term": "Term Name",
      "definition": "Clear concise definition or explanation based on notes"
    }}
  ],
  "thingsToRemember": [
    "High-yield takeaway or memory hook 1",
    "High-yield takeaway or memory hook 2",
    "High-yield takeaway or memory hook 3"
  ]
}}
`);

router.post('/', async (req, res) => {
  try {
    const {
      notes,
      format = 'standard',
      provider = 'gemini',
      apiKey
    } = req.body;

    if (!notes || notes.trim() === '') {
      return res.status(400).json({ error: 'Please provide notes to summarize.' });
    }

    const model = getChatModel({ provider, apiKey, temperature: 0.2 });
    const parser = new JsonOutputParser();
    const chain = summarizePromptTemplate.pipe(model).pipe(parser);

    let summary;
    const formattedPrompt = await summarizePromptTemplate.format({ notes, format });

    try {
      summary = await chain.invoke({ notes, format });
    } catch (parseErr) {
      console.warn('Fallback JSON parsing for notes summary:', parseErr.message);
      const rawResponse = await model.invoke(formattedPrompt);
      const rawText = typeof rawResponse.content === 'string' ? rawResponse.content : JSON.stringify(rawResponse.content);
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse summary output.');
      }
    }

    res.json({
      success: true,
      data: summary,
      wordCount: notes.split(/\s+/).length,
      debug: {
        langchainComponents: ['PromptTemplate', 'ChatModel', 'JsonOutputParser'],
        provider
      }
    });

  } catch (error) {
    console.error('Error in /api/summarize:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to summarize notes',
      missingKey: error.missingKey || false,
      provider: error.provider
    });
  }
});

export default router;
