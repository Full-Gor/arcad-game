// shield2_main.js - Système de bouclier sphérique avec révélation progressive (CODE ORIGINAL)
import { canvas, ctx } from './globals_simple.js';
import { starship } from './player_simple.js';
import { initSphericalGeometry } from './shield2_geometry.js';
import { updateSphericalEffects } from './shield2_effects.js';
import { createSphericalImpactEffect, updateImpactSystem } from './shield2_impacts.js';

// Système de bouclier sphérique avec révélation progressive (CODE ORIGINAL EXACT)
let sphericalShield = {
    // Configuration de la sphère
    radius: 55,
    visibility: 0,  // 0 = invisible, 1 = complètement visible
    targetVisibility: 0,
    
    // Grille géodésique
    gridLines: {
        meridians: [],  // Lignes verticales (longitude)
        parallels: [],  // Lignes horizontales (latitude)
        vertices: [],   // Points d'intersection
        segments: []    // Segments individuels pour animation
    },
    
    // Système de révélation
    revelations: [],  // Zones qui se révèlent lors des impacts
    energyWaves: [],  // Ondes d'énergie qui parcourent la sphère
    pulsePoints: [],  // Points qui pulsent sur la grille
    
    // Effets visuels
    rotation: {
        x: 0,
        y: 0,
        z: 0
    },
    
    // États
    isRevealing: false,
    revealTimer: 0,
    maxRevealTime: 600, // NOUVEAU: 10 secondes à 60fps (10 * 60 = 600 frames)
    
    // Configuration visuelle (TEST MAGENTA)
    colors: {
        grid: { r: 255, g: 0, b: 255 },      // Magenta pour la grille
        energy: { r: 255, g: 100, b: 255 },   // Magenta électrique
        impact: { r: 255, g: 150, b: 0 }      // Orange pour impacts
    }
};

// Initialisation de la structure sphérique (CODE ORIGINAL EXACT)
export function initSphericalShield(player = starship) {
    console.log('🛡️ Initialisation du bouclier sphérique v2 (code original)...');
    
    // Déléguer l'initialisation géométrique
    initSphericalGeometry(sphericalShield);
    
    console.log('✅ Bouclier sphérique v2 initialisé avec succès');
}

// Créer un impact qui révèle la structure (CODE ORIGINAL EXACT)
export function createSphericalImpact(impactX, impactY, player = starship, damage = 10) {
    // Déléguer à la gestion des impacts
    createSphericalImpactEffect(impactX, impactY, player, damage, sphericalShield);
}

// Mise à jour du système (CODE ORIGINAL EXACT)
export function updateSphericalShield() {
    // NOUVEAU: Rotation plus rapide de la sphère
    sphericalShield.rotation.y += 0.016; // 4x plus rapide
    sphericalShield.rotation.z += 0.012; // 4x plus rapide
    
    // Gestion de la visibilité globale (RALENTI)
    if (sphericalShield.isRevealing) {
        sphericalShield.visibility += (sphericalShield.targetVisibility - sphericalShield.visibility) * 0.05; // 2x plus lent
        sphericalShield.revealTimer--;
        
        if (sphericalShield.revealTimer <= 0) {
            sphericalShield.isRevealing = false;
            sphericalShield.targetVisibility = 0;
        }
    } else {
        sphericalShield.visibility *= 0.98; // Plus lent aussi
        if (sphericalShield.visibility < 0.01) {
            sphericalShield.visibility = 0;
        }
    }
    
    // Déléguer les mises à jour spécialisées
    updateSphericalEffects(sphericalShield);
    updateImpactSystem(sphericalShield);
}

// Fonction de rendu (CODE ORIGINAL EXACT)
export function drawSphericalShield(ctx) {
    if (!starship) return;
    
    const centerX = starship.x + starship.width / 2;
    const centerY = starship.y + starship.height / 2;
    
    ctx.save();
    
    // 1. AURA DE BASE (très subtile quand inactif)
    if (sphericalShield.visibility > 0) {
        const auraGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, sphericalShield.radius + 10
        );
        auraGradient.addColorStop(0, `rgba(255, 0, 255, ${sphericalShield.visibility * 0.05})`);
        auraGradient.addColorStop(0.7, `rgba(255, 0, 255, ${sphericalShield.visibility * 0.02})`);
        auraGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sphericalShield.radius + 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 2. GRILLE GÉODÉSIQUE - MÉRIDIENS (lignes verticales)
    sphericalShield.gridLines.meridians.forEach((meridian, mIndex) => {
        ctx.beginPath();
        let firstPoint = true;
        
        meridian.segments.forEach((segment, sIndex) => {
            if (!segment.visible) return;
            
            // Projection 3D -> 2D avec rotation
            const x3d = sphericalShield.radius * Math.sin(segment.theta) * Math.cos(meridian.angle);
            const y3d = sphericalShield.radius * Math.cos(segment.theta);
            const z3d = sphericalShield.radius * Math.sin(segment.theta) * Math.sin(meridian.angle);
            
            // Appliquer la rotation
            const rotatedX = x3d * Math.cos(sphericalShield.rotation.y) - z3d * Math.sin(sphericalShield.rotation.y);
            const rotatedZ = x3d * Math.sin(sphericalShield.rotation.y) + z3d * Math.cos(sphericalShield.rotation.y);
            
            // Projection perspective
            const perspective = 1 + rotatedZ / 200;
            const projX = centerX + rotatedX * perspective;
            const projY = centerY + y3d * perspective;
            
            if (firstPoint) {
                ctx.moveTo(projX, projY);
                firstPoint = false;
            } else {
                ctx.lineTo(projX, projY);
            }
        });
        
        // Appliquer le style pour toute la ligne
        const avgOpacity = meridian.segments.reduce((sum, s) => sum + s.opacity, 0) / meridian.segments.length;
        const avgGlow = meridian.segments.reduce((sum, s) => sum + s.glowIntensity, 0) / meridian.segments.length;
        
        if (avgGlow > 0.1) {
            // NOUVEAU: Lignes d'impact beaucoup plus visibles
            ctx.strokeStyle = `rgba(255, 150, 0, ${Math.min(1, avgOpacity * sphericalShield.visibility * 1.5)})`; // Plus opaque
            ctx.lineWidth = 2.5 + avgGlow * 1.5; // Plus épaisse
            ctx.shadowBlur = 15 * avgGlow; // Plus de lueur
            ctx.shadowColor = 'rgba(255, 150, 0, 1.0)'; // Lueur plus intense
        } else {
            ctx.strokeStyle = `rgba(255, 0, 255, ${avgOpacity * sphericalShield.visibility})`;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(255, 0, 255, 0.5)';
        }
        
        ctx.stroke();
    });
    
    // 3. GRILLE GÉODÉSIQUE - PARALLÈLES (lignes horizontales)
    sphericalShield.gridLines.parallels.forEach(parallel => {
        ctx.beginPath();
        let firstPoint = true;
        
        parallel.segments.forEach(segment => {
            if (!segment.visible) return;
            
            // Projection 3D -> 2D
            const x3d = sphericalShield.radius * Math.sin(parallel.theta) * Math.cos(segment.phi);
            const y3d = sphericalShield.radius * Math.cos(parallel.theta);
            const z3d = sphericalShield.radius * Math.sin(parallel.theta) * Math.sin(segment.phi);
            
            // Rotation
            const rotatedX = x3d * Math.cos(sphericalShield.rotation.y) - z3d * Math.sin(sphericalShield.rotation.y);
            const rotatedZ = x3d * Math.sin(sphericalShield.rotation.y) + z3d * Math.cos(sphericalShield.rotation.y);
            
            // Projection
            const perspective = 1 + rotatedZ / 200;
            const projX = centerX + rotatedX * perspective;
            const projY = centerY + y3d * perspective;
            
            if (firstPoint) {
                ctx.moveTo(projX, projY);
                firstPoint = false;
            } else {
                ctx.lineTo(projX, projY);
            }
        });
        
        const avgOpacity = parallel.segments.reduce((sum, s) => sum + s.opacity, 0) / parallel.segments.length;
        const avgGlow = parallel.segments.reduce((sum, s) => sum + s.glowIntensity, 0) / parallel.segments.length;
        
        if (avgGlow > 0.1) {
            // NOUVEAU: Lignes d'impact beaucoup plus visibles (parallèles)
            ctx.strokeStyle = `rgba(255, 150, 0, ${Math.min(1, avgOpacity * sphericalShield.visibility * 1.5)})`; // Plus opaque
            ctx.lineWidth = 2.5 + avgGlow * 1.5; // Plus épaisse
            ctx.shadowBlur = 15 * avgGlow; // Plus de lueur
            ctx.shadowColor = 'rgba(255, 150, 0, 1.0)'; // Lueur plus intense
        } else {
            ctx.strokeStyle = `rgba(255, 0, 255, ${avgOpacity * sphericalShield.visibility})`;
            ctx.lineWidth = 1;
        }
        
        ctx.stroke();
    });
    
    // 4. VERTICES ACTIFS (intersections qui pulsent)
    sphericalShield.gridLines.vertices.forEach(vertex => {
        if (!vertex.active || vertex.pulse < 0.1) return;
        
        const x3d = sphericalShield.radius * Math.sin(vertex.theta) * Math.cos(vertex.angle);
        const y3d = sphericalShield.radius * Math.cos(vertex.theta);
        const z3d = sphericalShield.radius * Math.sin(vertex.theta) * Math.sin(vertex.angle);
        
        const rotatedX = x3d * Math.cos(sphericalShield.rotation.y) - z3d * Math.sin(sphericalShield.rotation.y);
        const rotatedZ = x3d * Math.sin(sphericalShield.rotation.y) + z3d * Math.cos(sphericalShield.rotation.y);
        
        const perspective = 1 + rotatedZ / 200;
        const projX = centerX + rotatedX * perspective;
        const projY = centerY + y3d * perspective;
        
        const pulseGradient = ctx.createRadialGradient(projX, projY, 0, projX, projY, 5 * vertex.pulse);
        pulseGradient.addColorStop(0, `rgba(255, 255, 255, ${vertex.pulse})`);
        pulseGradient.addColorStop(0.5, `rgba(255, 150, 0, ${vertex.pulse * 0.7})`);
        pulseGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
        
        ctx.fillStyle = pulseGradient;
        ctx.beginPath();
        ctx.arc(projX, projY, 5 * vertex.pulse, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 5. ONDES D'ÉNERGIE
    sphericalShield.energyWaves.forEach(wave => {
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
            
            const x3d = sphericalShield.radius * Math.sin(waveTheta) * Math.cos(wavePhi);
            const y3d = sphericalShield.radius * Math.cos(waveTheta);
            const z3d = sphericalShield.radius * Math.sin(waveTheta) * Math.sin(wavePhi);
            
            const rotatedX = x3d * Math.cos(sphericalShield.rotation.y) - z3d * Math.sin(sphericalShield.rotation.y);
            const rotatedZ = x3d * Math.sin(sphericalShield.rotation.y) + z3d * Math.cos(sphericalShield.rotation.y);
            
            const perspective = 1 + rotatedZ / 200;
            const projX = centerX + rotatedX * perspective;
            const projY = centerY + y3d * perspective;
            
            if (i === 0) ctx.moveTo(projX, projY);
            else ctx.lineTo(projX, projY);
        }
        ctx.stroke();
    });
    
    // 6. PARTICULES D'IMPACT (ADAPTÉ DU PREMIER BOUCLIER)
    sphericalShield.pulsePoints.forEach(point => {
        const alpha = point.life / point.maxLife;
        ctx.fillStyle = `rgba(255, 150, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.restore();
}

// Fonction de vérification (CODE ORIGINAL EXACT)
export function isSphericalShieldActive() {
    console.log('🔍 DEBUG: isSphericalShieldActive - starship:', !!starship, 'shield:', starship?.shield, 'visibility:', sphericalShield.visibility, 'isRevealing:', sphericalShield.isRevealing);
    return starship && starship.shield && (sphericalShield.visibility > 0 || sphericalShield.isRevealing);
}

// Fonction pour forcer la révélation complète (NOUVEAU: 10 secondes par défaut)
export function revealFullShield(duration = 600) { // NOUVEAU: 10 secondes à 60fps
    sphericalShield.isRevealing = true;
    sphericalShield.targetVisibility = 1;
    sphericalShield.revealTimer = duration;
    
    // Révéler toute la grille progressivement (RALENTI)
    sphericalShield.gridLines.meridians.forEach(meridian => {
        meridian.segments.forEach((segment, i) => {
            setTimeout(() => {
                segment.visible = true;
                segment.opacity = 1;
            }, i * 50); // 5x plus lent (50ms au lieu de 10ms)
        });
    });
    
    sphericalShield.gridLines.parallels.forEach(parallel => {
        parallel.segments.forEach((segment, i) => {
            setTimeout(() => {
                segment.visible = true;
                segment.opacity = 1;
            }, i * 50); // 5x plus lent (50ms au lieu de 10ms)
        });
    });
}

// Activation du bouclier
export function activateSphericalShield() {
    if (!starship) return;
    
    console.log('🛡️ Activation du bouclier sphérique v2 (code original) !');
    sphericalShield.active = true;
    sphericalShield.isRevealing = true;
    sphericalShield.visibility = 0;
    starship.shield = true; // NOUVEAU: Activer le flag shield du starship
    console.log('🛡️ starship.shield défini à true');
    revealFullShield();
}

// Export de la variable principale pour les autres modules
export { sphericalShield };
