// laser_beam_webgl.js - Laser beam avec WebGL (basé sur test.html)
import { canvas } from '../../globals_simple.js';

// Variables pour les power-ups Néon
let neonPowerUps = {
    speed: 1,
    multishot: 1,
    damage: 1
};

// Fonction pour activer un power-up Néon
function activateNeonPowerUp(type, value) {
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
function getNeonPowerUps() {
    return { ...neonPowerUps };
}

export function createPulsingLaserSimple(enemy, color = '#FFD700', minWidth = 2, height = 120, speed = 1.5, pulseDuration = 2500, speedMult = 1) {
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
        opacity: 1,
        // Système de tunnel (7 tirs d'affilée)
        tunnelIndex: 0,
        tunnelDelay: 100,
        lastTunnelTime: 0
    };
}

export function updatePulsingLaserSimple(laser) {
    const elapsed = Date.now() - laser.startTime;
    laser.sweepAngle += laser.sweepSpeed;
    if (Math.abs(laser.sweepAngle) > laser.sweepRange / 2) {
        laser.sweepSpeed *= -1;
    }
    if (elapsed > laser.duration) return true;
    if (elapsed < 200) laser.opacity = elapsed / 200; 
    else if (elapsed > laser.duration - 200) laser.opacity = (laser.duration - elapsed) / 200;
    return false;
}

export function drawPulsingLaserSimple(ctx, laser) {
    // Dessin simplifié du laser beam (sans WebGL pour compatibilité)
    ctx.save();
    
    // Laser beam simplifié
    ctx.strokeStyle = laser.color;
    ctx.lineWidth = laser.width;
    ctx.shadowColor = laser.glowColor;
    ctx.shadowBlur = 20;
    ctx.globalAlpha = laser.opacity;
    
    const length = canvas.height * 2;
    const startX = laser.x;
    const startY = laser.y;
    const endX = startX + Math.cos(laser.sweepAngle) * length;
    const endY = startY + Math.sin(laser.sweepAngle) * length;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Glow effect
    ctx.strokeStyle = laser.glowColor;
    ctx.lineWidth = laser.width * 3;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    ctx.globalAlpha = 1;
    ctx.restore();
}
