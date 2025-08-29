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
    maxRevealTime: 300, // RÉTABLI: ~5s à 60fps
    
    // Configuration visuelle RÉTABLIE (cyan + rouge néon pour les impacts)
    colors: {
        grid: { r: 0, g: 255, b: 255 },       // Cyan pour la grille/aura
        energy: { r: 0, g: 200, b: 255 },     // Cyan électrique pour ondes
        impact: { r: 255, g: 0, b: 80 }       // Rouge néon pour impacts
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
    // RÉTABLI: vitesses de rotation plus douces
    sphericalShield.rotation.y += 0.004;
    sphericalShield.rotation.z += 0.003;
    
    // RÉTABLI: révélation/fondu plus nerveux
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
        auraGradient.addColorStop(0, `rgba(${sphericalShield.colors.grid.r}, ${sphericalShield.colors.grid.g}, ${sphericalShield.colors.grid.b}, ${sphericalShield.visibility * 0.05})`);
        auraGradient.addColorStop(0.7, `rgba(${sphericalShield.colors.grid.r}, ${sphericalShield.colors.grid.g}, ${sphericalShield.colors.grid.b}, ${sphericalShield.visibility * 0.02})`);
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
            // Affinage du rouge néon (plus mince)
            ctx.strokeStyle = `rgba(${sphericalShield.colors.impact.r}, ${sphericalShield.colors.impact.g}, ${sphericalShield.colors.impact.b}, ${Math.min(0.9, avgOpacity * sphericalShield.visibility * 1.2)})`;
            ctx.lineWidth = 1.6 + avgGlow * 1.1; // plus mince
            ctx.shadowBlur = 10 * avgGlow; // lueur un peu réduite
            ctx.shadowColor = `rgba(${sphericalShield.colors.impact.r}, ${sphericalShield.colors.impact.g}, ${sphericalShield.colors.impact.b}, 0.9)`;
        } else {
            ctx.strokeStyle = `rgba(${sphericalShield.colors.grid.r}, ${sphericalShield.colors.grid.g}, ${sphericalShield.colors.grid.b}, ${avgOpacity * sphericalShield.visibility})`;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 5;
            ctx.shadowColor = `rgba(${sphericalShield.colors.grid.r}, ${sphericalShield.colors.grid.g}, ${sphericalShield.colors.grid.b}, 0.5)`;
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
            // Affinage du rouge néon (plus mince)
            ctx.strokeStyle = `rgba(${sphericalShield.colors.impact.r}, ${sphericalShield.colors.impact.g}, ${sphericalShield.colors.impact.b}, ${Math.min(0.9, avgOpacity * sphericalShield.visibility * 1.2)})`;
            ctx.lineWidth = 1.6 + avgGlow * 1.1;
            ctx.shadowBlur = 10 * avgGlow;
            ctx.shadowColor = `rgba(${sphericalShield.colors.impact.r}, ${sphericalShield.colors.impact.g}, ${sphericalShield.colors.impact.b}, 0.9)`;
        } else {
            ctx.strokeStyle = `rgba(${sphericalShield.colors.grid.r}, ${sphericalShield.colors.grid.g}, ${sphericalShield.colors.grid.b}, ${avgOpacity * sphericalShield.visibility})`;
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
        pulseGradient.addColorStop(0.5, `rgba(${sphericalShield.colors.impact.r}, ${sphericalShield.colors.impact.g}, ${sphericalShield.colors.impact.b}, ${vertex.pulse * 0.7})`);
        pulseGradient.addColorStop(1, `rgba(${sphericalShield.colors.impact.r}, ${sphericalShield.colors.impact.g}, ${sphericalShield.colors.impact.b}, 0)`);
        
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
        // IMPACT EN MAGENTA
        ctx.fillStyle = `rgba(255, 0, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.restore();
}

// Fonction de vérification (CODE ORIGINAL EXACT)
export function isSphericalShieldActive() {
    console.log('🔍 DEBUG: isSphericalShieldActive - starship:', !!starship, 'shield:', starship?.shield, 'visibility:', sphericalShield.visibility, 'isRevealing:', sphericalShield.isRevealing);
    // NOUVEAU: Vérifier que c'est BIEN le bouclier sphérique qui est actif, pas le simple
    return starship && sphericalShield.active && (sphericalShield.visibility > 0 || sphericalShield.isRevealing);
}

// Désactiver le bouclier sphérique
export function deactivateSphericalShield() {
    sphericalShield.active = false;
    sphericalShield.isRevealing = false;
    sphericalShield.targetVisibility = 0;
    sphericalShield.visibility = 0;
}

// Fonction pour forcer la révélation complète (NOUVEAU: 10 secondes par défaut)
export function revealFullShield(duration = 600) { // NOUVEAU: 10 secondes à 60fps
    // Activer explicitement le système lors d'une révélation initiée
    sphericalShield.active = true;
    sphericalShield.isRevealing = true;
    sphericalShield.targetVisibility = 1;
    sphericalShield.revealTimer = duration;
    
    // Révéler toute la grille progressivement (RALENTI)
    sphericalShield.gridLines.meridians.forEach(meridian => {
        meridian.segments.forEach((segment, i) => {
            setTimeout(() => {
                segment.visible = true;
                segment.opacity = 1;
            }, i * 10); // RÉTABLI: timing plus rapide
        });
    });
    
    sphericalShield.gridLines.parallels.forEach(parallel => {
        parallel.segments.forEach((segment, i) => {
            setTimeout(() => {
                segment.visible = true;
                segment.opacity = 1;
            }, i * 10); // RÉTABLI: timing plus rapide
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
    // NOUVEAU: Ne plus modifier starship.shield pour éviter le conflit avec le bouclier simple
    console.log('🛡️ Bouclier sphérique activé (sans modifier starship.shield)');
    revealFullShield();
}

// Export de la variable principale pour les autres modules
export { sphericalShield };
