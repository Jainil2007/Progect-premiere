import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useStore } from './store';

export function Planet({ position, color, size, name, data }) {
    const meshRef = useRef();
    const selectPlanet = useStore((state) => state.selectPlanet);
    const [hovered, setHover] = useState(false);

    // Slow rotation
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        selectPlanet(data); // Pass the full planet data object
    };

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={hovered ? color : 'black'}
                    emissiveIntensity={hovered ? 0.5 : 0}
                />
            </mesh>
            <Text
                position={[0, size + 2, 0]}
                fontSize={size * 0.5 + 2} // Adaptive text size
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {name}
            </Text>
        </group>
    );
}

import { Line } from '@react-three/drei';

export function Orbit({ points, color }) {
    return (
        <Line
            points={points}
            color={color}
            opacity={0.3}
            transparent
            lineWidth={1}
        />
    )
}
