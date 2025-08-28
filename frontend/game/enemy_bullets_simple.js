// enemy_bullets_simple.js - Gestion avancée des tirs des ennemis de façon modulaire
import { canvas, ctx } from './globals_simple.js';
import { enemies } from './enemies_simple.js';
import { starship } from './player_simple.js';
import { shootFunnelLaser } from './funnel_laser_simple.js';

// ========================================
// VARIABLES ET CONFIGURATION
// ========================================

export let enemyBullets = [];
export let enemyLasers = [];              // Nouveau : lasers persistants
export let wavePatterns = [];             // Nouveau : patterns d'ondes
export let particleEffects = [];          // Nouveau : effets de particules
let growingBullets = [];
let enemyShootTimers = new Map();
let laserChargeEffects = new Map();       // Effets de charge pour lasers
let enemyShootingInterval = null;

// Configuration générale
let enemyBulletSpeedMultiplier = 1;
const maxEnemyBullets = 150;
const maxEnemyLasers = 10;

// ========================================
// NOUVEAUX TYPES DE PROJECTILES
// ========================================

const PROJECTILE_TYPES = {
    LASER_BEAM: 'laser_beam',
    PULSE_LASER: 'pulse_laser',
    WAVE_SHOT: 'wave_shot',
    SPIRAL_SHOT: 'spiral_shot',
    SCATTER_SHOT: 'scatter_shot',
    HOMING_MISSILE: 'homing_missile',
    PLASMA_ORB: 'plasma_orb',
    LIGHTNING_BOLT: 'lightning_bolt',
    SONIC_WAVE: 'sonic_wave',
    BLACK_HOLE: 'black_hole'
};

// NOUVEAU: Appliquer la difficulté au démarrage
function applyDifficultySettings() {
    const savedDifficulty = localStorage.getItem('gameDifficulty') || 'medium';
    
    const difficultyValues = {
        'easy': { enemyBulletSpeed: 2 },
        'medium': { enemyBulletSpeed: 3 },
        'hard': { enemyBulletSpeed: 4 },
        'master': { enemyBulletSpeed: 5 }
    };
    
    const settings = difficultyValues[savedDifficulty];
    enemyBulletSpeedMultiplier = settings.enemyBulletSpeed / 3; // Normaliser par rapport à medium
    
    console.log(`🎯 Vitesse projectiles ennemis (${savedDifficulty}): ${settings.enemyBulletSpeed}`);
}

// ========================================
// FONCTION PRINCIPALE DE TIR
// ========================================

export function shootEnemyBullets() {
    enemies.forEach((enemy, enemyIndex) => {
        // Probabilité de tir selon le type d'ennemi
        const shootChance = getShootChance(enemy.type);
        if (Math.random() > shootChance) return;

        const enemyId = `${enemy.x}_${enemy.y}_${enemy.type}_${enemyIndex}`;
        const currentTime = Date.now();
        const lastShootTime = enemyShootTimers.get(enemyId) || 0;
        
        // Système de tir selon le type d'ennemi
        switch(enemy.type) {
            case 0: // ENEMY1 - Laser jaune pulsant (ancien sophistiqué)
                if (currentTime - lastShootTime >= 3000) {
                    createPulsingLaser(enemy, "#FFD700", 2, 120, 3, 2500);  // Jaune vif
                    enemyShootTimers.set(enemyId, currentTime);
                }
                break;
                
            case 1: // ENEMY2 - Spirale cyan (ancien sophistiqué) 
                if (currentTime - lastShootTime >= 2000) {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            if (enemies.includes(enemy)) {
                                createWaveBullet(enemy, "cyan", 8, 3.5, 30, 0.006 + i * 0.001);
                            }
                        }, i * 200);
                    }
                    enemyShootTimers.set(enemyId, currentTime);
                }
                break;
                
            case 2: // ENEMY3 - Double laser rouge qui SUIT l'ennemi à 7px
                if (currentTime - lastShootTime >= 1200) {
                    createFollowingLaser(enemy, "red", 3, 80, 5);
                    setTimeout(() => {
                        if (enemies.includes(enemy)) {
                            createFollowingLaser(enemy, "orange", 2, 60, 6);
                        }
                    }, 300);
                    enemyShootTimers.set(enemyId, currentTime);
                }
                break;
                
            case 3: // ENEMY4 - Tir violet ondulant (ancien sophistiqué)
                if (currentTime - lastShootTime >= 1800) {
                    createWaveBullet(enemy, "purple", 14, 4, 50, 0.005);
                    enemyShootTimers.set(enemyId, currentTime);
                }
                break;
                
            case 4: // ENEMY5 - Laser vert pulsant (ancien sophistiqué)
                if (currentTime - lastShootTime >= 2500) {
                    createPulsingLaser(enemy, "green", 8, 90, 2.5, 1500);
                    enemyShootTimers.set(enemyId, currentTime);
                }
                break;
                
            case 5: // ENEMY6 - Onde sonique qui SUIT l'ennemi à 7px
                if (currentTime - lastShootTime >= 5000) {
                    createFollowingSonicWave(enemy);
                    enemyShootTimers.set(enemyId, currentTime);
                }
                break;
                
            case 6: // TYPE 6 = ENEMY7 (enemy4.jpg substitut) - Laser pulsé avancé
                if (currentTime - lastShootTime >= 3000) {
                    createPulseLaser(enemy);
                    enemyShootTimers.set(enemyId, currentTime);
                }
                break;
                
            case 7: // TYPE 7 = ENEMY8 (enemy5.jpg substitut) - Tir en onde sinusoïdale avancé
                if (currentTime - lastShootTime >= 2000) {
                    createWaveShot(enemy);
                    enemyShootTimers.set(enemyId, currentTime);
                }
                break;
                
            case 8: // TYPE 8 = ENEMY9 (enemy6.jpg substitut) - 🌈 SPIRALE ARC-EN-CIEL 🌈
                if (currentTime - lastShootTime >= 800) {  // PLUS FRÉQUENT: 0.8s au lieu de 2.5s
                    createSpiralShot(enemy);
                    enemyShootTimers.set(enemyId, currentTime);
                }
                break;
                
            case 9: // TYPE 9 = ENEMY10 - LASER ENTONNOIR
                if (shootFunnelLaser(enemy)) {
                    // Le timer est géré dans shootFunnelLaser
                }
                break;
        }
    });
    
    // Limiter le nombre total de projectiles
    if (enemyBullets.length > maxEnemyBullets) {
        enemyBullets = enemyBullets.slice(-maxEnemyBullets);
    }
    if (enemyLasers.length > maxEnemyLasers) {
        enemyLasers = enemyLasers.slice(-maxEnemyLasers);
    }
}

// ========================================
// ANCIENNES FONCTIONS SOPHISTIQUÉES (ENEMY1-6)
// ========================================

// Créer un laser pulsant (pour ENEMY1 et ENEMY5)
function createPulsingLaser(enemy, color, minWidth, height, speed, pulseDuration) {
    const laser = {
        centerX: enemy.x + enemy.width / 2,  // Position centrale fixe
        x: enemy.x + enemy.width / 2 - minWidth / 2,
        y: enemy.y + enemy.height,
        minWidth: minWidth,
        maxWidth: minWidth * 3,
        currentWidth: minWidth,
        height: height,
        vy: speed * enemyBulletSpeedMultiplier,
        color: color,
        startTime: Date.now(),
        pulseDuration: pulseDuration,
        isPulsingLaser: true,
        glowIntensity: 15
    };
    
    pulsingLasers.push(laser);
}

// Créer un tir ondulant (pour ENEMY2 et ENEMY4)
function createWaveBullet(enemy, color, size, speed, amplitude, frequency) {
    waveBullets.push({
        x: enemy.x + enemy.width / 2 - size / 2,
        y: enemy.y + enemy.height,
        startX: enemy.x + enemy.width / 2 - size / 2,
        width: size,
        height: size,
        vy: speed * enemyBulletSpeedMultiplier,
        amplitude: amplitude,
        frequency: frequency,
        startTime: Date.now(),
        color: color,
        isWaveBullet: true,
        glowIntensity: 5
    });
}

// Créer un laser qui suit l'ennemi à 7px (pour ENEMY3)
function createFollowingLaser(enemy, color, width, height, speed) {
    const followingLaser = {
        x: enemy.x + enemy.width / 2 - width / 2,
        y: enemy.y + enemy.height + 7,  // 7px du nez
        width: width,
        height: height,
        vy: speed * enemyBulletSpeedMultiplier,
        color: color,
        isFollowingLaser: true,
        enemyReference: enemy,
        offsetY: enemy.height + 7,
        glowIntensity: 10,
        isGrowing: true,
        startTime: Date.now()
    };
    
    enemyBullets.push(followingLaser);
}

// Créer une onde sonique qui suit l'ennemi à 7px (pour ENEMY6)
function createFollowingSonicWave(enemy) {
    const followingWave = {
        type: 'following_sonic_wave',
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height + 7,  // 7px du nez
        radius: 0,
        maxRadius: 100,
        expansionSpeed: 3,
        color: 'rgba(100, 200, 255, 0.5)',
        enemyReference: enemy,
        offsetY: enemy.height + 7,
        ringCount: 2,
        rings: [],
        damage: 1,
        active: true,
        startTime: Date.now()
    };
    
    // Créer les anneaux
    for (let i = 0; i < followingWave.ringCount; i++) {
        followingWave.rings.push({
            radius: 0,
            delay: i * 150,
            opacity: 1 - (i * 0.3),
            thickness: 2 - i * 0.3
        });
    }
    
    enemyBullets.push(followingWave);
}

// Variables pour les anciens types
let pulsingLasers = [];
let waveBullets = [];

// ========================================
// LASER PULSÉ AVANCÉ (pour ENEMY7-9)
// ========================================

function createPulseLaser(enemy) {
    // Effet de charge avant le tir
    createLaserChargeEffect(enemy);
    
    setTimeout(() => {
        if (!enemies.includes(enemy)) return;
        
        const laser = {
            type: PROJECTILE_TYPES.PULSE_LASER,
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            width: 4,
            baseWidth: 4,
            maxWidth: 25,
            length: canvas.height,
            color: '#00ffff',
            glowColor: '#00ddff',
            pulseSpeed: 0.1,
            pulsePhase: 0,
            damage: 2,
            duration: 2000,
            startTime: Date.now(),
            opacity: 1,
            particles: []
        };
        
        enemyLasers.push(laser);
        createLaserImpactEffect(laser);
    }, 500); // Délai de charge
}

// ========================================
// TIR EN ONDE SINUSOÏDALE
// ========================================

function createWaveShot(enemy) {
    const wavePattern = {
        type: PROJECTILE_TYPES.WAVE_SHOT,
        originX: enemy.x + enemy.width / 2,
        originY: enemy.y + enemy.height,
        bullets: [],
        waveLength: 50,
        amplitude: 30,
        frequency: 0.1,
        speed: 4 * enemyBulletSpeedMultiplier,
        color: '#ff00ff',
        glowIntensity: 15,
        bulletCount: 8,
        phase: 0
    };
    
    // Créer plusieurs projectiles formant une onde
    for (let i = 0; i < wavePattern.bulletCount; i++) {
        const bullet = {
            x: wavePattern.originX,
            y: wavePattern.originY + (i * 10),
            baseX: wavePattern.originX,
            width: 6,
            height: 6,
            vx: 0,
            vy: wavePattern.speed,
            color: wavePattern.color,
            waveOffset: i * Math.PI / 4,
            amplitude: wavePattern.amplitude,
            frequency: wavePattern.frequency,
            glowing: true,
            trail: []
        };
        
        enemyBullets.push(bullet);
        wavePattern.bullets.push(bullet);
    }
    
    wavePatterns.push(wavePattern);
}

// ========================================
// TIR EN SPIRALE
// ========================================

function createSpiralShot(enemy) {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height;
    const spiralCount = 3;
    const bulletPerSpiral = 12;
    
    
    for (let s = 0; s < spiralCount; s++) {
        for (let i = 0; i < bulletPerSpiral; i++) {
            const angle = (i / bulletPerSpiral) * Math.PI * 2 + (s * Math.PI * 2 / spiralCount);
            const delay = i * 50; // Décalage temporel pour créer la spirale
            
            setTimeout(() => {
                if (!enemies.includes(enemy)) return;
                
                const bullet = {
                    type: PROJECTILE_TYPES.SPIRAL_SHOT,
                    x: centerX,
                    y: centerY,
                    width: 8,
                    height: 8,
                    angle: angle,
                    radius: 0,
                    radiusSpeed: 2,
                    rotationSpeed: 0.05,
                    color: `hsl(${(i * 30) % 360}, 100%, 50%)`,
                    glowing: true,
                    maxRadius: 200,
                    trail: []
                };
                
                enemyBullets.push(bullet);
            }, delay);
        }
    }
}

// ========================================
// LASER BALAYANT
// ========================================

function createSweepingLaser(enemy) {
    // Effet de charge avec particules
    createChargeParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height);
    
    setTimeout(() => {
        if (!enemies.includes(enemy)) return;
        
        const laser = {
            type: PROJECTILE_TYPES.LASER_BEAM,
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            targetX: starship.x + starship.width / 2,
            targetY: starship.y + starship.height / 2,
            width: 3,
            sweepAngle: -Math.PI / 4,
            sweepSpeed: 0.02,
            sweepRange: Math.PI / 2,
            color: '#ff0000',
            glowColor: '#ff6666',
            intensity: 1,
            duration: 3000,
            startTime: Date.now(),
            damageZones: [],
            particleTrail: []
        };
        
        enemyLasers.push(laser);
    }, 800);
}

// ========================================
// ORBE DE PLASMA
// ========================================

function createPlasmaOrb(enemy) {
    const orb = {
        type: PROJECTILE_TYPES.PLASMA_ORB,
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        width: 20,
        height: 20,
        vx: 0,
        vy: 2 * enemyBulletSpeedMultiplier,
        color: '#9400d3',
        coreColor: '#ffffff',
        energy: 1,
        pulsating: true,
        pulsePhase: 0,
        fragmentOnImpact: true,
        trail: [],
        electricArcs: []
    };
    
    enemyBullets.push(orb);
}

// ========================================
// ONDE SONIQUE EXPANSIVE
// ========================================

function createSonicWave(enemy) {
    const wave = {
        type: PROJECTILE_TYPES.SONIC_WAVE,
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        radius: 0,
        maxRadius: 300,
        expansionSpeed: 5,
        color: 'rgba(100, 200, 255, 0.3)',
        ringCount: 3,
        rings: [],
        damage: 1,
        active: true
    };
    
    // Créer plusieurs anneaux concentriques
    for (let i = 0; i < wave.ringCount; i++) {
        wave.rings.push({
            radius: 0,
            delay: i * 200,
            opacity: 1 - (i * 0.2),
            thickness: 3 - i * 0.5
        });
    }
    
    wavePatterns.push(wave);
}

// ========================================
// MISE À JOUR DES PROJECTILES
// ========================================

export function updateEnemyBullets() {
    if (!canvas) return;
    
    // Mise à jour des balles standards et avancées
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        
        switch(bullet.type) {
            case PROJECTILE_TYPES.SPIRAL_SHOT:
                updateSpiralBullet(bullet, i);
                break;
                
            case PROJECTILE_TYPES.PLASMA_ORB:
                updatePlasmaOrb(bullet, i);
                break;
                
            default:
                updateStandardBullet(bullet, i);
        }
    }
    
    // Mise à jour des lasers
    updateLasers();
    
    // Mise à jour des patterns d'ondes
    updateWavePatterns();
    
    // Mise à jour des anciens types sophistiqués
    updatePulsingLasers();
    updateWaveBullets();
    
    // Mise à jour des effets de particules
    updateParticleEffects();
}

function updateStandardBullet(bullet, index) {
    // NOUVEAUX TYPES QUI SUIVENT L'ENNEMI
    
    // Laser qui suit l'ennemi (ENEMY3)
    if (bullet.isFollowingLaser && bullet.enemyReference) {
        if (enemies.includes(bullet.enemyReference)) {
            // Suivre l'ennemi à 7px du nez
            bullet.x = bullet.enemyReference.x + bullet.enemyReference.width / 2 - bullet.width / 2;
            bullet.y = bullet.enemyReference.y + bullet.offsetY;
        } else {
            // Ennemi détruit → continuer en ligne droite
            bullet.y += bullet.vy;
        }
    }
    // Onde sonique qui suit l'ennemi (ENEMY6)
    else if (bullet.type === 'following_sonic_wave' && bullet.enemyReference) {
        if (enemies.includes(bullet.enemyReference)) {
            // Suivre l'ennemi à 7px du nez
            bullet.x = bullet.enemyReference.x + bullet.enemyReference.width / 2;
            bullet.y = bullet.enemyReference.y + bullet.offsetY;
        }
        
        // Expansion des anneaux
        bullet.rings.forEach(ring => {
            if (ring.delay > 0) {
                ring.delay -= 16; // ~60fps
            } else {
                ring.radius += bullet.expansionSpeed;
            }
        });
        
        // Supprimer si tous les anneaux ont dépassé le rayon max
        const allExpired = bullet.rings.every(ring => ring.radius > bullet.maxRadius);
        if (allExpired) {
            enemyBullets.splice(index, 1);
            return;
        }
    }
    // Mouvement standard
    else {
        bullet.x += bullet.vx || 0;
        bullet.y += bullet.vy || 0;
        
        // Effet d'onde sinusoïdale
        if (bullet.waveOffset !== undefined) {
            bullet.x = bullet.baseX + Math.sin(Date.now() * bullet.frequency + bullet.waveOffset) * bullet.amplitude;
        }
    }
    
    // Traînée
    if (bullet.trail) {
        bullet.trail.push({ x: bullet.x, y: bullet.y, opacity: 1 });
        if (bullet.trail.length > 8) bullet.trail.shift();
    }
    
    // Supprimer si hors écran (sauf les types qui suivent)
    if (!bullet.isFollowingLaser && bullet.type !== 'following_sonic_wave' && isOutOfBounds(bullet)) {
        enemyBullets.splice(index, 1);
    }
}

function updateSpiralBullet(bullet, index) {
    bullet.radius += bullet.radiusSpeed;
    bullet.angle += bullet.rotationSpeed;
    
    bullet.x = bullet.x + Math.cos(bullet.angle) * bullet.radiusSpeed;
    bullet.y = bullet.y + Math.sin(bullet.angle) * bullet.radiusSpeed;
    
    // Ajouter à la trainée
    bullet.trail.push({ x: bullet.x, y: bullet.y, opacity: 1 });
    if (bullet.trail.length > 10) bullet.trail.shift();
    
    // Supprimer si hors limites
    if (bullet.radius > bullet.maxRadius || isOutOfBounds(bullet)) {
        enemyBullets.splice(index, 1);
    }
}

function updatePlasmaOrb(orb, index) {
    orb.x += orb.vx;
    orb.y += orb.vy;
    orb.pulsePhase += 0.1;
    
    // Pulsation
    if (orb.pulsating) {
        orb.width = 20 + Math.sin(orb.pulsePhase) * 5;
        orb.height = orb.width;
    }
    
    // Arcs électriques aléatoires
    if (Math.random() < 0.3) {
        orb.electricArcs.push({
            angle: Math.random() * Math.PI * 2,
            length: 15 + Math.random() * 10,
            lifetime: 5
        });
    }
    
    // Mise à jour des arcs
    orb.electricArcs = orb.electricArcs.filter(arc => {
        arc.lifetime--;
        return arc.lifetime > 0;
    });
    
    // Trainée
    orb.trail.push({ 
        x: orb.x, 
        y: orb.y, 
        size: orb.width * 0.8,
        opacity: 0.5 
    });
    if (orb.trail.length > 8) orb.trail.shift();
    
    if (isOutOfBounds(orb)) {
        enemyBullets.splice(index, 1);
    }
}

function updateLasers() {
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        const laser = enemyLasers[i];
        const elapsed = Date.now() - laser.startTime;
        
        if (elapsed > laser.duration) {
            // Effet de disparition
            createLaserFadeEffect(laser);
            enemyLasers.splice(i, 1);
            continue;
        }
        
        switch(laser.type) {
            case PROJECTILE_TYPES.PULSE_LASER:
                // Pulsation du laser
                laser.pulsePhase += laser.pulseSpeed;
                laser.width = laser.baseWidth + 
                    Math.sin(laser.pulsePhase) * (laser.maxWidth - laser.baseWidth) / 2 + 
                    (laser.maxWidth - laser.baseWidth) / 2;
                
                // Générer des particules le long du laser
                if (Math.random() < 0.5) {
                    createLaserParticle(laser);
                }
                break;
                
            case PROJECTILE_TYPES.LASER_BEAM:
                // Balayage du laser
                laser.sweepAngle += laser.sweepSpeed;
                if (Math.abs(laser.sweepAngle) > laser.sweepRange / 2) {
                    laser.sweepSpeed *= -1;
                }
                break;
        }
        
        // Fade in/out
        if (elapsed < 200) {
            laser.opacity = elapsed / 200;
        } else if (elapsed > laser.duration - 200) {
            laser.opacity = (laser.duration - elapsed) / 200;
        }
    }
}

function updateWavePatterns() {
    for (let i = wavePatterns.length - 1; i >= 0; i--) {
        const wave = wavePatterns[i];
        
        if (wave.type === PROJECTILE_TYPES.SONIC_WAVE) {
            // Mise à jour des anneaux
            wave.rings.forEach(ring => {
                if (ring.delay > 0) {
                    ring.delay -= 16; // ~60fps
                } else {
                    ring.radius += wave.expansionSpeed;
                }
            });
            
            // Supprimer si tous les anneaux ont dépassé le rayon max
            const allExpired = wave.rings.every(ring => ring.radius > wave.maxRadius);
            if (allExpired) {
                wavePatterns.splice(i, 1);
            }
        }
    }
}

// Mise à jour des lasers pulsants (anciens)
function updatePulsingLasers() {
    for (let i = pulsingLasers.length - 1; i >= 0; i--) {
        const laser = pulsingLasers[i];
        laser.y += laser.vy;

        // Pulsation: largeur varie sinusoidalement
        const elapsed = Date.now() - laser.startTime;
        const progress = (elapsed % laser.pulseDuration) / laser.pulseDuration;
        laser.currentWidth = laser.minWidth + (laser.maxWidth - laser.minWidth) * Math.abs(Math.sin(progress * Math.PI));

        // Centrer la largeur changeante par rapport au centre fixe
        laser.x = laser.centerX - laser.currentWidth / 2;

        if (laser.y > canvas.height) {
            pulsingLasers.splice(i, 1);
        }
    }
}

// Mise à jour des tirs ondulants (anciens)
function updateWaveBullets() {
    for (let i = waveBullets.length - 1; i >= 0; i--) {
        const wave = waveBullets[i];
        const elapsed = Date.now() - wave.startTime;
        wave.y += wave.vy;

        // Mouvement sinusoidal horizontal
        wave.x = wave.startX + wave.amplitude * Math.sin(elapsed * wave.frequency);

        if (wave.y > canvas.height || wave.x < -wave.width || wave.x > canvas.width) {
            waveBullets.splice(i, 1);
        }
    }
}

// ========================================
// RENDU VISUEL
// ========================================

export function drawEnemyBullets() {
    if (!ctx) return;
    
    // Dessiner les trainées d'abord (derrière les projectiles)
    drawTrails();
    
    // Dessiner les ondes
    drawWavePatterns();
    
    // Dessiner les lasers
    drawLasers();
    
    // Dessiner les projectiles
    enemyBullets.forEach(bullet => {
        ctx.save();
        
        switch(bullet.type) {
            case PROJECTILE_TYPES.SPIRAL_SHOT:
                drawSpiralBullet(bullet);
                break;
                
            case PROJECTILE_TYPES.PLASMA_ORB:
                drawPlasmaOrb(bullet);
                break;
                
            default:
                drawStandardBullet(bullet);
        }
        
        ctx.restore();
    });
    
    // Dessiner les effets de particules
    drawParticleEffects();
    
    // Dessiner les anciens types sophistiqués
    drawPulsingLasers();
    drawWaveBullets();
    
    // Dessiner les balles qui grossissent
    drawGrowingBullets();
}

function drawStandardBullet(bullet) {
    // Onde sonique qui suit (ENEMY6)
    if (bullet.type === 'following_sonic_wave') {
        bullet.rings.forEach(ring => {
            if (ring.radius > 0 && ring.radius < bullet.maxRadius) {
                ctx.strokeStyle = bullet.color;
                ctx.lineWidth = ring.thickness;
                ctx.globalAlpha = ring.opacity * (1 - ring.radius / bullet.maxRadius);
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, ring.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Distorsion visuelle
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = ring.thickness * 0.5;
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, ring.radius * 0.95, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
        ctx.globalAlpha = 1;
    }
    // Laser qui suit (ENEMY3)
    else if (bullet.isFollowingLaser) {
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = bullet.glowIntensity;
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Contour pour laser
        ctx.strokeStyle = bullet.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
    // Projectile standard
    else {
        // Effet de lueur si spécifié
        if (bullet.glowing) {
            ctx.shadowColor = bullet.color;
            ctx.shadowBlur = 10;
        }
        
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Contour pour plus de visibilité
        ctx.strokeStyle = bullet.color;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawSpiralBullet(bullet) {
    
    // Traînée colorée
    bullet.trail.forEach((point, i) => {
        ctx.globalAlpha = (i / bullet.trail.length) * 0.7;
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, bullet.width/3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
    
    // Projectile principal avec lueur
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Centre brillant
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.width/4, 0, Math.PI * 2);
    ctx.fill();
}

function drawLasers() {
    enemyLasers.forEach(laser => {
        ctx.save();
        ctx.globalAlpha = laser.opacity;
        
        if (laser.type === PROJECTILE_TYPES.PULSE_LASER) {
            // Gradient pour le laser
            const gradient = ctx.createLinearGradient(
                laser.x - laser.width/2, laser.y,
                laser.x + laser.width/2, laser.y
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.2, laser.color);
            gradient.addColorStop(0.5, '#ffffff');
            gradient.addColorStop(0.8, laser.color);
            gradient.addColorStop(1, 'transparent');
            
            // Corps du laser
            ctx.fillStyle = gradient;
            ctx.fillRect(
                laser.x - laser.width/2, 
                laser.y, 
                laser.width, 
                laser.length
            );
            
            // Effet de lueur
            ctx.shadowColor = laser.glowColor;
            ctx.shadowBlur = laser.width;
            ctx.fillRect(
                laser.x - laser.width/4, 
                laser.y, 
                laser.width/2, 
                laser.length
            );
            
            // Particules le long du laser
            laser.particles.forEach(p => {
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
            });
            
        } else if (laser.type === PROJECTILE_TYPES.LASER_BEAM) {
            // Laser avec angle de balayage
            ctx.save();
            ctx.translate(laser.x, laser.y);
            ctx.rotate(laser.sweepAngle);
            
            const laserLength = canvas.height;
            const gradient = ctx.createLinearGradient(0, 0, 0, laserLength);
            gradient.addColorStop(0, laser.color);
            gradient.addColorStop(0.5, laser.glowColor);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(-laser.width/2, 0, laser.width, laserLength);
            
            // Effet de chaleur/distorsion
            ctx.shadowColor = laser.glowColor;
            ctx.shadowBlur = laser.width * 3;
            ctx.strokeStyle = laser.color;
            ctx.lineWidth = laser.width * 0.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, laserLength);
            ctx.stroke();
            
            ctx.restore();
        }
        
        ctx.restore();
    });
}

function drawPlasmaOrb(orb) {
    // Trainée
    orb.trail.forEach((t, i) => {
        ctx.globalAlpha = (i / orb.trail.length) * 0.5;
        const gradient = ctx.createRadialGradient(
            t.x, t.y, 0,
            t.x, t.y, t.size/2
        );
        gradient.addColorStop(0, orb.coreColor);
        gradient.addColorStop(0.5, orb.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size/2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
    
    // Orbe principal avec gradient
    const gradient = ctx.createRadialGradient(
        orb.x, orb.y, 0,
        orb.x, orb.y, orb.width/2
    );
    gradient.addColorStop(0, orb.coreColor);
    gradient.addColorStop(0.3, orb.color);
    gradient.addColorStop(0.7, orb.color);
    gradient.addColorStop(1, 'rgba(148, 0, 211, 0.2)');
    
    // Lueur externe
    ctx.shadowColor = orb.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Core brillant
    ctx.shadowBlur = 0;
    ctx.fillStyle = orb.coreColor;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.width/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Arcs électriques
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 5;
    orb.electricArcs.forEach(arc => {
        ctx.globalAlpha = arc.lifetime / 5;
        ctx.beginPath();
        ctx.moveTo(orb.x, orb.y);
        const endX = orb.x + Math.cos(arc.angle) * arc.length;
        const endY = orb.y + Math.sin(arc.angle) * arc.length;
        
        // Arc électrique avec zigzag
        const segments = 3;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = orb.x + (endX - orb.x) * t + (Math.random() - 0.5) * 5;
            const y = orb.y + (endY - orb.y) * t + (Math.random() - 0.5) * 5;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    });
}

function drawWavePatterns() {
    wavePatterns.forEach(wave => {
        if (wave.type === PROJECTILE_TYPES.SONIC_WAVE) {
            wave.rings.forEach(ring => {
                if (ring.radius > 0 && ring.radius < wave.maxRadius) {
                    ctx.strokeStyle = wave.color;
                    ctx.lineWidth = ring.thickness;
                    ctx.globalAlpha = ring.opacity * (1 - ring.radius / wave.maxRadius);
                    ctx.beginPath();
                    ctx.arc(wave.x, wave.y, ring.radius, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Distorsion visuelle
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.lineWidth = ring.thickness * 0.5;
                    ctx.beginPath();
                    ctx.arc(wave.x, wave.y, ring.radius * 0.95, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });
        }
    });
}

function drawTrails() {
    enemyBullets.forEach(bullet => {
        if (bullet.trail && bullet.trail.length > 1) {
            bullet.trail.forEach((point, i) => {
                ctx.globalAlpha = (i / bullet.trail.length) * 0.3;
                ctx.fillStyle = bullet.color;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    });
    ctx.globalAlpha = 1;
}

// Dessiner les lasers pulsants (anciens)
function drawPulsingLasers() {
    
    pulsingLasers.forEach((laser, index) => {
        ctx.save();
        ctx.fillStyle = laser.color;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = laser.glowIntensity;
        
        // Dessiner comme rectangle avec largeur variable
        ctx.fillRect(laser.x, laser.y, laser.currentWidth, laser.height);
        
        // Contour pour plus de visibilité
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(laser.x, laser.y, laser.currentWidth, laser.height);
        
        // Debug: dessiner un point rouge au centre pour vérifier la position
        ctx.fillStyle = 'red';
        ctx.fillRect(laser.centerX - 2, laser.y - 2, 4, 4);
        
        ctx.restore();
    });
}

// Dessiner les tirs ondulants (anciens)
function drawWaveBullets() {
    waveBullets.forEach(wave => {
        ctx.save();
        ctx.fillStyle = wave.color;
        ctx.shadowColor = wave.color;
        ctx.shadowBlur = wave.glowIntensity;
        
        // Cercle pour l'onde
        ctx.beginPath();
        ctx.arc(
            wave.x + wave.width / 2, 
            wave.y + wave.height / 2, 
            wave.width / 2, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Contour pour plus de visibilité
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    });
}

function drawGrowingBullets() {
    growingBullets.forEach(growingBullet => {
        ctx.save();
        
        ctx.fillStyle = growingBullet.color;
        ctx.shadowColor = growingBullet.color;
        ctx.shadowBlur = 5;
        
        // Cercle qui grandit progressivement
        ctx.beginPath();
        ctx.arc(
            growingBullet.x, 
            growingBullet.y, 
            growingBullet.currentSize / 2,  // Rayon actuel
            0, Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    });
}

// ========================================
// EFFETS VISUELS ET PARTICULES
// ========================================

function createLaserChargeEffect(enemy) {
    const effect = {
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        particles: [],
        duration: 500,
        startTime: Date.now()
    };
    
    // Créer des particules convergentes
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const distance = 30 + Math.random() * 20;
        effect.particles.push({
            x: effect.x + Math.cos(angle) * distance,
            y: effect.y + Math.sin(angle) * distance,
            targetX: effect.x,
            targetY: effect.y,
            speed: 0.1,
            size: 2 + Math.random() * 2,
            color: `hsl(${180 + Math.random() * 60}, 100%, 50%)`,
            trail: []
        });
    }
    
    particleEffects.push(effect);
}

function createChargeParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        particleEffects.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3,
            color: '#ffaa00',
            lifetime: 30,
            type: 'charge'
        });
    }
}

function createLaserImpactEffect(laser) {
    // Effet d'impact visuel simple
}

function createLaserFadeEffect(laser) {
    // Effet de disparition visuel simple
}

function createLaserParticle(laser) {
    if (!laser.particles) laser.particles = [];
    
    laser.particles.push({
        x: laser.x + (Math.random() - 0.5) * laser.width,
        y: laser.y + Math.random() * laser.length,
        opacity: 1,
        life: 20
    });
    
    // Nettoyer les anciennes particules
    laser.particles = laser.particles.filter(p => {
        p.life--;
        p.opacity = p.life / 20;
        return p.life > 0;
    });
}

function updateParticleEffects() {
    for (let i = particleEffects.length - 1; i >= 0; i--) {
        const effect = particleEffects[i];
        
        if (effect.type === 'charge') {
            effect.x += effect.vx;
            effect.y += effect.vy;
            effect.vx *= 0.95;
            effect.vy *= 0.95;
            effect.lifetime--;
            effect.size *= 0.95;
            
            if (effect.lifetime <= 0) {
                particleEffects.splice(i, 1);
            }
        } else if (effect.duration) {
            const elapsed = Date.now() - effect.startTime;
            if (elapsed > effect.duration) {
                particleEffects.splice(i, 1);
                continue;
            }
            
            // Mise à jour des particules de charge laser
            effect.particles.forEach(p => {
                p.x += (p.targetX - p.x) * p.speed;
                p.y += (p.targetY - p.y) * p.speed;
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > 5) p.trail.shift();
            });
        }
    }
}

function drawParticleEffects() {
    particleEffects.forEach(effect => {
        if (effect.type === 'charge') {
            ctx.globalAlpha = effect.lifetime / 30;
            ctx.fillStyle = effect.color;
            ctx.shadowColor = effect.color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (effect.particles) {
            effect.particles.forEach(p => {
                // Trainée
                p.trail.forEach((t, i) => {
                    ctx.globalAlpha = i / p.trail.length * 0.5;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(t.x - 1, t.y - 1, 2, 2);
                });
                
                // Particule principale
                ctx.globalAlpha = 1;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    });
    
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

function isOutOfBounds(obj) {
    return obj.x < -50 || obj.x > canvas.width + 50 || 
           obj.y < -50 || obj.y > canvas.height + 50;
}

function getShootChance(enemyType) {
    const chances = {
        0: 0.7,  // 70% de chance
        1: 0.75,
        2: 0.8,
        3: 0.65,
        4: 0.7,
        5: 0.6,
        6: 0.9   // Boss
    };
    return chances[enemyType] || 0.7;
}

// ========================================
// PATTERN DE BOSS
// ========================================

function executeBossPattern(boss, currentTime) {
    const lastPattern = enemyShootTimers.get('boss_pattern') || 0;
    const patternInterval = 8000; // Change de pattern toutes les 8 secondes
    
    if (currentTime - lastPattern >= patternInterval) {
        const patterns = [
            () => createCircularBarrage(boss),
            () => createLaserGrid(boss),
            () => createHomingMissiles(boss),
            () => createBlackHole(boss)
        ];
        
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        randomPattern();
        enemyShootTimers.set('boss_pattern', currentTime);
    }
}

function createCircularBarrage(boss) {
    const centerX = boss.x + boss.width / 2;
    const centerY = boss.y + boss.height / 2;
    const bulletCount = 24;
    
    for (let i = 0; i < bulletCount; i++) {
        const angle = (i / bulletCount) * Math.PI * 2;
        const speed = 3 * enemyBulletSpeedMultiplier;
        
        enemyBullets.push({
            x: centerX,
            y: centerY,
            width: 10,
            height: 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: `hsl(${i * 15}, 100%, 50%)`,
            glowing: true,
            trail: []
        });
    }
}

function createLaserGrid(boss) {
    // Implémentation simple pour éviter les erreurs
    console.log('Laser Grid pattern activated');
}

function createHomingMissiles(boss) {
    // Implémentation simple pour éviter les erreurs
    console.log('Homing Missiles pattern activated');
}

function createBlackHole(boss) {
    // Implémentation simple pour éviter les erreurs
    console.log('Black Hole pattern activated');
}

// ========================================
// FONCTIONS DE GESTION
// ========================================

// Démarrer le tir automatique des ennemis
export function startEnemyShooting() {
    if (enemyShootingInterval) return; // Éviter les doublons
    
    // Appliquer les paramètres de difficulté
    applyDifficultySettings();
    
    // Les ennemis tirent toutes les 1 seconde
    enemyShootingInterval = setInterval(() => {
        shootEnemyBullets();
    }, 1000);
    
    console.log('🎯 Système de tir avancé démarré avec difficulté');
}

// Arrêter le tir automatique des ennemis
export function stopEnemyShooting() {
    if (enemyShootingInterval) {
        clearInterval(enemyShootingInterval);
        enemyShootingInterval = null;
        console.log('🎯 Système de tir avancé arrêté');
    }
}

// Fonction pour obtenir le nombre de projectiles ennemis
export function getEnemyBulletCount() {
    return enemyBullets.length + enemyLasers.length;
}

// Export des fonctions de nettoyage
export function clearEnemyBullets() {
    enemyBullets = [];
    enemyLasers = [];
    wavePatterns = [];
    particleEffects = [];
    growingBullets = [];
    pulsingLasers = [];
    waveBullets = [];
}

export function clearAllProjectiles() {
    clearEnemyBullets();
}

export function pauseProjectiles() {
    // Sauvegarder l'état pour pause
    return {
        bullets: [...enemyBullets],
        lasers: [...enemyLasers],
        waves: [...wavePatterns],
        particles: [...particleEffects]
    };
}

export function resumeProjectiles(state) {
    if (state) {
        enemyBullets = state.bullets;
        enemyLasers = state.lasers;
        wavePatterns = state.waves;
        particleEffects = state.particles;
    }
}
