// shield_effects.js - Effets visuels du bouclier simple
import { starship } from './player_simple.js';
import { shieldSystem } from './shield_simple.js';

// Créer un impact amélioré pour le bouclier simple
export function createSimpleShieldImpact(impactX, impactY, player = starship, damage = 10) {
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
    
    // Explosion de particules d'énergie
    for (let i = 0; i < 20; i++) {
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
    
    console.log('💥 Impact sur le bouclier simple à', impactX, impactY);
}

// Fonction pour créer des particules d'impact pour le bouclier simple
export function createSimpleImpactParticles(impactX, impactY, count = 15) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const particle = {
            x: impactX,
            y: impactY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30 + Math.random() * 20,
            maxLife: 30 + Math.random() * 20,
            size: 2 + Math.random() * 2,
            color: 'rgba(4, 251, 172, 1)'
        };
        
        shieldSystem.particles.push(particle);
    }
}

// Fonction pour mettre à jour les effets du bouclier simple
export function updateSimpleShieldEffects() {
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
}

// Fonction pour dessiner les effets du bouclier simple
export function drawSimpleShieldEffects(ctx) {
    if (!starship) return;
    
    const centerX = starship.x + starship.width / 2;
    const centerY = starship.y + starship.height / 2;
    
    // Dessiner les ondulations (Ripples)
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
    
    // Dessiner les explosions d'énergie
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
}
