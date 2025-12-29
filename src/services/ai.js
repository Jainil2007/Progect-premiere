import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function fetchPlanetData(planetName) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Structured JSON Prompt
        const prompt = `Generate a JSON object for the celestial body "${planetName}".
        The JSON must strictly follow this schema (no markdown formatting, just raw JSON):
        {
            "summary": "2 sentence scientific summary of the body.",
            "discoveries": [
                "Discovery 1 (Year)",
                "Discovery 2 (Year)",
                "Discovery 3 (Year)"
            ],
            "keyTheories": [
                "Theory 1",
                "Theory 2"
            ],
            "deepStats": [
                { "label": "Mean Density", "value": "5.51 g/cm³" },
                { "label": "Atmosphere", "value": "N2, O2, Ar" },
                ... (Total 5 scientifically accurate stats like Surface Gravity, Escape Velocity, Core Temp, etc)
            ]
        }
        Keep descriptions concise and scientific.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup markdown if present (Gemini sometimes adds ```json ... ```)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("AI Error:", error);
        return null; // Return null to handle UI fallback
    }
}
