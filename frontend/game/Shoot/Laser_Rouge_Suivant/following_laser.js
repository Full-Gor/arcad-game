// following_laser.js - Laser rectangulaire qui suit le nez de l'ennemi
import { ctx } from '../../globals_simple.js';

export function createFollowingLaser(enemy, color = 'red', width = 4, height = 80, speed = 5, speedMult = 1) {
  return {
    type: 'following_laser_mod',
    x: enemy.x + enemy.width / 2 - width / 2,
    y: enemy.y + enemy.height + 7,
    width,
    height,
    vy: speed * speedMult,
    color,
    enemyReference: enemy,
    offsetY: enemy.height + 7,
    glowIntensity: 10
  };
}

export function updateFollowingLaser(laser) {
  if (laser.enemyReference) {
    // Suivre le nez de l'ennemi
    laser.x = laser.enemyReference.x + laser.enemyReference.width / 2 - laser.width / 2;
    laser.y = laser.enemyReference.y + laser.offsetY;
  } else {
    // Ennemi détruit → continuer en ligne droite
    laser.y += laser.vy;
  }
}

export function drawFollowingLaser(laser) {
  ctx.save();
  ctx.shadowColor = laser.color;
  ctx.shadowBlur = laser.glowIntensity;
  ctx.fillStyle = laser.color;
  ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
  ctx.strokeStyle = laser.color;
  ctx.lineWidth = 1;
  ctx.strokeRect(laser.x, laser.y, laser.width, laser.height);
  ctx.restore();
}







