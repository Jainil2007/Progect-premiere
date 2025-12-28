import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';

// Reusable dummy object for calculations
const dummy = new THREE.Object3D();

export default function AsteroidCloud({ count = 4000 }) {
    const meshRef = useRef();

    // Generate data once
    const { positions, rotations, scales } = useMemo(() => {
        const positions = [];
        const rotations = [];
        const scales = [];

        console.log("Cloud Mounted");

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

            // Cloud Scale: Small rocks (0.3 radius approx)
            const s = Math.random() * 0.4 + 0.1;
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

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            {/* Cloud Size: Radius 4.0 (5x larger) */}
            <dodecahedronGeometry args={[4.0, 0]} />
            {/* Cloud Material: Mid-tone Grey (#888888) */}
            <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.1} />
        </instancedMesh>
    );
}
