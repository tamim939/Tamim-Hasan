
import { GoogleGenAI, Type } from "@google/genai";

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
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAIImage = async (prompt: string): Promise<string | undefined> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return undefined;
};

export const enhanceTo4K = async (base64Image: string): Promise<string | undefined> => {
  await ensureKeySelection();
  const ai = getAIClient();
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Upscale this image to 4K ultra-high resolution. Enhance every detail, sharpen edges, remove all compression artifacts, and restore textures to studio quality. The output must be a perfectly clean, high-definition version of this exact scene." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return undefined;
};

export const restoreDarkImage = async (base64Image: string): Promise<string | undefined> => {
  await ensureKeySelection();
  const ai = getAIClient();
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "This is a very dark or black image. Fully restore it to a clear, realistic image. Increase the exposure, recover all details from the shadows, remove digital noise, and make it look as if it were taken in bright daylight. The result must be sharp and professional." }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return undefined;
};

export const processVideoNoise = async (prompt: string, thumbnailBase64?: string): Promise<string | undefined> => {
  await ensureKeySelection();
  const ai = getAIClient();
  
  let payload: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A crystal clear, noise-free, cinematic 4K video. Perfectly clean visuals, stable camera, studio lighting. Content: ${prompt}`,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  };

  if (thumbnailBase64) {
    const base64Data = thumbnailBase64.split(',')[1];
    const mimeType = thumbnailBase64.split(';')[0].split(':')[1];
    payload.image = { imageBytes: base64Data, mimeType };
  }

  let operation = await ai.models.generateVideos(payload);
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (downloadLink) {
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
  return undefined;
};
