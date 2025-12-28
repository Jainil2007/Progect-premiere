import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function fetchPlanetData(planetName, distance) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Safety prompt
        const prompt = `I am looking at ${planetName} in a 3D visualization. 
    It is currently about ${distance} AU from Earth (if applicable).
    Give me 3 fascinating, short, scientific facts about it.
    Also mention its current distance in a human-readable format (e.g. million km) if you can estimate from the AU provided.
    Keep the whole response under 100 words.
    Format as a bulleted list.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Error:", error);
        return "Error connecting to the planetary database. Signal lost.";
    }
}
