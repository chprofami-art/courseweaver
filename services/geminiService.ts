
import { GoogleGenAI } from "@google/genai";

export const generateCourseContent = async (rawContent: string, systemPrompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: rawContent }] }],
        config: {
            systemInstruction: systemPrompt,
        }
    });

    const text = response.text;
    if (text === undefined) {
        throw new Error("No content generated. The response may have been blocked or empty.");
    }

    return text;
};
