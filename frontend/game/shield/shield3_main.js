// shield3_main.js - Bouclier 3 (Absorption + Riposte) - module principal
import { canvas, ctx } from '../globals_simple.js';
import { starship } from '../player_simple.js';
import { initShield3Geometry, activateShield3Segments, drawShield3Grid, updateShield3GridRotation } from './shield3_geometry.js';
import { createShield3Shockwave, createShield3ResidualParticles, updateShield3Spheres, drawShield3Spheres, updateShield3Trails, drawShield3Trails, updateShield3Residuals, drawShield3Residuals, drawShield3EnergyBar } from './shield3_effects.js';
import { fireShield3LaserRiposte, updateShield3Lasers, drawShield3Lasers, updateShield3Charging, drawShield3Charging } from './shield3_lasers.js';

// Limites de sécurité (performance)
const MAX_S3_SPHERES = 40;
const MAX_S3_TRAILS = 120;
const MAX_S3_RESIDUALS = 200;
const MAX_S3_CHARGING = 120;

export const absorptionShield3 = {
    radius: 55,
    visibility: 0,
    isAbsorbing: false,
    active: false, // activé par Alt

    // Énergie
    energyStored: 0,
    maxEnergy: 100,

    // Collections
    energySpheres: [],
    laserBlasts: [],
    chargingLasers: [],
    residualParticles: [],
    energyTrails: [],

    // Grille
    grid: {
        meridians: 24,
        parallels: 16,
        segments: [],
        rotation: { x: 0, y: 0, z: 0 }
    },

    colors: {
        absorption: { r: 255, g: 0, b: 255 },
        laserCore: { r: 255, g: 255, b: 255 },
        laserEdge: { r: 255, g: 0, b: 100 },
        grid: { r: 200, g: 0, b: 255 }
    },

    // Animation
    time: 0,
    pulsePhase: 0
};

export function initShield3(player = starship) {
    initShield3Geometry(absorptionShield3);
}

export function activateShield3() {
    absorptionShield3.active = true;
    // Rendre visible immédiatement une légère aura pour feedback
    absorptionShield3.visibility = Math.max(absorptionShield3.visibility, 0.2);
}

export function deactivateShield3() {
    absorptionShield3.active = false;
}

export function isShield3Active() {
    return !!absorptionShield3.active;
}

// Impact d'absorption (à appeler lors de collisions)
export function createShield3AbsorptionImpact(impactX, impactY, player = starship, damage = 10) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const dx = impactX - centerX;
    const dy = impactY - centerY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const phi = angle;
    const theta = Math.acos(Math.min(1, distance / absorptionShield3.radius));

    absorptionShield3.isAbsorbing = true;
    absorptionShield3.visibility = Math.min(1, absorptionShield3.visibility + 0.3);

    const energyGained = damage * 2;
    absorptionShield3.energyStored = Math.min(absorptionShield3.maxEnergy, absorptionShield3.energyStored + energyGained);

    // Sphère d'énergie aspirée
    absorptionShield3.energySpheres.push({
        x: impactX,
        y: impactY,
        targetX: centerX,
        targetY: centerY,
        radius: 20,
        opacity: 1,
        color: { ...absorptionShield3.colors.absorption },
        spiralAngle: 0,
        spiralRadius: distance,
        life: 60,
        trail: []
    });
    if (absorptionShield3.energySpheres.length > MAX_S3_SPHERES) {
        absorptionShield3.energySpheres.splice(0, absorptionShield3.energySpheres.length - MAX_S3_SPHERES);
    }

    // Activer segments proches
    activateShield3Segments(absorptionShield3, phi, theta);

    // Tir de riposte si assez d'énergie
    if (absorptionShield3.energyStored >= 50) {
        setTimeout(() => {
            fireShield3LaserRiposte(absorptionShield3, angle, centerX, centerY);
            absorptionShield3.energyStored -= 50;
        }, 500);
    }

    // Trainées d'absorption
    for (let i = 0; i < 15; i++) {
        const particleAngle = angle + (Math.random() - 0.5) * Math.PI * 0.5;
        const speed = 1 + Math.random() * 2;
        absorptionShield3.energyTrails.push({
            x: impactX,
            y: impactY,
            vx: -Math.cos(particleAngle) * speed,
            vy: -Math.sin(particleAngle) * speed,
            size: 3 + Math.random() * 3,
            life: 40,
            color: { ...absorptionShield3.colors.absorption },
            trail: []
        });
    }
    if (absorptionShield3.energyTrails.length > MAX_S3_TRAILS) {
        absorptionShield3.energyTrails.splice(0, absorptionShield3.energyTrails.length - MAX_S3_TRAILS);
    }
}

export function triggerShield3ManualRiposte(targetX, targetY) {
    if (absorptionShield3.energyStored >= 30) {
        const centerX = starship.x + starship.width / 2;
        const centerY = starship.y + starship.height / 2;
        const angle = Math.atan2(targetY - centerY, targetX - centerX);
        fireShield3LaserRiposte(absorptionShield3, angle, centerX, centerY);
        absorptionShield3.energyStored -= 30;
    }
}

export function updateShield3() {
    if (!absorptionShield3.active) {
        // Fade out quand inactif
        absorptionShield3.isAbsorbing = false;
        absorptionShield3.visibility *= 0.95;
        if (absorptionShield3.visibility < 0.01) absorptionShield3.visibility = 0;
        return;
    }

    absorptionShield3.time++;
    absorptionShield3.pulsePhase += 0.1;

    // Rotation grille
    updateShield3GridRotation(absorptionShield3);

    // Sphères d'énergie et traînées
    updateShield3Spheres(absorptionShield3);
    updateShield3Trails(absorptionShield3);

    // Lasers et charge
    updateShield3Lasers(absorptionShield3, createShield3Shockwave, createShield3ResidualParticles);
    updateShield3Charging(absorptionShield3);

    // Résiduels
    updateShield3Residuals(absorptionShield3);
    // Gardes finales (caps)
    if (absorptionShield3.energySpheres.length > MAX_S3_SPHERES) {
        absorptionShield3.energySpheres.length = MAX_S3_SPHERES;
    }
    if (absorptionShield3.energyTrails.length > MAX_S3_TRAILS) {
        absorptionShield3.energyTrails.length = MAX_S3_TRAILS;
    }
    if (absorptionShield3.residualParticles.length > MAX_S3_RESIDUALS) {
        absorptionShield3.residualParticles.splice(0, absorptionShield3.residualParticles.length - MAX_S3_RESIDUALS);
    }
    if (absorptionShield3.chargingLasers.length > MAX_S3_CHARGING) {
        absorptionShield3.chargingLasers.splice(0, absorptionShield3.chargingLasers.length - MAX_S3_CHARGING);
    }

    // Fin d'absorption pour cette frame
    absorptionShield3.isAbsorbing = false;
}

export function drawShield3(ctx) {
    if (!absorptionShield3.active || absorptionShield3.visibility <= 0) return;

    const centerX = starship.x + starship.width / 2;
    const centerY = starship.y + starship.height / 2;

    ctx.save();

    // Aura
    if (absorptionShield3.visibility > 0) {
        const auraGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, absorptionShield3.radius + 20);
        auraGradient.addColorStop(0, `rgba(255, 0, 255, ${absorptionShield3.visibility * 0.1})`);
        auraGradient.addColorStop(0.5, `rgba(200, 0, 255, ${absorptionShield3.visibility * 0.05})`);
        auraGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, absorptionShield3.radius + 20, 0, Math.PI * 2);
        ctx.fill();
    }

    // Grille
    drawShield3Grid(ctx, absorptionShield3, centerX, centerY);

    // Effets: sphères, charge, lasers, trails, résiduels
    drawShield3Spheres(ctx, absorptionShield3);
    drawShield3Charging(ctx, absorptionShield3);
    drawShield3Lasers(ctx, absorptionShield3);
    drawShield3Trails(ctx, absorptionShield3);
    drawShield3Residuals(ctx, absorptionShield3);

    // Barre d'énergie
    drawShield3EnergyBar(ctx, absorptionShield3, centerX, centerY);

    ctx.restore();
}


