// bullets/types/spiral.js - Tirs en spirale
import { enemyBullets } from '../../enemy_bullets_simple.js';

export function createSpiralShot(enemy) {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height;
    const spiralCount = 3;
    const bulletPerSpiral = 12;
    for (let s = 0; s < spiralCount; s++) {
        for (let i = 0; i < bulletPerSpiral; i++) {
            const angle = (i / bulletPerSpiral) * Math.PI * 2 + (s * Math.PI * 2 / spiralCount);
            const delay = i * 50;
            setTimeout(() => {
                const bullet = {
                    type: 'spiral_mgr',
                    x: centerX,
                    y: centerY,
                    width: 8,
                    height: 8,
                    angle,
                    radius: 0,
                    radiusSpeed: 2,
                    rotationSpeed: 0.05,
                    color: `hsl(${(i * 30) % 360}, 100%, 50%)`,
                    glowing: true,
                    maxRadius: 200,
                    trail: []
                };
                enemyBullets.push(bullet);
            }, delay);
        }
    }
}

export function updateSpiralBullet(bullet) {
    bullet.radius += bullet.radiusSpeed;
    bullet.angle += bullet.rotationSpeed;
    bullet.x = bullet.x + Math.cos(bullet.angle) * bullet.radiusSpeed;
    bullet.y = bullet.y + Math.sin(bullet.angle) * bullet.radiusSpeed;
    bullet.trail.push({ x: bullet.x, y: bullet.y, opacity: 1 });
    if (bullet.trail.length > 10) bullet.trail.shift();
}



