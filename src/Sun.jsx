import React, { useRef, useState } from 'react';
import { useStore } from './store';

export default function Sun({ position, size, name, data }) {
    const meshRef = useRef();
    const selectPlanet = useStore((state) => state.selectPlanet);
    const [hovered, setHover] = useState(false);

    const handleClick = (e) => {
        e.stopPropagation();
        selectPlanet(data);
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
                <meshBasicMaterial color="#FFD700" />
            </mesh>
        </group>
    );
}
