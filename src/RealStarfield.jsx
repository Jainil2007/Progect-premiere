import React, { useMemo } from 'react';
import * as THREE from 'three';
import starData from './data/stars.json';

export default function RealStarfield() {
    const geometry = useMemo(() => {
        const coords = [];
        const colors = [];

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

                // Cartesian
                const xAstro = R * Math.cos(deRad) * Math.cos(raRad);
                const yAstro = R * Math.cos(deRad) * Math.sin(raRad);
                const zAstro = R * Math.sin(deRad);

                coords.push(xAstro, zAstro, -yAstro);

                // Visual Logic
                // Normalize intensity clearer:
                // Mag -1.5 (Sirius) -> 1.0 (Brightest)
                // Mag 6.0 -> 0.2 (Dimmest)
                let intensity = 1.0 - ((mag + 1.46) / 7.5);
                if (intensity < 0.2) intensity = 0.2;
                if (intensity > 1.0) intensity = 1.0;

                const color = new THREE.Color();
                const sp = star.SpectralCls || "";

                // Crisper Colors
                if (sp.startsWith('O') || sp.startsWith('B')) {
                    color.setHSL(0.6, 0.4, intensity); // Blue-White
                } else if (sp.startsWith('A')) {
                    color.setHSL(0.6, 0.1, intensity); // White-Blue
                } else if (sp.startsWith('M') || sp.startsWith('K')) {
                    color.setHSL(0.08, 0.6, intensity * 0.9); // Orange (dimmed slightly)
                } else {
                    // F, G (Sun-like), etc -> White
                    color.setHSL(0.0, 0.0, intensity);
                }

                colors.push(color.r, color.g, color.b);

            } catch (e) { }
        });

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        return geo;
    }, []);

    return (
        <points>
            <primitive object={geometry} />
            {/*
        Using sizeAttenuation={false} makes "size" represent PIXELS.
        size={1.5} means each star is 1.5 screen pixels, regardless of distance.
        This creates the "clean point of light" effect.
      */}
            <pointsMaterial
                size={1.5}
                vertexColors
                sizeAttenuation={false}
                transparent
                opacity={0.8}
                depthWrite={false}
            />
        </points>
    );
}
