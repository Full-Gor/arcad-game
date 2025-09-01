// golden_shield_system.js - Système de bouclier sphérique doré alvéolaire avec réflexion
import { canvas, ctx } from './globals_simple.js';

// Système de bouclier sphérique doré alvéolaire avec réflexion
let goldenHoneycombShield = {
    // Configuration du bouclier
    radius: 60,
    active: false,
    visibility: 1,
    
    // Rotation
    rotation: {
        x: 0,
        y: 0,
        z: 0,
        speedX: 0.005,
        speedY: 0.008,
        speedZ: 0.003
    },
    
    // Structure alvéolaire (hexagones)
    honeycomb: {
        hexagons: [],
        rows: 8,
        cols: 12,
        hexSize: 12
    },
    
    // Système de réflexion
    reflectedProjectiles: [],
    impactZones: [],
    
    // Configuration visuelle
    colors: {
        gold: { r: 255, g: 215, b: 0 },           // Or principal
        lightGold: { r: 255, g: 235, b: 100 },    // Or clair
        darkGold: { r: 200, g: 150, b: 0 },       // Or foncé
        white: { r: 255, g: 255, b: 255 },        // Blanc pour les éclats
        amber: { r: 255, g: 170, b: 0 }           // Ambre pour les reflets
    },
    
    // Effets visuels
    shimmerEffect: 0,
    pulsePhase: 0,
    goldenParticles: [],
    reflectionFlashes: [],
    
    // Animation
    time: 0
};

// Initialisation du bouclier doré
export function initGoldenHoneycombShield(player) {
    goldenHoneycombShield.active = true;
    goldenHoneycombShield.hexagons = [];
    
    // Générer la structure alvéolaire sphérique
    generateSphericalHoneycomb();
    
    // Créer des particules dorées ambiantes
    for (let i = 0; i < 30; i++) {
        goldenHoneycombShield.goldenParticles.push({
            angle: Math.random() * Math.PI * 2,
            phi: Math.random() * Math.PI,
            distance: goldenHoneycombShield.radius + Math.random() * 10,
            size: 1 + Math.random() * 2,
            speed: 0.01 + Math.random() * 0.02,
            opacity: 0.5 + Math.random() * 0.5,
            shimmer: Math.random() * Math.PI * 2
        });
    }
    
    console.log('🛡️ Bouclier doré alvéolaire initialisé');
}

// Générer la structure alvéolaire sur une sphère
function generateSphericalHoneycomb() {
    goldenHoneycombShield.honeycomb.hexagons = [];
    
    // Créer une grille d'hexagones mappée sur une sphère
    const latitudeBands = goldenHoneycombShield.honeycomb.rows;
    const longitudeBands = goldenHoneycombShield.honeycomb.cols;
    
    for (let lat = 0; lat < latitudeBands; lat++) {
        const theta = (lat / latitudeBands) * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        
        // Ajuster le nombre d'hexagones selon la latitude (moins aux pôles)
        const hexagonsAtLatitude = Math.max(3, Math.floor(longitudeBands * sinTheta));
        
        for (let lon = 0; lon < hexagonsAtLatitude; lon++) {
            const phi = (lon / hexagonsAtLatitude) * Math.PI * 2;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            
            // Position 3D sur la sphère
            const x = sinTheta * cosPhi;
            const y = cosTheta;
            const z = sinTheta * sinPhi;
            
            goldenHoneycombShield.honeycomb.hexagons.push({
                // Coordonnées sphériques
                theta: theta,
                phi: phi,
                // Coordonnées cartésiennes normalisées
                x: x,
                y: y,
                z: z,
                // État de l'hexagone
                illuminated: false,
                illuminationLevel: 0,
                lastImpactTime: 0,
                // Couleur actuelle
                currentColor: { ...goldenHoneycombShield.colors.darkGold },
                // Animation
                pulse: Math.random() * Math.PI * 2,
                shimmer: 0
            });
        }
    }
}

// Créer un impact et réfléchir le projectile
export function createGoldenShieldImpact(impactX, impactY, projectile, player) {
    if (!goldenHoneycombShield.active) return false;
    
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    // Calculer la position de l'impact sur la sphère
    const dx = impactX - centerX;
    const dy = impactY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Vérifier si l'impact est sur le bouclier
    if (distance > goldenHoneycombShield.radius * 1.2) return false;
    
    // Angle d'impact
    const impactAngle = Math.atan2(dy, dx);
    
    // Convertir en coordonnées sphériques
    const phi = impactAngle;
    const theta = Math.acos(Math.min(1, distance / goldenHoneycombShield.radius));
    
    // Illuminer les hexagones proches
    illuminateNearbyHexagons(theta, phi);
    
    // Créer l'effet d'impact
    goldenHoneycombShield.impactZones.push({
        theta: theta,
        phi: phi,
        radius: 0,
        maxRadius: 0.5, // En radians
        intensity: 1,
        life: 30,
        maxLife: 30
    });
    
    // Créer un flash de réflexion
    goldenHoneycombShield.reflectionFlashes.push({
        x: impactX,
        y: impactY,
        radius: 0,
        maxRadius: 40,
        opacity: 1,
        color: { ...goldenHoneycombShield.colors.white }
    });
    
    // RÉFLÉCHIR LE PROJECTILE (comme un miroir)
    if (projectile) {
        // Calculer l'angle de réflexion (opposé à l'angle d'incidence)
        const reflectionAngle = impactAngle + Math.PI; // Inverser la direction
        
        // Créer le projectile réfléchi - COPIE EXACTE avec direction inversée
        const reflectedProjectile = {
            x: impactX,
            y: impactY,
            vx: Math.cos(reflectionAngle) * Math.abs(projectile.speed || 10),
            vy: Math.sin(reflectionAngle) * Math.abs(projectile.speed || 10),
            damage: projectile.damage || 10,
            size: projectile.size || 5,
            color: projectile.color ? { ...projectile.color } : { r: 255, g: 0, b: 0 }, // GARDER LA COULEUR ORIGINALE
            trail: [],
            life: 200,
            isReflected: true,
            originalType: projectile.type || 'standard',
            // Copier toutes les propriétés spécifiques du projectile original
            ...projectile.specialProperties
        };
        
        goldenHoneycombShield.reflectedProjectiles.push(reflectedProjectile);
        
        // Effet de particules dorées à l'impact
        createReflectionParticles(impactX, impactY, reflectionAngle);
    }
    
    return true; // Impact absorbé et réfléchi
}

// Illuminer les hexagones proches de l'impact
function illuminateNearbyHexagons(impactTheta, impactPhi) {
    goldenHoneycombShield.honeycomb.hexagons.forEach(hex => {
        // Calculer la distance angulaire
        const dTheta = Math.abs(hex.theta - impactTheta);
        const dPhi = Math.abs(hex.phi - impactPhi);
        const angularDistance = Math.sqrt(dTheta * dTheta + dPhi * dPhi);
        
        // Illuminer si proche
        if (angularDistance < 0.5) {
            hex.illuminated = true;
            hex.illuminationLevel = Math.max(hex.illuminationLevel, 1 - angularDistance * 2);
            hex.lastImpactTime = goldenHoneycombShield.time;
            hex.shimmer = 1;
            
            // Changer la couleur vers or brillant
            hex.currentColor = lerpColor(
                goldenHoneycombShield.colors.darkGold,
                goldenHoneycombShield.colors.lightGold,
                hex.illuminationLevel
            );
        }
    });
}

// Créer des particules de réflexion (effet du bouclier doré)
function createReflectionParticles(x, y, angle) {
    for (let i = 0; i < 15; i++) {
        const spreadAngle = angle + (Math.random() - 0.5) * Math.PI * 0.3;
        const speed = 2 + Math.random() * 3;
        
        goldenHoneycombShield.goldenParticles.push({
            x: x,
            y: y,
            vx: Math.cos(spreadAngle) * speed,
            vy: Math.sin(spreadAngle) * speed,
            size: 2 + Math.random() * 2,
            life: 40,
            opacity: 1,
            isProjectileParticle: true,
            color: Math.random() > 0.5 ? 
                   goldenHoneycombShield.colors.gold :  // Les PARTICULES restent dorées
                   goldenHoneycombShield.colors.white    // C'est l'effet du bouclier
        });
    }
}

// Interpolation de couleur
function lerpColor(color1, color2, t) {
    return {
        r: Math.floor(color1.r + (color2.r - color1.r) * t),
        g: Math.floor(color1.g + (color2.g - color1.g) * t),
        b: Math.floor(color1.b + (color2.b - color1.b) * t)
    };
}

// Mise à jour du bouclier
export function updateGoldenHoneycombShield() {
    if (!goldenHoneycombShield.active) return;
    
    goldenHoneycombShield.time++;
    goldenHoneycombShield.shimmerEffect += 0.02;
    goldenHoneycombShield.pulsePhase += 0.03;
    
    // Rotation continue
    goldenHoneycombShield.rotation.x += goldenHoneycombShield.rotation.speedX;
    goldenHoneycombShield.rotation.y += goldenHoneycombShield.rotation.speedY;
    goldenHoneycombShield.rotation.z += goldenHoneycombShield.rotation.speedZ;
    
    // Mise à jour des hexagones
    goldenHoneycombShield.honeycomb.hexagons.forEach(hex => {
        // Réduction progressive de l'illumination
        if (hex.illuminated) {
            hex.illuminationLevel *= 0.95;
            hex.shimmer *= 0.98;
            
            if (hex.illuminationLevel < 0.01) {
                hex.illuminated = false;
                hex.illuminationLevel = 0;
            }
            
            // Retour progressif à la couleur d'origine
            hex.currentColor = lerpColor(
                goldenHoneycombShield.colors.darkGold,
                goldenHoneycombShield.colors.lightGold,
                hex.illuminationLevel
            );
        }
        
        // Pulsation naturelle
        hex.pulse += 0.05;
    });
    
    // Mise à jour des zones d'impact
    goldenHoneycombShield.impactZones = goldenHoneycombShield.impactZones.filter(zone => {
        zone.radius += 0.03;
        zone.life--;
        zone.intensity = zone.life / zone.maxLife;
        return zone.life > 0;
    });
    
    // Mise à jour des projectiles réfléchis
    goldenHoneycombShield.reflectedProjectiles = goldenHoneycombShield.reflectedProjectiles.filter(proj => {
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;
        
        // Ajouter à la traînée
        if (!proj.trail) proj.trail = [];
        if (proj.trail.length > 10) proj.trail.shift();
        proj.trail.push({ x: proj.x, y: proj.y, opacity: 1 });
        
        // Mise à jour de la traînée
        proj.trail.forEach(t => t.opacity *= 0.9);
        
        // Supprimer si hors écran ou vie épuisée
        return proj.life > 0 && 
               proj.x > -50 && proj.x < canvas.width + 50 &&
               proj.y > -50 && proj.y < canvas.height + 50;
    });
    
    // Mise à jour des flashes de réflexion
    goldenHoneycombShield.reflectionFlashes = goldenHoneycombShield.reflectionFlashes.filter(flash => {
        flash.radius += 3;
        flash.opacity *= 0.9;
        return flash.opacity > 0.01;
    });
    
    // Mise à jour des particules dorées
    goldenHoneycombShield.goldenParticles = goldenHoneycombShield.goldenParticles.filter(particle => {
        if (particle.isProjectileParticle) {
            // Particules de projectile
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            particle.life--;
            particle.opacity = particle.life / 40;
            return particle.life > 0;
        } else {
            // Particules ambiantes orbitales
            particle.angle += particle.speed;
            particle.shimmer += 0.1;
            return true;
        }
    });
}

// Fonction de rendu
export function drawGoldenHoneycombShield(ctx, player) {
    if (!goldenHoneycombShield.active) return;
    
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    ctx.save();
    
    // 1. AURA DORÉE
    const auraGradient = ctx.createRadialGradient(
        centerX, centerY, goldenHoneycombShield.radius * 0.5,
        centerX, centerY, goldenHoneycombShield.radius * 1.3
    );
    auraGradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
    auraGradient.addColorStop(0.5, 'rgba(255, 235, 100, 0.05)');
    auraGradient.addColorStop(1, 'rgba(255, 170, 0, 0)');
    
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, goldenHoneycombShield.radius * 1.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. STRUCTURE ALVÉOLAIRE (HEXAGONES)
    goldenHoneycombShield.honeycomb.hexagons.forEach(hex => {
        // Appliquer la rotation
        let x3d = hex.x * goldenHoneycombShield.radius;
        let y3d = hex.y * goldenHoneycombShield.radius;
        let z3d = hex.z * goldenHoneycombShield.radius;
        
        // Rotation Y
        const cosY = Math.cos(goldenHoneycombShield.rotation.y);
        const sinY = Math.sin(goldenHoneycombShield.rotation.y);
        const tempX = x3d * cosY - z3d * sinY;
        const tempZ = x3d * sinY + z3d * cosY;
        x3d = tempX;
        z3d = tempZ;
        
        // Rotation X
        const cosX = Math.cos(goldenHoneycombShield.rotation.x);
        const sinX = Math.sin(goldenHoneycombShield.rotation.x);
        const tempY = y3d * cosX - z3d * sinX;
        const tempZ2 = y3d * sinX + z3d * cosX;
        y3d = tempY;
        z3d = tempZ2;
        
        // Ne dessiner que les hexagones visibles (face avant)
        if (z3d > -goldenHoneycombShield.radius * 0.3) {
            // Projection 2D
            const perspective = 1 + z3d / 200;
            const projX = centerX + x3d * perspective;
            const projY = centerY + y3d * perspective;
            
            // Taille adaptée à la perspective
            const hexSize = goldenHoneycombShield.honeycomb.hexSize * perspective;
            
            // Opacité basée sur la profondeur
            const depthOpacity = 0.3 + (z3d + goldenHoneycombShield.radius) / (goldenHoneycombShield.radius * 2) * 0.7;
            
            // Dessiner l'hexagone
            ctx.save();
            ctx.translate(projX, projY);
            
            // Effet de shimmer
            const shimmer = Math.sin(goldenHoneycombShield.shimmerEffect + hex.pulse) * 0.3 + 0.7;
            
            // Couleur avec illumination
            const finalOpacity = depthOpacity * shimmer * goldenHoneycombShield.visibility;
            
            // Remplissage de l'hexagone
            if (hex.illuminated) {
                // Hexagone illuminé
                const hexGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, hexSize);
                hexGradient.addColorStop(0, `rgba(255, 255, 255, ${hex.illuminationLevel})`);
                hexGradient.addColorStop(0.5, `rgba(${hex.currentColor.r}, ${hex.currentColor.g}, ${hex.currentColor.b}, ${finalOpacity})`);
                hexGradient.addColorStop(1, `rgba(${goldenHoneycombShield.colors.darkGold.r}, ${goldenHoneycombShield.colors.darkGold.g}, ${goldenHoneycombShield.colors.darkGold.b}, ${finalOpacity * 0.5})`);
                ctx.fillStyle = hexGradient;
            } else {
                // Hexagone normal
                ctx.fillStyle = `rgba(${goldenHoneycombShield.colors.darkGold.r}, ${goldenHoneycombShield.colors.darkGold.g}, ${goldenHoneycombShield.colors.darkGold.b}, ${finalOpacity * 0.2})`;
            }
            
            // Dessiner l'hexagone
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const hx = Math.cos(angle) * hexSize;
                const hy = Math.sin(angle) * hexSize;
                if (i === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.fill();
            
            // Bordure dorée
            ctx.strokeStyle = `rgba(${goldenHoneycombShield.colors.gold.r}, ${goldenHoneycombShield.colors.gold.g}, ${goldenHoneycombShield.colors.gold.b}, ${finalOpacity})`;
            ctx.lineWidth = hex.illuminated ? 2 : 1;
            ctx.shadowBlur = hex.illuminated ? 10 : 5;
            ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
            ctx.stroke();
            
            ctx.restore();
        }
    });
    
    // 3. EFFET DE BRILLANCE GLOBALE
    const shimmerGradient = ctx.createRadialGradient(
        centerX - goldenHoneycombShield.radius * 0.3, 
        centerY - goldenHoneycombShield.radius * 0.3,
        0,
        centerX - goldenHoneycombShield.radius * 0.3,
        centerY - goldenHoneycombShield.radius * 0.3,
        goldenHoneycombShield.radius * 0.5
    );
    shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = shimmerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, goldenHoneycombShield.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 4. FLASHES DE RÉFLEXION
    goldenHoneycombShield.reflectionFlashes.forEach(flash => {
        const flashGradient = ctx.createRadialGradient(
            flash.x, flash.y, 0,
            flash.x, flash.y, flash.radius
        );
        flashGradient.addColorStop(0, `rgba(255, 255, 255, ${flash.opacity})`);
        flashGradient.addColorStop(0.5, `rgba(255, 235, 100, ${flash.opacity * 0.5})`);
        flashGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = flashGradient;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 5. PROJECTILES RÉFLÉCHIS
    goldenHoneycombShield.reflectedProjectiles.forEach(proj => {
        // Traînée dans la couleur originale
        if (proj.trail && proj.trail.length > 1) {
            const trailColor = proj.color || { r: 255, g: 0, b: 0 };
            ctx.strokeStyle = `rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, 0.5)`;
            ctx.lineWidth = proj.size * 0.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, 0.8)`;
            
            ctx.beginPath();
            proj.trail.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
        
        // Projectile dans sa couleur originale
        const projColor = proj.color || { r: 255, g: 0, b: 0 };
        const projGradient = ctx.createRadialGradient(
            proj.x, proj.y, 0,
            proj.x, proj.y, proj.size
        );
        projGradient.addColorStop(0, `rgba(255, 255, 255, 1)`);
        projGradient.addColorStop(0.3, `rgba(${projColor.r}, ${projColor.g}, ${projColor.b}, 1)`);
        projGradient.addColorStop(1, `rgba(${projColor.r}, ${projColor.g}, ${projColor.b}, 0.3)`);
        
        ctx.fillStyle = projGradient;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 6. PARTICULES DORÉES AMBIANTES
    goldenHoneycombShield.goldenParticles.forEach(particle => {
        if (!particle.isProjectileParticle) {
            // Particules orbitales
            const x3d = Math.sin(particle.phi) * Math.cos(particle.angle) * particle.distance;
            const y3d = Math.cos(particle.phi) * particle.distance;
            const z3d = Math.sin(particle.phi) * Math.sin(particle.angle) * particle.distance;
            
            // Appliquer la rotation
            const cosY = Math.cos(goldenHoneycombShield.rotation.y);
            const sinY = Math.sin(goldenHoneycombShield.rotation.y);
            const tempX = x3d * cosY - z3d * sinY;
            const tempZ = x3d * sinY + z3d * cosY;
            
            const perspective = 1 + tempZ / 200;
            const projX = centerX + tempX * perspective;
            const projY = centerY + y3d * perspective;
            
            const shimmer = Math.sin(particle.shimmer) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity * shimmer})`;
            ctx.beginPath();
            ctx.arc(projX, projY, particle.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Particules de projectile
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    ctx.restore();
}

// Fonction pour obtenir les projectiles réfléchis (pour gérer les collisions)
export function getReflectedProjectiles() {
    return goldenHoneycombShield.reflectedProjectiles;
}

// Fonction pour activer/désactiver le bouclier
export function toggleGoldenShield(active) {
    goldenHoneycombShield.active = active;
    if (active) {
        goldenHoneycombShield.visibility = 1;
        console.log('🛡️ Bouclier doré activé');
    } else {
        goldenHoneycombShield.visibility = 0;
        console.log('🛡️ Bouclier doré désactivé');
    }
}

// Fonction pour vérifier si un projectile est bloqué
export function checkGoldenShieldBlock(projectileX, projectileY, player) {
    if (!goldenHoneycombShield.active) return false;
    
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const distance = Math.sqrt(
        Math.pow(projectileX - centerX, 2) + 
        Math.pow(projectileY - centerY, 2)
    );
    
    return distance <= goldenHoneycombShield.radius;
}
