import axios from 'axios';

const API_KEY = 'fXzcYyUOXqbUqzarYPhzFp2C21qGhj1V3orIzslW';
const BASE_URL = 'https://api.cohere.ai';

export const generateAIContent = async (prompt: string, model: string = 'command-xlarge-nightly', maxTokens: number = 500, temperature: number = 0.7): Promise<string> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/generate`,
      {
        model,
        prompt,
        max_tokens: maxTokens,
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.text.trim();
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw error;
  }
};
