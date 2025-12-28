import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import starData from './data/stars.json';

// Constellation Data: Pairs of HR Numbers
import { CONSTELLATIONS } from './data/constellationData';

export default function RealSky() {
    const { geometry, lines } = useMemo(() => {
        const coords = [];
        const colors = [];
        const starMap = {}; // HR -> Vector3

        // Radius of the celestial sphere
        const R = 50000;

        starData.forEach((star) => {
            try {
                const mag = parseFloat(star.Vmag);
                if (isNaN(mag)) return;

                // Parse RA
                const rot = 15; // 15 degrees per hour
                const raH = parseFloat(star.RAh);
                const raM = parseFloat(star.RAm);
                const raS = parseFloat(star.RAs);
                const raDeg = (raH + raM / 60 + raS / 3600) * rot;
                const raRad = THREE.MathUtils.degToRad(raDeg);

                // Parse Dec
                const sign = star["DE-"] === '-' ? -1 : 1;
                const deD = parseFloat(star.DEd);
                const deM = parseFloat(star.DEm);
                const deS = parseFloat(star.DEs);
                const deDeg = (deD + deM / 60 + deS / 3600) * sign;
                const deRad = THREE.MathUtils.degToRad(deDeg);

                // Cartesian Conversion
                const xAstro = R * Math.cos(deRad) * Math.cos(raRad);
                const yAstro = R * Math.cos(deRad) * Math.sin(raRad);
                const zAstro = R * Math.sin(deRad);

                const pos = new THREE.Vector3(xAstro, zAstro, -yAstro);

                coords.push(pos.x, pos.y, pos.z);

                if (star.HR) {
                    starMap[star.HR] = pos;
                }

                // Visual Colors
                let intensity = 1.0 - ((mag + 1.46) / 7.5);
                if (intensity < 0.2) intensity = 0.2;
                if (intensity > 1.0) intensity = 1.0;

                const color = new THREE.Color();
                const sp = star.SpectralCls || "";

                if (sp.startsWith('O') || sp.startsWith('B')) {
                    color.setHSL(0.6, 0.4, intensity);
                } else if (sp.startsWith('A')) {
                    color.setHSL(0.6, 0.1, intensity);
                } else if (sp.startsWith('F') || sp.startsWith('G')) {
                    color.setHSL(0.12, 0.4, intensity);
                } else if (sp.startsWith('K')) {
                    color.setHSL(0.08, 0.6, intensity);
                } else if (sp.startsWith('M')) {
                    color.setHSL(0.02, 0.8, intensity);
                } else {
                    color.setHSL(0.0, 0.0, intensity);
                }

                colors.push(color.r, color.g, color.b);

            } catch (e) { }
        });

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Generate Constellation Lines Segments
        // Format: Array of point pairs: [[v1, v2], [v3, v4]...]
        const lineSegments = [];
        Object.entries(CONSTELLATIONS).forEach(([name, pairs]) => {
            pairs.forEach(([hr1, hr2]) => {
                const p1 = starMap[hr1];
                const p2 = starMap[hr2];
                if (p1 && p2) {
                    lineSegments.push([p1, p2]);
                }
            });
        });

        return { geometry: geo, lines: lineSegments };
    }, []);

    const starCount = geometry.attributes.position.count;
    const lineCount = lines.length;
    console.log(`RealSky Rendered: ${starCount} stars, ${lineCount} constellation connections.`);

    return (
        <group>
            {/* The Stars */}
            <points>
                <primitive object={geometry} />
                <pointsMaterial
                    size={4.0} // Robust Size
                    vertexColors
                    sizeAttenuation={false}
                    transparent
                    opacity={1.0}
                    depthWrite={false}
                />
            </points>

            {/* The Constellations: Render as individual Lines for safety */}
            {lines.map((pair, idx) => (
                <Line
                    key={idx}
                    points={pair} // [Vector3, Vector3]
                    color="white"
                    opacity={0.4} // Visible but not overwhelming
                    transparent
                    lineWidth={1}
                />
            ))}
        </group>
    );
}
