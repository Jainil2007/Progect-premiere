// Utility to calculate 3D coordinates from orbital elements
// Scale: 1 AU = 100 units

const SCALE = 100;

export function getPlanetPosition(elements, date) {
    // Julian Date calculation
    const dayMs = 1000 * 60 * 60 * 24;
    const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
    const now = date.getTime();
    const d = (now - J2000) / dayMs;

    // Keplerian Elements
    const { a, e, i, O, w, M } = elements;

    // Mean Anomaly (M) over time - approximate mean motion n assuming a in AU
    // n (deg/day) approx 0.9856076686 / a^(3/2)
    const n = 0.9856076686 / Math.pow(a, 1.5);
    let currentM = M + n * d;

    // Normalize M to 0-360
    currentM = currentM % 360;
    // Convert to radians for math
    const rad = Math.PI / 180;
    const M_rad = currentM * rad;
    const e_val = e;
    const i_rad = i * rad;
    const O_rad = O * rad;
    const w_rad = w * rad;

    // Solve Kepler's Equation for Eccentric Anomaly (E)
    // M = E - e*sin(E)
    let E = M_rad;
    for (let j = 0; j < 5; j++) {
        E = M_rad + e_val * Math.sin(E);
    }

    // Coordinates in orbital plane
    // P = a * (cos(E) - e)
    // Q = a * sin(E) * sqrt(1 - e^2)
    const P = a * (Math.cos(E) - e_val);
    const Q = a * Math.sin(E) * Math.sqrt(1 - e_val * e_val);

    // Rotate to heliocentric ecliptic coordinates
    // We need to apply inclination, ascending node, argument of perihelion
    // This is a simplified 3D rotation

    // Position in orbital plane (z=0 relative to orbit)
    // x' = P, y' = Q

    // 1. Rotate by argument of periapsis (w)
    const cos_w = Math.cos(w_rad);
    const sin_w = Math.sin(w_rad);
    const x_orbit = P * cos_w - Q * sin_w;
    const y_orbit = P * sin_w + Q * cos_w;

    // 2. Rotate by inclination (i) around x-axis
    const cos_i = Math.cos(i_rad);
    const sin_i = Math.sin(i_rad);
    // z_orbit was 0
    const x_inc = x_orbit;
    const y_inc = y_orbit * cos_i;
    const z_inc = y_orbit * sin_i;

    // 3. Rotate by Longitude of Ascending Node (O) around z-axis
    const cos_O = Math.cos(O_rad);
    const sin_O = Math.sin(O_rad);

    const x_final = x_inc * cos_O - y_inc * sin_O;
    const y_final = x_inc * sin_O + y_inc * cos_O;
    const z_final = z_inc;

    // Swap Y and Z because in Three.js Y is "up" (ecliptic normal), but typical astronomy Z is ecliptic normal.
    // Actually, in default Three.js: Y is up, X is right, Z is toward camera.
    // In Astronomy: X is Vernal Equinox, Z is Ecliptic Pole.
    // So Astro(X, Y, Z) -> Three(X, Z, -Y) or similar depending on setup.
    // Let's just map Astro Z (height above plane) to Three Y.
    // Astro X/Y plane -> Three X/Z plane.

    return [x_final * SCALE, z_final * SCALE, -y_final * SCALE];
}

export function getOrbitPath(elements) {
    const points = [];
    // Calculate 100 points along the orbit
    // We can just iterate Mean Anomaly from 0 to 360

    // We reuse the calculation logic but vary M manually
    // We can't reuse the exact function easily due to time dependency, 
    // so we replicate the core geometric logic.

    const { a, e, i, O, w } = elements;
    const rad = Math.PI / 180;
    const i_rad = i * rad;
    const O_rad = O * rad;
    const w_rad = w * rad;

    const cos_i = Math.cos(i_rad);
    const sin_i = Math.sin(i_rad);
    const cos_O = Math.cos(O_rad);
    const sin_O = Math.sin(O_rad);
    const cos_w = Math.cos(w_rad);
    const sin_w = Math.sin(w_rad);

    for (let deg = 0; deg <= 360; deg += 2) {
        const M_rad = deg * rad;
        let E = M_rad;
        for (let j = 0; j < 5; j++) {
            E = M_rad + e * Math.sin(E);
        }

        const P = a * (Math.cos(E) - e);
        const Q = a * Math.sin(E) * Math.sqrt(1 - e * e);

        const x_orbit = P * cos_w - Q * sin_w;
        const y_orbit = P * sin_w + Q * cos_w;

        const x_inc = x_orbit;
        const y_inc = y_orbit * cos_i;
        const z_inc = y_orbit * sin_i;

        const x = x_inc * cos_O - y_inc * sin_O;
        const y = x_inc * sin_O + y_inc * cos_O;
        const z = z_inc;

        points.push([x * SCALE, z * SCALE, -y * SCALE]);
    }
    return points;
}
