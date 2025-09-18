// player_shooting_modes.js - Modes de tir spéciaux du joueur selon les power-ups Néon
import { canvas, ctx } from './globals_simple.js';
import { starship } from './player_simple.js';

// Variables pour les projectiles spéciaux du joueur
export let playerSpecialBullets = [];

// État des power-ups Néon actifs sur le joueur
let activeNeonPowerUps = {
    speed: 1,
    multishot: 1,
    damage: 1
};

// Variables de contrôle du tir
let lastShootTime = 0;
const baseShootInterval = 200; // Intervalle de base entre les tirs

// ========================================
// GESTION DES POWER-UPS NÉON
// ========================================

// Activer un power-up Néon sur le joueur
export function activatePlayerNeonPowerUp(type, value) {
    activeNeonPowerUps[type] = value;
    
    // Connecter avec le système de tirs multiples
    if (window.setShootingMode) {
        switch(type) {
            case 'speed':
                window.setShootingMode('enemy2'); // Spirale cyan
                break;
            case 'multishot':
                window.setShootingMode('enemy4'); // Tir violet ondulant
                break;
            case 'damage':
                window.setShootingMode('enemy1'); // Laser jaune pulsant
                break;
        }
    }
    
    console.log(`🎯 Power-up Néon activé sur le joueur: ${type} +${value}`);
}

// Obtenir la valeur d'un power-up actif
function getPowerUpValue(type) {
    return activeNeonPowerUps[type] || 1;
}

// ========================================
// MODE 1: LASERS (Power-up Vitesse) - Utilise lasers.js
// ========================================

function createPulsingLaser(x, y) {
    const speed = getPowerUpValue('speed');
    const damage = getPowerUpValue('damage');
    
    return {
        type: 'pulsing_laser',
        x: x,
        y: y,
        width: 8 * damage,
        height: 20,
        vx: 0,
        vy: -15 * speed,
        color: '#04fbac',
        pulsePhase: 0,
        pulseSpeed: 0.2,
        glowIntensity: 10 * damage,
        trail: [],
        // Propriétés spécifiques au laser pulsé
        minWidth: 6 * damage,
        maxWidth: 12 * damage,
        pulseIntensity: 0.8
    };
}

function createSweepingLaser(x, y) {
    const damage = getPowerUpValue('damage');
    
    return {
        type: 'sweeping_laser',
        x: x,
        y: y,
        width: 6 * damage,
        height: 25,
        vx: 0,
        vy: -12,
        sweepPhase: 0,
        sweepAmplitude: 3,
        sweepSpeed: 0.15,
        color: '#00ffff',
        glowIntensity: 8 * damage,
        // Propriétés spécifiques au laser balayant
        sweepRange: 20,
        sweepDirection: 1
    };
}

// ========================================
// MODE 2: LASER BEAM (Power-up Multishot) - Utilise laser_beam.js
// ========================================

function createLaserBeam(x, y) {
    const damage = getPowerUpValue('damage');
    const speed = getPowerUpValue('speed');
    
    return {
        type: 'laser_beam',
        x: x,
        y: y,
        width: 4 * damage,
        height: 30,
        vx: 0,
        vy: -18 * speed,
        color: '#ff00ff',
        glowIntensity: 15 * damage,
        sweepSpeed: 0.1 * speed,
        sweepPhase: 0,
        // Propriétés spécifiques au laser beam
        beamIntensity: 0.9,
        sweepRange: 15,
        energyPulse: 0
    };
}

// ========================================
// MODE 3: ELECTRIC LASER (Power-up Dégâts) - Utilise electric_laser_serpentine.js
// ========================================

function createElectricLaser(x, y) {
    const damage = getPowerUpValue('damage');
    const speed = getPowerUpValue('speed');
    
    return {
        type: 'electric_laser',
        x: x,
        y: y,
        width: 10 * damage,
        height: 35 * damage,
        vx: 0,
        vy: -14 * speed,
        color: '#ff00ff',
        electricArcs: [],
        pulsePhase: 0,
        pulseSpeed: 0.15,
        trail: [],
        arcSpawnTimer: 0,
        // Propriétés spécifiques au laser électrique
        length: 25 * damage,
        arcFrequency: 0.3,
        electricIntensity: 0.8,
        serpentinePhase: 0
    };
}

// ========================================
// SYSTÈME DE TIR PRINCIPAL
// ========================================

export function shootPlayerSpecialBullet() {
    if (!starship || !canvas) {
        console.log('⚠️ shootPlayerSpecialBullet: starship ou canvas manquant');
        return;
    }
    
    const currentTime = Date.now();
    const shootInterval = baseShootInterval / getPowerUpValue('speed');
    
    // Vérifier l'intervalle de tir
    if (currentTime - lastShootTime < shootInterval) {
        console.log(`⏱️ Tir bloqué par intervalle: ${currentTime - lastShootTime}ms < ${shootInterval}ms`);
        return;
    }
    
    const centerX = starship.x + starship.width / 2;
    const centerY = starship.y;
    
    // Décider du type de tir selon les power-ups actifs
    const bulletTypes = [];
    
    // Mode 1: Lasers (si speed > 1) - Utilise lasers.js
    if (getPowerUpValue('speed') > 1) {
        bulletTypes.push('pulsing_laser', 'sweeping_laser');
        console.log('🎯 Mode 1 activé: Lasers (pulsés + balayants)');
    }
    
    // Mode 2: Laser Beam (si multishot > 1) - Utilise laser_beam.js
    if (getPowerUpValue('multishot') > 1) {
        for (let i = 0; i < getPowerUpValue('multishot'); i++) {
            bulletTypes.push('laser_beam');
        }
        console.log(`🎯 Mode 2 activé: Laser Beam (${getPowerUpValue('multishot')} projectiles)`);
    }
    
    // Mode 3: Electric Laser (si damage > 1) - Utilise electric_laser_serpentine.js
    if (getPowerUpValue('damage') > 1) {
        bulletTypes.push('electric_laser');
        console.log('🎯 Mode 3 activé: Laser Électrique');
    }
    
    // Si aucun power-up actif, tirer un laser de base
    if (bulletTypes.length === 0) {
        bulletTypes.push('pulsing_laser');
        console.log('🎯 Mode par défaut: Laser de base');
    }
    
    console.log(`🚀 Création de ${bulletTypes.length} projectiles:`, bulletTypes);
    
    // Créer les projectiles
    bulletTypes.forEach((type, index) => {
        let bullet;
        let offsetX = 0;
        
        // Décalage pour le multishot
        if (type === 'laser_beam' && bulletTypes.length > 1) {
            offsetX = (index - (bulletTypes.length - 1) / 2) * 15;
        }
        
        switch (type) {
            case 'pulsing_laser':
                bullet = createPulsingLaser(centerX + offsetX, centerY);
                break;
            case 'sweeping_laser':
                bullet = createSweepingLaser(centerX + offsetX, centerY);
                break;
            case 'laser_beam':
                bullet = createLaserBeam(centerX + offsetX, centerY);
                break;
            case 'electric_laser':
                bullet = createElectricLaser(centerX + offsetX, centerY);
                break;
        }
        
        if (bullet) {
            playerSpecialBullets.push(bullet);
            console.log(`✅ Projectile créé: ${type} à (${bullet.x}, ${bullet.y})`);
        }
    });
    
    lastShootTime = currentTime;
    console.log(`📊 Total projectiles actifs: ${playerSpecialBullets.length}`);
}

// ========================================
// MISE À JOUR DES PROJECTILES
// ========================================

export function updatePlayerSpecialBullets() {
    if (playerSpecialBullets.length > 0) {
        console.log(`🔄 Mise à jour de ${playerSpecialBullets.length} projectiles spéciaux`);
    }
    
    for (let i = playerSpecialBullets.length - 1; i >= 0; i--) {
        const bullet = playerSpecialBullets[i];
        
        // Mise à jour selon le type
        switch (bullet.type) {
            case 'pulsing_laser':
                updatePulsingLaser(bullet);
                break;
            case 'sweeping_laser':
                updateSweepingLaser(bullet);
                break;
            case 'laser_beam':
                updateLaserBeam(bullet);
                break;
            case 'electric_laser':
                updateElectricLaser(bullet);
                break;
        }
        
        // Supprimer si hors écran
        if (bullet.y + bullet.height < 0 || 
            bullet.y > canvas.height || 
            bullet.x < -50 || 
            bullet.x > canvas.width + 50) {
            playerSpecialBullets.splice(i, 1);
            console.log(`🗑️ Projectile supprimé (hors écran): ${bullet.type}`);
        }
    }
}

function updatePulsingLaser(bullet) {
    bullet.y += bullet.vy;
    bullet.pulsePhase += bullet.pulseSpeed;
    
    // Pulsation de la largeur (comme dans lasers.js)
    bullet.width = bullet.minWidth + (bullet.maxWidth - bullet.minWidth) * 
                   (Math.sin(bullet.pulsePhase) * 0.5 + 0.5);
    
    // Trainée
    bullet.trail.push({ x: bullet.x, y: bullet.y, width: bullet.width, opacity: 0.6 });
    if (bullet.trail.length > 5) bullet.trail.shift();
}

function updateSweepingLaser(bullet) {
    bullet.y += bullet.vy;
    bullet.sweepPhase += bullet.sweepSpeed;
    
    // Mouvement de balayage horizontal (comme dans lasers.js)
    bullet.x += Math.sin(bullet.sweepPhase) * bullet.sweepAmplitude;
    
    // Changement de direction périodique
    if (bullet.sweepPhase > Math.PI * 2) {
        bullet.sweepDirection *= -1;
        bullet.sweepPhase = 0;
    }
}

function updateLaserBeam(bullet) {
    bullet.y += bullet.vy;
    bullet.sweepPhase += bullet.sweepSpeed;
    bullet.energyPulse += 0.1;
    
    // Balayage léger (comme dans laser_beam.js)
    bullet.x += Math.sin(bullet.sweepPhase) * 2;
    
    // Pulsation d'énergie
    bullet.beamIntensity = 0.7 + Math.sin(bullet.energyPulse) * 0.3;
}

function updateElectricLaser(bullet) {
    bullet.y += bullet.vy;
    bullet.pulsePhase += bullet.pulseSpeed;
    bullet.arcSpawnTimer++;
    bullet.serpentinePhase += 0.1;
    
    // Pulsation (comme dans electric_laser_serpentine.js)
    bullet.width = 10 * getPowerUpValue('damage') + Math.sin(bullet.pulsePhase) * 3;
    
    // Mouvement serpentin léger
    bullet.x += Math.sin(bullet.serpentinePhase) * 1.5;
    
    // Générer des arcs électriques
    if (bullet.arcSpawnTimer % 10 === 0) {
        bullet.electricArcs.push({
            angle: Math.random() * Math.PI * 2,
            length: 15 + Math.random() * 10,
            lifetime: 8,
            segments: 3
        });
    }
    
    // Mise à jour des arcs
    bullet.electricArcs = bullet.electricArcs.filter(arc => {
        arc.lifetime--;
        return arc.lifetime > 0;
    });
    
    // Trainée
    bullet.trail.push({ x: bullet.x, y: bullet.y, width: bullet.width, opacity: 0.5 });
    if (bullet.trail.length > 8) bullet.trail.shift();
}

// ========================================
// RENDU DES PROJECTILES
// ========================================

export function drawPlayerSpecialBullets() {
    if (playerSpecialBullets.length > 0) {
        console.log(`🎨 Rendu de ${playerSpecialBullets.length} projectiles spéciaux`);
    }
    
    playerSpecialBullets.forEach(bullet => {
        switch (bullet.type) {
            case 'pulsing_laser':
                drawPulsingLaser(bullet);
                break;
            case 'sweeping_laser':
                drawSweepingLaser(bullet);
                break;
            case 'laser_beam':
                drawLaserBeam(bullet);
                break;
            case 'electric_laser':
                drawElectricLaser(bullet);
                break;
        }
    });
}

function drawPulsingLaser(bullet) {
    ctx.save();
    
    // Trainée
    bullet.trail.forEach((point, index) => {
        ctx.globalAlpha = point.opacity * (index / bullet.trail.length);
        ctx.fillStyle = bullet.color;
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = bullet.glowIntensity * 0.5;
        ctx.fillRect(point.x - point.width/2, point.y, point.width, point.height);
    });
    
    // Laser principal avec effet de pulsation
    ctx.globalAlpha = 1;
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = bullet.glowIntensity;
    
    // Effet de pulsation comme dans lasers.js
    const pulseGlow = bullet.glowIntensity * (0.8 + Math.sin(bullet.pulsePhase) * 0.2);
    ctx.shadowBlur = pulseGlow;
    
    ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height);
    
    ctx.restore();
}

function drawSweepingLaser(bullet) {
    ctx.save();
    
    // Effet de balayage comme dans lasers.js
    const sweepIntensity = Math.sin(bullet.sweepPhase) * 0.3 + 0.7;
    
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = bullet.glowIntensity * sweepIntensity;
    ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height);
    
    ctx.restore();
}

function drawLaserBeam(bullet) {
    ctx.save();
    
    // Effet de laser beam comme dans laser_beam.js
    const energyIntensity = bullet.beamIntensity;
    
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = bullet.glowIntensity * energyIntensity;
    
    // Rendu avec intensité variable
    ctx.globalAlpha = energyIntensity;
    ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height);
    
    ctx.restore();
}

function drawElectricLaser(bullet) {
    ctx.save();
    
    // Trainée avec effet de transparence
    bullet.trail.forEach((point, index) => {
        ctx.globalAlpha = point.opacity * (index / bullet.trail.length);
        ctx.fillStyle = bullet.color;
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 5;
        ctx.fillRect(point.x - point.width/2, point.y, point.width, point.height);
    });
    
    // Laser principal
    ctx.globalAlpha = 1;
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = bullet.glowIntensity;
    ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height);
    
    // Arcs électriques (comme dans electric_laser_serpentine.js)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 3;
    
    bullet.electricArcs.forEach(arc => {
        ctx.globalAlpha = arc.lifetime / 8;
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
    
    ctx.restore();
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

export function clearPlayerSpecialBullets() {
    playerSpecialBullets = [];
}

export function getPlayerPowerUpStatus() {
    return { ...activeNeonPowerUps };
}

export function resetPlayerPowerUps() {
    activeNeonPowerUps = { speed: 1, multishot: 1, damage: 1 };
}
