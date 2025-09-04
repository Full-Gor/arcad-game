// plasma_orb.js - Orbe de plasma
import { enemyBullets } from '../../enemy_bullets_simple.js';

export function createPlasmaOrb(enemy, speedMult = 1) {
    const orb = {
        type: 'plasma_orb_mgr',
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        width: 20,
        height: 20,
        vx: 0,
        vy: 2 * speedMult,
        color: '#9400d3',
        coreColor: '#ffffff',
        energy: 1,
        pulsating: true,
        pulsePhase: 0,
        fragmentOnImpact: true,
        trail: [],
        electricArcs: []
    };
    enemyBullets.push(orb);
}

export function updatePlasmaOrb(orb) {
    orb.x += orb.vx;
    orb.y += orb.vy;
    orb.pulsePhase += 0.1;
    if (orb.pulsating) {
        orb.width = 20 + Math.sin(orb.pulsePhase) * 5;
        orb.height = orb.width;
    }
    if (Math.random() < 0.3) {
        orb.electricArcs.push({ angle: Math.random() * Math.PI * 2, length: 15 + Math.random() * 10, lifetime: 5 });
    }
    orb.electricArcs = orb.electricArcs.filter(arc => (--arc.lifetime) > 0);
    orb.trail.push({ x: orb.x, y: orb.y, size: orb.width * 0.8, opacity: 0.5 });
    if (orb.trail.length > 8) orb.trail.shift();
}



