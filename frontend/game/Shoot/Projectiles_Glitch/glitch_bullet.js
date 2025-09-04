// glitch_bullet.js - Projectile glitch
import { enemyBullets } from '../../enemy_bullets_simple.js';

export function createGlitchBullet(enemy, speedMult = 1) {
  const centerX = enemy.x + enemy.width / 2;
  const centerY = enemy.y + enemy.height / 2;
  const bullet = {
    type: 'glitch_bullet_mod',
    x: centerX,
    y: centerY,
    width: 10,
    height: 10,
    vx: (Math.random() - 0.5) * 2,
    vy: 5 * speedMult,
    glitchOffset: { x: 0, y: 0 },
    glitchPhase: 0,
    glitchIntensity: 5,
    glitchColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
    currentColor: '#00FFFF',
    instability: 0.1,
    trail: []
  };
  enemyBullets.push(bullet);
}

export function updateGlitchBullet(bullet) {
  bullet.x += bullet.vx;
  bullet.y += bullet.vy;
  bullet.glitchPhase += 0.2;
  if (Math.random() < bullet.instability) {
    bullet.glitchOffset.x = (Math.random() - 0.5) * bullet.glitchIntensity * 2;
    bullet.glitchOffset.y = (Math.random() - 0.5) * bullet.glitchIntensity;
    bullet.currentColor = bullet.glitchColors[Math.floor(Math.random() * bullet.glitchColors.length)];
    bullet.instability = Math.min(0.3, bullet.instability + 0.02);
  } else {
    bullet.glitchOffset.x *= 0.9;
    bullet.glitchOffset.y *= 0.9;
    bullet.instability = Math.max(0.1, bullet.instability - 0.01);
  }
  bullet.vx = (Math.random() - 0.5) * 3 + Math.sin(bullet.glitchPhase) * 2;
  bullet.trail.push({ x: bullet.x + bullet.glitchOffset.x, y: bullet.y + bullet.glitchOffset.y, color: bullet.currentColor, opacity: 0.5, glitched: Math.random() < 0.3 });
  if (bullet.trail.length > 10) bullet.trail.shift();
}







