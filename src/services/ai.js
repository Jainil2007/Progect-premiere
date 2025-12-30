import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function fetchPlanetData(planetName) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Structured JSON Prompt
        const prompt = `Generate a JSON object for the celestial body "${planetName}".
        The JSON must strictly follow this schema (no markdown formatting, just raw JSON):
        {
            "latest_news": [
                { "headline": "Headline 1", "date": "Date", "body": "Short paragraph." },
                { "headline": "Headline 2", "date": "Date", "body": "Short paragraph." },
                { "headline": "Headline 3", "date": "Date", "body": "Short paragraph." },
                { "headline": "Headline 4", "date": "Date", "body": "Short paragraph." },
                { "headline": "Headline 5", "date": "Date", "body": "Short paragraph." }
            ],
            "deep_dive": "A detailed 300-word scientific article about the geology, potential for life, and future exploration of this body.",
            "history_timeline": [
                { "date": "Year", "event": "Event description" },
                { "date": "Year", "event": "Event description" },
                { "date": "Year", "event": "Event description" },
                { "date": "Year", "event": "Event description" },
                { "date": "Year", "event": "Event description" }
            ],
            "pop_culture": [
                "Mention in Movie/Book 1",
                "Mention in Movie/Book 2",
                "Mention in Movie/Book 3"
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
