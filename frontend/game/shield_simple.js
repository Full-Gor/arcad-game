// shield_simple.js - Gestion du bouclier avancé de façon modulaire
import { canvas, ctx } from './globals_simple.js';
import { starship } from './player_simple.js';

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

// Initialisation du système de bouclier (OPTIMISÉ)
export function initShieldSystem(player = starship) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    // Créer la grille hexagonale (RÉDUITE: 24 au lieu de 36)
    shieldSystem.hexagons = [];
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
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
    
    // Créer les particules d'énergie orbitales (RÉDUITE: 8 au lieu de 12)
    shieldSystem.orbitalParticles = [];
    for (let i = 0; i < 8; i++) {
        shieldSystem.orbitalParticles.push({
            angle: (i / 8) * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.02,
            radius: shieldSystem.baseRadius - 5 + Math.random() * 15,
            size: 2 + Math.random() * 2,
            trail: [],
            pulseSpeed: 0.001 + Math.random() * 0.003
        });
    }
    
    // Particules de plasma flottantes (RÉDUITE: 20 au lieu de 30)
    shieldSystem.particles = [];
    for (let i = 0; i < 20; i++) {
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

// Créer un impact amélioré
export function createShieldImpact(impactX, impactY, player = starship, damage = 10) {
    if (!player || !player.shield) return;
    
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    const dx = impactX - centerX;
    const dy = impactY - centerY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Impact principal avec onde de choc
    shieldSystem.impacts.push({
        angle: angle,
        intensity: 1.0,
        radius: 0,
        maxRadius: 40,
        life: 45,
        maxLife: 45,
        shockwave: true,
        color: { ...shieldSystem.energyColor.impact }
    });
    
    // Créer des ondulations (ripples)
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            shieldSystem.ripples.push({
                x: impactX,
                y: impactY,
                radius: 0,
                maxRadius: 60 + i * 20,
                opacity: 0.8 - i * 0.2,
                speed: 2 - i * 0.3,
                angle: angle
            });
        }, i * 100);
    }
    
    // Explosion de particules d'énergie (RÉDUITE: 12 au lieu de 20)
    for (let i = 0; i < 12; i++) {
        const spreadAngle = angle + (Math.random() - 0.5) * Math.PI * 0.5;
        const speed = 2 + Math.random() * 4;
        shieldSystem.energyBursts.push({
            x: impactX,
            y: impactY,
            vx: Math.cos(spreadAngle) * speed,
            vy: Math.sin(spreadAngle) * speed,
            size: 2 + Math.random() * 3,
            life: 30 + Math.random() * 20,
            color: Math.random() > 0.5 ? shieldSystem.energyColor : shieldSystem.energyColor.impact,
            trail: []
        });
    }
    
    // Activer les hexagones proches
    shieldSystem.hexagons.forEach(hex => {
        const hexAngle = hex.angle;
        const angleDiff = Math.abs(angle - hexAngle);
        const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
        
        if (normalizedDiff < 0.5) {
            hex.active = true;
            hex.activation = 1.0;
        }
    });
    
    // Créer une distorsion temporaire
    shieldSystem.distortion = Math.min(shieldSystem.distortion + damage * 0.1, 2.0);
    
    // Overcharge temporaire pour effet dramatique
    shieldSystem.overcharge = Math.min(shieldSystem.overcharge + 0.3, 1.0);
    
    console.log(`🛡️ Impact avancé créé à l'angle ${(angle * 180 / Math.PI).toFixed(1)}° avec ${damage} dégâts`);
}

// Fonction pour activer le bouclier avancé
export function activateShield(player = starship, duration = 5000) {
    if (!player) return;
    
    console.log('🛡️ Activation du bouclier avancé pour', duration, 'ms');
    
    // Activer le bouclier
    player.shield = true;
    
    // Initialiser le système de bouclier avancé
    initShieldSystem(player);
    
    // Réinitialiser l'intégrité
    shieldSystem.integrity = 100;
    shieldSystem.overcharge = 0;
    shieldSystem.distortion = 0;
    
    // Nettoyer l'ancien timeout si il existe
    if (player.shieldTimeout) {
        clearTimeout(player.shieldTimeout);
        player.shieldTimeout = null;
    }
    
    // Désactiver le bouclier après la durée spécifiée
    player.shieldTimeout = setTimeout(() => {
        console.log('🛡️ Désactivation du bouclier avancé');
        player.shield = false;
        
        // Nettoyer le système
        cleanupShieldSystem(player);
        
        player.shieldTimeout = null;
    }, duration);
}

// Mise à jour du système avancé (OPTIMISÉ)
export function updateShieldParticles() {
    if (!starship || !starship.shield) return;
    
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
    
    // Mise à jour des explosions d'énergie (OPTIMISÉ: traînée plus courte)
    shieldSystem.energyBursts = shieldSystem.energyBursts.filter(burst => {
        // Ajouter à la traînée (RÉDUITE: 5 au lieu de 8)
        if (burst.trail.length > 5) burst.trail.shift();
        burst.trail.push({ x: burst.x, y: burst.y, size: burst.size });
        
        burst.x += burst.vx;
        burst.y += burst.vy;
        burst.vx *= 0.95;
        burst.vy *= 0.95;
        burst.life--;
        burst.size *= 0.98;
        return burst.life > 0 && burst.size > 0.5;
    });
    
    // Mise à jour des hexagones (OPTIMISÉ: seulement si actifs ou tous les 3 frames)
    if (shieldSystem.time % 3 === 0) {
        shieldSystem.hexagons.forEach(hex => {
            if (hex.active) {
                hex.activation *= 0.92;
                if (hex.activation < 0.01) {
                    hex.active = false;
                    hex.activation = 0;
                }
            }
            // Distorsion de la distance (calcul moins fréquent)
            const distortionEffect = Math.sin(shieldSystem.time * 0.05 + hex.pulseOffset) * 2;
            hex.distance = hex.baseDistance + distortionEffect + shieldSystem.distortion * 5;
        });
    }
    
    // Mise à jour des particules orbitales (OPTIMISÉ: traînée plus courte)
    const centerX = starship.x + starship.width/2;
    const centerY = starship.y + starship.height/2;
    
    shieldSystem.orbitalParticles.forEach(particle => {
        particle.angle += particle.speed;
        
        // Maintenir une courte traînée (RÉDUITE: 6 au lieu de 10)
        if (particle.trail.length > 6) particle.trail.shift();
        const x = centerX + Math.cos(particle.angle) * particle.radius;
        const y = centerY + Math.sin(particle.angle) * particle.radius;
        particle.trail.push({ x, y });
    });
    
    // Mise à jour des particules de plasma (OPTIMISÉ: moins fréquente)
    if (shieldSystem.time % 2 === 0) {
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
}

// Rendu du bouclier avancé
export function drawShieldParticles() {
    if (!starship || !starship.shield) return;
    
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
    
    // 2. GRILLE HEXAGONALE (OPTIMISÉE: sans shadow)
    shieldSystem.hexagons.forEach(hex => {
        const x = centerX + Math.cos(hex.angle) * hex.distance;
        const y = centerY + Math.sin(hex.angle) * hex.distance;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(hex.angle);
        
        // Couleur selon l'activation (SIMPLIFIÉ: sans shadowBlur)
        if (hex.active) {
            const r = Math.floor(4 + hex.activation * 251);
            const g = Math.floor(251 - hex.activation * 100);
            const b = Math.floor(172 + hex.activation * 80);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + hex.activation * 0.7})`;
            ctx.lineWidth = 1 + hex.activation * 2;
        } else {
            ctx.strokeStyle = `rgba(4, 251, 172, ${hex.opacity})`;
            ctx.lineWidth = 1;
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
    
    // 4. LIGNE DE PLASMA PRINCIPALE (OPTIMISÉE: sans shadow, moins de points)
    ctx.strokeStyle = 'rgba(4, 251, 172, 0.8)';
    ctx.lineWidth = 2;
    
    // Dessiner avec variation selon les impacts (RÉDUIT: 32 au lieu de 64)
    ctx.beginPath();
    for (let i = 0; i <= 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        let radius = shieldSystem.baseRadius;
        
        // Déformation par les impacts (OPTIMISÉ: seulement si impacts actifs)
        if (shieldSystem.impacts.length > 0) {
            shieldSystem.impacts.forEach(impact => {
                const angleDiff = Math.abs(angle - impact.angle);
                const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
                if (normalizedDiff < 0.5) {
                    const influence = (1 - normalizedDiff / 0.5) * impact.intensity;
                    radius += Math.sin(influence * Math.PI) * 10;
                }
            });
        }
        
        // Ajout de l'effet plasma (RÉDUIT: moins d'ondulations)
        radius += Math.sin(angle * 4 + shieldSystem.plasmaFlow) * 1.5;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // 5. PARTICULES ORBITALES AVEC TRAÎNÉES (OPTIMISÉES: gradients simplifiés)
    shieldSystem.orbitalParticles.forEach(particle => {
        const x = centerX + Math.cos(particle.angle) * particle.radius;
        const y = centerY + Math.sin(particle.angle) * particle.radius;
        
        // Traînée (SIMPLIFIÉE: moins de points)
        if (particle.trail.length > 2) {
            ctx.strokeStyle = 'rgba(4, 251, 172, 0.3)';
            ctx.lineWidth = particle.size * 0.5;
            ctx.beginPath();
            // OPTIMISÉ: seulement 1 point sur 2
            for (let i = 0; i < particle.trail.length; i += 2) {
                const point = particle.trail[i];
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
        
        // Particule principale (SIMPLIFIÉ: sans gradient complexe)
        ctx.fillStyle = 'rgba(4, 251, 172, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Centre plus lumineux
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(x, y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 6. EXPLOSIONS D'ÉNERGIE (OPTIMISÉES: traînées et gradients simplifiés)
    shieldSystem.energyBursts.forEach(burst => {
        // Traînée (SIMPLIFIÉE: ligne simple)
        if (burst.trail.length > 1) {
            ctx.strokeStyle = `rgba(${burst.color.r}, ${burst.color.g}, ${burst.color.b}, 0.4)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(burst.trail[0].x, burst.trail[0].y);
            ctx.lineTo(burst.x, burst.y);
            ctx.stroke();
        }
        
        // Particule d'énergie (SIMPLIFIÉ: sans gradient)
        const opacity = burst.life / 50;
        ctx.fillStyle = `rgba(${burst.color.r}, ${burst.color.g}, ${burst.color.b}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Centre plus lumineux
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.size * 0.5, 0, Math.PI * 2);
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
    
    // 8. EFFET DE SURCHARGE (OPTIMISÉ: sans shadow)
    if (shieldSystem.overcharge > 0.1) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${shieldSystem.overcharge * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shieldSystem.baseRadius + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Double cercle pour effet de lueur sans shadow
        ctx.strokeStyle = `rgba(255, 255, 255, ${shieldSystem.overcharge * 0.2})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, shieldSystem.baseRadius + 8, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Fonction pour nettoyer le système de bouclier avancé
function cleanupShieldSystem(player) {
    // Nettoyer tous les éléments du système
    shieldSystem.hexagons = [];
    shieldSystem.particles = [];
    shieldSystem.orbitalParticles = [];
    shieldSystem.impacts = [];
    shieldSystem.ripples = [];
    shieldSystem.energyBursts = [];
    
    // Réinitialiser les états
    shieldSystem.integrity = 100;
    shieldSystem.overcharge = 0;
    shieldSystem.distortion = 0;
    shieldSystem.time = 0;
    shieldSystem.plasmaFlow = 0;
    
    console.log('🛡️ Système de bouclier avancé nettoyé');
}

// Fonction helper pour vérifier si le bouclier est actif
export function isShieldActive() {
    return starship && starship.shield && shieldSystem.integrity > 0;
}

// Fonction pour régénérer le bouclier
export function regenerateShield(amount = 1) {
    shieldSystem.integrity = Math.min(100, shieldSystem.integrity + amount);
}

// Fonction pour désactiver manuellement le bouclier
export function deactivateShield(player = starship) {
    if (player) {
        player.shield = false;
        if (player.shieldTimeout) {
            clearTimeout(player.shieldTimeout);
            player.shieldTimeout = null;
        }
        cleanupShieldSystem(player);
        console.log('🛡️ Bouclier avancé désactivé manuellement');
    }
}

// Fonction d'initialisation du bouclier avancé
export function initializeShield() {
    // S'assurer que le joueur a les propriétés nécessaires
    if (starship) {
        starship.shield = false;
        starship.shieldTimeout = null;
        starship.player = starship.player || 1;
    }
    
    // Initialiser le système de bouclier avancé
    shieldSystem.hexagons = [];
    shieldSystem.particles = [];
    shieldSystem.orbitalParticles = [];
    shieldSystem.impacts = [];
    shieldSystem.ripples = [];
    shieldSystem.energyBursts = [];
    shieldSystem.integrity = 100;
    shieldSystem.overcharge = 0;
    shieldSystem.distortion = 0;
    shieldSystem.time = 0;
    shieldSystem.plasmaFlow = 0;
    
    console.log('🛡️ Module bouclier avancé initialisé');
}
