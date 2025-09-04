// shield_geometry.js - Géométrie du bouclier simple
import { starship } from '../player_simple.js';
import { shieldSystem } from './shield_simple.js';
import { isSimpleShieldActive } from './shield_simple.js';

// Initialisation de la géométrie du bouclier simple
export function initSimpleShieldGeometry(player = starship) {
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
    
    console.log('🔧 Géométrie du bouclier simple initialisée');
}

// Calcul de distance pour le bouclier simple
export function calculateSimpleShieldDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Révéler des segments de grille pour le bouclier simple
export function revealSimpleShieldSegments(centerX, centerY, radius, intensity) {
    if (!shieldSystem.hexagons) return;
    
    // Activer les vertices dans le rayon
    shieldSystem.hexagons.forEach(hex => {
        const distance = calculateSimpleShieldDistance(centerX, centerY, hex.x, hex.y);
        if (distance < radius) {
            hex.active = true;
            hex.intensity = Math.max(hex.intensity || 0, intensity);
        }
    });
}

// Activer les vertices proches pour le bouclier simple
export function activateNearbySimpleShieldVertices(centerX, centerY, radius) {
    if (!shieldSystem.hexagons) return;
    
    shieldSystem.hexagons.forEach(hex => {
        const hexAngle = hex.angle;
        const distance = calculateSimpleShieldDistance(centerX, centerY, 
            centerX + Math.cos(hexAngle) * hex.distance, 
            centerY + Math.sin(hexAngle) * hex.distance);
        
        if (distance < radius) {
            hex.active = true;
            hex.activation = 1.0;
        }
    });
}

// Mise à jour de la géométrie du bouclier simple
export function updateSimpleShieldGeometry() {
    if (!starship) return;
    
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

// Dessiner la géométrie hexagonale du bouclier simple
export function drawSimpleShieldGeometry(ctx) {
    if (!starship || !isSimpleShieldActive()) return;
    
    const centerX = starship.x + starship.width / 2;
    const centerY = starship.y + starship.height / 2;
    
    // Dessiner la grille hexagonale
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
    
    // Dessiner les particules orbitales avec traînées
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
    
    // Dessiner les particules de plasma flottantes
    shieldSystem.particles.forEach(particle => {
        const x = centerX + Math.cos(particle.angle) * particle.distance;
        const y = centerY + Math.sin(particle.angle) * particle.distance;
        const opacity = particle.opacity * (particle.lifespan / 200);
        
        ctx.fillStyle = `rgba(4, 251, 172, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}


