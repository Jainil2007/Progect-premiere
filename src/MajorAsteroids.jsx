import React, { useMemo, useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import { TextureLoader } from 'three';
import { useStore } from './store';
import { Orbit } from './Planet'; // Keep Orbit import
import { getPlanetPosition, getOrbitPath } from './utils/astronomy';
import { asteroidData } from './data/asteroidData';

// dedicated Renderer for Asteroids (No Textures Required)
function Asteroid({ position, color, size, name, data }) {
    const rotatingGroup = useRef();
    const selectPlanet = useStore((state) => state.selectPlanet);
    const [hovered, setHover] = useState(false);

    // Visual Upgrade: Load Rock Texture
    const texture = useLoader(TextureLoader, '/textures/mercury.jpg');

    // Random initial rotation for variety
    const randomRotation = useMemo(() => [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
    ], []);

    useFrame((state, delta) => {
        if (rotatingGroup.current) {
            rotatingGroup.current.rotation.y += delta * 0.5;
            rotatingGroup.current.rotation.x += delta * 0.2; // Irregular spin for asteroids
        }
    });

    const handleClick = (e) => {
        e.stopPropagation();
        selectPlanet(data);
    };

    return (
        <group position={position}>
            {/* Rotating Mesh Group */}
            <group ref={rotatingGroup}>
                {/* Apply Random Rotation to the Mesh itself to create variety */}
                <mesh
                    rotation={randomRotation}
                    onClick={handleClick}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                >
                    <dodecahedronGeometry args={[size, 0]} /> {/* Jagged Rock Shape */}
                    <meshStandardMaterial
                        map={texture}
                        bumpMap={texture}
                        bumpScale={0.2}
                        color="#999999"
                        roughness={0.8}
                        emissive={hovered ? '#444444' : 'black'}
                        emissiveIntensity={hovered ? 0.3 : 0}
                    />
                </mesh>
            </group>

            {/* Stable Label */}
            <Billboard position={[0, size + 1.5, 0]}>
                <Text
                    fontSize={size * 0.8 + 1}
                    color="#cccccc"
                    anchorX="center"
                    anchorY="middle"
                >
                    {name}
                </Text>
            </Billboard>
        </group>
    );
}

export default function MajorAsteroids() {
    const currentDate = useMemo(() => new Date(), []);
    console.log("Major Mounted");

    return (
        <group>
            {asteroidData.map((asteroid) => {
                const position = getPlanetPosition(asteroid, currentDate);
                const orbitPath = getOrbitPath(asteroid);

                return (
                    <React.Fragment key={asteroid.name}>
                        <Orbit points={orbitPath} color={asteroid.color} opacity={0.3} />
                        <Asteroid
                            position={position}
                            color={asteroid.color}
                            size={asteroid.size}
                            name={asteroid.name}
                            data={asteroid}
                        />
                    </React.Fragment>
                );
            })}
        </group>
    );
}
