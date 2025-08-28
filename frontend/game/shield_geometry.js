// shield_geometry.js - Gestion de la géométrie sphérique du bouclier
import { canvas, ctx } from './globals_simple.js';

// Initialisation de la structure géodésique sphérique
export function initSphericalGeometry(sphericalShield, shieldCollections) {
    console.log('🔧 Initialisation de la géométrie sphérique...');
    
    // Réinitialiser les collections
    shieldCollections.gridLines.meridians = [];
    shieldCollections.gridLines.parallels = [];
    shieldCollections.gridLines.vertices = [];
    
    // Créer les méridiens (longitude - lignes verticales)
    const meridianCount = 16;
    for (let i = 0; i < meridianCount; i++) {
        const angle = (i / meridianCount) * Math.PI * 2;
        const meridian = {
            angle: angle,
            opacity: 0,
            segments: []
        };
        
        // Créer les segments pour chaque méridien
        for (let j = 0; j <= 32; j++) {
            const theta = (j / 32) * Math.PI;
            meridian.segments.push({
                theta: theta,
                visible: false,
                opacity: 0,
                glowIntensity: 0
            });
        }
        
        shieldCollections.gridLines.meridians.push(meridian);
    }
    
    // Créer les parallèles (latitude - lignes horizontales)
    const parallelCount = 12;
    for (let i = 0; i < parallelCount; i++) {
        const theta = ((i + 1) / (parallelCount + 1)) * Math.PI;
        const parallel = {
            theta: theta,
            opacity: 0,
            segments: []
        };
        
        // Créer les segments pour chaque parallèle
        for (let j = 0; j <= 32; j++) {
            const phi = (j / 32) * Math.PI * 2;
            parallel.segments.push({
                phi: phi,
                visible: false,
                opacity: 0,
                glowIntensity: 0
            });
        }
        
        shieldCollections.gridLines.parallels.push(parallel);
    }
    
    // Créer les vertices (intersections)
    for (let i = 0; i < meridianCount; i++) {
        for (let j = 0; j < parallelCount; j++) {
            const meridian = shieldCollections.gridLines.meridians[i];
            const parallel = shieldCollections.gridLines.parallels[j];
            
            shieldCollections.gridLines.vertices.push({
                meridianIndex: i,
                parallelIndex: j,
                angle: meridian.angle,
                theta: parallel.theta,
                opacity: 0,
                pulse: 0,
                active: false
            });
        }
    }
    
    console.log(`✅ Géométrie créée: ${meridianCount} méridiens, ${parallelCount} parallèles, ${shieldCollections.gridLines.vertices.length} vertices`);
}

// Mise à jour de la géométrie sphérique
export function updateSphericalGeometry(sphericalShield, shieldCollections) {
    // Mise à jour des vertices actifs
    shieldCollections.gridLines.vertices.forEach(vertex => {
        if (vertex.active) {
            vertex.pulse *= 0.95;
            if (vertex.pulse < 0.01) {
                vertex.active = false;
                vertex.pulse = 0;
            }
        }
    });
    
    // Fade out progressif des segments quand pas d'impact
    if (!sphericalShield.isRevealing) {
        shieldCollections.gridLines.meridians.forEach(meridian => {
            meridian.segments.forEach(segment => {
                segment.opacity *= 0.98;
                segment.glowIntensity *= 0.95;
                if (segment.opacity < 0.01) {
                    segment.visible = false;
                }
            });
        });
        
        shieldCollections.gridLines.parallels.forEach(parallel => {
            parallel.segments.forEach(segment => {
                segment.opacity *= 0.98;
                segment.glowIntensity *= 0.95;
                if (segment.opacity < 0.01) {
                    segment.visible = false;
                }
            });
        });
    }
}

// Dessiner la grille géodésique
export function drawSphericalGrid(ctx, centerX, centerY, sphericalShield, shieldCollections) {
    // 1. DESSINER LES MÉRIDIENS (lignes verticales)
    shieldCollections.gridLines.meridians.forEach((meridian, mIndex) => {
        ctx.beginPath();
        let firstPoint = true;
        let hasVisibleSegments = false;
        
        meridian.segments.forEach((segment, sIndex) => {
            if (!segment.visible) return;
            hasVisibleSegments = true;
            
            // Projection 3D -> 2D avec rotation
            const coords = project3DTo2D(
                sphericalShield.radius * Math.sin(segment.theta) * Math.cos(meridian.angle),
                sphericalShield.radius * Math.cos(segment.theta),
                sphericalShield.radius * Math.sin(segment.theta) * Math.sin(meridian.angle),
                centerX, centerY, sphericalShield.rotation
            );
            
            if (firstPoint) {
                ctx.moveTo(coords.x, coords.y);
                firstPoint = false;
            } else {
                ctx.lineTo(coords.x, coords.y);
            }
        });
        
        if (hasVisibleSegments) {
            // Calculer les propriétés moyennes pour le style
            const avgOpacity = meridian.segments.reduce((sum, s) => sum + s.opacity, 0) / meridian.segments.length;
            const avgGlow = meridian.segments.reduce((sum, s) => sum + s.glowIntensity, 0) / meridian.segments.length;
            
            applyGridLineStyle(ctx, avgOpacity, avgGlow, sphericalShield);
            ctx.stroke();
        }
    });
    
    // 2. DESSINER LES PARALLÈLES (lignes horizontales)
    shieldCollections.gridLines.parallels.forEach(parallel => {
        ctx.beginPath();
        let firstPoint = true;
        let hasVisibleSegments = false;
        
        parallel.segments.forEach(segment => {
            if (!segment.visible) return;
            hasVisibleSegments = true;
            
            // Projection 3D -> 2D
            const coords = project3DTo2D(
                sphericalShield.radius * Math.sin(parallel.theta) * Math.cos(segment.phi),
                sphericalShield.radius * Math.cos(parallel.theta),
                sphericalShield.radius * Math.sin(parallel.theta) * Math.sin(segment.phi),
                centerX, centerY, sphericalShield.rotation
            );
            
            if (firstPoint) {
                ctx.moveTo(coords.x, coords.y);
                firstPoint = false;
            } else {
                ctx.lineTo(coords.x, coords.y);
            }
        });
        
        if (hasVisibleSegments) {
            const avgOpacity = parallel.segments.reduce((sum, s) => sum + s.opacity, 0) / parallel.segments.length;
            const avgGlow = parallel.segments.reduce((sum, s) => sum + s.glowIntensity, 0) / parallel.segments.length;
            
            applyGridLineStyle(ctx, avgOpacity, avgGlow, sphericalShield);
            ctx.stroke();
        }
    });
}

// Dessiner les vertices actifs (intersections qui pulsent)
export function drawActiveVertices(ctx, centerX, centerY, sphericalShield, shieldCollections) {
    shieldCollections.gridLines.vertices.forEach(vertex => {
        if (!vertex.active || vertex.pulse < 0.1) return;
        
        const coords = project3DTo2D(
            sphericalShield.radius * Math.sin(vertex.theta) * Math.cos(vertex.angle),
            sphericalShield.radius * Math.cos(vertex.theta),
            sphericalShield.radius * Math.sin(vertex.theta) * Math.sin(vertex.angle),
            centerX, centerY, sphericalShield.rotation
        );
        
        const pulseGradient = ctx.createRadialGradient(
            coords.x, coords.y, 0, 
            coords.x, coords.y, 5 * vertex.pulse
        );
        pulseGradient.addColorStop(0, `rgba(255, 255, 255, ${vertex.pulse})`);
        pulseGradient.addColorStop(0.5, `rgba(255, 150, 0, ${vertex.pulse * 0.7})`);
        pulseGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
        
        ctx.fillStyle = pulseGradient;
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 5 * vertex.pulse, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Fonction utilitaire pour la projection 3D vers 2D
function project3DTo2D(x3d, y3d, z3d, centerX, centerY, rotation) {
    // Appliquer la rotation
    const rotatedX = x3d * Math.cos(rotation.y) - z3d * Math.sin(rotation.y);
    const rotatedZ = x3d * Math.sin(rotation.y) + z3d * Math.cos(rotation.y);
    
    // Projection perspective
    const perspective = 1 + rotatedZ / 200;
    const projX = centerX + rotatedX * perspective;
    const projY = centerY + y3d * perspective;
    
    return { x: projX, y: projY, z: rotatedZ };
}

// Appliquer le style des lignes de grille (tout en orange comme dans le code original)
function applyGridLineStyle(ctx, opacity, glowIntensity, sphericalShield) {
    if (glowIntensity > 0.1) {
        // Style d'impact (orange brillant)
        ctx.strokeStyle = `rgba(255, 150, 0, ${opacity * sphericalShield.visibility})`;
        ctx.lineWidth = 1.5 + glowIntensity;
        ctx.shadowBlur = 10 * glowIntensity;
        ctx.shadowColor = 'rgba(255, 150, 0, 0.8)';
    } else {
        // Style normal (orange plus doux - pas cyan !)
        ctx.strokeStyle = `rgba(255, 200, 100, ${opacity * sphericalShield.visibility})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(255, 200, 100, 0.5)';
    }
}

// Fonction utilitaire pour calculer la distance sphérique
export function calculateSphericalDistance(phi1, theta1, phi2, theta2) {
    const dPhi = phi2 - phi1;
    const dTheta = theta2 - theta1;
    return Math.sqrt(dPhi * dPhi + dTheta * dTheta);
}

// Révéler les segments de grille dans un rayon donné
export function revealGridSegments(sphericalShield, shieldCollections, revelationPhi, revelationTheta, revelationRadius, intensity) {
    // Révéler les segments de méridiens
    shieldCollections.gridLines.meridians.forEach(meridian => {
        meridian.segments.forEach(segment => {
            const distance = calculateSphericalDistance(
                revelationPhi, revelationTheta,
                meridian.angle, segment.theta
            );
            
            if (distance < revelationRadius) {
                segment.visible = true;
                segment.opacity = Math.min(1, segment.opacity + 0.1);
                segment.glowIntensity = Math.max(segment.glowIntensity, intensity);
            }
        });
    });
    
    // Révéler les segments de parallèles
    shieldCollections.gridLines.parallels.forEach(parallel => {
        parallel.segments.forEach(segment => {
            const distance = calculateSphericalDistance(
                revelationPhi, revelationTheta,
                segment.phi, parallel.theta
            );
            
            if (distance < revelationRadius) {
                segment.visible = true;
                segment.opacity = Math.min(1, segment.opacity + 0.1);
                segment.glowIntensity = Math.max(segment.glowIntensity, intensity);
            }
        });
    });
}

// Activer les vertices proches d'un impact
export function activateNearbyVertices(shieldCollections, impactPhi, impactTheta, radius = 0.5) {
    shieldCollections.gridLines.vertices.forEach(vertex => {
        const angleDiff = Math.abs(vertex.angle - impactPhi);
        const thetaDiff = Math.abs(vertex.theta - impactTheta);
        const distance = Math.sqrt(angleDiff * angleDiff + thetaDiff * thetaDiff);
        
        if (distance < radius) {
            vertex.active = true;
            vertex.pulse = 1.0;
        }
    });
}
