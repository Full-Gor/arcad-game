// following_sonic_wave.js - Onde sonique qui suit le nez de l'ennemi
import { enemyBullets } from '../../enemy_bullets_simple.js';

export function createFollowingSonicWave(enemy) {
  const wave = {
    type: 'following_sonic_wave_mod',
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
    startTime: Date.now()
  };
  for (let i = 0; i < wave.ringCount; i++) {
    wave.rings.push({ radius: 0, delay: i * 150, opacity: 1 - (i * 0.3), thickness: 2 - i * 0.3 });
  }
  enemyBullets.push(wave);
}

export function updateFollowingSonicWave(wave) {
  if (wave.enemyReference) {
    wave.x = wave.enemyReference.x + wave.enemyReference.width / 2;
    wave.y = wave.enemyReference.y + wave.enemyReference.height + 7;
  }
  wave.rings.forEach(ring => {
    if (ring.delay > 0) ring.delay -= 16; else ring.radius += wave.expansionSpeed;
  });
}



