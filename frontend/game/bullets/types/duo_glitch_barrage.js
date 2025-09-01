// duo_glitch_barrage.js - Tir glitch coordonné qui nécessite deux ennemis
import { enemyBullets } from '../../enemy_bullets_simple.js';

// Pré-condition: enemies.length >= 2 et fournir deux entités
export function fireDuoGlitch(enemyA, enemyB, options = {}) {
    const {
        volleyCount = 3,
        intervalMs = 150,
        speed = 5,
        intensity = 5
    } = options;
    for (let v = 0; v < volleyCount; v++) {
        setTimeout(() => {
            if (enemyA) enemyBullets.push(makeGlitchBullet(enemyA, speed, intensity));
            if (enemyB) enemyBullets.push(makeGlitchBullet(enemyB, speed, intensity));
        }, v * intervalMs);
    }
}

function makeGlitchBullet(enemy, speed, intensity) {
    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y + enemy.height;
    return {
        type: 'glitch',
        x: cx,
        y: cy,
        width: 10,
        height: 10,
        vx: (Math.random() - 0.5) * 2,
        vy: speed,
        glitchOffset: { x: 0, y: 0 },
        glitchPhase: 0,
        glitchIntensity: intensity,
        glitchColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
        currentColor: '#00FFFF',
        instability: 0.1,
        trail: []
    };
}



