import React, { useMemo, useRef, useEffect } from 'react'
import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { planetData } from './solarSystemData'
import { getPlanetPosition, getOrbitPath } from './utils/astronomy'
import { Planet, Orbit } from './Planet'
import Sun from './Sun'
import { useStore } from './store'
import RealSky from './RealSky'
import { Earth3D, EarthFallback } from './Earth3D'
import AsteroidCloud from './AsteroidCloud'
import MajorAsteroids from './MajorAsteroids'
import * as THREE from 'three'

// Debug Log outside component
console.log("Main Scene Module Loaded");

function CameraManager() {
  const controlsRef = useRef();
  const activePlanetData = useStore(state => state.activePlanetData);
  const { camera } = useThree();

  useEffect(() => {
    if (activePlanetData && controlsRef.current) {
      let vecPos;

      // Check for direct static position (Asteroids/Constellations) vs Orbital Elements (Planets)
      if (activePlanetData.staticPosition) {
        vecPos = new THREE.Vector3(...activePlanetData.staticPosition);
      } else {
        const pos = getPlanetPosition(activePlanetData, new Date());
        vecPos = new THREE.Vector3(...pos);
      }

      // --- NEW LOGIC: Type-Based Navigation ---
      if (activePlanetData.type === 'Constellation') {
        // CONSTELLATION MODE: Stay at center, look at the sky
        controlsRef.current.setLookAt(
          0, 20, 40,      // Camera near Earth/Sun
          vecPos.x, vecPos.y, vecPos.z, // Look at the Stars
          true
        );
      } else {
        // PLANET/ASTEROID MODE: Fly to object

        // Planet size logic
        const size = activePlanetData.size || 1;
        const distance = size * 10; // 10x radius distance
        let safeDist = distance < 5 ? 5 : distance;

        // Offset from planet for the camera
        const offset = new THREE.Vector3(safeDist, safeDist / 2, safeDist);
        const camPos = vecPos.clone().add(offset);

        controlsRef.current.setLookAt(
          camPos.x, camPos.y, camPos.z,
          vecPos.x, vecPos.y, vecPos.z,
          true // enable transition
        );
      }
    } else if (controlsRef.current) {
      // Reset view to overview
      controlsRef.current.setLookAt(
        0, 200, 500, // Camera Position
        0, 0, 0,     // Target (Sun)
        true         // Transition
      );
    }
  }, [activePlanetData]);

  return <CameraControls ref={controlsRef} minDistance={10} maxDistance={20000} />;
}

export default function Scene() {
  const currentDate = useMemo(() => new Date(), []);
  console.log("Main Scene Rendering");

  return (
    <>
      <color attach="background" args={['black']} />

      {/* Sun Light - Point light at center */}
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={5000} decay={0.5} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#ffffff', '#444444', 0.2]} />

      {/* Camera Logic */}
      <CameraManager />

      <React.Suspense fallback={null}>

        {/* The Sun - Always render explicitly to ensure it exists */}
        <Sun position={[0, 0, 0]} size={10} name="Sun" />

        {/* ASTEROIDS RENDERING */}
        <AsteroidCloud />
        <MajorAsteroids />

        {planetData.map((planet) => {
          const position = getPlanetPosition(planet, currentDate);
          const orbitPath = getOrbitPath(planet);

          // If Sun is in data, render it (via Sun component)
          if (planet.name === 'Sun') {
            return <Sun key={planet.name} {...planet} />
          }

          // Earth has custom component
          if (planet.name === 'Earth') {
            return (
              <React.Fragment key={planet.name}>
                <Orbit points={orbitPath} color={planet.color} />
                <Earth3D position={position} size={planet.size} data={planet} />
              </React.Fragment>
            )
          }

          // Other Planets: Must have texturePath
          return (
            <React.Fragment key={planet.name}>
              <Orbit points={orbitPath} color={planet.color} />
              <Planet
                position={position}
                color={planet.color}
                size={planet.size}
                name={planet.name}
                data={planet}
                texturePath={planet.texturePath}
              />
            </React.Fragment>
          )
        })}

        <RealSky />
      </React.Suspense>
    </>
  )
}
