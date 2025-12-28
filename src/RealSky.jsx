import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import starData from './data/stars.json';

// Constellation Data: Pairs of HR Numbers (Strings matching JSON)
const CONSTELLATIONS = {
    Orion: [
        ['2061', '1790'], // Betelgeuse - Bellatrix
        ['2061', '1879'], // Betelgeuse - Meissa
        ['1879', '1790'], // Meissa - Bellatrix
        ['1790', '1852'], // Bellatrix - Mintaka
        ['1852', '1903'], // Mintaka - Alnilam
        ['1903', '1948'], // Alnilam - Alnitak
        ['1948', '2004'], // Alnitak - Saiph
        ['1713', '2004'], // Rigel - Saiph
        // Shield / Club omitted for simplicity
    ],
    UrsaMajor: [
        ['4301', '4295'], // Dubhe - Merak
        ['4295', '4554'], // Merak - Phecda
        ['4554', '4660'], // Phecda - Megrez
        ['4660', '4301'], // Megrez - Dubhe
        ['4660', '4905'], // Megrez - Alioth
        ['4905', '5054'], // Alioth - Mizar
        ['5054', '5191'], // Mizar - Alkaid
    ],
    Cassiopeia: [
        ['21', '168'],   // Caph - Schedar
        ['168', '264'],  // Schedar - Gamma
        ['264', '403'],  // Gamma - Delta
        ['403', '542'],  // Delta - Epsilon
    ],
    Crux: [
        ['4730', '4763'], // Acrux - Gacrux
        ['4853', '4656'], // Mimosa - Delta
        ['4730', '4853'], // Acrux - Mimosa (Box Frame)
        ['4763', '4656'], // Gacrux - Delta
    ],
    Scorpius: [
        ['6134', '6027'], // Antares - Graffias (Head)
        ['6134', '6247'], // Antares - Tau Sco
        ['6247', '6252'], // Tau - Epsilon
        ['6252', '6241'], // Epsilon - Mu
        ['6527', '6508'], // Shaula - Lesath (Stinger)
        ['6508', '6553'], // Lesath - Kappa
        ['6553', '6378'], // Kappa - Theta
        ['6378', '6241'], // Theta - Mu (Body connection)
    ]
};

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

                // Three.js Coordinate Mapping (Y-up)
                // Assuming Z is North/South axis in astronomy, usually Y is up in ThreeJS.
                // Standard mapping: x=x, y=z, z=-y
                const pos = new THREE.Vector3(xAstro, zAstro, -yAstro);

                coords.push(pos.x, pos.y, pos.z);

                // Save for Lines
                if (star.HR) {
                    starMap[star.HR] = pos;
                }

                // Visual Logic
                let intensity = 1.0 - ((mag + 1.46) / 7.5);
                if (intensity < 0.2) intensity = 0.2;
                if (intensity > 1.0) intensity = 1.0;

                const color = new THREE.Color();
                const sp = star.SpectralCls || "";

                if (sp.startsWith('O') || sp.startsWith('B')) {
                    color.setHSL(0.6, 0.4, intensity); // Blue-White
                } else if (sp.startsWith('A')) {
                    color.setHSL(0.6, 0.1, intensity); // White-Blue
                } else if (sp.startsWith('M') || sp.startsWith('K')) {
                    color.setHSL(0.08, 0.8, intensity * 0.9); // Orange/Red
                } else {
                    color.setHSL(0.0, 0.0, intensity); // White
                }

                colors.push(color.r, color.g, color.b);

            } catch (e) { }
        });

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Generate Constellation Lines
        const linePoints = [];
        Object.values(CONSTELLATIONS).forEach(pairs => {
            pairs.forEach(([hr1, hr2]) => {
                const p1 = starMap[hr1];
                const p2 = starMap[hr2];
                if (p1 && p2) {
                    linePoints.push(p1, p2);
                }
            });
        });

        return { geometry: geo, lines: linePoints };
    }, []);

    console.log("Real Sky Mounted Successfully");

    return (
        <group>
            {/* The Stars */}
            <points>
                <primitive object={geometry} />
                <pointsMaterial
                    size={5.0} // DEBUG SIZE: 5.0
                    vertexColors
                    sizeAttenuation={false}
                    transparent
                    opacity={1.0} // DEBUG OPACITY: 1.0
                    depthWrite={false}
                />
            </points>

            {/* The Constellation Lines */}
            <mesh>
                {/* Using Drei Line for convenience or just simple LineSegments */}
            </mesh>

            {/* Native Three LineSegments for filters */}
            {lines.length > 0 && (
                <lineSegments>
                    <bufferGeometry>
                        <float32BufferAttribute
                            attach="attributes-position"
                            count={lines.length}
                            array={new Float32Array(lines.flatMap(v => [v.x, v.y, v.z]))}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#ffffff" opacity={1.0} transparent linewidth={1} />
                </lineSegments>
            )}
        </group>
    );
}
