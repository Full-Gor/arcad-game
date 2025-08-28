// shield_advanced.js - Système de bouclier sphérique avancé (principal)
import { canvas, ctx } from './globals_simple.js';
import { starship } from './player_simple.js';
import { initSphericalGeometry, updateSphericalGeometry } from './shield_geometry.js';
import { initShieldEffects, updateShieldEffects, drawShieldEffects } from './shield_effects.js';
import { createSphericalImpactEffect, updateImpactEffects, drawImpactEffects } from './shield_impacts.js';

// Système de bouclier sphérique principal
let sphericalShield = {
    // Configuration de la sphère
    radius: 55,
    visibility: 0,  // 0 = invisible, 1 = complètement visible
    targetVisibility: 0,
    
    // États
    isActive: false,
    isRevealing: false,
    revealTimer: 0,
    maxRevealTime: 120,
    
    // Rotation de la sphère
    rotation: {
        x: 0,
        y: 0,
        z: 0
    },
    
    // Configuration visuelle
    colors: {
        grid: { r: 0, g: 255, b: 200 },      // Cyan pour la grille de base
        energy: { r: 100, g: 200, b: 255 },   // Bleu électrique pour les ondes
        impact: { r: 255, g: 150, b: 0 }      // Orange pour les impacts
    }
};

// Variables pour les collections d'effets
let shieldCollections = {
    revelations: [],     // Zones qui se révèlent lors des impacts
    energyWaves: [],     // Ondes d'énergie qui parcourent la sphère
    pulsePoints: [],     // Points qui pulsent sur la grille
    gridLines: {
        meridians: [],   // Lignes verticales (longitude)
        parallels: [],   // Lignes horizontales (latitude)
        vertices: [],    // Points d'intersection
        segments: []     // Segments individuels pour animation
    }
};

// Initialisation du système complet
export function initAdvancedShield() {
    console.log('🛡️ Initialisation du bouclier sphérique avancé...');
    
    // Initialiser la géométrie sphérique
    initSphericalGeometry(sphericalShield, shieldCollections);
    
    // Initialiser les systèmes d'effets
    initShieldEffects(sphericalShield, shieldCollections);
    
    console.log('✅ Bouclier sphérique avancé initialisé');
}

// Activation du bouclier
export function activateAdvancedShield() {
    if (!starship) return;
    
    sphericalShield.isActive = true;
    starship.shield = true;
    
    console.log('🛡️ Bouclier sphérique activé');
}

// Désactivation du bouclier
export function deactivateAdvancedShield() {
    if (!starship) return;
    
    sphericalShield.isActive = false;
    sphericalShield.isRevealing = false;
    sphericalShield.targetVisibility = 0;
    starship.shield = false;
    
    console.log('🛡️ Bouclier sphérique désactivé');
}

// Créer un impact sur le bouclier
export function createAdvancedShieldImpact(impactX, impactY, damage = 10) {
    if (!isAdvancedShieldActive()) return;
    
    const centerX = starship.x + starship.width / 2;
    const centerY = starship.y + starship.height / 2;
    
    // Déclencher l'effet d'impact
    createSphericalImpactEffect(
        impactX, impactY, 
        centerX, centerY, 
        sphericalShield, 
        shieldCollections,
        damage
    );
    
    console.log(`🛡️ Impact sur bouclier sphérique à (${impactX}, ${impactY})`);
}

// Mise à jour du système complet
export function updateAdvancedShield() {
    if (!starship) return;
    
    // Rotation subtile de la sphère
    sphericalShield.rotation.y += 0.002;
    sphericalShield.rotation.z += 0.001;
    
    // Gestion de la visibilité globale
    if (sphericalShield.isRevealing) {
        sphericalShield.visibility += (sphericalShield.targetVisibility - sphericalShield.visibility) * 0.1;
        sphericalShield.revealTimer--;
        
        if (sphericalShield.revealTimer <= 0) {
            sphericalShield.isRevealing = false;
            sphericalShield.targetVisibility = 0;
        }
    } else {
        sphericalShield.visibility *= 0.95;
        if (sphericalShield.visibility < 0.01) {
            sphericalShield.visibility = 0;
        }
    }
    
    // Mise à jour de la géométrie
    updateSphericalGeometry(sphericalShield, shieldCollections);
    
    // Mise à jour des effets
    updateShieldEffects(sphericalShield, shieldCollections);
    
    // Mise à jour des impacts
    updateImpactEffects(sphericalShield, shieldCollections);
}

// Rendu du système complet
export function drawAdvancedShield() {
    if (!ctx || !starship || !isAdvancedShieldActive()) return;
    
    const centerX = starship.x + starship.width / 2;
    const centerY = starship.y + starship.height / 2;
    
    ctx.save();
    
    // 1. Dessiner l'aura de base
    drawBaseAura(ctx, centerX, centerY);
    
    // 2. Dessiner les effets visuels
    drawShieldEffects(ctx, centerX, centerY, sphericalShield, shieldCollections);
    
    // 3. Dessiner les effets d'impact
    drawImpactEffects(ctx, centerX, centerY, sphericalShield, shieldCollections);
    
    ctx.restore();
}

// Fonction pour dessiner l'aura de base (orange comme dans le code original)
function drawBaseAura(ctx, centerX, centerY) {
    if (sphericalShield.visibility <= 0) return;
    
    const auraGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, sphericalShield.radius + 10
    );
    // Utiliser les couleurs orange du code original
    auraGradient.addColorStop(0, `rgba(255, 150, 0, ${sphericalShield.visibility * 0.05})`);
    auraGradient.addColorStop(0.7, `rgba(255, 100, 0, ${sphericalShield.visibility * 0.02})`);
    auraGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
    
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sphericalShield.radius + 10, 0, Math.PI * 2);
    ctx.fill();
}

// Fonction pour forcer la révélation complète
export function revealFullAdvancedShield(duration = 180) {
    sphericalShield.isRevealing = true;
    sphericalShield.targetVisibility = 1;
    sphericalShield.revealTimer = duration;
    
    // Révéler toute la grille progressivement
    shieldCollections.gridLines.meridians.forEach(meridian => {
        meridian.segments.forEach((segment, i) => {
            setTimeout(() => {
                segment.visible = true;
                segment.opacity = 1;
            }, i * 10);
        });
    });
    
    shieldCollections.gridLines.parallels.forEach(parallel => {
        parallel.segments.forEach((segment, i) => {
            setTimeout(() => {
                segment.visible = true;
                segment.opacity = 1;
            }, i * 10);
        });
    });
    
    console.log('🛡️ Révélation complète du bouclier sphérique');
}

// Fonction de vérification de l'état
export function isAdvancedShieldActive() {
    return starship && starship.shield && sphericalShield.isActive && sphericalShield.visibility > 0;
}

// Fonction pour obtenir les informations du bouclier
export function getAdvancedShieldInfo() {
    return {
        isActive: sphericalShield.isActive,
        visibility: sphericalShield.visibility,
        isRevealing: sphericalShield.isRevealing,
        radius: sphericalShield.radius
    };
}

// Export des données principales pour les autres modules
export { sphericalShield, shieldCollections };
