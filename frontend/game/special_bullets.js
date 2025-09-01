// special_bullets.js - Gestion des projectiles spéciaux (électriques et glitch)
import { canvas, ctx } from './globals_simple.js';
import { enemyBullets } from './enemy_bullets_simple.js';
import { updateDuoLavaOrb, drawDuoLavaOrb } from './bullets/types/duo_lava_orb.js';
import { updateElectricLaser as updateElectricLaserGen, drawElectricLaser as drawElectricLaserGen } from './bullets/types/electric_laser_serpentine.js';

// ========================================
// MISE À JOUR DES PROJECTILES SPÉCIAUX
// ========================================

export function updateSpecialBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        
        if (bullet.type === 'electric') {
            updateElectricBullet(bullet);
        } else if (bullet.type === 'glitch') {
            updateGlitchBullet(bullet);
        } else if (bullet.type === 'electric_laser_gen') {
            const done = updateElectricLaserGen(bullet);
            if (done) {
                enemyBullets.splice(i, 1);
                continue;
            }
        } else if (bullet.type === 'duo_lava_orb') {
            const done = updateDuoLavaOrb(bullet);
            if (done) {
                enemyBullets.splice(i, 1);
                continue;
            }
        }
        
        // Supprimer si hors écran
        if (bullet.x < -50 || bullet.x > canvas.width + 50 ||
            bullet.y < -50 || bullet.y > canvas.height + 50) {
            enemyBullets.splice(i, 1);
        }
    }
}

function updateElectricBullet(bullet) {
    // Mouvement de base
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    
    // Vérifier que les positions restent valides
    if (!isFinite(bullet.x) || !isFinite(bullet.y)) {
        bullet.x = 0;
        bullet.y = 0;
    }
    
    // Pulsation
    bullet.pulsePhase += 0.15;
    bullet.width = 12 + Math.sin(bullet.pulsePhase) * 3;
    bullet.height = bullet.width;
    
    // Vérifier que la taille reste valide
    if (!isFinite(bullet.width) || bullet.width <= 0) {
        bullet.width = 12;
        bullet.height = 12;
    }
    
    // Générer des arcs électriques
    if (Math.random() < 0.4) {
        bullet.electricArcs.push({
            angle: Math.random() * Math.PI * 2,
            length: 15 + Math.random() * 10,
            lifetime: 5,
            segments: 2 + Math.floor(Math.random() * 2)
        });
    }
    
    // Mise à jour des arcs
    bullet.electricArcs = bullet.electricArcs.filter(arc => {
        arc.lifetime--;
        return arc.lifetime > 0;
    });
    
    // Trainée
    bullet.trail.push({
        x: bullet.x,
        y: bullet.y,
        size: bullet.width * 0.7,
        opacity: 0.6
    });
    if (bullet.trail.length > 8) bullet.trail.shift();
}

function updateGlitchBullet(bullet) {
    // Mouvement de base avec instabilité
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    
    // Vérifier que les positions restent valides
    if (!isFinite(bullet.x) || !isFinite(bullet.y)) {
        bullet.x = 0;
        bullet.y = 0;
    }
    
    // Effet de glitch - téléportation aléatoire
    bullet.glitchPhase += 0.2;
    if (Math.random() < bullet.instability) {
        bullet.glitchOffset.x = (Math.random() - 0.5) * bullet.glitchIntensity * 2;
        bullet.glitchOffset.y = (Math.random() - 0.5) * bullet.glitchIntensity;
        
        // Changement de couleur aléatoire
        bullet.currentColor = bullet.glitchColors[Math.floor(Math.random() * bullet.glitchColors.length)];
        
        // Augmenter temporairement l'instabilité
        bullet.instability = Math.min(0.3, bullet.instability + 0.02);
    } else {
        // Réduire progressivement l'offset de glitch
        bullet.glitchOffset.x *= 0.9;
        bullet.glitchOffset.y *= 0.9;
        bullet.instability = Math.max(0.1, bullet.instability - 0.01);
    }
    
    // Vérifier que les offsets de glitch restent valides
    if (!isFinite(bullet.glitchOffset.x) || !isFinite(bullet.glitchOffset.y)) {
        bullet.glitchOffset.x = 0;
        bullet.glitchOffset.y = 0;
    }
    
    // Oscillation horizontale
    bullet.vx = (Math.random() - 0.5) * 3 + Math.sin(bullet.glitchPhase) * 2;
    
    // Trainée avec effet de glitch
    bullet.trail.push({
        x: bullet.x + bullet.glitchOffset.x,
        y: bullet.y + bullet.glitchOffset.y,
        color: bullet.currentColor,
        opacity: 0.5,
        glitched: Math.random() < 0.3
    });
    if (bullet.trail.length > 10) bullet.trail.shift();
}

// ========================================
// RENDU DES PROJECTILES SPÉCIAUX
// ========================================

export function drawSpecialBullets(ctx) {
    enemyBullets.forEach(bullet => {
        if (bullet.type === 'electric') {
            drawElectricBullet(ctx, bullet);
        } else if (bullet.type === 'glitch') {
            drawGlitchBullet(ctx, bullet);
        } else if (bullet.type === 'electric_laser_gen') {
            drawElectricLaserGen(ctx, bullet);
        } else if (bullet.type === 'duo_lava_orb') {
            drawDuoLavaOrb(ctx, bullet);
        }
    });
}

function drawElectricBullet(ctx, bullet) {
    // Trainée
    bullet.trail.forEach((point, index) => {
        // Vérifier que les valeurs sont valides
        if (!isFinite(point.x) || !isFinite(point.y) || !isFinite(point.size) || point.size <= 0) {
            console.warn('Point invalide ignoré:', point);
            return; // Ignorer ce point invalide
        }
        
        ctx.globalAlpha = (index / bullet.trail.length) * 0.5;
        
        // Vérification supplémentaire avant createRadialGradient
        const radius = point.size / 2;
        if (!isFinite(radius) || radius <= 0) {
            console.warn('Radius invalide:', radius, 'point.size:', point.size);
            return;
        }
        
        const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, radius
        );
        gradient.addColorStop(0, bullet.coreColor);
        gradient.addColorStop(0.5, bullet.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
    
    // Vérifier que les valeurs de la boule sont valides
    if (!isFinite(bullet.x) || !isFinite(bullet.y) || !isFinite(bullet.width) || bullet.width <= 0) {
        return; // Ne pas dessiner si les valeurs sont invalides
    }
    
    // Boule principale avec gradient
    const gradient = ctx.createRadialGradient(
        bullet.x, bullet.y, 0,
        bullet.x, bullet.y, bullet.width / 2
    );
    gradient.addColorStop(0, bullet.coreColor);
    gradient.addColorStop(0.3, bullet.color);
    gradient.addColorStop(0.7, bullet.color);
    gradient.addColorStop(1, 'rgba(255, 0, 255, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Core brillant
    ctx.fillStyle = bullet.coreColor;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.width / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Arcs électriques
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 3;
    
    bullet.electricArcs.forEach(arc => {
        ctx.globalAlpha = arc.lifetime / 5;
        ctx.beginPath();
        
        const startX = bullet.x;
        const startY = bullet.y;
        const endX = startX + Math.cos(arc.angle) * arc.length;
        const endY = startY + Math.sin(arc.angle) * arc.length;
        
        ctx.moveTo(startX, startY);
        
        for (let i = 1; i <= arc.segments; i++) {
            const t = i / arc.segments;
            const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 5;
            const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 5;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    });
}

function drawGlitchBullet(ctx, bullet) {
    // Trainée avec effet de corruption
    bullet.trail.forEach((point, index) => {
        // Vérifier que les valeurs sont valides
        if (!isFinite(point.x) || !isFinite(point.y)) {
            return; // Ignorer ce point invalide
        }
        
        ctx.globalAlpha = (index / bullet.trail.length) * 0.6;
        
        if (point.glitched) {
            // Point corrompu
            ctx.fillStyle = bullet.glitchColors[Math.floor(Math.random() * bullet.glitchColors.length)];
            ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
        } else {
            ctx.fillStyle = point.color;
            ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
        }
    });
    
    ctx.globalAlpha = 1;
    
    // Vérifier que les valeurs de la boule sont valides
    if (!isFinite(bullet.x) || !isFinite(bullet.y) || !isFinite(bullet.width) || !isFinite(bullet.height) || 
        !isFinite(bullet.glitchOffset.x) || !isFinite(bullet.glitchOffset.y) || 
        bullet.width <= 0 || bullet.height <= 0) {
        return; // Ne pas dessiner si les valeurs sont invalides
    }
    
    // Effet de distorsion RGB
    const offset = 2;
    
    // Canal rouge
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(
        bullet.x + bullet.glitchOffset.x - offset - bullet.width/2,
        bullet.y + bullet.glitchOffset.y - bullet.height/2,
        bullet.width,
        bullet.height
    );
    
    // Canal vert
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(
        bullet.x + bullet.glitchOffset.x + offset - bullet.width/2,
        bullet.y + bullet.glitchOffset.y - bullet.height/2,
        bullet.width,
        bullet.height
    );
    
    // Canal bleu
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fillRect(
        bullet.x + bullet.glitchOffset.x - bullet.width/2,
        bullet.y + bullet.glitchOffset.y - offset - bullet.height/2,
        bullet.width,
        bullet.height
    );
    
    // Core principal
    ctx.fillStyle = bullet.currentColor;
    ctx.shadowColor = bullet.currentColor;
    ctx.shadowBlur = 10;
    ctx.fillRect(
        bullet.x + bullet.glitchOffset.x - bullet.width/2,
        bullet.y + bullet.glitchOffset.y - bullet.height/2,
        bullet.width,
        bullet.height
    );
    
    // Pixels corrompus aléatoires
    if (Math.random() < 0.3) {
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 3; i++) {
            const px = bullet.x + (Math.random() - 0.5) * 20;
            const py = bullet.y + (Math.random() - 0.5) * 20;
            ctx.fillRect(px, py, 2, 2);
        }
    }
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

export function clearSpecialBullets() {
    // Supprimer tous les projectiles spéciaux
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        if (bullet.type === 'electric' || bullet.type === 'glitch') {
            enemyBullets.splice(i, 1);
        }
    }
}

export function getSpecialBulletsCount() {
    return enemyBullets.filter(bullet => bullet.type === 'electric' || bullet.type === 'glitch').length;
}
