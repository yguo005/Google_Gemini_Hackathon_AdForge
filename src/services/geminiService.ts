import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { GeneratedScriptsResponse, GeneratedScript } from "../types";

const SCRIPT_GENERATION_MODEL = 'gemini-2.5-flash';
const IMAGE_GENERATION_MODEL = 'imagen-4.0-generate-001';

const scriptGenAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const campaignSchema = {
  type: Type.OBJECT,
  properties: {
    campaigns: {
      type: Type.ARRAY,
      description: "A list of ad campaigns, one for each target audience.",
      items: {
        type: Type.OBJECT,
        properties: {
          audience: {
            type: Type.STRING,
            description: "The target audience for this ad variant.",
          },
          script: {
            type: Type.STRING,
            description: "A short, punchy ad script (1-2 sentences) for the visual.",
          },
          imagePrompt: {
            type: Type.STRING,
            description: "A detailed, descriptive prompt for a text-to-image model like Google Imagen to create a high-quality, photorealistic ad creative based on the script and audience.",
          },
        },
        required: ["audience", "script", "imagePrompt"],
      },
    },
  },
  required: ["campaigns"],
};

export const generateScriptsAndPrompts = async (productDescription: string, audiences: string): Promise<GeneratedScript[]> => {
  const prompt = `
    You are a world-class creative director for an advertising agency.
    Your task is to generate a set of distinct ad campaign concepts for a product based on a description and a list of target audiences.

    Product Description: "${productDescription}"
    Target Audiences: "${audiences}"

    For each audience, create one unique campaign concept. Each concept must include:
    1. The target audience name.
    2. A short, compelling ad script (1-2 sentences) to be used as copy.
    3. A detailed text-to-image prompt that describes the scene, subjects, actions, style (e.g., photorealistic, vibrant, cinematic), and mood for an ad image. The prompt should be vivid and specific enough for an AI image generation model to create a high-quality visual.

    Return the output in the specified JSON format.
  `;

  try {
    const response: GenerateContentResponse = await scriptGenAI.models.generateContent({
      model: SCRIPT_GENERATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: campaignSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse: GeneratedScriptsResponse = JSON.parse(jsonText);
    return parsedResponse.campaigns || [];
  } catch (error) {
    console.error("Error generating scripts:", error);
    throw new Error("Failed to generate ad scripts. Please check the console for details.");
  }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    // Re-initialize AI client to ensure the latest API key is used.
    const imageGenAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await imageGenAI.models.generateImages({
            model: IMAGE_GENERATION_MODEL,
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        if (!base64ImageBytes) {
            throw new Error("Image generation succeeded, but no image data was returned.");
        }

        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (error: any) {
        console.error("Error during image generation:", error);
        throw new Error(`Image generation failed: ${error.message}`);
    }
};