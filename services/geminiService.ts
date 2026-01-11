
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export const ensureKeySelection = async () => {
  // @ts-ignore
  if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    return true; 
  }
  return true;
};

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateImage = async (prompt: string, highRes: boolean = false): Promise<string | undefined> => {
  await ensureKeySelection();
  const ai = getAIClient();
  const model = highRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: highRes ? "1K" : undefined
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return undefined;
};

export const editImage = async (base64Image: string, prompt: string): Promise<string | undefined> => {
  await ensureKeySelection();
  const ai = getAIClient();
  const model = 'gemini-3-pro-image-preview';
  
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return undefined;
};

export const cleanVideo = async (prompt: string, imageBase64?: string): Promise<string | undefined> => {
  await ensureKeySelection();
  const ai = getAIClient();
  const model = 'veo-3.1-fast-generate-preview';
  
  let payload: any = {
    model,
    prompt: `Clean, cinematic, ultra-high resolution, noise-free, studio quality video based on: ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  };

  if (imageBase64) {
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    payload.image = {
      imageBytes: base64Data,
      mimeType: mimeType
    };
  }

  let operation = await ai.models.generateVideos(payload);
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
      operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        throw new Error("API Key session expired. Please re-select your key.");
      }
      throw e;
    }
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (downloadLink) {
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  return undefined;
};
