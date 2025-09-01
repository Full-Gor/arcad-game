// laser_beam.js - Laser balayé (beam)

// Variables pour les power-ups Néon
let neonPowerUps = {
    speed: 1,
    multishot: 1,
    damage: 1
};

// Fonction pour activer un power-up Néon
export function activateNeonPowerUp(type, value) {
    switch(type) {
        case 'speed':
            neonPowerUps.speed = value;
            break;
        case 'multishot':
            neonPowerUps.multishot = value;
            break;
        case 'damage':
            neonPowerUps.damage = value;
            break;
    }
}

// Fonction pour obtenir les valeurs des power-ups
export function getNeonPowerUps() {
    return { ...neonPowerUps };
}

export function createLaserBeam(enemy) {
  return {
    type: 'laser_beam_mod',
    x: enemy.x + enemy.width / 2,
    y: enemy.y + enemy.height,
    width: 3 * neonPowerUps.damage,
    sweepAngle: -Math.PI / 4,
    sweepSpeed: 0.02 * neonPowerUps.speed,
    sweepRange: Math.PI / 2,
    color: '#ff0000',
    glowColor: '#ff6666',
    duration: 3000,
    startTime: Date.now(),
    opacity: 1
  };
}

export function updateLaserBeam(beam) {
  const elapsed = Date.now() - beam.startTime;
  beam.sweepAngle += beam.sweepSpeed;
  if (Math.abs(beam.sweepAngle) > beam.sweepRange / 2) {
    beam.sweepSpeed *= -1;
  }
  if (elapsed > beam.duration) return true;
  if (elapsed < 200) beam.opacity = elapsed / 200; else if (elapsed > beam.duration - 200) beam.opacity = (beam.duration - elapsed) / 200;
  return false;
}

export function drawLaserBeam(ctx, beam) {
  ctx.save();
  ctx.globalAlpha = beam.opacity;
  ctx.translate(beam.x, beam.y);
  ctx.rotate(beam.sweepAngle);
  const laserLength = ctx.canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, 0, laserLength);
  gradient.addColorStop(0, beam.color);
  gradient.addColorStop(0.5, beam.glowColor);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(-beam.width/2, 0, beam.width, laserLength);
  ctx.restore();
}


