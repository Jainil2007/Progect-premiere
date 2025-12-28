import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useStore } from './store';

// Reusable dummy object for calculations
const dummy = new THREE.Object3D();

export default function AsteroidBelt({ count = 5000 }) {
    const meshRef = useRef();
    const selectPlanet = useStore((state) => state.selectPlanet);

    // Generate data once
    const { positions, rotations, scales } = useMemo(() => {
        const positions = [];
        const rotations = [];
        const scales = [];

        console.log("Rendering Main Asteroid Belt");

        for (let i = 0; i < count; i++) {
            // Main Belt: 2.3 to 3.2 AU (Scale 100) -> 230 to 320 units
            const r = (Math.random() * (3.2 - 2.3) + 2.3) * 100;
            const theta = Math.random() * 2 * Math.PI;

            // X-Z plane with Y spread
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            // Vertical thicknes: +/- 15 units
            const y = (Math.random() - 0.5) * 30;

            positions.push(x, y, z);

            rotations.push(
                Math.random() * 2 * Math.PI,
                Math.random() * 2 * Math.PI,
                Math.random() * 2 * Math.PI
            );

            // Realistic Scale: Small rocks
            // Base size will be 0.2, so scale multiplier 0.5-1.5 gives effective radius 0.1-0.3
            const s = Math.random() * 1.0 + 0.5;
            scales.push(s, s, s);
        }
        return { positions, rotations, scales };
    }, [count]);

    useLayoutEffect(() => {
        if (meshRef.current) {
            for (let i = 0; i < count; i++) {
                dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                dummy.rotation.set(rotations[i * 3], rotations[i * 3 + 1], rotations[i * 3 + 2]);
                dummy.scale.set(scales[i * 3], scales[i * 3], scales[i * 3]);

                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
            }
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [count, positions, rotations, scales]);

    const handleClick = (e) => {
        e.stopPropagation();
        const instanceId = e.instanceId;

        // Calculate position for camera target
        // We can recover it from the data arrays since the index matches
        const x = positions[instanceId * 3];
        const y = positions[instanceId * 3 + 1];
        const z = positions[instanceId * 3 + 2];

        const asteroidData = {
            name: `Asteroid-${instanceId}`,
            description: "A rocky remnant from the early solar system, located in the Main Asteroid Belt between Mars and Jupiter.",
            fact: "This object is composed primarily of carbonaceous or silicate minerals.",
            size: 1, // Mock size for camera distance logic
            a: '2.6', // Avg
            e: '0.1',
            i: '?',
            M: '?',
            // Hack: we need getPlanetPosition compatible object OR modify store/CameraManager to handle raw coordinates.
            // CameraManager currently calls getPlanetPosition(activePlanetData).
            // We can add a "positionOverride" or similar.
            // OR, we make getPlanetPosition handle a "static" type.

            // Let's add a `staticPosition` field to this object and handle it in CameraManager vs getPlanetPosition
            staticPosition: [x, y, z]
        };

        selectPlanet(asteroidData);
    };

    // ... (data generation logic remains same, it was correct)
    console.log("Rendering Main Asteroid Belt with Guide Rails");

    return (
        <group>
            {/* Guide Rail: Inner Boundary (2.3 AU = 230 units) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[230, 0.5, 16, 100]} />
                <meshBasicMaterial color="yellow" opacity={0.5} transparent />
            </mesh>

            {/* Guide Rail: Outer Boundary (3.2 AU = 320 units) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[320, 0.5, 16, 100]} />
                <meshBasicMaterial color="yellow" opacity={0.5} transparent />
            </mesh>

            <instancedMesh ref={meshRef} args={[null, null, count]} onClick={handleClick}>
                {/* Debug Size: 0.5 (Intermediate) */}
                <dodecahedronGeometry args={[0.5, 0]} />
                {/* Debug Color: Bright White */}
                <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </instancedMesh>
        </group>
    );
}
