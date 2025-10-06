// bullets/types/wave.js - Tirs en ondes (sinusoïde) et pattern groupé
import { enemyBullets, wavePatterns } from '../../enemy_bullets_simple.js';

export function createWaveBullet(enemy, color, size, speed, amplitude, frequency, enemyBulletSpeedMultiplier) {
    wavePatterns.push({
        type: 'wave_shot_mgr',
        originX: enemy.x + enemy.width / 2,
        originY: enemy.y + enemy.height,
        bullets: [],
        waveLength: 50,
        amplitude,
        frequency,
        speed: speed * enemyBulletSpeedMultiplier,
        color,
        glowIntensity: 15,
        bulletCount: 8,
        phase: 0
    });
}

export function spawnWavePatternBullets(pattern) {
    for (let i = 0; i < pattern.bulletCount; i++) {
        const bullet = {
            x: pattern.originX,
            y: pattern.originY + (i * 10),
            baseX: pattern.originX,
            width: 6,
            height: 6,
            vx: 0,
            vy: pattern.speed,
            color: pattern.color,
            waveOffset: i * Math.PI / 4,
            amplitude: pattern.amplitude,
            frequency: pattern.frequency,
            glowing: true,
            trail: []
        };
        enemyBullets.push(bullet);
        pattern.bullets.push(bullet);
    }
}

export function updateWavePattern(pattern) {
    // Les bullets sont mises à jour dans updateStandardBullet, ici on peut ajuster la phase globale si besoin
}



