// bullets/types/funnel.js - Laser entonnoir (funnel)

// Modèle de données suggéré:
// {
//   id, enemyRef, startTime,
//   phase: 'growing' | 'disintegrating' | 'complete',
//   growDuration, disintegrateDuration,
//   x, y, currentWidth, maxWidth, length,
//   funnelRadius, maxFunnelRadius, funnelHeight,
//   opacity, glowIntensity, maxGlowIntensity,
//   funnelSegments, funnelWaveAmplitude, funnelWavePhase,
//   disintegrationParticles: []
// }

export function createFunnelLaser(enemy, now = Date.now()) {
  return {
    id: now + Math.random(),
    enemyRef: enemy,
    startTime: now,
    phase: 'growing',
    growDuration: 3000,
    disintegrateDuration: 1500,
    x: enemy.x + enemy.width / 2,
    y: enemy.y + enemy.height,
    currentWidth: 1,
    maxWidth: 200,
    length: 1000,
    funnelRadius: 1,
    maxFunnelRadius: 100,
    funnelHeight: 60,
    opacity: 1,
    glowIntensity: 0,
    maxGlowIntensity: 30,
    funnelSegments: 32,
    funnelWaveAmplitude: 0,
    funnelWavePhase: 0,
    disintegrationParticles: []
  };
}

export function updateFunnelLaser(laser, now = Date.now()) {
  const elapsed = now - laser.startTime;
  if (laser.enemyRef) {
    laser.x = laser.enemyRef.x + laser.enemyRef.width / 2;
    laser.y = laser.enemyRef.y + laser.enemyRef.height;
  }
  if (laser.phase === 'growing') {
    const t = Math.min(elapsed / laser.growDuration, 1);
    const e = easeInOutCubic(t);
    laser.currentWidth = 1 + (laser.maxWidth - 1) * e;
    laser.funnelRadius = 1 + (laser.maxFunnelRadius - 1) * e;
    laser.glowIntensity = laser.maxGlowIntensity * e;
    laser.funnelWaveAmplitude = 3 * Math.sin(elapsed * 0.003);
    laser.funnelWavePhase += 0.05;
    if (elapsed >= laser.growDuration) {
      laser.phase = 'disintegrating';
      laser.disintegrationStartTime = now;
    }
  } else if (laser.phase === 'disintegrating') {
    const dElapsed = now - laser.disintegrationStartTime;
    const p = Math.min(dElapsed / laser.disintegrateDuration, 1);
    laser.opacity = 1 - p;
    laser.currentWidth = laser.maxWidth * (1 - p * 0.5);
    laser.funnelWaveAmplitude = 10 + 20 * p;
    laser.funnelWavePhase += 0.1 + p * 0.2;
    if (p >= 1) {
      laser.phase = 'complete';
    }
  }
}

export function drawFunnelLaser(ctx, laser) {
  if (laser.phase === 'complete') return;
  ctx.save();
  ctx.globalAlpha = laser.opacity;
  drawFunnelTop(ctx, laser);
  drawLaserBeam(ctx, laser);
  ctx.restore();
}

function drawFunnelTop(ctx, laser) {
  const grad = ctx.createRadialGradient(laser.x, laser.y, 0, laser.x, laser.y, laser.funnelRadius);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.6, '#87CEEB');
  grad.addColorStop(1, 'rgba(135,206,235,0.3)');
  ctx.beginPath();
  for (let i = 0; i <= laser.funnelSegments; i++) {
    const angle = (i / laser.funnelSegments) * Math.PI * 2;
    const wave = Math.sin(angle * 3 + laser.funnelWavePhase) * laser.funnelWaveAmplitude;
    const r = laser.funnelRadius + wave;
    const x = laser.x + Math.cos(angle) * r;
    const y = laser.y + Math.sin(angle) * r * 0.3;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#00BFFF';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00BFFF';
  ctx.shadowBlur = laser.glowIntensity;
  ctx.stroke();
  const link = ctx.createLinearGradient(laser.x - laser.currentWidth/2, laser.y, laser.x + laser.currentWidth/2, laser.y);
  link.addColorStop(0.2, '#87CEEB');
  link.addColorStop(0.5, '#FFFFFF');
  link.addColorStop(0.8, '#87CEEB');
  ctx.fillStyle = link;
  ctx.fillRect(laser.x - laser.currentWidth/2, laser.y, laser.currentWidth, laser.funnelHeight);
}

function drawLaserBeam(ctx, laser) {
  const grad = ctx.createLinearGradient(
    laser.x - laser.currentWidth/2,
    laser.y + laser.funnelHeight,
    laser.x + laser.currentWidth/2,
    laser.y + laser.funnelHeight
  );
  grad.addColorStop(0.1, 'rgba(135,206,235,0.3)');
  grad.addColorStop(0.5, '#FFFFFF');
  grad.addColorStop(0.9, 'rgba(135,206,235,0.3)');
  ctx.fillStyle = grad;
  ctx.fillRect(
    laser.x - laser.currentWidth/2,
    laser.y + laser.funnelHeight,
    laser.currentWidth,
    laser.length - laser.funnelHeight
  );
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}



