// AI Configuration for Story Analysis and Image Generation
export const AI_CONFIG = {
  // Custom endpoint configuration - no API keys required
  OPENROUTER_BASE_URL: "https://oi-server.onrender.com",
  
  // Headers for custom endpoint
  HEADERS: {
    "Content-Type": "application/json",
    "CustomerId": "cus_Szde3rnRXMofEO",
    "Authorization": "Bearer xxx"
  },
  
  // Models
  ANALYSIS_MODEL: "openrouter/claude-sonnet-4",
  IMAGE_MODEL: "replicate/black-forest-labs/flux-1.1-pro"
};

export interface StoryScene {
  id: string;
  title: string;
  description: string;
  characters: string[];
  setting: string;
  visualPrompt: string;
  order: number;
}

export interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callAI(messages: any[], model: string = AI_CONFIG.ANALYSIS_MODEL): Promise<string> {
  try {
    const response = await fetch(`${AI_CONFIG.OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: AI_CONFIG.HEADERS,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("AI request failed:", error);
    throw new Error("Failed to process AI request");
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${AI_CONFIG.OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: AI_CONFIG.HEADERS,
      body: JSON.stringify({
        model: AI_CONFIG.IMAGE_MODEL,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1,
        temperature: 0.8,
        // Image generation specific parameters
        image: {
          width: 1024,
          height: 1024,
          steps: 25,
          guidance_scale: 3.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    // The image URL should be in the response
    return data.image_url || data.url || "";
  } catch (error) {
    console.error("Image generation failed:", error);
    // Return placeholder image as fallback
    return `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1687fbc0-bd7d-4a96-a18f-f8891fd09dcc.png`;
  }
}