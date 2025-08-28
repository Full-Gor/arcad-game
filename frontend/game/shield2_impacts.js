// shield2_impacts.js - Gestion des impacts sur le bouclier sphérique (CODE ORIGINAL)
import { revealGridSegments, activateNearbyVertices } from './shield2_geometry.js';
import { createEnergyWave, createImpactParticles } from './shield2_effects.js';

// Créer un impact qui révèle la structure (CODE ORIGINAL EXACT)
export function createSphericalImpactEffect(impactX, impactY, player, damage, sphericalShield) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
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
    sphericalShield.revelations.push({
        phi: phi,
        theta: theta,
        radius: 0,
        maxRadius: Math.PI * 0.8,  // Couvre une large zone
        intensity: 1.0,
        life: 60,
        maxLife: 60,
        expansionSpeed: 0.08,
        color: { ...sphericalShield.colors.impact }
    });
    
    // Créer une onde d'énergie qui parcourt la sphère (CODE ORIGINAL EXACT)
    for (let i = 0; i < 3; i++) {
        const speed = 0.05 - i * 0.01;
        const opacity = 1.0 - i * 0.2;
        const color = i === 0 ? sphericalShield.colors.impact : sphericalShield.colors.energy;
        
        createEnergyWave(sphericalShield, phi, theta, color, speed, i * 100);
    }
    
    // Activer les vertices proches
    activateNearbyVertices(sphericalShield, phi, theta);
    
    // Créer les particules d'impact
    createImpactParticles(sphericalShield, impactX, impactY);
    
    console.log(`💥 Impact sphérique v2 créé à φ=${phi.toFixed(2)}, θ=${theta.toFixed(2)}`);
}

// Mise à jour du système d'impacts (CODE ORIGINAL EXACT)
export function updateImpactSystem(sphericalShield) {
    // Mise à jour des zones de révélation
    sphericalShield.revelations = sphericalShield.revelations.filter(revelation => {
        revelation.radius += revelation.expansionSpeed;
        revelation.life--;
        revelation.intensity = (revelation.life / revelation.maxLife);
        
        // Révéler les segments de grille dans le rayon (CODE ORIGINAL EXACT)
        revealGridSegments(
            sphericalShield,
            revelation.phi,
            revelation.theta,
            revelation.radius,
            revelation.intensity
        );
        
        return revelation.life > 0;
    });
}
