
import React, { useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import { useStore } from './store';
import { TextureLoader, DoubleSide } from 'three';

function SaturnRing({ size }) {
    const ringTexture = useLoader(TextureLoader, '/textures/saturn_ring.png');

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.2, size * 2.3, 64]} />
            <meshStandardMaterial map={ringTexture} transparent side={DoubleSide} opacity={0.8} />
        </mesh>
    );
}

export function Planet({ position, color, size, name, data, texturePath }) {
    // CRITICAL FIX: Prevent loader from running if texture is missing
    if (!texturePath) return null;

    const rotatingGroup = useRef();
    const selectPlanet = useStore((state) => state.selectPlanet);
    const [hovered, setHover] = useState(false);

    const texture = useLoader(TextureLoader, texturePath);

    useFrame((state, delta) => {
        if (rotatingGroup.current) {
            rotatingGroup.current.rotation.y += delta * 0.5;
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        selectPlanet(data);
    };

    return (
        <group position={position}>
            {/* Rotating Helper Group (Planet + Rings) */}
            <group ref={rotatingGroup}>
                <mesh
                    onClick={handleClick}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                >
                    <sphereGeometry args={[size, 32, 32]} />
                    <meshStandardMaterial
                        map={texture}
                        color={color}
                        emissive={hovered ? color : 'black'}
                        emissiveIntensity={hovered ? 0.5 : 0}
                    />
                </mesh>
                {name === 'Saturn' && <SaturnRing size={size} />}
            </group>

            {/* Stable Label (Billboard) */}
            <Billboard position={[0, size + 2, 0]}>
                <Text
                    fontSize={size * 0.5 + 2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {name}
                </Text>
            </Billboard>
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
