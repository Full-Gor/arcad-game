// funnel_laser_simple.js - Système de laser entonnoir pour ENEMY10
import { canvas, ctx } from './globals_simple.js';
import { enemies } from './enemies_simple.js';
import { starship } from './player_simple.js';

// Variables principales (depuis votre code original)
export let enemyBullets = [];
let growingBullets = [];
let enemyShootTimers = new Map();
let enemyBulletSpeedMultiplier = 1;
const maxNewBullets = 10;
const maxEnemyBullets = 100;

// NOUVEAU: Variables pour le laser entonnoir
export let funnelLasers = [];
export let playerFunnelLasers = [];
let laserParticles = [];
let enemiesWithActiveLasers = new Set(); // Track des ennemis qui tirent

// ========================================
// CRÉATION DU LASER ENTONNOIR
// ========================================

function createFunnelLaser(enemy) {
    const laser = {
        // Identifiant et timing
        id: Date.now() + Math.random(),
        enemy: enemy,
        startTime: Date.now(),
        
        // Phases du laser
        phase: 'growing',  // 'growing', 'disintegrating', 'complete'
        growDuration: 3000,      // 3 secondes de croissance
        disintegrateDuration: 1500, // 1.5 secondes de désintégration
        
        // Position (suit l'ennemi)
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        
        // Dimensions
        currentWidth: 1,         // Commence à 1px
        maxWidth: 200,           // Jusqu'à 200px
        length: canvas.height,   // Toute la hauteur du canvas
        
        // Forme de l'entonnoir au sommet
        funnelRadius: 1,         // Rayon actuel de l'entonnoir
        maxFunnelRadius: 100,    // Rayon max de l'entonnoir
        funnelHeight: 60,        // Hauteur de l'entonnoir
        
        // Effets visuels
        opacity: 1,
        glowIntensity: 0,
        maxGlowIntensity: 30,
        
        // Particules de désintégration
        disintegrationParticles: [],
        particleSpawnRate: 0,
        
        // Couleurs (bleu ciel vers blanc)
        edgeColor: '#87CEEB',    // Bleu ciel
        coreColor: '#FFFFFF',    // Blanc pur
        glowColor: '#00BFFF',    // Deep sky blue pour la lueur
        
        // Propriétés de l'entonnoir
        funnelSegments: 32,      // Nombre de segments pour dessiner l'entonnoir arrondi
        funnelWaveAmplitude: 0,  // Amplitude des ondulations de l'entonnoir
        funnelWaveFrequency: 0.1,
        funnelWavePhase: 0
    };
    
    funnelLasers.push(laser);
    
    // Marquer cet ennemi comme ayant un laser actif
    enemiesWithActiveLasers.add(enemy);
}

// CRÉER UN LASER ENTONNOIR POUR LE JOUEUR (orienté vers le haut)
export function createPlayerFunnelLaser() {
    if (!starship || !canvas) return;
    const laser = {
        id: Date.now() + Math.random(),
        enemy: null,
        startTime: Date.now(),
        phase: 'growing',
        growDuration: 2000,
        disintegrateDuration: 1000,
        x: starship.x + starship.width / 2,
        y: starship.y, // départ du vaisseau
        currentWidth: 1,
        maxWidth: 160,
        length: canvas.height, // tir vers le haut
        funnelRadius: 1,
        maxFunnelRadius: 80,
        funnelHeight: 60,
        opacity: 1,
        glowIntensity: 0,
        maxGlowIntensity: 25,
        disintegrationParticles: [],
        particleSpawnRate: 0,
        edgeColor: '#87CEEB',
        coreColor: '#FFFFFF',
        glowColor: '#00BFFF',
        funnelSegments: 32,
        funnelWaveAmplitude: 0,
        funnelWaveFrequency: 0.1,
        funnelWavePhase: 0,
        orientation: -1 // -1 = vers le haut
    };
    playerFunnelLasers.push(laser);
}

// ========================================
// MISE À JOUR DU LASER
// ========================================

export function updateFunnelLasers() {
    for (let i = funnelLasers.length - 1; i >= 0; i--) {
        const laser = funnelLasers[i];
        const elapsed = Date.now() - laser.startTime;
        
        // Suivre la position de l'ennemi s'il existe encore
        if (laser.enemy && enemies.includes(laser.enemy)) {
            laser.x = laser.enemy.x + laser.enemy.width / 2;
            laser.y = laser.enemy.y + laser.enemy.height;
        }
        
        // PHASE 1: CROISSANCE (0 à 3 secondes)
        if (laser.phase === 'growing') {
            const growProgress = Math.min(elapsed / laser.growDuration, 1);
            
            // Interpolation cubique pour une croissance plus naturelle
            const easeProgress = easeInOutCubic(growProgress);
            
            // Croissance de la largeur du laser
            laser.currentWidth = 1 + (laser.maxWidth - 1) * easeProgress;
            
            // Croissance de l'entonnoir
            laser.funnelRadius = 1 + (laser.maxFunnelRadius - 1) * easeProgress;
            
            // Augmentation progressive de la lueur
            laser.glowIntensity = laser.maxGlowIntensity * easeProgress;
            
            // Petites ondulations de l'entonnoir pendant la croissance
            laser.funnelWaveAmplitude = 3 * Math.sin(elapsed * 0.003);
            laser.funnelWavePhase += 0.05;
            
            // Passer à la phase de désintégration après 3 secondes
            if (elapsed >= laser.growDuration) {
                laser.phase = 'disintegrating';
                laser.disintegrationStartTime = Date.now();
                initializeDisintegration(laser);
            }
        }
        
        // PHASE 2: DÉSINTÉGRATION (3 à 4.5 secondes)
        else if (laser.phase === 'disintegrating') {
            const disintegrateElapsed = Date.now() - laser.disintegrationStartTime;
            const disintegrateProgress = Math.min(disintegrateElapsed / laser.disintegrateDuration, 1);
            
            // Réduction de l'opacité
            laser.opacity = 1 - disintegrateProgress;
            
            // Le laser se fragmente progressivement
            laser.currentWidth = laser.maxWidth * (1 - disintegrateProgress * 0.5);
            
            // L'entonnoir se déforme et se brise
            laser.funnelWaveAmplitude = 10 + 20 * disintegrateProgress;
            laser.funnelWavePhase += 0.1 + disintegrateProgress * 0.2;
            
            // Génération de particules de désintégration
            if (Math.random() < 0.8) {
                generateDisintegrationParticles(laser);
            }
            
            // Mise à jour des particules
            updateLaserParticles(laser);
            
            // Fin du laser
            if (disintegrateProgress >= 1) {
                laser.phase = 'complete';
                // Libérer l'ennemi du laser
                if (laser.enemy) {
                    enemiesWithActiveLasers.delete(laser.enemy);
                }
                funnelLasers.splice(i, 1);
            }
        }
    }
    // MàJ laser joueur (mêmes phases, orientation inversée)
    for (let i = playerFunnelLasers.length - 1; i >= 0; i--) {
        const laser = playerFunnelLasers[i];
        const elapsed = Date.now() - laser.startTime;
        // suivre le joueur
        laser.x = starship.x + starship.width / 2;
        laser.y = starship.y - 2; // léger offset pour éviter le chevauchement visuel
        if (laser.phase === 'growing') {
            const growProgress = Math.min(elapsed / laser.growDuration, 1);
            const easeProgress = easeInOutCubic(growProgress);
            laser.currentWidth = 1 + (laser.maxWidth - 1) * easeProgress;
            laser.funnelRadius = 1 + (laser.maxFunnelRadius - 1) * easeProgress;
            laser.glowIntensity = laser.maxGlowIntensity * easeProgress;
            laser.funnelWaveAmplitude = 3 * Math.sin(elapsed * 0.003);
            laser.funnelWavePhase += 0.05;
            if (elapsed >= laser.growDuration) {
                laser.phase = 'disintegrating';
                laser.disintegrationStartTime = Date.now();
                initializeDisintegration(laser);
            }
        } else if (laser.phase === 'disintegrating') {
            const disintegrateElapsed = Date.now() - laser.disintegrationStartTime;
            const disintegrateProgress = Math.min(disintegrateElapsed / laser.disintegrateDuration, 1);
            laser.opacity = 1 - disintegrateProgress;
            laser.currentWidth = laser.maxWidth * (1 - disintegrateProgress * 0.5);
            laser.funnelWaveAmplitude = 10 + 20 * disintegrateProgress;
            laser.funnelWavePhase += 0.1 + disintegrateProgress * 0.2;
            if (Math.random() < 0.8) generateDisintegrationParticles(laser);
            updateLaserParticles(laser);
            if (disintegrateProgress >= 1) {
                laser.phase = 'complete';
                playerFunnelLasers.splice(i, 1);
            }
        }
    }
}

// ========================================
// RENDU DU LASER
// ========================================

export function drawFunnelLasers(ctx) {
    const drawOne = (laser) => {
        ctx.save();
        ctx.globalAlpha = laser.opacity;
        
        // 1. DESSINER L'ENTONNOIR (partie supérieure arrondie)
        drawFunnelTop(ctx, laser);
        
        // 2. DESSINER LE CORPS DU LASER
        drawLaserBeam(ctx, laser);
        
        // 3. DESSINER LES PARTICULES DE DÉSINTÉGRATION
        if (laser.phase === 'disintegrating') {
            drawDisintegrationParticles(ctx, laser);
        }
        
        // 4. EFFET DE LUEUR GLOBAL
        applyLaserGlow(ctx, laser);
        
        ctx.restore();
    };
    funnelLasers.forEach(drawOne);
    playerFunnelLasers.forEach(drawOne);
}

// Dessiner l'entonnoir au sommet du laser
function drawFunnelTop(ctx, laser) {
    ctx.save();
    
    // Créer un gradient radial pour l'entonnoir
    const centerY = (laser.orientation === -1)
        ? (laser.y - laser.funnelRadius * 0.3)  // décaler vers le haut pour ne pas dépasser sous le vaisseau
        : laser.y;
    const funnelGradient = ctx.createRadialGradient(
        laser.x, centerY, 0,
        laser.x, centerY, laser.funnelRadius
    );
    funnelGradient.addColorStop(0, laser.coreColor);
    funnelGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
    funnelGradient.addColorStop(0.6, laser.edgeColor);
    funnelGradient.addColorStop(1, 'rgba(135, 206, 235, 0.3)');
    
    // Dessiner l'entonnoir avec une forme complexe
    ctx.beginPath();
    
    // Créer une forme d'entonnoir arrondie avec des segments
    for (let i = 0; i <= laser.funnelSegments; i++) {
        const angle = (i / laser.funnelSegments) * Math.PI * 2;
        
        // Ajouter des ondulations pendant la croissance/désintégration
        const waveOffset = Math.sin(angle * 3 + laser.funnelWavePhase) * laser.funnelWaveAmplitude;
        const radius = laser.funnelRadius + waveOffset;
        
        // Calculer la position en créant une forme d'entonnoir elliptique
        const x = laser.x + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * 0.3; // Écrasé verticalement pour l'effet plat
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fillStyle = funnelGradient;
    ctx.fill();
    
    // Ajouter un contour lumineux
    ctx.strokeStyle = laser.glowColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = laser.glowColor;
    ctx.shadowBlur = laser.glowIntensity;
    ctx.stroke();
    
    // Dessiner la connexion entre l'entonnoir et le laser
    const connectionGradient = ctx.createLinearGradient(
        laser.x - laser.currentWidth/2, laser.y,
        laser.x + laser.currentWidth/2, laser.y
    );
    connectionGradient.addColorStop(0, 'transparent');
    connectionGradient.addColorStop(0.2, laser.edgeColor);
    connectionGradient.addColorStop(0.5, laser.coreColor);
    connectionGradient.addColorStop(0.8, laser.edgeColor);
    connectionGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = connectionGradient;
    // connexion entonnoir → selon orientation
    if (laser.orientation === -1) {
        ctx.fillRect(
            laser.x - laser.currentWidth/2,
            laser.y - laser.funnelHeight,
            laser.currentWidth,
            laser.funnelHeight
        );
    } else {
        ctx.fillRect(
            laser.x - laser.currentWidth/2,
            laser.y,
            laser.currentWidth,
            laser.funnelHeight
        );
    }
    
    ctx.restore();
}

// Dessiner le corps principal du laser
function drawLaserBeam(ctx, laser) {
    // Créer un gradient horizontal pour l'effet bleu ciel vers blanc
    const beamGradient = ctx.createLinearGradient(
        laser.x - laser.currentWidth/2, laser.y + laser.funnelHeight,
        laser.x + laser.currentWidth/2, laser.y + laser.funnelHeight
    );
    
    // Configuration du gradient (bleu ciel sur les bords, blanc au centre)
    beamGradient.addColorStop(0, 'rgba(135, 206, 235, 0.1)');    // Transparent sur le bord extrême
    beamGradient.addColorStop(0.1, laser.edgeColor);              // Bleu ciel
    beamGradient.addColorStop(0.3, 'rgba(173, 216, 230, 0.9)');  // Bleu clair
    beamGradient.addColorStop(0.5, laser.coreColor);              // Blanc au centre
    beamGradient.addColorStop(0.7, 'rgba(173, 216, 230, 0.9)');  // Bleu clair
    beamGradient.addColorStop(0.9, laser.edgeColor);              // Bleu ciel
    beamGradient.addColorStop(1, 'rgba(135, 206, 235, 0.1)');    // Transparent sur le bord extrême
    
    // Dessiner le faisceau principal
    ctx.fillStyle = beamGradient;
    if (laser.orientation === -1) {
        // vers le haut
        ctx.fillRect(
            laser.x - laser.currentWidth/2,
            laser.y - laser.length,
            laser.currentWidth,
            laser.length - laser.funnelHeight
        );
    } else {
        // vers le bas (ennemi)
        ctx.fillRect(
            laser.x - laser.currentWidth/2,
            laser.y + laser.funnelHeight,
            laser.currentWidth,
            laser.length - laser.funnelHeight
        );
    }
    
    // Ajouter un coeur blanc brillant au centre
    if (laser.currentWidth > 20) {
        const coreWidth = laser.currentWidth * 0.3;
        const coreGradient = ctx.createLinearGradient(
            laser.x - coreWidth/2, laser.y + laser.funnelHeight,
            laser.x + coreWidth/2, laser.y + laser.funnelHeight
        );
        coreGradient.addColorStop(0, 'transparent');
        coreGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
        coreGradient.addColorStop(0.5, '#FFFFFF');
        coreGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.7)');
        coreGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = coreGradient;
        ctx.fillRect(
            laser.x - coreWidth/2,
            laser.y + laser.funnelHeight,
            coreWidth,
            laser.length - laser.funnelHeight
        );
    }
    
    // Effet de lignes énergétiques dans le laser
    if (laser.phase === 'growing' && laser.currentWidth > 10) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        
        // Lignes énergétiques qui montent
        for (let i = 0; i < 3; i++) {
            const xOffset = (i - 1) * laser.currentWidth * 0.3;
            const waveOffset = Math.sin(Date.now() * 0.01 + i) * 5;
            
            ctx.beginPath();
            ctx.moveTo(laser.x + xOffset + waveOffset, laser.y + laser.funnelHeight);
            ctx.lineTo(laser.x + xOffset + waveOffset, laser.y + laser.length);
            ctx.stroke();
        }
    }
}

// Effet de lueur autour du laser
function applyLaserGlow(ctx, laser) {
    if (laser.glowIntensity > 0) {
        ctx.save();
        ctx.globalAlpha = laser.opacity * 0.5;
        ctx.shadowColor = laser.glowColor;
        ctx.shadowBlur = laser.glowIntensity;
        
        // Halo externe
        ctx.strokeStyle = laser.glowColor;
        ctx.lineWidth = laser.currentWidth * 0.1;
        ctx.beginPath();
        ctx.moveTo(laser.x, laser.y);
        ctx.lineTo(laser.x, laser.y + laser.length);
        ctx.stroke();
        
        ctx.restore();
    }
}

// ========================================
// SYSTÈME DE DÉSINTÉGRATION
// ========================================

function initializeDisintegration(laser) {
    laser.particleSpawnRate = 0.9;
    laser.disintegrationParticles = [];
}

function generateDisintegrationParticles(laser) {
    const particleCount = Math.floor(laser.currentWidth / 10);
    
    for (let i = 0; i < particleCount; i++) {
        // Position aléatoire le long du laser
        const yPosition = laser.y + Math.random() * laser.length;
        const xOffset = (Math.random() - 0.5) * laser.currentWidth;
        
        laser.disintegrationParticles.push({
            x: laser.x + xOffset,
            y: yPosition,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2 - 3,
            size: 2 + Math.random() * 4,
            opacity: 1,
            color: Math.random() > 0.5 ? laser.coreColor : laser.edgeColor,
            lifetime: 30 + Math.random() * 30,
            glowing: Math.random() > 0.7
        });
    }
    
    // Particules spéciales pour l'entonnoir
    if (Math.random() < 0.5) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * laser.funnelRadius;
            
            laser.disintegrationParticles.push({
                x: laser.x + Math.cos(angle) * radius,
                y: laser.y + Math.sin(angle) * radius * 0.3,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) - 2,
                size: 3 + Math.random() * 3,
                opacity: 1,
                color: laser.glowColor,
                lifetime: 40,
                glowing: true,
                trail: []
            });
        }
    }
}

function updateLaserParticles(laser) {
    for (let i = laser.disintegrationParticles.length - 1; i >= 0; i--) {
        const particle = laser.disintegrationParticles[i];
        
        // Mise à jour de la position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Gravité légère
        particle.vy += 0.1;
        
        // Friction
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        
        // Réduction de la durée de vie
        particle.lifetime--;
        particle.opacity = particle.lifetime / 40;
        particle.size *= 0.97;
        
        // Ajouter à la trainée si applicable
        if (particle.trail) {
            particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
            if (particle.trail.length > 5) particle.trail.shift();
        }
        
        // Supprimer les particules mortes
        if (particle.lifetime <= 0 || particle.size < 0.5) {
            laser.disintegrationParticles.splice(i, 1);
        }
    }
}

function drawDisintegrationParticles(ctx, laser) {
    laser.disintegrationParticles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity * laser.opacity;
        
        // Dessiner la trainée si elle existe
        if (particle.trail) {
            particle.trail.forEach((point, index) => {
                ctx.globalAlpha = point.opacity * (index / particle.trail.length) * 0.5;
                ctx.fillStyle = particle.color;
                ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
            });
            ctx.globalAlpha = particle.opacity * laser.opacity;
        }
        
        // Particule principale
        if (particle.glowing) {
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 10;
        }
        
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// ========================================
// INTÉGRATION AVEC LE SYSTÈME EXISTANT
// ========================================

export function shootFunnelLaser(enemy) {
    const enemyId = `${enemy.x}_${enemy.y}_${enemy.type}`;
    const currentTime = Date.now();
    const lastShootTime = enemyShootTimers.get(enemyId) || 0;
    
    // ENEMY10 (type 9) - Laser Entonnoir toutes les 8 secondes
    if (currentTime - lastShootTime >= 8000) {
        createFunnelLaser(enemy);
        enemyShootTimers.set(enemyId, currentTime);
        return true;
    }
    
    return false;
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

function easeInOutCubic(t) {
    return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Fonction pour vérifier la collision avec le laser (pour le système de jeu)
export function checkLaserCollision(player) {
    for (let laser of funnelLasers) {
        if (laser.phase === 'growing') {
            // Zone de l'entonnoir
            const funnelDist = Math.sqrt(
                Math.pow(player.x + player.width/2 - laser.x, 2) +
                Math.pow(player.y + player.height/2 - laser.y, 2) * 0.09 // Écrasement vertical
            );
            
            if (funnelDist < laser.funnelRadius) {
                return true; // Collision avec l'entonnoir
            }
            
            // Zone du faisceau
            if (player.x < laser.x + laser.currentWidth/2 &&
                player.x + player.width > laser.x - laser.currentWidth/2 &&
                player.y > laser.y) {
                return true; // Collision avec le faisceau
            }
        }
    }
    return false;
}

// Vérifier si un ennemi a un laser actif
export function hasActiveLaser(enemy) {
    return enemiesWithActiveLasers.has(enemy);
}

// Nettoyage
export function clearFunnelLasers() {
    funnelLasers = [];
    laserParticles = [];
    enemyShootTimers.clear();
    enemiesWithActiveLasers.clear();
}

// Variables exportées en haut du fichier
