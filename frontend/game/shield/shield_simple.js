// shield_simple.js - Premier bouclier simple activé avec ESPACE
import { canvas, ctx } from '../globals_simple.js';
import { starship } from '../player_simple.js';
import { createSimpleShieldImpact } from './shield_effects.js';

// Variables pour le système de bouclier avancé
let shieldSystem = {
    // Particules de base
    particles: [],
    orbitalParticles: [],
    
    // Hexagones du bouclier
    hexagons: [],
    hexagonSize: 12,
    hexagonRows: 8,
    
    // Système d'impacts amélioré
    impacts: [],
    ripples: [],
    energyBursts: [],
    
    // Configuration visuelle
    baseRadius: 50,
    energyColor: {
        r: 4, g: 251, b: 172,  // Couleur de base cyan
        impact: { r: 255, g: 100, b: 50 }  // Orange pour les impacts
    },
    
    // États du bouclier
    integrity: 100,
    overcharge: 0,
    distortion: 0,
    
    // Animation
    time: 0,
    plasmaFlow: 0
};

// Initialisation du système de bouclier
export function initShieldSystem(player = starship) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    // Créer la grille hexagonale
    shieldSystem.hexagons = [];
    for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        const distance = shieldSystem.baseRadius + Math.random() * 10;
        shieldSystem.hexagons.push({
            angle: angle,
            distance: distance,
            baseDistance: distance,
            opacity: 0.1 + Math.random() * 0.2,
            pulseOffset: Math.random() * Math.PI * 2,
            active: false,
            activation: 0
        });
    }
    
    // Créer les particules d'énergie orbitales
    shieldSystem.orbitalParticles = [];
    for (let i = 0; i < 12; i++) {
        shieldSystem.orbitalParticles.push({
            angle: (i / 12) * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.02,
            radius: shieldSystem.baseRadius - 5 + Math.random() * 15,
            size: 2 + Math.random() * 2,
            trail: [],
            pulseSpeed: 0.001 + Math.random() * 0.003
        });
    }
    
    // Particules de plasma flottantes
    shieldSystem.particles = [];
    for (let i = 0; i < 30; i++) {
        shieldSystem.particles.push({
            angle: Math.random() * Math.PI * 2,
            distance: 30 + Math.random() * 30,
            speed: 0.5 + Math.random() * 1.5,
            size: 1 + Math.random() * 3,
            opacity: 0.3 + Math.random() * 0.4,
            lifespan: 100 + Math.random() * 100
        });
    }
}

// Fonction d'activation du bouclier simple
export function activateSimpleShield() {
    if (shieldSystem.integrity > 0 && !starship.shield) {
        starship.shield = true;
        console.log('🛡️ Bouclier simple activé avec ESPACE');
    }
}

// Fonction de désactivation du bouclier simple
export function deactivateSimpleShield() {
    starship.shield = false;
    console.log('🛡️ Bouclier simple désactivé');
}

// Fonction de vérification si le bouclier simple est actif
export function isSimpleShieldActive() {
    return starship && starship.shield && shieldSystem.integrity > 0;
}

// Fonction de mise à jour du bouclier simple
export function updateSimpleShield() {
    if (!starship) return;
    
    shieldSystem.time++;
    shieldSystem.plasmaFlow += 0.02;
    
    // Réduction progressive de la distorsion et overcharge
    shieldSystem.distortion *= 0.95;
    shieldSystem.overcharge *= 0.98;
    
    // Mise à jour des impacts
    shieldSystem.impacts = shieldSystem.impacts.filter(impact => {
        impact.life--;
        impact.intensity = impact.life / impact.maxLife;
        impact.radius += 2;
        return impact.life > 0;
    });
    
    // Mise à jour des ondulations
    shieldSystem.ripples = shieldSystem.ripples.filter(ripple => {
        ripple.radius += ripple.speed;
        ripple.opacity *= 0.95;
        return ripple.radius < ripple.maxRadius && ripple.opacity > 0.01;
    });
    
    // Mise à jour des explosions d'énergie
    shieldSystem.energyBursts = shieldSystem.energyBursts.filter(burst => {
        // Ajouter à la traînée
        if (burst.trail.length > 8) burst.trail.shift();
        burst.trail.push({ x: burst.x, y: burst.y, size: burst.size });
        
        burst.x += burst.vx;
        burst.y += burst.vy;
        burst.vx *= 0.95;
        burst.vy *= 0.95;
        burst.life--;
        burst.size *= 0.98;
        return burst.life > 0 && burst.size > 0.5;
    });
    
    // Mise à jour des hexagones
    shieldSystem.hexagons.forEach(hex => {
        if (hex.active) {
            hex.activation *= 0.92;
            if (hex.activation < 0.01) {
                hex.active = false;
                hex.activation = 0;
            }
        }
        // Distorsion de la distance
        const distortionEffect = Math.sin(shieldSystem.time * 0.05 + hex.pulseOffset) * 2;
        hex.distance = hex.baseDistance + distortionEffect + shieldSystem.distortion * 5;
    });
    
    // Mise à jour des particules orbitales
    shieldSystem.orbitalParticles.forEach(particle => {
        particle.angle += particle.speed;
        
        // Maintenir une courte traînée
        if (particle.trail.length > 10) particle.trail.shift();
        const x = starship.x + starship.width/2 + Math.cos(particle.angle) * particle.radius;
        const y = starship.y + starship.height/2 + Math.sin(particle.angle) * particle.radius;
        particle.trail.push({ x, y });
    });
    
    // Mise à jour des particules de plasma
    shieldSystem.particles.forEach(particle => {
        particle.angle += particle.speed * 0.01;
        particle.lifespan--;
        if (particle.lifespan <= 0) {
            particle.lifespan = 100 + Math.random() * 100;
            particle.distance = 30 + Math.random() * 30;
            particle.angle = Math.random() * Math.PI * 2;
        }
    });
}

// Fonction de dessin du bouclier simple
export function drawSimpleShield() {
    if (!isSimpleShieldActive() || !starship) return;
    
    const centerX = starship.x + starship.width / 2;
    const centerY = starship.y + starship.height / 2;
    
    ctx.save();
    
    // 1. COUCHE DE BASE - Champ d'énergie avec distorsion
    const baseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, shieldSystem.baseRadius + 20);
    const overchargeBoost = shieldSystem.overcharge;
    baseGradient.addColorStop(0, `rgba(4, 251, 172, ${0.05 + overchargeBoost * 0.1})`);
    baseGradient.addColorStop(0.5, `rgba(4, 251, 172, ${0.03 + overchargeBoost * 0.05})`);
    baseGradient.addColorStop(1, 'rgba(4, 251, 172, 0)');
    
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, shieldSystem.baseRadius + 20 + shieldSystem.distortion * 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. GRILLE HEXAGONALE
    ctx.strokeStyle = 'rgba(4, 251, 172, 0.3)';
    ctx.lineWidth = 1;
    
    shieldSystem.hexagons.forEach(hex => {
        const x = centerX + Math.cos(hex.angle) * hex.distance;
        const y = centerY + Math.sin(hex.angle) * hex.distance;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(hex.angle);
        
        // Couleur selon l'activation
        if (hex.active) {
            const r = Math.floor(4 + hex.activation * 251);
            const g = Math.floor(251 - hex.activation * 100);
            const b = Math.floor(172 + hex.activation * 80);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + hex.activation * 0.7})`;
            ctx.lineWidth = 1 + hex.activation * 2;
            
            // Lueur pour les hexagones actifs
            ctx.shadowBlur = 10 * hex.activation;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        } else {
            ctx.strokeStyle = `rgba(4, 251, 172, ${hex.opacity})`;
            ctx.shadowBlur = 0;
        }
        
        // Dessiner l'hexagone
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hx = Math.cos(angle) * shieldSystem.hexagonSize;
            const hy = Math.sin(angle) * shieldSystem.hexagonSize;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    });
    
    // 3. ONDULATIONS (Ripples)
    shieldSystem.ripples.forEach(ripple => {
        ctx.strokeStyle = `rgba(4, 251, 172, ${ripple.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ripple.radius, ripple.angle - 1, ripple.angle + 1);
        ctx.stroke();
        
        // Effet de distorsion
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ripple.radius + 5, ripple.angle - 0.5, ripple.angle + 0.5);
        ctx.stroke();
    });
    
    // 4. LIGNE DE PLASMA PRINCIPALE
    ctx.strokeStyle = 'rgba(4, 251, 172, 0.8)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(4, 251, 172, 0.5)';
    
    // Dessiner avec variation selon les impacts
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        let radius = shieldSystem.baseRadius;
        
        // Déformation par les impacts
        shieldSystem.impacts.forEach(impact => {
            const angleDiff = Math.abs(angle - impact.angle);
            const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
            if (normalizedDiff < 0.5) {
                const influence = (1 - normalizedDiff / 0.5) * impact.intensity;
                radius += Math.sin(influence * Math.PI) * 10;
            }
        });
        
        // Ajout de l'effet plasma
        radius += Math.sin(angle * 8 + shieldSystem.plasmaFlow) * 2;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // 5. PARTICULES ORBITALES AVEC TRAÎNÉES
    shieldSystem.orbitalParticles.forEach(particle => {
        const x = centerX + Math.cos(particle.angle) * particle.radius;
        const y = centerY + Math.sin(particle.angle) * particle.radius;
        
        // Traînée
        if (particle.trail.length > 1) {
            ctx.strokeStyle = 'rgba(4, 251, 172, 0.3)';
            ctx.lineWidth = particle.size * 0.5;
            ctx.beginPath();
            particle.trail.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
        
        // Particule principale
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size);
        particleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        particleGradient.addColorStop(0.5, 'rgba(4, 251, 172, 0.8)');
        particleGradient.addColorStop(1, 'rgba(4, 251, 172, 0)');
        
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 6. EXPLOSIONS D'ÉNERGIE
    shieldSystem.energyBursts.forEach(burst => {
        // Traînée
        if (burst.trail.length > 1) {
            ctx.strokeStyle = `rgba(${burst.color.r}, ${burst.color.g}, ${burst.color.b}, 0.3)`;
            burst.trail.forEach((point, i) => {
                ctx.lineWidth = point.size * 0.5 * ((i + 1) / burst.trail.length);
                ctx.beginPath();
                if (i > 0) {
                    ctx.moveTo(burst.trail[i-1].x, burst.trail[i-1].y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                }
            });
        }
        
        // Particule d'énergie
        const energyGradient = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, burst.size);
        energyGradient.addColorStop(0, `rgba(255, 255, 255, ${burst.life / 50})`);
        energyGradient.addColorStop(0.3, `rgba(${burst.color.r}, ${burst.color.g}, ${burst.color.b}, ${burst.life / 50})`);
        energyGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = energyGradient;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 7. PARTICULES DE PLASMA FLOTTANTES
    shieldSystem.particles.forEach(particle => {
        const x = centerX + Math.cos(particle.angle) * particle.distance;
        const y = centerY + Math.sin(particle.angle) * particle.distance;
        const opacity = particle.opacity * (particle.lifespan / 200);
        
        ctx.fillStyle = `rgba(4, 251, 172, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 8. EFFET DE SURCHARGE
    if (shieldSystem.overcharge > 0.1) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${shieldSystem.overcharge * 0.3})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, shieldSystem.baseRadius + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Fonction pour absorber un projectile avec le bouclier simple (retourne true si absorbé)
export function absorbProjectile(projectile) {
    if (!isSimpleShieldActive() || !starship) return false;
    
    const shieldCenterX = starship.x + starship.width / 2;
    const shieldCenterY = starship.y + starship.height / 2;
    const shieldRadius = shieldSystem.baseRadius;
    
    const projectileCenterX = projectile.x + projectile.width / 2;
    const projectileCenterY = projectile.y + projectile.height / 2;
    
    const distance = Math.sqrt(
        Math.pow(projectileCenterX - shieldCenterX, 2) +
        Math.pow(projectileCenterY - shieldCenterY, 2)
    );
    
    if (distance <= shieldRadius) {
        // Créer un effet d'impact
        createSimpleShieldImpact(projectileCenterX, projectileCenterY, starship, 10);
        return true;
    }
    
    return false;
}

// Fonction helper pour vérifier si le bouclier est actif
export function isShieldActive() {
    return starship && starship.shield && shieldSystem.integrity > 0;
}

// Fonction pour régénérer le bouclier
export function regenerateShield(amount = 1) {
    shieldSystem.integrity = Math.min(100, shieldSystem.integrity + amount);
}

// Export du système pour les autres modules
export { shieldSystem };
