import React, { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Earth3D({ position, size = 1, rotation = [0, 0, 0] }) {
    const earthRef = useRef();
    const cloudsRef = useRef();

    // Textures: Assumes files are in public/textures/
    // Using standard names. If files fail to load, Drei's useTexture usually errors or returns null.
    // For robustness, we might want a Suspense wrapper in Scene, but here we define the component.
    const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
        '/textures/earth_daymap.jpg',
        '/textures/earth_normal_map.jpg',
        '/textures/earth_specular_map.jpg',
        '/textures/earth_clouds.jpg'
    ]);

    // Earth Axis Tilt: 23.5 degrees
    const tilt = 23.5 * (Math.PI / 180);

    useFrame(({ clock }) => {
        const elapsedTime = clock.getElapsedTime();
        // Slow rotation
        if (earthRef.current) {
            earthRef.current.rotation.y = elapsedTime / 50;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y = elapsedTime / 40; // Clouds move slightly faster
        }
    });

    return (
        <group position={position} rotation={[0, 0, tilt]}>
            {/* EARTH SPHERE */}
            {/* Oblate Spheroid: Slightly squashed at poles (y-axis) by 1/298 */}
            <mesh ref={earthRef} scale={[size, size * 0.996, size]}>
                <sphereGeometry args={[1, 128, 128]} />
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    normalScale={[0.5, 0.5]}
                    roughnessMap={specularMap}
                    roughness={0.7}
                    metalness={0.1}
                    displacementScale={0.05} // Low value to prevent spikes
                />
            </mesh>

            {/* CLOUD/ATMOSPHERE LAYER */}
            {/* Slightly larger sphere */}
            <mesh ref={cloudsRef} scale={[size * 1.01, size * 1.006, size * 1.01]}>
                <sphereGeometry args={[1, 128, 128]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent
                    opacity={0.4}
                    depthWrite={false} // Don't block the earth behind it
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* ATMOSPHERE GLOW (Fresnel-like Rim) */}
            <mesh scale={[size * 1.02, size * 1.02, size * 1.02]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    color="#4488ff"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide} // Render on the inside of the sphere so it looks like a halo
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

// Fallback component in case textures are missing (renders a simple blue sphere)
export function EarthFallback({ position, size = 1 }) {
    return (
        <mesh position={position}>
            <sphereGeometry args={[size, 64, 64]} />
            <meshStandardMaterial color="blue" />
        </mesh>
    )
}
