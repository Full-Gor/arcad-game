// shield_impacts.js - Gestion des impacts sur le bouclier sphérique
import { canvas, ctx } from './globals_simple.js';
import { calculateSphericalDistance, revealGridSegments, activateNearbyVertices } from './shield_geometry.js';
import { createEnergyWave, createImpactParticles, createEnergyPulse } from './shield_effects.js';

// Créer un impact sphérique complet
export function createSphericalImpactEffect(impactX, impactY, centerX, centerY, sphericalShield, shieldCollections, damage = 10) {
    // Calculer l'angle d'impact sur la sphère
    const dx = impactX - centerX;
    const dy = impactY - centerY;
    const impactAngle = Math.atan2(dy, dx);
    const impactDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Convertir en coordonnées sphériques
    const phi = impactAngle;
    const theta = Math.acos(Math.min(1, impactDistance / sphericalShield.radius));
    
    // Déclencher la révélation
    sphericalShield.isRevealing = true;
    sphericalShield.revealTimer = sphericalShield.maxRevealTime;
    sphericalShield.targetVisibility = 1;
    
    // Créer une zone de révélation qui s'étend
    const revelation = {
        phi: phi,
        theta: theta,
        radius: 0,
        maxRadius: Math.PI * 0.8,  // Couvre une large zone
        intensity: 1.0,
        life: 60,
        maxLife: 60,
        expansionSpeed: 0.08,
        color: { ...sphericalShield.colors.impact }
    };
    
    shieldCollections.revelations.push(revelation);
    
    // Créer des ondes d'énergie multiples
    for (let i = 0; i < 3; i++) {
        createEnergyWave(
            shieldCollections,
            phi, theta,
            i === 0 ? sphericalShield.colors.impact : sphericalShield.colors.energy,
            i * 100
        );
    }
    
    // Activer les vertices proches
    activateNearbyVertices(shieldCollections, phi, theta, 0.5);
    
    // Créer des particules d'impact
    createImpactParticles(shieldCollections, impactX, impactY, 15);
    
    // Effet de pulse énergétique
    createEnergyPulse(shieldCollections, centerX, centerY, sphericalShield.radius, damage / 10);
    
    console.log(`💥 Impact sphérique créé à φ=${phi.toFixed(2)}, θ=${theta.toFixed(2)}`);
}

// Mise à jour des effets d'impact
export function updateImpactEffects(sphericalShield, shieldCollections) {
    // Mise à jour des zones de révélation
    shieldCollections.revelations = shieldCollections.revelations.filter(revelation => {
        revelation.radius += revelation.expansionSpeed;
        revelation.life--;
        revelation.intensity = (revelation.life / revelation.maxLife);
        
        // Révéler les segments de grille dans le rayon
        revealGridSegments(
            sphericalShield, 
            shieldCollections,
            revelation.phi, 
            revelation.theta, 
            revelation.radius, 
            revelation.intensity
        );
        
        return revelation.life > 0;
    });
}

// Rendu des effets d'impact
export function drawImpactEffects(ctx, centerX, centerY, sphericalShield, shieldCollections) {
    ctx.save();
    
    // Dessiner les zones de révélation
    drawRevelationZones(ctx, centerX, centerY, sphericalShield, shieldCollections);
    
    // Dessiner les effets de distorsion
    drawDistortionEffects(ctx, centerX, centerY, sphericalShield, shieldCollections);
    
    ctx.restore();
}

// Dessiner les zones de révélation
function drawRevelationZones(ctx, centerX, centerY, sphericalShield, shieldCollections) {
    shieldCollections.revelations.forEach(revelation => {
        if (revelation.intensity < 0.1) return;
        
        // Créer un gradient radial pour la zone d'impact
        const gradient = ctx.createRadialGradient(
            centerX, centerY, revelation.radius * 10,
            centerX, centerY, revelation.radius * 20
        );
        
        gradient.addColorStop(0, `rgba(${revelation.color.r}, ${revelation.color.g}, ${revelation.color.b}, ${revelation.intensity * 0.3})`);
        gradient.addColorStop(0.5, `rgba(${revelation.color.r}, ${revelation.color.g}, ${revelation.color.b}, ${revelation.intensity * 0.1})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, revelation.radius * 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Dessiner un anneau d'impact
        ctx.strokeStyle = `rgba(${revelation.color.r}, ${revelation.color.g}, ${revelation.color.b}, ${revelation.intensity})`;
        ctx.lineWidth = 2 + revelation.intensity * 2;
        ctx.shadowBlur = 15 * revelation.intensity;
        ctx.shadowColor = `rgba(${revelation.color.r}, ${revelation.color.g}, ${revelation.color.b}, 0.8)`;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, revelation.radius * 15, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Dessiner les effets de distorsion
function drawDistortionEffects(ctx, centerX, centerY, sphericalShield, shieldCollections) {
    // Effet de distorsion pour les impacts récents
    shieldCollections.revelations.forEach(revelation => {
        if (revelation.life < revelation.maxLife * 0.8) return; // Seulement les impacts récents
        
        const distortionRadius = revelation.radius * 12;
        const distortionIntensity = revelation.intensity;
        
        // Créer des ondulations de distorsion
        for (let i = 0; i < 3; i++) {
            const waveRadius = distortionRadius + i * 5;
            const waveIntensity = distortionIntensity * (1 - i * 0.3);
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${waveIntensity * 0.2})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.setLineDash([]); // Reset dash
        }
    });
}

// Créer un impact de surcharge
export function createOverchargeImpact(centerX, centerY, sphericalShield, shieldCollections, intensity = 2.0) {
    // Impact multiple aléatoire pour simuler une surcharge
    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * sphericalShield.radius * 0.8;
        
        const impactX = centerX + Math.cos(angle) * distance;
        const impactY = centerY + Math.sin(angle) * distance;
        
        setTimeout(() => {
            createSphericalImpactEffect(
                impactX, impactY, 
                centerX, centerY, 
                sphericalShield, 
                shieldCollections, 
                intensity * 5
            );
        }, i * 100);
    }
    
    console.log('⚡ Impact de surcharge créé');
}

// Créer un impact directionnel
export function createDirectionalImpact(impactX, impactY, centerX, centerY, direction, sphericalShield, shieldCollections) {
    // Impact principal
    createSphericalImpactEffect(impactX, impactY, centerX, centerY, sphericalShield, shieldCollections, 15);
    
    // Impacts secondaires dans la direction
    for (let i = 1; i <= 3; i++) {
        const secondaryX = impactX + Math.cos(direction) * i * 10;
        const secondaryY = impactY + Math.sin(direction) * i * 10;
        
        setTimeout(() => {
            createSphericalImpactEffect(
                secondaryX, secondaryY, 
                centerX, centerY, 
                sphericalShield, 
                shieldCollections, 
                10 - i * 2
            );
        }, i * 150);
    }
    
    console.log(`🎯 Impact directionnel créé (angle: ${direction.toFixed(2)})`);
}

// Créer un effet de résonance
export function createResonanceEffect(centerX, centerY, sphericalShield, shieldCollections) {
    // Créer des impacts en forme de croix
    const directions = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
    const distance = sphericalShield.radius * 0.7;
    
    directions.forEach((direction, index) => {
        const impactX = centerX + Math.cos(direction) * distance;
        const impactY = centerY + Math.sin(direction) * distance;
        
        setTimeout(() => {
            createSphericalImpactEffect(
                impactX, impactY, 
                centerX, centerY, 
                sphericalShield, 
                shieldCollections, 
                8
            );
        }, index * 200);
    });
    
    console.log('🔊 Effet de résonance créé');
}

// Créer un effet de cascade d'impacts
export function createCascadeImpact(startX, startY, centerX, centerY, sphericalShield, shieldCollections, count = 8) {
    const angleStep = (Math.PI * 2) / count;
    const baseRadius = 20;
    
    for (let i = 0; i < count; i++) {
        const angle = i * angleStep;
        const radius = baseRadius + i * 5;
        const impactX = startX + Math.cos(angle) * radius;
        const impactY = startY + Math.sin(angle) * radius;
        
        setTimeout(() => {
            createSphericalImpactEffect(
                impactX, impactY, 
                centerX, centerY, 
                sphericalShield, 
                shieldCollections, 
                12 - i
            );
        }, i * 100);
    }
    
    console.log(`🌊 Cascade d'impacts créée (${count} impacts)`);
}

// Fonction pour tester les impacts
export function testImpactPattern(centerX, centerY, sphericalShield, shieldCollections, pattern = 'circle') {
    switch (pattern) {
        case 'circle':
            // Impacts en cercle
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const distance = sphericalShield.radius * 0.8;
                const impactX = centerX + Math.cos(angle) * distance;
                const impactY = centerY + Math.sin(angle) * distance;
                
                setTimeout(() => {
                    createSphericalImpactEffect(impactX, impactY, centerX, centerY, sphericalShield, shieldCollections, 10);
                }, i * 200);
            }
            break;
            
        case 'spiral':
            // Impacts en spirale
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 4; // 2 tours
                const distance = (i / 12) * sphericalShield.radius;
                const impactX = centerX + Math.cos(angle) * distance;
                const impactY = centerY + Math.sin(angle) * distance;
                
                setTimeout(() => {
                    createSphericalImpactEffect(impactX, impactY, centerX, centerY, sphericalShield, shieldCollections, 8);
                }, i * 150);
            }
            break;
            
        case 'random':
            // Impacts aléatoires
            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * sphericalShield.radius;
                const impactX = centerX + Math.cos(angle) * distance;
                const impactY = centerY + Math.sin(angle) * distance;
                
                setTimeout(() => {
                    createSphericalImpactEffect(impactX, impactY, centerX, centerY, sphericalShield, shieldCollections, Math.random() * 15);
                }, Math.random() * 2000);
            }
            break;
    }
    
    console.log(`🎨 Test d'impact pattern: ${pattern}`);
}
