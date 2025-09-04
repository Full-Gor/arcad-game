// laser_pulsed_simple.js - Laser pulsé simple (barre verticale pulsante)
import { canvas, ctx } from '../../globals_simple.js';

export function createPulsingLaserSimple(enemy, color = '#FFD700', minWidth = 2, height = 120, speed = 3, pulseDuration = 2500, speedMult = 1) {
    return {
        x: enemy.x + enemy.width / 2 - minWidth / 2,
        centerX: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        minWidth,
        maxWidth: minWidth * 3,
        currentWidth: minWidth,
        height,
        vy: speed * speedMult,
        color,
        startTime: Date.now(),
        pulseDuration,
        glowIntensity: 15
    };
}

export function updatePulsingLaserSimple(laser) {
    laser.y += laser.vy;
    const elapsed = Date.now() - laser.startTime;
    const progress = (elapsed % laser.pulseDuration) / laser.pulseDuration;
    laser.currentWidth = laser.minWidth + (laser.maxWidth - laser.minWidth) * Math.abs(Math.sin(progress * Math.PI));
    laser.x = laser.centerX - laser.currentWidth / 2;
    return laser.y > canvas.height;
}

export function drawPulsingLaserSimple(laser) {
    ctx.save();
    ctx.fillStyle = laser.color;
    ctx.shadowColor = laser.color;
    ctx.shadowBlur = laser.glowIntensity;
    ctx.fillRect(laser.x, laser.y, laser.currentWidth, laser.height);
    ctx.strokeStyle = laser.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(laser.x, laser.y, laser.currentWidth, laser.height);
    ctx.restore();
}



