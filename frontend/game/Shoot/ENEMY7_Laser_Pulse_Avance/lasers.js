// bullets/types/lasers.js - Lasers pulsés et balayés
import { canvas, ctx } from '../../globals_simple.js';

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

export function createPulsingLaser(enemy, color, minWidth, height, speed, pulseDuration, enemyBulletSpeedMultiplier, pulsingLasers) {
    const laser = {
        centerX: enemy.x + enemy.width / 2,
        x: enemy.x + enemy.width / 2 - minWidth / 2,
        y: enemy.y + enemy.height,
        minWidth,
        maxWidth: minWidth * 3,
        currentWidth: minWidth,
        height,
        vy: speed * enemyBulletSpeedMultiplier * neonPowerUps.speed,
        color,
        startTime: Date.now(),
        pulseDuration,
        isPulsingLaser: true,
        glowIntensity: 15 * neonPowerUps.damage
    };
    pulsingLasers.push(laser);
}

export function updatePulsingLasers(pulsingLasers) {
    for (let i = pulsingLasers.length - 1; i >= 0; i--) {
        const laser = pulsingLasers[i];
        laser.y += laser.vy;
        const elapsed = Date.now() - laser.startTime;
        const progress = (elapsed % laser.pulseDuration) / laser.pulseDuration;
        laser.currentWidth = laser.minWidth + (laser.maxWidth - laser.minWidth) * Math.abs(Math.sin(progress * Math.PI));
        laser.x = laser.centerX - laser.currentWidth / 2;
        if (laser.y > canvas.height) {
            pulsingLasers.splice(i, 1);
        }
    }
}

export function drawPulsingLasers(pulsingLasers) {
    pulsingLasers.forEach(laser => {
        ctx.save();
        ctx.fillStyle = laser.color;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = laser.glowIntensity;
        ctx.fillRect(laser.x, laser.y, laser.currentWidth, laser.height);
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(laser.x, laser.y, laser.currentWidth, laser.height);
        ctx.restore();
    });
}

export function createPulseLaser(enemy, enemyLasers) {
    setTimeout(() => {
        const laser = {
            type: 'pulse_laser_mgr',
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            width: 4 * neonPowerUps.damage,
            baseWidth: 4,
            maxWidth: 25 * neonPowerUps.damage,
            length: canvas.height,
            color: '#00ffff',
            glowColor: '#00ddff',
            pulseSpeed: 0.1,
            pulsePhase: 0,
            damage: 2 * neonPowerUps.damage,
            duration: 2000,
            startTime: Date.now(),
            opacity: 1,
            particles: []
        };
        enemyLasers.push(laser);
    }, 500);
}

export function createSweepingLaser(enemy, enemyLasers) {
    setTimeout(() => {
        const laser = {
            type: 'laser_beam_mgr',
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            targetX: enemy.x + enemy.width / 2,
            targetY: enemy.y + enemy.height + 100,
            width: 3 * neonPowerUps.damage,
            sweepAngle: -Math.PI / 4,
            sweepSpeed: 0.02,
            sweepRange: Math.PI / 2,
            color: '#ff0000',
            glowColor: '#ff6666',
            intensity: 1,
            duration: 3000,
            startTime: Date.now(),
            damageZones: [],
            particleTrail: [],
            opacity: 1
        };
        enemyLasers.push(laser);
    }, 800);
}

export function updateLasers(enemyLasers) {
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        const laser = enemyLasers[i];
        const elapsed = Date.now() - laser.startTime;
        if (elapsed > laser.duration) {
            enemyLasers.splice(i, 1);
            continue;
        }
        switch(laser.type) {
            case 'pulse_laser_mgr':
                laser.pulsePhase += laser.pulseSpeed;
                laser.width = laser.baseWidth + 
                    Math.sin(laser.pulsePhase) * (laser.maxWidth - laser.baseWidth) / 2 + 
                    (laser.maxWidth - laser.baseWidth) / 2;
                // Effet multishot si activé
                if (neonPowerUps.multishot > 1 && Math.random() < 0.1) {
                    createPulseLaser(laser, enemyLasers);
                }
                break;
            case 'laser_beam_mgr':
                laser.sweepAngle += laser.sweepSpeed;
                if (Math.abs(laser.sweepAngle) > laser.sweepRange / 2) {
                    laser.sweepSpeed *= -1;
                }
                // Effet multishot si activé
                if (neonPowerUps.multishot > 1 && Math.random() < 0.1) {
                    createSweepingLaser(laser, enemyLasers);
                }
                break;
        }
        if (elapsed < 200) laser.opacity = elapsed / 200;
        else if (elapsed > laser.duration - 200) laser.opacity = (laser.duration - elapsed) / 200;
    }
}

export function drawLasers(enemyLasers) {
    enemyLasers.forEach(laser => {
        ctx.save();
        ctx.globalAlpha = laser.opacity;
        if (laser.type === 'pulse_laser_mgr') {
            const gradient = ctx.createLinearGradient(
                laser.x - laser.width/2, laser.y,
                laser.x + laser.width/2, laser.y
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.2, laser.color);
            gradient.addColorStop(0.5, '#ffffff');
            gradient.addColorStop(0.8, laser.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(laser.x - laser.width/2, laser.y, laser.width, laser.length);
            ctx.shadowColor = laser.glowColor;
            ctx.shadowBlur = laser.width;
            ctx.fillRect(laser.x - laser.width/4, laser.y, laser.width/2, laser.length);
        } else if (laser.type === 'laser_beam_mgr') {
            ctx.save();
            ctx.translate(laser.x, laser.y);
            ctx.rotate(laser.sweepAngle);
            const laserLength = canvas.height;
            const gradient = ctx.createLinearGradient(0, 0, 0, laserLength);
            gradient.addColorStop(0, laser.color);
            gradient.addColorStop(0.5, laser.glowColor);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(-laser.width/2, 0, laser.width, laserLength);
            ctx.restore();
        }
        ctx.restore();
    });
}


