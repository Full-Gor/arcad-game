// vortex_system.js - Système de Vortex du Subespace avec téléportation
import { canvas, ctx } from './globals_simple.js';

// Système de Vortex du Subespace avec téléportation
let vortexSystem = {
    vortexPairs: [],
    maxPairs: 2,
    spawnTimer: 0,
    spawnInterval: 600, // 10 secondes à 60fps
    
    // Configuration visuelle
    config: {
        minRadius: 30,
        maxRadius: 50,
        spiralArms: 5,
        rotationSpeed: 0.05,
        
        // Couleurs pour l'entrée
        entryColors: {
            core: { r: 150, g: 0, b: 255 },      // Violet profond
            mid: { r: 100, g: 50, b: 200 },      // Violet moyen
            edge: { r: 0, g: 100, b: 255 },      // Bleu électrique
            glow: '#9400ff'
        },
        
        // Couleurs pour la sortie
        exitColors: {
            core: { r: 0, g: 255, b: 150 },      // Cyan-vert
            mid: { r: 50, g: 200, b: 100 },      // Vert moyen
            edge: { r: 100, g: 255, b: 0 },      // Vert-jaune
            glow: '#00ff96'
        }
    },
    
    // Entités téléportées (pour éviter la téléportation en boucle)
    teleportedEntities: [],
    
    // Animation
    time: 0
};

// Initialiser le système de vortex
export function initVortexSystem(canvasWidth, canvasHeight) {
    vortexSystem.canvasWidth = canvasWidth;
    vortexSystem.canvasHeight = canvasHeight;
    vortexSystem.vortexPairs = [];
    vortexSystem.teleportedEntities = [];
    
    console.log('🌀 Système de vortex initialisé');
}

// Créer une paire de vortex liés
function createVortexPair() {
    // Position aléatoire pour l'entrée
    const entryX = 100 + Math.random() * (vortexSystem.canvasWidth - 200);
    const entryY = 100 + Math.random() * (vortexSystem.canvasHeight - 200);
    
    // Position aléatoire pour la sortie (éloignée de l'entrée)
    let exitX, exitY;
    do {
        exitX = 100 + Math.random() * (vortexSystem.canvasWidth - 200);
        exitY = 100 + Math.random() * (vortexSystem.canvasHeight - 200);
    } while (Math.sqrt(Math.pow(exitX - entryX, 2) + Math.pow(exitY - entryY, 2)) < 400);
    
    const pairId = Date.now() + Math.random();
    
    // Créer le vortex d'entrée
    const entryVortex = createVortex(entryX, entryY, 'entry', pairId);
    
    // Créer le vortex de sortie
    const exitVortex = createVortex(exitX, exitY, 'exit', pairId);
    
    // Lier les deux vortex
    entryVortex.linkedVortex = exitVortex;
    exitVortex.linkedVortex = entryVortex;
    
    // Ajouter la paire au système
    vortexSystem.vortexPairs.push({
        id: pairId,
        entry: entryVortex,
        exit: exitVortex,
        lifespan: 600, // 10 secondes
        active: true,
        formation: 0 // Animation d'apparition
    });
    
    // Effet d'ouverture
    createOpeningEffect(entryVortex);
    createOpeningEffect(exitVortex);
    
    console.log('🌀 Nouvelle paire de vortex créée');
}

// Créer un vortex individuel
function createVortex(x, y, type, pairId) {
    return {
        id: Date.now() + Math.random(),
        pairId: pairId,
        type: type, // 'entry' ou 'exit'
        x: x,
        y: y,
        radius: vortexSystem.config.minRadius,
        targetRadius: vortexSystem.config.maxRadius,
        
        // Animation
        rotation: 0,
        spiralOffset: 0,
        pulsePhase: Math.random() * Math.PI * 2,
        distortionField: [],
        
        // Particules
        particles: [],
        energyRings: [],
        lightningBolts: [],
        
        // État
        isActive: true,
        pulling: false,
        teleportingEntity: null,
        
        // Effets visuels
        glowIntensity: 0.5,
        coreSize: 5,
        eventHorizon: 30
    };
}

// Créer l'effet d'ouverture du vortex
function createOpeningEffect(vortex) {
    // Onde de choc initiale
    vortex.shockwave = {
        radius: 0,
        maxRadius: 150,
        opacity: 1,
        speed: 5
    };
    
    // Particules d'énergie qui convergent
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const distance = 100 + Math.random() * 50;
        
        vortex.particles.push({
            x: vortex.x + Math.cos(angle) * distance,
            y: vortex.y + Math.sin(angle) * distance,
            targetX: vortex.x,
            targetY: vortex.y,
            size: 2 + Math.random() * 3,
            speed: 0.05 + Math.random() * 0.05,
            life: 100,
            trail: [],
            color: vortex.type === 'entry' ? 
                   vortexSystem.config.entryColors.edge : 
                   vortexSystem.config.exitColors.edge
        });
    }
    
    // Anneaux d'énergie
    for (let i = 0; i < 3; i++) {
        vortex.energyRings.push({
            radius: 20 + i * 15,
            opacity: 1,
            rotation: Math.random() * Math.PI * 2,
            speed: (0.02 + Math.random() * 0.03) * (i % 2 === 0 ? 1 : -1)
        });
    }
    
    // Champ de distorsion
    initializeDistortionField(vortex);
}

// Initialiser le champ de distorsion spatiale
function initializeDistortionField(vortex) {
    const gridSize = 8;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            vortex.distortionField.push({
                x: (i - gridSize/2) * 20,
                y: (j - gridSize/2) * 20,
                offsetX: 0,
                offsetY: 0,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
}

// Mise à jour du système de vortex
export function updateVortexSystem(entities = []) {
    vortexSystem.time++;
    vortexSystem.spawnTimer++;
    
    // Spawn périodique de nouvelles paires
    if (vortexSystem.spawnTimer >= vortexSystem.spawnInterval && 
        vortexSystem.vortexPairs.length < vortexSystem.maxPairs) {
        createVortexPair();
        vortexSystem.spawnTimer = 0;
    }
    
    // Nettoyer les entités téléportées anciennes
    vortexSystem.teleportedEntities = vortexSystem.teleportedEntities.filter(
        record => vortexSystem.time - record.time < 60 // 1 seconde de cooldown
    );
    
    // Mise à jour de chaque paire de vortex
    vortexSystem.vortexPairs = vortexSystem.vortexPairs.filter(pair => {
        // Animation d'apparition
        if (pair.formation < 1) {
            pair.formation += 0.02;
            pair.entry.radius = vortexSystem.config.minRadius + 
                                (vortexSystem.config.maxRadius - vortexSystem.config.minRadius) * pair.formation;
            pair.exit.radius = pair.entry.radius;
        }
        
        // Réduction de la durée de vie
        pair.lifespan--;
        
        // Animation de fermeture
        if (pair.lifespan < 60) {
            pair.entry.radius *= 0.98;
            pair.exit.radius *= 0.98;
            pair.entry.glowIntensity *= 0.95;
            pair.exit.glowIntensity *= 0.95;
        }
        
        // Mise à jour des vortex individuels
        updateVortex(pair.entry, entities);
        updateVortex(pair.exit, entities);
        
        return pair.lifespan > 0 && pair.entry.radius > 5;
    });
}

// Mise à jour d'un vortex individuel
function updateVortex(vortex, entities) {
    // Rotation de la spirale
    vortex.rotation += vortexSystem.config.rotationSpeed * (vortex.type === 'entry' ? 1 : -1);
    vortex.spiralOffset += 0.1;
    vortex.pulsePhase += 0.05;
    
    // Pulsation du noyau
    vortex.coreSize = 5 + Math.sin(vortex.pulsePhase) * 2;
    
    // Mise à jour du champ de distorsion
    vortex.distortionField.forEach(point => {
        point.phase += 0.05;
        const distance = Math.sqrt(point.x * point.x + point.y * point.y);
        const pull = Math.max(0, 1 - distance / vortex.radius);
        
        point.offsetX = Math.sin(point.phase) * pull * 5;
        point.offsetY = Math.cos(point.phase) * pull * 5;
    });
    
    // Mise à jour des particules
    vortex.particles = vortex.particles.filter(particle => {
        // Mouvement en spirale vers le centre
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 2) {
            // Mouvement en spirale
            const angle = Math.atan2(dy, dx) + 0.1;
            const speed = particle.speed * (1 + (50 - distance) / 50);
            
            particle.x += Math.cos(angle) * speed * distance * 0.1;
            particle.y += Math.sin(angle) * speed * distance * 0.1;
            
            // Ajouter à la traînée
            if (particle.trail.length > 10) particle.trail.shift();
            particle.trail.push({ x: particle.x, y: particle.y });
            
            particle.life--;
            return particle.life > 0;
        } else {
            // Régénérer la particule
            const angle = Math.random() * Math.PI * 2;
            particle.x = vortex.x + Math.cos(angle) * vortex.radius * 1.5;
            particle.y = vortex.y + Math.sin(angle) * vortex.radius * 1.5;
            particle.life = 100;
            return true;
        }
    });
    
    // Régénérer des particules si nécessaire
    while (vortex.particles.length < 20) {
        const angle = Math.random() * Math.PI * 2;
        const distance = vortex.radius + Math.random() * 30;
        
        vortex.particles.push({
            x: vortex.x + Math.cos(angle) * distance,
            y: vortex.y + Math.sin(angle) * distance,
            targetX: vortex.x,
            targetY: vortex.y,
            size: 1 + Math.random() * 2,
            speed: 0.02 + Math.random() * 0.03,
            life: 100,
            trail: [],
            color: vortex.type === 'entry' ? 
                   vortexSystem.config.entryColors.edge : 
                   vortexSystem.config.exitColors.edge
        });
    }
    
    // Mise à jour des anneaux d'énergie
    vortex.energyRings.forEach(ring => {
        ring.rotation += ring.speed;
        ring.opacity = 0.3 + Math.sin(vortexSystem.time * 0.05 + ring.rotation) * 0.3;
    });
    
    // Génération occasionnelle d'éclairs
    if (Math.random() < 0.02) {
        vortex.lightningBolts.push({
            start: Math.random() * Math.PI * 2,
            end: Math.random() * Math.PI * 2,
            life: 10,
            segments: generateLightningPath()
        });
    }
    
    // Mise à jour des éclairs
    vortex.lightningBolts = vortex.lightningBolts.filter(bolt => {
        bolt.life--;
        return bolt.life > 0;
    });
    
    // VÉRIFICATION DES TÉLÉPORTATIONS
    checkTeleportation(vortex, entities);
}

// Vérifier si une entité doit être téléportée
function checkTeleportation(vortex, entities) {
    if (vortex.type !== 'entry') return; // Seules les entrées téléportent
    
    entities.forEach(entity => {
        if (!entity || !entity.x || !entity.y) return;
        
        // Vérifier si l'entité a déjà été téléportée récemment
        const wasRecentlyTeleported = vortexSystem.teleportedEntities.some(
            record => record.entityId === entity.id && 
                     vortexSystem.time - record.time < 60
        );
        
        if (wasRecentlyTeleported) return;
        
        // Calculer la distance au centre du vortex
        const dx = entity.x + (entity.width || 0) / 2 - vortex.x;
        const dy = entity.y + (entity.height || 0) / 2 - vortex.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si l'entité est dans l'horizon des événements
        if (distance < vortex.eventHorizon) {
            // Effet d'aspiration
            if (distance > 5) {
                const pullStrength = 1 - (distance / vortex.eventHorizon);
                entity.x += dx * pullStrength * 0.1;
                entity.y += dy * pullStrength * 0.1;
                
                // Créer des particules d'aspiration
                if (Math.random() < pullStrength) {
                    createSuctionParticles(entity, vortex);
                }
            } else {
                // TÉLÉPORTATION !
                teleportEntity(entity, vortex);
            }
        }
    });
}

// Téléporter une entité
function teleportEntity(entity, entryVortex) {
    const exitVortex = entryVortex.linkedVortex;
    if (!exitVortex) return;
    
    // Calculer la nouvelle position (avec un léger décalage aléatoire)
    const angle = Math.random() * Math.PI * 2;
    const offset = 30 + Math.random() * 20;
    
    entity.x = exitVortex.x + Math.cos(angle) * offset - (entity.width || 0) / 2;
    entity.y = exitVortex.y + Math.sin(angle) * offset - (entity.height || 0) / 2;
    
    // Enregistrer la téléportation pour éviter les boucles
    vortexSystem.teleportedEntities.push({
        entityId: entity.id,
        time: vortexSystem.time
    });
    
    // Effets visuels
    createTeleportEffect(entryVortex);
    createTeleportEffect(exitVortex);
    
    // Message spécial pour le joueur
    if (entity.isPlayer) {
        console.log(`🚀 JOUEUR téléporté de (${entryVortex.x}, ${entryVortex.y}) vers (${exitVortex.x}, ${exitVortex.y})`);
    } else {
        console.log(`🌀 Ennemi téléporté de (${entryVortex.x}, ${entryVortex.y}) vers (${exitVortex.x}, ${exitVortex.y})`);
    }
}

// Créer l'effet de téléportation
function createTeleportEffect(vortex) {
    // Flash lumineux
    vortex.teleportFlash = {
        radius: 0,
        maxRadius: 80,
        opacity: 1
    };
    
    // Explosion de particules
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const speed = 3 + Math.random() * 2;
        
        vortex.particles.push({
            x: vortex.x,
            y: vortex.y,
            targetX: vortex.x + Math.cos(angle) * 100,
            targetY: vortex.y + Math.sin(angle) * 100,
            size: 3 + Math.random() * 2,
            speed: speed * 0.01,
            life: 50,
            trail: [],
            color: { r: 255, g: 255, b: 255 }
        });
    }
}

// Créer des particules d'aspiration
function createSuctionParticles(entity, vortex) {
    const entityCenterX = entity.x + (entity.width || 0) / 2;
    const entityCenterY = entity.y + (entity.height || 0) / 2;
    
    for (let i = 0; i < 3; i++) {
        vortex.particles.push({
            x: entityCenterX + (Math.random() - 0.5) * 20,
            y: entityCenterY + (Math.random() - 0.5) * 20,
            targetX: vortex.x,
            targetY: vortex.y,
            size: 1 + Math.random(),
            speed: 0.05,
            life: 50,
            trail: [],
            color: { r: 100, g: 200, b: 255 }
        });
    }
}

// Générer un chemin d'éclair
function generateLightningPath() {
    const segments = [];
    const count = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i <= count; i++) {
        segments.push({
            radius: 20 + Math.random() * 20,
            offset: (Math.random() - 0.5) * 10
        });
    }
    
    return segments;
}

// Fonction de rendu
export function drawVortexSystem(ctx) {
    vortexSystem.vortexPairs.forEach(pair => {
        drawVortex(ctx, pair.entry);
        drawVortex(ctx, pair.exit);
        
        // Ligne de connexion subtile (optionnel)
        if (pair.formation > 0.5) {
            ctx.save();
            ctx.strokeStyle = 'rgba(150, 100, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 15]);
            ctx.beginPath();
            ctx.moveTo(pair.entry.x, pair.entry.y);
            ctx.lineTo(pair.exit.x, pair.exit.y);
            ctx.stroke();
            ctx.restore();
        }
    });
}

// Dessiner un vortex individuel
function drawVortex(ctx, vortex) {
    const colors = vortex.type === 'entry' ? 
                   vortexSystem.config.entryColors : 
                   vortexSystem.config.exitColors;
    
    ctx.save();
    ctx.translate(vortex.x, vortex.y);
    
    // 1. CHAMP DE DISTORSION (grille déformée)
    ctx.strokeStyle = `rgba(${colors.edge.r}, ${colors.edge.g}, ${colors.edge.b}, 0.2)`;
    ctx.lineWidth = 0.5;
    
    vortex.distortionField.forEach((point, i) => {
        if (i % 8 !== 0) return; // Dessiner seulement certaines lignes
        
        const nextPoint = vortex.distortionField[i + 1];
        if (nextPoint) {
            ctx.beginPath();
            ctx.moveTo(point.x + point.offsetX, point.y + point.offsetY);
            ctx.lineTo(nextPoint.x + nextPoint.offsetX, nextPoint.y + nextPoint.offsetY);
            ctx.stroke();
        }
    });
    
    // 2. ANNEAUX D'ÉNERGIE
    vortex.energyRings.forEach(ring => {
        ctx.save();
        ctx.rotate(ring.rotation);
        
        ctx.strokeStyle = `rgba(${colors.mid.r}, ${colors.mid.g}, ${colors.mid.b}, ${ring.opacity})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.glow;
        
        ctx.beginPath();
        ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Segments lumineux
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * ring.radius;
            const y = Math.sin(angle) * ring.radius;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${ring.opacity * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
    
    // 3. SPIRALE DU VORTEX
    ctx.save();
    ctx.rotate(vortex.rotation);
    
    for (let arm = 0; arm < vortexSystem.config.spiralArms; arm++) {
        const armAngle = (arm / vortexSystem.config.spiralArms) * Math.PI * 2;
        
        const spiralGradient = ctx.createLinearGradient(0, 0, vortex.radius, 0);
        spiralGradient.addColorStop(0, `rgba(${colors.core.r}, ${colors.core.g}, ${colors.core.b}, 0.8)`);
        spiralGradient.addColorStop(0.5, `rgba(${colors.mid.r}, ${colors.mid.g}, ${colors.mid.b}, 0.5)`);
        spiralGradient.addColorStop(1, `rgba(${colors.edge.r}, ${colors.edge.g}, ${colors.edge.b}, 0)`);
        
        ctx.strokeStyle = spiralGradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const spiralRadius = t * vortex.radius;
            const spiralAngle = armAngle + t * Math.PI + vortex.spiralOffset;
            
            const x = Math.cos(spiralAngle) * spiralRadius;
            const y = Math.sin(spiralAngle) * spiralRadius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
    }
    
    ctx.restore();
    
    // 4. HORIZON DES ÉVÉNEMENTS
    const horizonGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, vortex.eventHorizon);
    horizonGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    horizonGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    horizonGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = horizonGradient;
    ctx.beginPath();
    ctx.arc(0, 0, vortex.eventHorizon, 0, Math.PI * 2);
    ctx.fill();
    
    // 5. NOYAU CENTRAL
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, vortex.coreSize);
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    coreGradient.addColorStop(0.3, `rgba(${colors.core.r}, ${colors.core.g}, ${colors.core.b}, 0.9)`);
    coreGradient.addColorStop(1, `rgba(${colors.core.r}, ${colors.core.g}, ${colors.core.b}, 0)`);
    
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, vortex.coreSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 6. ÉCLAIRS
    vortex.lightningBolts.forEach(bolt => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.life / 10})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5;
        ctx.shadowColor = colors.glow;
        
        ctx.beginPath();
        bolt.segments.forEach((segment, i) => {
            const angle = bolt.start + (bolt.end - bolt.start) * (i / bolt.segments.length);
            const x = Math.cos(angle) * (segment.radius + segment.offset);
            const y = Math.sin(angle) * (segment.radius + segment.offset);
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    });
    
    // 7. PARTICULES
    vortex.particles.forEach(particle => {
        // Traînée
        if (particle.trail.length > 1) {
            ctx.strokeStyle = `rgba(${particle.color.r || colors.edge.r}, ${particle.color.g || colors.edge.g}, ${particle.color.b || colors.edge.b}, 0.3)`;
            ctx.lineWidth = particle.size * 0.5;
            ctx.beginPath();
            particle.trail.forEach((point, i) => {
                const x = point.x - vortex.x;
                const y = point.y - vortex.y;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }
        
        // Particule
        const px = particle.x - vortex.x;
        const py = particle.y - vortex.y;
        
        ctx.fillStyle = `rgba(${particle.color.r || colors.edge.r}, ${particle.color.g || colors.edge.g}, ${particle.color.b || colors.edge.b}, ${particle.life / 100})`;
        ctx.beginPath();
        ctx.arc(px, py, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 8. FLASH DE TÉLÉPORTATION
    if (vortex.teleportFlash) {
        vortex.teleportFlash.radius += 5;
        vortex.teleportFlash.opacity *= 0.9;
        
        if (vortex.teleportFlash.opacity > 0.01) {
            const flashGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, vortex.teleportFlash.radius);
            flashGradient.addColorStop(0, `rgba(255, 255, 255, ${vortex.teleportFlash.opacity})`);
            flashGradient.addColorStop(0.5, `rgba(${colors.core.r}, ${colors.core.g}, ${colors.core.b}, ${vortex.teleportFlash.opacity * 0.5})`);
            flashGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = flashGradient;
            ctx.beginPath();
            ctx.arc(0, 0, vortex.teleportFlash.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            vortex.teleportFlash = null;
        }
    }
    
    // 9. INDICATEUR DE TYPE
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = vortex.type === 'entry' ? 'rgba(150, 0, 255, 0.8)' : 'rgba(0, 255, 150, 0.8)';
    ctx.fillText(vortex.type === 'entry' ? 'IN' : 'OUT', 0, vortex.radius + 20);
    
    ctx.restore();
}

// Fonction pour obtenir les vortex actifs (pour les collisions)
export function getActiveVortexes() {
    const vortexes = [];
    vortexSystem.vortexPairs.forEach(pair => {
        vortexes.push(pair.entry);
        vortexes.push(pair.exit);
    });
    return vortexes;
}

// Fonction pour forcer la création d'une paire de vortex
export function forceCreateVortexPair(entryX, entryY, exitX, exitY) {
    const pairId = Date.now() + Math.random();
    
    const entryVortex = createVortex(entryX, entryY, 'entry', pairId);
    const exitVortex = createVortex(exitX, exitY, 'exit', pairId);
    
    entryVortex.linkedVortex = exitVortex;
    exitVortex.linkedVortex = entryVortex;
    
    vortexSystem.vortexPairs.push({
        id: pairId,
        entry: entryVortex,
        exit: exitVortex,
        lifespan: 600,
        active: true,
        formation: 0
    });
    
    createOpeningEffect(entryVortex);
    createOpeningEffect(exitVortex);
    
    console.log('🌀 Paire de vortex forcée créée');
}
