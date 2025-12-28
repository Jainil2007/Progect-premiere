import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import starData from './data/stars.json';

// Constellation Data: Pairs of HR Numbers
const CONSTELLATIONS = {
    // --- ZODIAC ---
    Aries: [
        ['617', '553'],   // Hamal - Sheratan
        ['553', '546'],   // Sheratan - Mesarthim
        ['546', '99'],    // Mesarthim - 41 Ari (Tail)
    ],
    Taurus: [
        ['1457', '1409'], // Aldebaran - Gamma Tau
        ['1409', '1346'], // Gamma - Delta
        ['1409', '1373'], // Gamma - Theta
        ['1457', '1641'], // Aldebaran - Zeta
        ['1409', '1791'], // Gamma - Elnath
        ['1178', '1165'], // Pleiades (Alcyone - Maia)
    ],
    Gemini: [
        ['2421', '2473'], // Pollux - Castor
        ['2421', '2216'], // Pollux - Wasat
        ['2473', '2286'], // Castor - Mebsuta
        ['2216', '1977'], // Wasat - Alhena
        ['2286', '2088'], // Mebsuta - Propus
    ],
    Cancer: [
        ['3461', '3449'], // Acubens - Altarf
        ['3449', '3429'], // Altarf - Asellus Australis
        ['3429', '3408'], // Asellus Aust - Asellus Bor
    ],
    Leo: [
        ['3982', '4057'], // Regulus - Eta
        ['4057', '4031'], // Eta - Algieba
        ['4031', '3905'], // Algieba - Adhafera
        ['3905', '3873'], // Adhafera - Rasalas
        ['4031', '4357'], // Algieba - Chertan
        ['4357', '4359'], // Chertan - Zosma
        ['4359', '4534'], // Zosma - Denebola
    ],
    Virgo: [
        ['5056', '4910'], // Spica - Porrima
        ['4910', '4825'], // Porrima - Minelauva
        ['4825', '4540'], // Minelauva - Zavijava
        ['5056', '5338'], // Spica - Heze
        ['4910', '4689'], // Porrima - Zaniah
        ['4825', '4932'], // Minelauva - Vindemiatrix
    ],
    Libra: [
        ['5685', '5787'], // Zubenelgenubi - Zubeneschamali
        ['5787', '5603'], // Zubeneschamali - Gamma
        ['5685', '5603'], // Zubenelgenubi - Gamma
    ],
    Scorpius: [
        ['6134', '6027'], // Antares - Graffias
        ['6134', '6247'], // Antares - Tau
        ['6247', '6252'], // Tau - Epsilon
        ['6252', '6241'], // Epsilon - Mu
        ['6241', '6378'], // Mu - Theta
        ['6378', '6553'], // Theta - Kappa
        ['6553', '6508'], // Kappa - Lesath
        ['6508', '6527'], // Lesath - Shaula
    ],
    Sagittarius: [
        ['6913', '6879'], // Kaus Australis - Kaus Media
        ['6879', '6859'], // Kaus Media - Kaus Borealis
        ['6879', '7121'], // Kaus Media - Ascella
        ['7121', '7194'], // Ascella - Tau
        ['6913', '7194'], // Kaus Aust - Tau
        ['6859', '7039'], // Kaus Bor - Nunki
        ['7039', '7121'], // Nunki - Ascella
    ],
    Capricornus: [
        ['7776', '7773'], // Alpha2 - Beta
        ['7776', '8278'], // Alpha2 - Theta
        ['8278', '8322'], // Theta - Iota
        ['8322', '8204'], // Iota - Gamma
        ['8204', '8162'], // Gamma - Delta
    ],
    Aquarius: [
        ['8414', '8232'], // Sadalsuud - Sadalmelik
        ['8232', '8518'], // Sadalmelik - Zeta
        ['8518', '8610'], // Zeta - Eta
        ['8610', '8634'], // Eta - Pi
        ['8518', '8709'], // Zeta - Gamma
        ['8709', '8728'], // Gamma - Fomalhaut
    ],
    Pisces: [
        ['603', '489'],   // Alrescha - Omicron
        ['489', '383'],   // Omicron - Eta
        ['8852', '8773'], // Gamma - Iota
        ['8773', '8916'], // Iota - Theta
        ['8916', '9067'], // Theta - TX Psc
        ['9067', '45'],   // TX Psc - Delta
        ['603', '224'],   // Alrescha - Delta
    ],

    // --- NAVIGATIONAL / OTHERS ---
    Orion: [
        ['2061', '1790'], // Betelgeuse - Bellatrix
        ['2061', '1879'], // Betelgeuse - Meissa
        ['1879', '1790'], // Meissa - Bellatrix
        ['1790', '1852'], // Bellatrix - Mintaka
        ['1852', '1903'], // Mintaka - Alnilam
        ['1903', '1948'], // Alnilam - Alnitak
        ['1948', '2004'], // Alnitak - Saiph
        ['1713', '2004'], // Rigel - Saiph
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
        ['4730', '4853'], // Acrux - Mimosa
        ['4763', '4656'], // Gacrux - Delta
    ],
    Cygnus: [
        ['7924', '7796'], // Deneb - Sadr
        ['7796', '7417'], // Sadr - Albireo
        ['7796', '7528'], // Sadr - Delta
        ['7796', '7949'], // Sadr - Epsilon
    ],
    Lyra: [
        ['7001', '7106'], // Vega - Epsilon
        ['7001', '7178'], // Vega - Zeta
        ['7178', '7235'], // Zeta - Delta
        ['7235', '7141'], // Delta - Gamma
        ['7141', '7106'], // Gamma - Epsilon
    ],
    Aquila: [
        ['7557', '7525'], // Altair - Tarazed
        ['7557', '7595'], // Altair - Alshain
        ['7557', '7236'], // Altair - Delta
    ],
    CanisMajor: [
        ['2491', '2282'], // Sirius - Murzim
        ['2491', '2618'], // Sirius - Adhara
        ['2618', '2657'], // Adhara - Wezen
        ['2657', '2693'], // Wezen - Aludra
    ],
    Pegasus: [
        ['8775', '8781'], // Scheat - Markab
        ['8781', '39'],   // Markab - Algenib
        ['39', '15'],     // Algenib - Alpheratz
        ['15', '8775'],   // Alpheratz - Scheat
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
