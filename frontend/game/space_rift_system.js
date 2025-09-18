// space_rift_system.js - Système de Failles Spatiales avec effet de fracture
import { canvas, ctx } from './globals_simple.js';

// Système de Failles Spatiales avec effet de fracture
let spaceRiftSystem = {
    riftPairs: [],
    maxPairs: 2,
    spawnTimer: 0,
    spawnInterval: 480, // 8 secondes à 60fps
    
    // Configuration visuelle
    config: {
        baseSize: 80,
        shardCount: 12, // Nombre de fragments
        
        // Couleurs pour les failles
        colors: {
            intact: { r: 100, g: 200, b: 255 },      // Bleu ciel (surface intacte)
            cracks: { r: 255, g: 255, b: 255 },      // Blanc pour les fissures
            edge: { r: 150, g: 0, b: 255 },          // Violet pour les bords
            void: { r: 0, g: 0, b: 0 },              // Noir du vide
            energy: { r: 0, g: 255, b: 255 }         // Cyan pour l'énergie
        }
    },
    
    // Entités téléportées récemment
    teleportedEntities: [],
    
    // Animation globale
    time: 0
};

// Initialiser le système de failles
export function initSpaceRiftSystem(canvasWidth, canvasHeight) {
    spaceRiftSystem.canvasWidth = canvasWidth;
    spaceRiftSystem.canvasHeight = canvasHeight;
    spaceRiftSystem.riftPairs = [];
    spaceRiftSystem.teleportedEntities = [];
    
    // Créer une première paire de failles
    createRiftPair();
    
    console.log('🌀 Système de failles spatiales initialisé');
}

// Créer une paire de failles liées
function createRiftPair() {
    // Positions aléatoires éloignées
    const entryX = 150 + Math.random() * (spaceRiftSystem.canvasWidth - 300);
    const entryY = 150 + Math.random() * (spaceRiftSystem.canvasHeight - 300);
    
    let exitX, exitY;
    do {
        exitX = 150 + Math.random() * (spaceRiftSystem.canvasWidth - 300);
        exitY = 150 + Math.random() * (spaceRiftSystem.canvasHeight - 300);
    } while (Math.sqrt(Math.pow(exitX - entryX, 2) + Math.pow(exitY - entryY, 2)) < 250);
    
    const pairId = Date.now() + Math.random();
    
    // Créer les deux failles
    const entryRift = createRift(entryX, entryY, 'entry', pairId);
    const exitRift = createRift(exitX, exitY, 'exit', pairId);
    
    // Les lier
    entryRift.linkedRift = exitRift;
    exitRift.linkedRift = entryRift;
    
    // Ajouter la paire
    spaceRiftSystem.riftPairs.push({
        id: pairId,
        entry: entryRift,
        exit: exitRift,
        lifespan: 600, // 10 secondes
        active: true
    });
    
    console.log('🌀 Paire de failles créée');
}

// Créer une faille individuelle
function createRift(x, y, type, pairId) {
    const rift = {
        id: Date.now() + Math.random(),
        pairId: pairId,
        type: type,
        x: x,
        y: y,
        size: spaceRiftSystem.config.baseSize,
        
        // État de fracture
        fractureLevel: 0, // 0 = intact, 1 = complètement brisé
        isFractured: false,
        canTeleport: false,
        
        // Fragments (morceaux de verre)
        shards: [],
        cracks: [],
        
        // Animation
        shakeIntensity: 0,
        pulsePhase: 0,
        
        // Particules et effets
        particles: [],
        energyLeaks: [],
        electricArcs: [],
        
        // Zone de téléportation
        teleportRadius: 40
    };
    
    // Initialiser les fragments
    initializeShards(rift);
    
    return rift;
}

// Initialiser les fragments de la faille
function initializeShards(rift) {
    const shardCount = spaceRiftSystem.config.shardCount;
    const centerX = 0;
    const centerY = 0;
    
    // Créer un pattern de Voronoi pour les fragments
    const seeds = [];
    for (let i = 0; i < shardCount; i++) {
        const angle = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const distance = 20 + Math.random() * 30;
        seeds.push({
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance
        });
    }
    
    // Ajouter le centre
    seeds.push({ x: 0, y: 0 });
    
    // Créer les fragments basés sur les seeds
    seeds.forEach((seed, index) => {
        const shard = {
            id: index,
            centerX: seed.x,
            centerY: seed.y,
            originalX: seed.x,
            originalY: seed.y,
            
            // Vertices du fragment (forme polygonale)
            vertices: generateShardVertices(seed, seeds),
            
            // Animation
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            offsetX: 0,
            offsetY: 0,
            drift: Math.random() * Math.PI * 2,
            driftSpeed: 0.01 + Math.random() * 0.02,
            
            // État
            isBroken: false,
            opacity: 1,
            scale: 1,
            crackIntensity: 0
        };
        
        rift.shards.push(shard);
    });
}

// Générer les vertices d'un fragment
function generateShardVertices(seed, allSeeds) {
    const vertices = [];
    const angles = [];
    
    // Trouver les voisins les plus proches
    const neighbors = allSeeds
        .filter(s => s !== seed)
        .sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - seed.x, 2) + Math.pow(a.y - seed.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - seed.x, 2) + Math.pow(b.y - seed.y, 2));
            return distA - distB;
        })
        .slice(0, 6); // Prendre les 6 plus proches
    
    // Créer les points médians avec les voisins
    neighbors.forEach(neighbor => {
        const midX = (seed.x + neighbor.x) / 2 + (Math.random() - 0.5) * 5;
        const midY = (seed.y + neighbor.y) / 2 + (Math.random() - 0.5) * 5;
        const angle = Math.atan2(midY - seed.y, midX - seed.x);
        angles.push({ x: midX - seed.x, y: midY - seed.y, angle: angle });
    });
    
    // Trier par angle pour former un polygone
    angles.sort((a, b) => a.angle - b.angle);
    
    // Créer les vertices
    angles.forEach(a => {
        vertices.push({ x: a.x, y: a.y });
    });
    
    return vertices;
}

// Mise à jour du système
export function updateSpaceRiftSystem(entities = []) {
    spaceRiftSystem.time++;
    spaceRiftSystem.spawnTimer++;
    
    // Spawn périodique
    if (spaceRiftSystem.spawnTimer >= spaceRiftSystem.spawnInterval && 
        spaceRiftSystem.riftPairs.length < spaceRiftSystem.maxPairs) {
        createRiftPair();
        spaceRiftSystem.spawnTimer = 0;
    }
    
    // Nettoyer les téléportations anciennes
    spaceRiftSystem.teleportedEntities = spaceRiftSystem.teleportedEntities.filter(
        record => spaceRiftSystem.time - record.time < 60
    );
    
    // Mise à jour de chaque paire
    spaceRiftSystem.riftPairs = spaceRiftSystem.riftPairs.filter(pair => {
        // Réduction de durée de vie
        pair.lifespan--;
        
        // Mise à jour des failles
        updateRift(pair.entry, entities);
        updateRift(pair.exit, entities);
        
        // Commencer à se refermer
        if (pair.lifespan < 60) {
            pair.entry.fractureLevel = Math.max(0, pair.entry.fractureLevel - 0.02);
            pair.exit.fractureLevel = Math.max(0, pair.exit.fractureLevel - 0.02);
        }
        
        return pair.lifespan > 0;
    });
}

// Mise à jour d'une faille individuelle
function updateRift(rift, entities) {
    rift.pulsePhase += 0.05;
    
    // Progression de la fracture
    if (!rift.isFractured && rift.fractureLevel < 1) {
        rift.fractureLevel += 0.008; // Fracture progressive
        
        // Créer des fissures progressivement
        if (Math.random() < rift.fractureLevel * 0.1) {
            createCrack(rift);
        }
        
        // Tremblements qui s'intensifient
        rift.shakeIntensity = rift.fractureLevel * 5;
        
        // Quand complètement fracturé
        if (rift.fractureLevel >= 1) {
            rift.isFractured = true;
            rift.canTeleport = true;
            shatterRift(rift);
        }
    }
    
    // Animation des fragments brisés
    if (rift.isFractured) {
        rift.shards.forEach(shard => {
            if (shard.isBroken) {
                // Rotation des fragments
                shard.rotation += shard.rotationSpeed;
                
                // Dérive flottante
                shard.drift += shard.driftSpeed;
                shard.offsetX = Math.sin(shard.drift) * 5;
                shard.offsetY = Math.cos(shard.drift) * 3;
                
                // Légère expansion
                const centerDist = Math.sqrt(shard.centerX * shard.centerX + shard.centerY * shard.centerY);
                shard.centerX += (shard.centerX / centerDist) * 0.1;
                shard.centerY += (shard.centerY / centerDist) * 0.1;
            }
        });
    }
    
    // Mise à jour des fissures
    rift.cracks.forEach(crack => {
        crack.growth = Math.min(1, crack.growth + 0.02);
        crack.glow = 0.5 + Math.sin(spaceRiftSystem.time * 0.1 + crack.phase) * 0.5;
    });
    
    // Générer des particules d'énergie qui s'échappent
    if (rift.isFractured && Math.random() < 0.2) {
        createEnergyLeak(rift);
    }
    
    // Mise à jour des particules
    rift.particles = rift.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        particle.opacity = particle.life / particle.maxLife;
        return particle.life > 0;
    });
    
    // Mise à jour des fuites d'énergie
    rift.energyLeaks = rift.energyLeaks.filter(leak => {
        leak.length += leak.speed;
        leak.opacity *= 0.95;
        return leak.opacity > 0.01;
    });
    
    // Arcs électriques occasionnels
    if (rift.isFractured && Math.random() < 0.05) {
        createElectricArc(rift);
    }
    
    // Mise à jour des arcs
    rift.electricArcs = rift.electricArcs.filter(arc => {
        arc.life--;
        return arc.life > 0;
    });
    
    // Vérifier les téléportations
    if (rift.canTeleport && rift.type === 'entry') {
        checkRiftTeleportation(rift, entities);
    }
}

// Briser complètement la faille
function shatterRift(rift) {
    // Marquer tous les fragments comme brisés
    rift.shards.forEach(shard => {
        shard.isBroken = true;
        shard.crackIntensity = 1;
        
        // Vitesse de rotation aléatoire
        shard.rotationSpeed = (Math.random() - 0.5) * 0.05;
        
        // Légère poussée vers l'extérieur
        const angle = Math.atan2(shard.centerY, shard.centerX);
        const force = 2 + Math.random() * 3;
        shard.centerX += Math.cos(angle) * force;
        shard.centerY += Math.sin(angle) * force;
    });
    
    // Effet de bris
    createShatterEffect(rift);
}

// Créer une fissure
function createCrack(rift) {
    const startAngle = Math.random() * Math.PI * 2;
    const length = 20 + Math.random() * 30;
    
    const crack = {
        startX: Math.cos(startAngle) * 10,
        startY: Math.sin(startAngle) * 10,
        endX: Math.cos(startAngle) * length,
        endY: Math.sin(startAngle) * length,
        segments: [],
        growth: 0,
        glow: 0,
        phase: Math.random() * Math.PI * 2
    };
    
    // Créer un chemin en zigzag
    const segmentCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i <= segmentCount; i++) {
        const t = i / segmentCount;
        const baseX = crack.startX + (crack.endX - crack.startX) * t;
        const baseY = crack.startY + (crack.endY - crack.startY) * t;
        
        crack.segments.push({
            x: baseX + (Math.random() - 0.5) * 10,
            y: baseY + (Math.random() - 0.5) * 10
        });
    }
    
    rift.cracks.push(crack);
}

// Créer une fuite d'énergie
function createEnergyLeak(rift) {
    const angle = Math.random() * Math.PI * 2;
    
    rift.energyLeaks.push({
        angle: angle,
        length: 0,
        maxLength: 30 + Math.random() * 20,
        speed: 2,
        opacity: 1,
        width: 1 + Math.random() * 2
    });
}

// Créer un arc électrique
function createElectricArc(rift) {
    const startShard = rift.shards[Math.floor(Math.random() * rift.shards.length)];
    const endShard = rift.shards[Math.floor(Math.random() * rift.shards.length)];
    
    if (startShard === endShard) return;
    
    rift.electricArcs.push({
        startX: startShard.centerX,
        startY: startShard.centerY,
        endX: endShard.centerX,
        endY: endShard.centerY,
        segments: generateElectricPath(startShard.centerX, startShard.centerY, endShard.centerX, endShard.centerY),
        life: 5 + Math.random() * 5
    });
}

// Générer un chemin électrique
function generateElectricPath(x1, y1, x2, y2) {
    const segments = [];
    const segmentCount = 5;
    
    for (let i = 0; i <= segmentCount; i++) {
        const t = i / segmentCount;
        const baseX = x1 + (x2 - x1) * t;
        const baseY = y1 + (y2 - y1) * t;
        
        segments.push({
            x: baseX + (Math.random() - 0.5) * 10,
            y: baseY + (Math.random() - 0.5) * 10
        });
    }
    
    return segments;
}

// Créer l'effet de bris
function createShatterEffect(rift) {
    // Particules de verre
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        
        rift.particles.push({
            x: 0,
            y: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 3,
            life: 30 + Math.random() * 20,
            maxLife: 50,
            opacity: 1,
            type: 'glass'
        });
    }
    
    // Flash de lumière
    rift.shatterFlash = {
        radius: 0,
        maxRadius: 100,
        opacity: 1
    };
}

// Vérifier les téléportations
function checkRiftTeleportation(rift, entities) {
    entities.forEach(entity => {
        if (!entity || !entity.x || !entity.y) return;
        
        // Vérifier si déjà téléporté récemment
        const wasRecentlyTeleported = spaceRiftSystem.teleportedEntities.some(
            record => record.entityId === entity.id && 
                     spaceRiftSystem.time - record.time < 60
        );
        
        if (wasRecentlyTeleported) return;
        
        // Distance au centre
        const dx = entity.x + (entity.width || 0) / 2 - rift.x;
        const dy = entity.y + (entity.height || 0) / 2 - rift.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si dans la zone de téléportation
        if (distance < rift.teleportRadius) {
            teleportThroughRift(entity, rift);
        }
    });
}

// Téléporter à travers la faille
function teleportThroughRift(entity, entryRift) {
    const exitRift = entryRift.linkedRift;
    if (!exitRift) return;
    
    // Nouvelle position avec dispersion
    const angle = Math.random() * Math.PI * 2;
    const offset = 20 + Math.random() * 20;
    
    entity.x = exitRift.x + Math.cos(angle) * offset - (entity.width || 0) / 2;
    entity.y = exitRift.y + Math.sin(angle) * offset - (entity.height || 0) / 2;
    
    // Enregistrer la téléportation
    spaceRiftSystem.teleportedEntities.push({
        entityId: entity.id,
        time: spaceRiftSystem.time
    });
    
    // Effets visuels
    createTeleportEffect(entryRift);
    createTeleportEffect(exitRift);
    
    // Message spécial pour le joueur
    if (entity.isPlayer) {
        console.log(`🚀 JOUEUR téléporté par faille de (${entryRift.x}, ${entryRift.y}) vers (${exitRift.x}, ${exitRift.y})`);
    } else {
        console.log(`🌀 Ennemi téléporté par faille de (${entryRift.x}, ${entryRift.y}) vers (${exitRift.x}, ${exitRift.y})`);
    }
}

// Créer l'effet de téléportation
function createTeleportEffect(rift) {
    // Implosion des fragments
    rift.shards.forEach(shard => {
        shard.scale = 0.5;
        setTimeout(() => { shard.scale = 1; }, 200);
    });
    
    // Flash
    rift.teleportFlash = {
        opacity: 1,
        radius: 80
    };
}

// Fonction de rendu
export function drawSpaceRiftSystem(ctx) {
    spaceRiftSystem.riftPairs.forEach(pair => {
        drawRift(ctx, pair.entry);
        drawRift(ctx, pair.exit);
    });
}

// Dessiner une faille
function drawRift(ctx, rift) {
    ctx.save();
    ctx.translate(rift.x, rift.y);
    
    // Appliquer le tremblement
    if (rift.shakeIntensity > 0) {
        ctx.translate(
            (Math.random() - 0.5) * rift.shakeIntensity,
            (Math.random() - 0.5) * rift.shakeIntensity
        );
    }
    
    // 1. FOND NOIR DU VIDE (si fracturé)
    if (rift.isFractured) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, rift.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 2. FRAGMENTS DE VERRE
    rift.shards.forEach(shard => {
        ctx.save();
        ctx.translate(shard.centerX + shard.offsetX, shard.centerY + shard.offsetY);
        ctx.rotate(shard.rotation);
        ctx.scale(shard.scale, shard.scale);
        
        // Couleur du fragment
        let fillColor;
        if (!rift.isFractured) {
            // Surface intacte - effet miroir/verre
            const gradient = ctx.createLinearGradient(-20, -20, 20, 20);
            gradient.addColorStop(0, `rgba(${spaceRiftSystem.config.colors.intact.r}, ${spaceRiftSystem.config.colors.intact.g}, ${spaceRiftSystem.config.colors.intact.b}, 0.7)`);
            gradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.5)');
            gradient.addColorStop(1, `rgba(${spaceRiftSystem.config.colors.intact.r}, ${spaceRiftSystem.config.colors.intact.g}, ${spaceRiftSystem.config.colors.intact.b}, 0.3)`);
            fillColor = gradient;
        } else {
            // Fragment brisé - semi-transparent avec reflets
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
            gradient.addColorStop(0, `rgba(100, 200, 255, ${0.3 * (1 - rift.fractureLevel * 0.5)})`);
            gradient.addColorStop(1, 'rgba(0, 50, 100, 0.1)');
            fillColor = gradient;
        }
        
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + shard.crackIntensity * 0.5})`;
        ctx.lineWidth = 1;
        
        // Dessiner le polygone du fragment
        ctx.beginPath();
        shard.vertices.forEach((vertex, i) => {
            if (i === 0) ctx.moveTo(vertex.x, vertex.y);
            else ctx.lineTo(vertex.x, vertex.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    });
    
    // 3. FISSURES
    rift.cracks.forEach(crack => {
        const alpha = crack.growth;
        ctx.strokeStyle = `rgba(${spaceRiftSystem.config.colors.cracks.r}, ${spaceRiftSystem.config.colors.cracks.g}, ${spaceRiftSystem.config.colors.cracks.b}, ${alpha * crack.glow})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10 * crack.glow;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        
        ctx.beginPath();
        crack.segments.forEach((segment, i) => {
            const t = Math.min(1, crack.growth * crack.segments.length - i);
            if (t > 0) {
                if (i === 0) ctx.moveTo(segment.x * t, segment.y * t);
                else ctx.lineTo(segment.x * t, segment.y * t);
            }
        });
        ctx.stroke();
    });
    
    // 4. BORDURE ÉNERGÉTIQUE
    if (rift.fractureLevel > 0) {
        const borderGradient = ctx.createRadialGradient(0, 0, rift.size/2 - 10, 0, 0, rift.size/2 + 10);
        borderGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        borderGradient.addColorStop(0.5, `rgba(${spaceRiftSystem.config.colors.edge.r}, ${spaceRiftSystem.config.colors.edge.g}, ${spaceRiftSystem.config.colors.edge.b}, ${rift.fractureLevel * 0.5})`);
        borderGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, rift.size/2, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 5. FUITES D'ÉNERGIE
    rift.energyLeaks.forEach(leak => {
        const endX = Math.cos(leak.angle) * leak.length;
        const endY = Math.sin(leak.angle) * leak.length;
        
        const leakGradient = ctx.createLinearGradient(0, 0, endX, endY);
        leakGradient.addColorStop(0, `rgba(${spaceRiftSystem.config.colors.energy.r}, ${spaceRiftSystem.config.colors.energy.g}, ${spaceRiftSystem.config.colors.energy.b}, ${leak.opacity})`);
        leakGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.strokeStyle = leakGradient;
        ctx.lineWidth = leak.width;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    });
    
    // 6. ARCS ÉLECTRIQUES
    rift.electricArcs.forEach(arc => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${arc.life / 10})`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
        
        ctx.beginPath();
        arc.segments.forEach((segment, i) => {
            if (i === 0) ctx.moveTo(segment.x, segment.y);
            else ctx.lineTo(segment.x, segment.y);
        });
        ctx.stroke();
    });
    
    // 7. PARTICULES
    rift.particles.forEach(particle => {
        if (particle.type === 'glass') {
            // Particules de verre
            ctx.fillStyle = `rgba(200, 230, 255, ${particle.opacity})`;
        } else {
            // Particules d'énergie
            ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`;
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 8. FLASH DE TÉLÉPORTATION
    if (rift.teleportFlash) {
        rift.teleportFlash.opacity *= 0.9;
        rift.teleportFlash.radius *= 0.95;
        
        if (rift.teleportFlash.opacity > 0.01) {
            ctx.fillStyle = `rgba(255, 255, 255, ${rift.teleportFlash.opacity})`;
            ctx.beginPath();
            ctx.arc(0, 0, rift.teleportFlash.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            rift.teleportFlash = null;
        }
    }
    
    // 9. INDICATEUR DE TYPE
    if (rift.isFractured) {
        ctx.font = 'bold 10px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = rift.type === 'entry' ? 'rgba(150, 0, 255, 0.8)' : 'rgba(0, 255, 150, 0.8)';
        ctx.fillText(rift.type === 'entry' ? '→' : '←', 0, rift.size/2 + 20);
    }
    
    ctx.restore();
}

// Obtenir les failles actives
export function getActiveRifts() {
    const rifts = [];
    spaceRiftSystem.riftPairs.forEach(pair => {
        rifts.push(pair.entry);
        rifts.push(pair.exit);
    });
    return rifts;
}

// Forcer la création d'une paire
export function forceCreateRiftPair(entryX, entryY, exitX, exitY) {
    const pairId = Date.now() + Math.random();
    
    const entryRift = createRift(entryX, entryY, 'entry', pairId);
    const exitRift = createRift(exitX, exitY, 'exit', pairId);
    
    entryRift.linkedRift = exitRift;
    exitRift.linkedRift = entryRift;
    
    spaceRiftSystem.riftPairs.push({
        id: pairId,
        entry: entryRift,
        exit: exitRift,
        lifespan: 600,
        active: true
    });
    
    console.log('🌀 Paire de failles forcée créée');
}
