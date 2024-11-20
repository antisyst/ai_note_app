import axios from 'axios';

const API_KEY = 'fXzcYyUOXqbUqzarYPhzFp2C21qGhj1V3orIzslW';
const API_URL = 'https://api.cohere.ai/generate';

export const generateAIContentService = async (
  aiInput: string,
  signal?: AbortSignal
): Promise<string> => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'command-xlarge-nightly',
        prompt: aiInput,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal,
      }
    );
    return response.data.text.trim();
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    } else {
      console.error('Error generating AI content:', error);
    }
    throw error;
  }
};
