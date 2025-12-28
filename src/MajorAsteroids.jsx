import React, { useMemo } from 'react';
import { Planet, Orbit } from './Planet';
import { getPlanetPosition, getOrbitPath } from './utils/astronomy';

import { asteroidData } from './data/asteroidData';

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
                        <Planet
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
