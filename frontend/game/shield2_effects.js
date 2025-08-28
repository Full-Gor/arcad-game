// shield2_effects.js - Gestion des effets visuels du bouclier sphérique (CODE ORIGINAL)

// Mise à jour des effets visuels sphériques (CODE ORIGINAL EXACT)
export function updateSphericalEffects(sphericalShield) {
    // Mise à jour des ondes d'énergie
    sphericalShield.energyWaves = sphericalShield.energyWaves.filter(wave => {
        wave.radius += wave.speed;
        wave.opacity *= 0.98;
        return wave.radius < wave.maxRadius && wave.opacity > 0.01;
    });
    
    // Mise à jour des vertices actifs
    sphericalShield.gridLines.vertices.forEach(vertex => {
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
        sphericalShield.gridLines.meridians.forEach(meridian => {
            meridian.segments.forEach(segment => {
                segment.opacity *= 0.98;
                segment.glowIntensity *= 0.95;
                if (segment.opacity < 0.01) {
                    segment.visible = false;
                }
            });
        });
        
        sphericalShield.gridLines.parallels.forEach(parallel => {
            parallel.segments.forEach(segment => {
                segment.opacity *= 0.98;
                segment.glowIntensity *= 0.95;
                if (segment.opacity < 0.01) {
                    segment.visible = false;
                }
            });
        });
    }
    
    // Mise à jour des particules de pulse (CODE ORIGINAL EXACT)
    sphericalShield.pulsePoints = sphericalShield.pulsePoints.filter(point => {
        if (point.trail.length > 5) point.trail.shift();
        point.trail.push({ x: point.x, y: point.y });
        
        point.x += point.vx;
        point.y += point.vy;
        point.vx *= 0.95;
        point.vy *= 0.95;
        point.life--;
        point.size *= 0.98;
        
        return point.life > 0;
    });
}

// Créer une onde d'énergie qui parcourt la sphère (CODE ORIGINAL EXACT)
export function createEnergyWave(sphericalShield, phi, theta, color, speed, delay = 0) {
    setTimeout(() => {
        sphericalShield.energyWaves.push({
            originPhi: phi,
            originTheta: theta,
            radius: 0,
            maxRadius: Math.PI,
            speed: speed,
            opacity: 1.0,
            thickness: 0.1,
            color: color
        });
    }, delay);
}

// Créer des particules d'impact (CODE ORIGINAL EXACT)
export function createImpactParticles(sphericalShield, impactX, impactY) {
    // Particules d'impact
    for (let i = 0; i < 15; i++) {
        const spreadAngle = Math.random() * Math.PI * 2;
        const spreadSpeed = 1 + Math.random() * 3;
        sphericalShield.pulsePoints.push({
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
