import React, { useMemo, useRef, useEffect } from 'react'
import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { planetData } from './solarSystemData'
import { getPlanetPosition, getOrbitPath } from './utils/astronomy'
import { Planet, Orbit } from './Planet'
import { useStore } from './store'
import RealStarfield from './RealStarfield'
import AsteroidBelt from './AsteroidBelt'
import * as THREE from 'three'

function CameraManager() {
  const controlsRef = useRef();
  const activePlanetData = useStore(state => state.activePlanetData);
  const { camera } = useThree();

  useEffect(() => {
    if (activePlanetData && controlsRef.current) {
      let vecPos;

      // Check for direct static position (Asteroids) vs Orbital Elements (Planets)
      if (activePlanetData.staticPosition) {
        vecPos = new THREE.Vector3(...activePlanetData.staticPosition);
      } else {
        const pos = getPlanetPosition(activePlanetData, new Date());
        vecPos = new THREE.Vector3(...pos);
      }

      // Look directly at it, and move closer
      // We want to be at some distance from the planet
      // Planet size
      const size = activePlanetData.size || 1;
      const distance = size * 10; // 10x radius distance
      if (distance < 5) distance = 5; // Min distance for small rocks

      // Offset from planet for the camera
      const offset = new THREE.Vector3(distance, distance / 2, distance);
      const camPos = vecPos.clone().add(offset);

      controlsRef.current.setLookAt(
        camPos.x, camPos.y, camPos.z,
        vecPos.x, vecPos.y, vecPos.z,
        true // enable transition
      );
    } else if (controlsRef.current) {
      // Reset view to overview
      controlsRef.current.setLookAt(
        0, 200, 500, // Camera Position
        0, 0, 0,     // Target (Sun)
        true         // Transition
      );
    }
  }, [activePlanetData]);

  // Keep updating the look target if the planet is moving?
  // For now we just move once on click. Real-time tracking would need useFrame.

  return <CameraControls ref={controlsRef} minDistance={10} maxDistance={20000} />;
}

export default function Scene() {
  const currentDate = useMemo(() => new Date(), []);

  return (
    <>
      <color attach="background" args={['black']} />

      {/* Sun Light - Point light at center */}
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={5000} decay={0.5} />
      <ambientLight intensity={0.1} />

      {/* Camera Logic */}
      <CameraManager />

      {/* The Sun */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>

      {/* DEBUG PLACEMENT */}
      <AsteroidBelt />

      {planetData.map((planet) => {
        const position = getPlanetPosition(planet, currentDate);
        const orbitPath = getOrbitPath(planet);

        return (
          <React.Fragment key={planet.name}>
            <Orbit points={orbitPath} color={planet.color} />
            <Planet
              position={position}
              color={planet.color}
              size={planet.size}
              name={planet.name}
              data={planet}
            />
          </React.Fragment>
        )
      })}

      <RealStarfield />
    </>
  )
}
