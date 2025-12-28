import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from './store';
import { planetData } from './solarSystemData';
import { asteroidData } from './data/asteroidData';
import { CONSTELLATIONS } from './data/constellationData';
import stars from './data/stars.json';
import * as THREE from 'three';

// Pre-calculate constellation centers (approximate)
const constellationCenters = {};
Object.entries(CONSTELLATIONS).forEach(([name, pairs]) => {
    // Just grab the first star of the first pair as a reference point for now
    const firstHR = pairs[0][0];
    const star = stars.find(s => s.HR === firstHR);
    if (star) {
        // Calculate Position (Same math as RealSky)
        const R = 10000; // Distance for camera to look at
        const rot = 15;
        const raH = parseFloat(star.RAh);
        const raM = parseFloat(star.RAm);
        const raS = parseFloat(star.RAs);
        const raDeg = (raH + raM / 60 + raS / 3600) * rot;
        const raRad = THREE.MathUtils.degToRad(raDeg);

        const sign = star["DE-"] === '-' ? -1 : 1;
        const deD = parseFloat(star.DEd);
        const deM = parseFloat(star.DEm);
        const deS = parseFloat(star.DEs);
        const deDeg = (deD + deM / 60 + deS / 3600) * sign;
        const deRad = THREE.MathUtils.degToRad(deDeg);

        const x = R * Math.cos(deRad) * Math.cos(raRad);
        const y = R * Math.cos(deRad) * Math.sin(raRad);
        const z = R * Math.sin(deRad);

        // Match RealSky Coordinate System: x=x, y=z, z=-y
        const pos = [x, z, -y];
        constellationCenters[name] = pos;
    }
});

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const selectPlanet = useStore(state => state.selectPlanet);

    // Flatten all searchable items
    const allItems = useMemo(() => {
        const planets = planetData.map(p => ({ type: 'Planet', ...p }));
        const asteroids = asteroidData.map(a => ({ type: 'Asteroid', ...a }));
        const cons = Object.keys(CONSTELLATIONS).map(name => ({
            name: name,
            type: 'Constellation',
            staticPosition: constellationCenters[name],
            description: `The constellation of ${name}.`,
            color: '#aaaaaa'
        }));
        return [...planets, ...asteroids, ...cons];
    }, []);

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = allItems.filter(item =>
            item.name.toLowerCase().includes(lowerQuery)
        );
        setResults(filtered.slice(0, 8)); // Top 8 results
    }, [query, allItems]);

    const handleSelect = (item) => {
        selectPlanet(item);
        setQuery('');
        setResults([]);
    };

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 2000,
            width: '300px',
            fontFamily: "'Rajdhani', sans-serif"
        }}>
            <div style={{
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '18px', marginRight: '10px' }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search Universe..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '16px',
                        width: '100%',
                        outline: 'none'
                    }}
                />
            </div>

            {results.length > 0 && (
                <div style={{
                    marginTop: '5px',
                    background: 'rgba(20, 20, 20, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    {results.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            style={{
                                padding: '10px 15px',
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                color: '#eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                transition: 'background 0.2s'
                            }}
                        >
                            <span>{item.name}</span>
                            <span style={{
                                fontSize: '12px',
                                opacity: 0.6,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '4px'
                            }}>
                                {item.type}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
