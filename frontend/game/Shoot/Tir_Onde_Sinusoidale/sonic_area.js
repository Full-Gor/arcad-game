// sonic_area.js - Onde sonique de zone (anneaux concentriques)
import { enemyBullets, wavePatterns } from '../../enemy_bullets_simple.js';

export function createSonicWaveArea(enemy) {
    const wave = {
        type: 'sonic_wave_area_mgr',
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        radius: 0,
        maxRadius: 300,
        expansionSpeed: 5,
        color: 'rgba(100, 200, 255, 0.3)',
        ringCount: 3,
        rings: [],
        damage: 1,
        active: true
    };
    for (let i = 0; i < wave.ringCount; i++) {
        wave.rings.push({ radius: 0, delay: i * 200, opacity: 1 - (i * 0.2), thickness: 3 - i * 0.5 });
    }
    wavePatterns.push(wave);
}

export function updateSonicWaveArea(wave) {
    wave.rings.forEach(ring => {
        if (ring.delay > 0) ring.delay -= 16; else ring.radius += wave.expansionSpeed;
    });
}



