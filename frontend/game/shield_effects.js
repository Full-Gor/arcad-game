// shield_effects.js - Effets visuels du bouclier sphérique
import { canvas, ctx } from './globals_simple.js';
import { drawSphericalGrid, drawActiveVertices } from './shield_geometry.js';

// Initialisation des systèmes d'effets
export function initShieldEffects(sphericalShield, shieldCollections) {
    console.log('✨ Initialisation des effets de bouclier...');
    
    // Réinitialiser les collections d'effets
    shieldCollections.energyWaves = [];
    shieldCollections.pulsePoints = [];
    
    console.log('✅ Effets de bouclier initialisés');
}

// Mise à jour des effets visuels
export function updateShieldEffects(sphericalShield, shieldCollections) {
    // Mise à jour des ondes d'énergie
    shieldCollections.energyWaves = shieldCollections.energyWaves.filter(wave => {
        wave.radius += wave.speed;
        wave.opacity *= 0.98;
        return wave.radius < wave.maxRadius && wave.opacity > 0.01;
    });
    
    // Mise à jour des particules de pulse
    shieldCollections.pulsePoints = shieldCollections.pulsePoints.filter(point => {
        // Gestion de la traînée
        if (point.trail.length > 5) point.trail.shift();
        point.trail.push({ x: point.x, y: point.y });
        
        // Mouvement et physics
        point.x += point.vx;
        point.y += point.vy;
        point.vx *= 0.95;
        point.vy *= 0.95;
        point.life--;
        point.size *= 0.98;
        
        return point.life > 0;
    });
}

// Rendu des effets visuels
export function drawShieldEffects(ctx, centerX, centerY, sphericalShield, shieldCollections) {
    ctx.save();
    
    // 1. Dessiner la grille géodésique
    drawSphericalGrid(ctx, centerX, centerY, sphericalShield, shieldCollections);
    
    // 2. Dessiner les vertices actifs
    drawActiveVertices(ctx, centerX, centerY, sphericalShield, shieldCollections);
    
    // 3. Dessiner les ondes d'énergie
    drawEnergyWaves(ctx, centerX, centerY, sphericalShield, shieldCollections);
    
    // 4. Dessiner les particules de pulse
    drawPulseParticles(ctx, sphericalShield, shieldCollections);
    
    ctx.restore();
}

// Dessiner les ondes d'énergie qui parcourent la sphère
function drawEnergyWaves(ctx, centerX, centerY, sphericalShield, shieldCollections) {
    shieldCollections.energyWaves.forEach(wave => {
        ctx.strokeStyle = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity * sphericalShield.visibility})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, 0.5)`;
        
        // Dessiner un cercle sur la surface de la sphère
        ctx.beginPath();
        for (let i = 0; i <= 32; i++) {
            const angle = (i / 32) * Math.PI * 2;
            const waveTheta = wave.originTheta + wave.radius * Math.cos(angle);
            const wavePhi = wave.originPhi + wave.radius * Math.sin(angle);
            
            // Projection 3D vers 2D
            const coords = project3DWavePoint(
                waveTheta, wavePhi, 
                sphericalShield.radius, 
                centerX, centerY, 
                sphericalShield.rotation
            );
            
            if (i === 0) ctx.moveTo(coords.x, coords.y);
            else ctx.lineTo(coords.x, coords.y);
        }
        ctx.stroke();
    });
}

// Dessiner les particules d'impact
function drawPulseParticles(ctx, sphericalShield, shieldCollections) {
    shieldCollections.pulsePoints.forEach(point => {
        // Dessiner la traînée
        if (point.trail.length > 1) {
            ctx.strokeStyle = 'rgba(255, 150, 0, 0.3)';
            ctx.lineWidth = point.size * 0.5;
            ctx.beginPath();
            point.trail.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
        }
        
        // Dessiner la particule principale
        const particleGradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, point.size
        );
        particleGradient.addColorStop(0, `rgba(255, 255, 255, ${point.life / 50})`);
        particleGradient.addColorStop(0.5, `rgba(255, 150, 0, ${point.life / 50})`);
        particleGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
        
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Créer une onde d'énergie
export function createEnergyWave(shieldCollections, originPhi, originTheta, color, delay = 0) {
    setTimeout(() => {
        shieldCollections.energyWaves.push({
            originPhi: originPhi,
            originTheta: originTheta,
            radius: 0,
            maxRadius: Math.PI,
            speed: 0.05,
            opacity: 1.0,
            thickness: 0.1,
            color: color
        });
    }, delay);
}

// Créer des particules d'impact
export function createImpactParticles(shieldCollections, impactX, impactY, count = 15) {
    for (let i = 0; i < count; i++) {
        const spreadAngle = Math.random() * Math.PI * 2;
        const spreadSpeed = 1 + Math.random() * 3;
        
        shieldCollections.pulsePoints.push({
            x: impactX,
            y: impactY,
            vx: Math.cos(spreadAngle) * spreadSpeed,
            vy: Math.sin(spreadAngle) * spreadSpeed,
            size: 2 + Math.random() * 2,
            life: 30 + Math.random() * 20,
            trail: []
        });
    }
}

// Créer un effet de pulsation énergétique
export function createEnergyPulse(shieldCollections, centerX, centerY, radius, intensity = 1.0) {
    // Créer plusieurs ondes concentriques
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            
            shieldCollections.pulsePoints.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                vx: Math.cos(angle) * (2 + Math.random() * 2),
                vy: Math.sin(angle) * (2 + Math.random() * 2),
                size: 3 + Math.random() * 3,
                life: 40 + Math.random() * 30,
                trail: []
            });
        }, i * 50);
    }
}

// Fonction utilitaire pour projeter un point d'onde
function project3DWavePoint(theta, phi, radius, centerX, centerY, rotation) {
    const x3d = radius * Math.sin(theta) * Math.cos(phi);
    const y3d = radius * Math.cos(theta);
    const z3d = radius * Math.sin(theta) * Math.sin(phi);
    
    // Rotation
    const rotatedX = x3d * Math.cos(rotation.y) - z3d * Math.sin(rotation.y);
    const rotatedZ = x3d * Math.sin(rotation.y) + z3d * Math.cos(rotation.y);
    
    // Projection perspective
    const perspective = 1 + rotatedZ / 200;
    const projX = centerX + rotatedX * perspective;
    const projY = centerY + y3d * perspective;
    
    return { x: projX, y: projY };
}

// Créer un effet de révélation progressive
export function createRevealationEffect(shieldCollections, centerX, centerY, radius) {
    // Créer des particules qui révèlent la grille
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = radius * 0.8;
        
        shieldCollections.pulsePoints.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            vx: Math.cos(angle) * 0.5,
            vy: Math.sin(angle) * 0.5,
            size: 1.5,
            life: 60,
            trail: []
        });
    }
}

// Créer un effet de surcharge énergétique
export function createOverchargeEffect(shieldCollections, centerX, centerY, sphericalShield) {
    // Effet de surcharge avec particules intenses
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * sphericalShield.radius;
        const speed = 2 + Math.random() * 4;
        
        shieldCollections.pulsePoints.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 4,
            life: 50 + Math.random() * 40,
            trail: []
        });
    }
    
    // Ondes d'énergie multiples
    for (let i = 0; i < 5; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        createEnergyWave(
            shieldCollections, 
            phi, theta, 
            sphericalShield.colors.energy, 
            i * 100
        );
    }
}
