import React, { useMemo } from 'react';
import { Planet, Orbit } from './Planet';
import { getPlanetPosition, getOrbitPath } from './utils/astronomy';

const asteroidData = [
    {
        name: 'Ceres',
        color: '#a05a2c', // Reddish-Brown
        size: 3.0,
        a: 2.7663,
        e: 0.0785,
        i: 10.587,
        O: 80.260,
        w: 73.922,
        M: 71.280,
        description: "The largest object in the asteroid belt and the only dwarf planet in the inner Solar System. It comprises about 25% of the belt's total mass.",
        fact: "Ceres contains water ice and may harbor a subsurface ocean."
    },
    {
        name: 'Vesta',
        color: '#b06b3e', // Slightly lighter reddish-brown
        size: 2.8,
        a: 2.3614,
        e: 0.0886,
        i: 7.142,
        O: 103.851,
        w: 151.198,
        M: 20.88,
        description: "One of the largest asteroids in the Solar System. It is the brightest asteroid visible from Earth.",
        fact: "Vesta has a giant mountain at its south pole, taller than Mount Everest."
    },
    {
        name: 'Pallas',
        color: '#8f4e25', // Darker reddish-brown
        size: 2.8,
        a: 2.7716,
        e: 0.2299,
        i: 34.841,
        O: 173.128,
        w: 310.202,
        M: 52.88,
        description: "The third-largest asteroid in the Solar System. Its orbit is highly inclined relative to the plane of the main belt.",
        fact: "Pallas was the second asteroid to be discovered, after Ceres."
    },
    {
        name: 'Hygiea',
        color: '#7d4420', // Deep reddish-brown
        size: 2.5,
        a: 3.139,
        e: 0.112,
        i: 3.84,
        O: 283.4,
        w: 313.2,
        M: 100.0,
        description: "A major asteroid located in the outer main belt. It is dark and carbonaceous.",
        fact: "Hygiea is the fourth-largest asteroid but was discovered much later due to its dark surface."
    }
];

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
