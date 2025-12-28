import { create } from 'zustand'
import { fetchPlanetData } from './services/ai'

export const useStore = create((set, get) => ({
    activePlanet: null,
    activePlanetData: null, // { name, position, etc }
    planetFacts: "",
    isLoading: false,

    selectPlanet: async (planet, positionDesc) => {
        // If clicking same planet, toggle off (optional, but good UX)
        const current = get().activePlanet;
        if (current === planet.name) return;

        // Use static data if available
        let facts = "";
        if (planet.description && planet.fact) {
            facts = `${planet.description}\n\nFact: ${planet.fact}`;
            set({ activePlanet: planet.name, activePlanetData: planet, isLoading: false, planetFacts: facts });
        } else {
            // Fallback or future logic for non-static objects (like custom asteroids)
            set({ activePlanet: planet.name, activePlanetData: planet, isLoading: true, planetFacts: "" });
            try {
                const fetchedFacts = await fetchPlanetData(planet.name, "variable");
                set({ planetFacts: fetchedFacts, isLoading: false });
            } catch (e) {
                set({ planetFacts: "Error retrieving data.", isLoading: false });
            }
        }
    },

    clearSelection: () => set({ activePlanet: null, activePlanetData: null, planetFacts: "" })
}))
