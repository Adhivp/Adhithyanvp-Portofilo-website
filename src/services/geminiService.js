import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GATSBY_GEMINI_API_KEY);

export const getChatResponse = async (prompt, context) => {
  try {
    if (!process.env.GATSBY_GEMINI_API_KEY) {
      throw new Error('GATSBY_GEMINI_API_KEY is not defined');
    }

    const modelName = process.env.GATSBY_GEMINI_MODEL ;
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Format the chat history properly
    const chatHistory = [{
      role: 'user',
      parts: [{ text: context }]
    }];

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.1,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
    });

    try {
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (chatError) {
      console.error('Chat Error:', {
        message: chatError.message,
        name: chatError.name,
        stack: chatError.stack,
        details: chatError.details || 'No additional details'
      });
      throw new Error(`Chat error: ${chatError.message}`);
    }
  } catch (error) {
    // Log detailed error information
    console.error('Gemini API Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error.details || 'No additional details'
    });

    // Check for specific error types
    if (error.message.includes('API key')) {
      throw new Error('API key configuration error');
    } else if (error.message.includes('SAFETY')) {
      throw new Error('Content safety error');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded');
    }

    // Re-throw a generic error for other cases
    throw new Error('Failed to get response from Gemini API');
  }
};