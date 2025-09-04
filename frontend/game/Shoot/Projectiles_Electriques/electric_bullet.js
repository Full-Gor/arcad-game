// electric_bullet.js - Projectile électrique
import { enemyBullets } from '../../enemy_bullets_simple.js';

export function createElectricBullet(enemy, speedMult = 1) {
  const centerX = enemy.x + enemy.width / 2;
  const centerY = enemy.y + enemy.height / 2;
  const bullet = {
    type: 'electric_bullet_mod',
    x: centerX,
    y: centerY,
    width: 12,
    height: 12,
    vx: 0,
    vy: 5 * speedMult,
    color: '#FF00FF',
    coreColor: '#FFFFFF',
    electricArcs: [],
    trail: [],
    pulsePhase: 0
  };
  enemyBullets.push(bullet);
}

export function updateElectricBullet(bullet) {
  bullet.x += bullet.vx;
  bullet.y += bullet.vy;
  bullet.pulsePhase += 0.15;
  bullet.width = 12 + Math.sin(bullet.pulsePhase) * 3;
  bullet.height = bullet.width;
  if (Math.random() < 0.4) {
    bullet.electricArcs.push({ angle: Math.random() * Math.PI * 2, length: 15 + Math.random() * 10, lifetime: 5, segments: 3 });
  }
  bullet.electricArcs = bullet.electricArcs.filter(arc => (--arc.lifetime) > 0);
  bullet.trail.push({ x: bullet.x, y: bullet.y, size: bullet.width * 0.7, opacity: 0.6 });
  if (bullet.trail.length > 8) bullet.trail.shift();
}







