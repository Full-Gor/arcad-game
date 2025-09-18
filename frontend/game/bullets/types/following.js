// bullets/types/following.js - Lasers et ondes qui suivent l'ennemi
import { enemyBullets } from '../../enemy_bullets_simple.js';

export function createFollowingLaser(enemy, color, width, height, speed, enemyBulletSpeedMultiplier) {
    const followingLaser = {
        x: enemy.x + enemy.width / 2 - width / 2,
        y: enemy.y + enemy.height + 7,
        width,
        height,
        vy: speed * enemyBulletSpeedMultiplier,
        color,
        isFollowingLaser: true,
        enemyReference: enemy,
        offsetY: enemy.height + 7,
        glowIntensity: 10,
        isGrowing: true,
        startTime: Date.now()
    };
    enemyBullets.push(followingLaser);
}

export function createFollowingSonicWave(enemy) {
    const followingWave = {
        type: 'following_sonic_wave_mgr',
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height + 7,
        radius: 0,
        maxRadius: 100,
        expansionSpeed: 3,
        color: 'rgba(100, 200, 255, 0.5)',
        enemyReference: enemy,
        offsetY: enemy.height + 7,
        ringCount: 2,
        rings: [],
        damage: 1,
        active: true,
        startTime: Date.now()
    };
    for (let i = 0; i < followingWave.ringCount; i++) {
        followingWave.rings.push({ radius: 0, delay: i * 150, opacity: 1 - (i * 0.3), thickness: 2 - i * 0.3 });
    }
    enemyBullets.push(followingWave);
}



