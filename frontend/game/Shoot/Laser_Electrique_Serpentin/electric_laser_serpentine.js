// electric_laser_serpentine.js - Laser électrique générique (sans attribution)
import { enemyBullets } from '../../enemy_bullets_simple.js';

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

export function createElectricLaser(entity, options = {}) {
    const {
        length = 100,
        width = 8,
        vy = 6,
        color = '#00FFFF',
        coreColor = '#FFFFFF',
        glowColor = '#0088FF'
    } = options;
    const laser = {
        type: 'electric_laser_gen',
        x: entity.x + entity.width / 2,
        y: entity.y + entity.height,
        length: length * neonPowerUps.damage,
        width: width * neonPowerUps.damage,
        vx: 0,
        vy: vy * neonPowerUps.speed,
        electricArcs: [],
        color,
        coreColor,
        glowColor,
        pulsePhase: 0,
        lifetime: 60,
        maxLifetime: 60,
        sparkParticles: []
    };
    // init arcs
    for (let i = 0; i < 5; i++) {
        laser.electricArcs.push({
            offset: Math.random() * laser.length,
            amplitude: 10 + Math.random() * 15,
            frequency: Math.random() * 0.2,
            phase: Math.random() * Math.PI * 2
        });
    }
    enemyBullets.push(laser);
    return laser;
}

export function updateElectricLaser(laser) {
    // Le laser traverse l'écran 4x plus lentement
    laser.y += laser.vy * 0.50;
    // Pulsation 2x plus lente
    laser.pulsePhase += 0.075;
    if (!laser._tick) laser._tick = 0;
    laser._tick++;
    if (laser._tick % 2 === 0) {
        laser.lifetime--;
    }
    laser.electricArcs.forEach(arc => {
        // L'électricité parcourt le laser 2x moins vite (phase ralentie)
        arc.phase += arc.frequency * 2;
        arc.amplitude = (10 + Math.random() * 15) * (laser.lifetime / laser.maxLifetime);
    });
    // Fréquence d'étincelles conservée (pas moins fréquente)
    if (Math.random() < 0.5) {
        laser.sparkParticles.push({
            x: laser.x + (Math.random() - 0.5) * laser.width * 4,
            y: laser.y + Math.random() * laser.length,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2,
            lifetime: 10,
            size: 2 + Math.random() * 2
        });
    }
    laser.sparkParticles = laser.sparkParticles.filter(p => {
        p.x += p.vx; p.y += p.vy; if (laser._tick % 2 === 0) p.lifetime--; p.size *= 0.97; return p.lifetime > 0;
    });
    return laser.lifetime <= 0;
}

export function drawElectricLaser(ctx, laser) {
    ctx.save();
    const gradient = ctx.createLinearGradient(laser.x - laser.width/2, laser.y, laser.x + laser.width/2, laser.y);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
    gradient.addColorStop(0.5, laser.coreColor);
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(laser.x - laser.width/2, laser.y, laser.width, laser.length);
    const coreGradient = ctx.createLinearGradient(laser.x - laser.width/4, laser.y, laser.x + laser.width/4, laser.y);
    coreGradient.addColorStop(0, 'transparent');
    coreGradient.addColorStop(0.5, '#FFFFFF');
    coreGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGradient;
    ctx.fillRect(laser.x - laser.width/4, laser.y, laser.width/2, laser.length);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 5;
    laser.electricArcs.forEach(arc => {
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        const y = laser.y + arc.offset;
        ctx.moveTo(laser.x - laser.width/2, y);
        for (let i = 1; i <= 5; i++) {
            const t = i / 5;
            const x = laser.x - laser.width/2 + laser.width * t;
            const offsetY = Math.sin(arc.phase + t * Math.PI * 2) * arc.amplitude;
            ctx.lineTo(x, y + offsetY);
        }
        ctx.stroke();
    });
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 10;
    laser.sparkParticles.forEach(p => {
        ctx.globalAlpha = p.lifetime / 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size/2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}


