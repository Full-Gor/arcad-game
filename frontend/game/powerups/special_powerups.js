// Système de Power-ups Santé et Assistant IA
let specialPowerUps = {
    powerups: [],
    spawnTimer: 0,
    spawnInterval: 360,  // 6 secondes à 60fps
    
    // Types de power-ups spéciaux
    types: {
        health: {
            id: 'health',
            name: 'HEALTH',
            type: 'heart',
            primaryColor: { r: 255, g: 20, b: 100 },     // Rouge rosé
            secondaryColor: { r: 255, g: 100, b: 150 },  // Rose clair
            glowColor: '#ff1464',
            pulseColor: { r: 255, g: 255, b: 255 },      // Blanc pour l'ECG
            effect: 'heal',
            value: 50
        },
        aiAssistant: {
            id: 'aiAssistant',
            name: 'AI ASSIST',
            type: 'eye',
            primaryColor: { r: 0, g: 200, b: 255 },      // Bleu cybernétique
            secondaryColor: { r: 100, g: 255, b: 255 },  // Cyan clair
            glowColor: '#00c8ff',
            irisColor: { r: 255, g: 150, b: 0 },         // Orange pour l'iris
            effect: 'autoAim',
            value: 10  // Durée en secondes
        }
    },
    
    // Animation globale
    time: 0,
    
    // ECG data pour le cœur
    ecgData: [],
    ecgIndex: 0
};

// Initialiser les données ECG
function initECGData() {
    // Pattern ECG réaliste (ligne de base, P, QRS, T)
    const pattern = [
        0, 0, 0, 0, 0,                    // Ligne de base
        2, 4, 2, 0,                       // Onde P
        0, 0,                             // Segment PR
        -2, 15, -8, 0,                    // Complexe QRS
        0, 0, 0,                          // Segment ST
        2, 4, 5, 4, 2, 0,                 // Onde T
        0, 0, 0, 0, 0, 0, 0, 0            // Retour ligne de base
    ];
    
    specialPowerUps.ecgData = pattern;
}

// Initialiser le système
export function initSpecialPowerUps(canvasWidth, canvasHeight) {
    specialPowerUps.canvasWidth = canvasWidth;
    specialPowerUps.canvasHeight = canvasHeight;
    specialPowerUps.powerups = [];
    initECGData();
    
    // Spawn initial
    setTimeout(() => spawnSpecialPowerUp('health'), 1000);
    setTimeout(() => spawnSpecialPowerUp('aiAssistant'), 3000);
}

// Créer un power-up spécial
function spawnSpecialPowerUp(typeId) {
    const type = specialPowerUps.types[typeId];
    if (!type) return;
    
    const powerup = {
        id: Date.now() + Math.random(),
        type: typeId,
        config: type,
        x: 100 + Math.random() * (specialPowerUps.canvasWidth - 200),
        y: 100 + Math.random() * (specialPowerUps.canvasHeight - 200),
        size: 40,
        
        // Mouvement
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        rotation: 0,
        rotationSpeed: 0.02,
        
        // Animation
        pulse: 0,
        pulseSpeed: 0.05,
        scale: 1,
        opacity: 1,
        collected: false,
        
        // Spécifique au type
        // Pour le cœur
        heartBeat: 0,
        ecgPoints: [],
        ecgTrail: [],
        
        // Pour l'IA
        irisRotation: 0,
        irisScale: 1,
        scanAngle: 0,
        dataRings: [],
        binaryCode: [],
        blinkTimer: 0,
        isBlinking: false,
        
        // Particules
        particles: []
    };
    
    // Initialisation spécifique selon le type
    if (typeId === 'health') {
        initHeartPowerUp(powerup);
    } else if (typeId === 'aiAssistant') {
        initAIPowerUp(powerup);
    }
    
    specialPowerUps.powerups.push(powerup);
    return powerup;
}

// Initialiser le power-up cœur
function initHeartPowerUp(powerup) {
    // Initialiser le tracé ECG
    for (let i = 0; i < 50; i++) {
        powerup.ecgPoints.push({ x: i * 2 - 50, y: 0 });
    }
    
    // Particules de vie
    for (let i = 0; i < 8; i++) {
        powerup.particles.push({
            angle: (i / 8) * Math.PI * 2,
            distance: 30 + Math.random() * 20,
            size: 2 + Math.random() * 2,
            speed: 0.01 + Math.random() * 0.02,
            opacity: 0.5 + Math.random() * 0.5
        });
    }
}

// Initialiser le power-up IA
function initAIPowerUp(powerup) {
    // Anneaux de données
    for (let i = 0; i < 3; i++) {
        powerup.dataRings.push({
            radius: 20 + i * 8,
            rotation: Math.random() * Math.PI * 2,
            speed: (0.02 + Math.random() * 0.02) * (i % 2 === 0 ? 1 : -1),
            segments: 16,
            opacity: 0.7 - i * 0.2
        });
    }
    
    // Code binaire
    for (let i = 0; i < 20; i++) {
        powerup.binaryCode.push({
            value: Math.random() > 0.5 ? '1' : '0',
            x: (Math.random() - 0.5) * 60,
            y: (Math.random() - 0.5) * 60,
            speed: 0.5 + Math.random() * 1,
            opacity: Math.random()
        });
    }
}

// Mise à jour des power-ups
export function updateSpecialPowerUps(playerX, playerY, playerWidth, playerHeight) {
    specialPowerUps.time++;
    specialPowerUps.spawnTimer++;
    
    // Spawn périodique
    if (specialPowerUps.spawnTimer >= specialPowerUps.spawnInterval) {
        const types = Object.keys(specialPowerUps.types);
        const randomType = types[Math.floor(Math.random() * types.length)];
        spawnSpecialPowerUp(randomType);
        specialPowerUps.spawnTimer = 0;
    }
    
    // Mise à jour de chaque power-up
    specialPowerUps.powerups = specialPowerUps.powerups.filter(powerup => {
        if (powerup.collected) {
            powerup.opacity -= 0.05;
            powerup.scale += 0.1;
            return powerup.opacity > 0;
        }
        
        // Mouvement basique
        powerup.x += powerup.vx;
        powerup.y += powerup.vy;
        
        // Rebonds sur les bords
        if (powerup.x < 50 || powerup.x > specialPowerUps.canvasWidth - 50) {
            powerup.vx *= -1;
        }
        if (powerup.y < 50 || powerup.y > specialPowerUps.canvasHeight - 50) {
            powerup.vy *= -1;
        }
        
        // Rotation et pulsation
        powerup.rotation += powerup.rotationSpeed;
        powerup.pulse += powerup.pulseSpeed;
        
        // Mise à jour spécifique au type
        if (powerup.type === 'health') {
            updateHeartPowerUp(powerup);
        } else if (powerup.type === 'aiAssistant') {
            updateAIPowerUp(powerup);
        }
        
        // Vérifier la collision avec le joueur
        const dx = powerup.x - (playerX + playerWidth / 2);
        const dy = powerup.y - (playerY + playerHeight / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < powerup.size + 20) {
            powerup.collected = true;
            onSpecialPowerUpCollected(powerup);
        }
        
        return true;
    });
}

// Mise à jour du power-up cœur
function updateHeartPowerUp(powerup) {
    powerup.heartBeat += 0.08;
    
    // Mise à jour de l'ECG
    specialPowerUps.ecgIndex = (specialPowerUps.ecgIndex + 1) % specialPowerUps.ecgData.length;
    
    // Décaler les points ECG
    for (let i = powerup.ecgPoints.length - 1; i > 0; i--) {
        powerup.ecgPoints[i].y = powerup.ecgPoints[i - 1].y;
    }
    powerup.ecgPoints[0].y = specialPowerUps.ecgData[specialPowerUps.ecgIndex] * 2;
    
    // Ajouter au trail
    if (powerup.ecgTrail.length > 30) powerup.ecgTrail.shift();
    powerup.ecgTrail.push({
        points: [...powerup.ecgPoints.map(p => ({ ...p }))],
        opacity: 1
    });
    
    // Mise à jour du trail
    powerup.ecgTrail.forEach(trail => {
        trail.opacity *= 0.95;
    });
    
    // Mise à jour des particules
    powerup.particles.forEach(particle => {
        particle.angle += particle.speed;
        particle.distance = 30 + Math.sin(specialPowerUps.time * 0.05 + particle.angle) * 10;
    });
}

// Mise à jour du power-up IA
function updateAIPowerUp(powerup) {
    // Rotation de l'iris
    powerup.irisRotation += 0.03;
    powerup.scanAngle += 0.05;
    
    // Effet de scan
    powerup.irisScale = 1 + Math.sin(specialPowerUps.time * 0.1) * 0.1;
    
    // Clignement occasionnel
    powerup.blinkTimer++;
    if (powerup.blinkTimer > 180 && !powerup.isBlinking) {
        if (Math.random() < 0.01) {
            powerup.isBlinking = true;
            powerup.blinkTimer = 0;
        }
    }
    
    if (powerup.isBlinking) {
        powerup.blinkTimer++;
        if (powerup.blinkTimer > 10) {
            powerup.isBlinking = false;
            powerup.blinkTimer = 0;
        }
    }
    
    // Mise à jour des anneaux de données
    powerup.dataRings.forEach(ring => {
        ring.rotation += ring.speed;
    });
    
    // Mise à jour du code binaire
    powerup.binaryCode.forEach(code => {
        code.y -= code.speed;
        if (code.y < -30) {
            code.y = 30;
            code.value = Math.random() > 0.5 ? '1' : '0';
        }
        code.opacity = 0.5 + Math.sin(specialPowerUps.time * 0.1 + code.y) * 0.5;
    });
}

// Collision et effets
function onSpecialPowerUpCollected(powerup) {
    console.log(`${powerup.config.name} collected!`);
    
    if (powerup.type === 'health') {
        // Restaurer la santé
        if (window.starship) {
            window.starship.health = Math.min(100, (window.starship.health || 50) + powerup.config.value);
        }
        
        // Effet de particules de vie
        createHealingEffect(powerup);
        
    } else if (powerup.type === 'aiAssistant') {
        // Activer l'auto-visée
        if (window.starship) {
            window.starship.aiAssist = true;
            window.starship.aiAssistDuration = powerup.config.value * 60; // Convertir en frames
        }
        
        // Effet de connexion IA
        createAIConnectionEffect(powerup);
    }
}

// Effet de guérison
function createHealingEffect(powerup) {
    // Créer une explosion de particules de vie
    for (let i = 0; i < 20; i++) {
        // Les particules seront gérées dans le rendu
    }
}

// Effet de connexion IA
function createAIConnectionEffect(powerup) {
    // Créer des lignes de connexion
    for (let i = 0; i < 10; i++) {
        // Les lignes seront gérées dans le rendu
    }
}

// Fonction de rendu
export function drawSpecialPowerUps(ctx) {
    specialPowerUps.powerups.forEach(powerup => {
        ctx.save();
        ctx.translate(powerup.x, powerup.y);
        
        if (powerup.collected) {
            ctx.globalAlpha = powerup.opacity;
            const scale = powerup.scale;
            ctx.scale(scale, scale);
        }
        
        // Pulsation
        const pulseScale = 1 + Math.sin(powerup.pulse) * 0.1;
        ctx.scale(pulseScale, pulseScale);
        
        if (powerup.type === 'health') {
            drawHeartPowerUp(ctx, powerup);
        } else if (powerup.type === 'aiAssistant') {
            drawAIPowerUp(ctx, powerup);
        }
        
        ctx.restore();
    });
}

// Dessiner le power-up cœur
function drawHeartPowerUp(ctx, powerup) {
    const size = powerup.size;
    
    // 1. Halo lumineux
    const haloGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
    haloGradient.addColorStop(0, `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, 0.3)`);
    haloGradient.addColorStop(1, 'rgba(255, 20, 100, 0)');
    
    ctx.fillStyle = haloGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. Forme du cœur
    ctx.save();
    ctx.rotate(Math.sin(powerup.heartBeat) * 0.05);
    
    // Ombre du cœur
    ctx.shadowBlur = 20;
    ctx.shadowColor = powerup.config.glowColor;
    
    // Dessiner le cœur
    ctx.fillStyle = `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, 0.9)`;
    ctx.beginPath();
    
    // Courbe de Bézier pour le cœur
    const heartScale = size * 0.8;
    ctx.moveTo(0, -heartScale * 0.3);
    ctx.bezierCurveTo(-heartScale * 0.5, -heartScale * 0.8, -heartScale, -heartScale * 0.4, -heartScale, 0);
    ctx.bezierCurveTo(-heartScale, heartScale * 0.4, -heartScale * 0.5, heartScale * 0.8, 0, heartScale);
    ctx.bezierCurveTo(heartScale * 0.5, heartScale * 0.8, heartScale, heartScale * 0.4, heartScale, 0);
    ctx.bezierCurveTo(heartScale, -heartScale * 0.4, heartScale * 0.5, -heartScale * 0.8, 0, -heartScale * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // Reflet brillant
    const shineGradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = shineGradient;
    ctx.fill();
    
    ctx.restore();
    
    // 3. ECG à l'intérieur du cœur
    ctx.save();
    ctx.clip(); // Limiter l'ECG à l'intérieur du cœur
    
    // Trail de l'ECG
    powerup.ecgTrail.forEach((trail, index) => {
        if (trail.opacity > 0.1) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${trail.opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            trail.points.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x * 0.6, point.y);
                else ctx.lineTo(point.x * 0.6, point.y);
            });
            ctx.stroke();
        }
    });
    
    // Ligne ECG principale
    ctx.strokeStyle = `rgba(${powerup.config.pulseColor.r}, ${powerup.config.pulseColor.g}, ${powerup.config.pulseColor.b}, 1)`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    
    ctx.beginPath();
    powerup.ecgPoints.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x * 0.6, point.y);
        else ctx.lineTo(point.x * 0.6, point.y);
    });
    ctx.stroke();
    
    // Point lumineux au bout de la ligne
    const lastPoint = powerup.ecgPoints[powerup.ecgPoints.length - 1];
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.beginPath();
    ctx.arc(lastPoint.x * 0.6, lastPoint.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // 4. Particules orbitales
    powerup.particles.forEach(particle => {
        const x = Math.cos(particle.angle) * particle.distance;
        const y = Math.sin(particle.angle) * particle.distance;
        
        ctx.fillStyle = `rgba(255, 100, 150, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Dessiner le power-up IA (œil cybernétique)
function drawAIPowerUp(ctx, powerup) {
    const size = powerup.size;
    
    // 1. Halo de données
    const dataGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2);
    dataGradient.addColorStop(0, `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, 0.2)`);
    dataGradient.addColorStop(1, 'rgba(0, 200, 255, 0)');
    
    ctx.fillStyle = dataGradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. Anneaux de données rotatifs
    powerup.dataRings.forEach(ring => {
        ctx.save();
        ctx.rotate(ring.rotation);
        
        ctx.strokeStyle = `rgba(${powerup.config.secondaryColor.r}, ${powerup.config.secondaryColor.g}, ${powerup.config.secondaryColor.b}, ${ring.opacity})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // Dessiner les segments
        for (let i = 0; i < ring.segments; i++) {
            const angle = (i / ring.segments) * Math.PI * 2;
            const nextAngle = ((i + 1) / ring.segments) * Math.PI * 2;
            
            if (i % 3 === 0) { // Seulement certains segments
                ctx.beginPath();
                ctx.arc(0, 0, ring.radius, angle, nextAngle);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    });
    
    // 3. Forme de l'œil (si pas en train de cligner)
    if (!powerup.isBlinking) {
        // Contour de l'œil
        ctx.save();
        ctx.scale(1, 0.6); // Forme ovale
        
        // Fond de l'œil
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Bord lumineux
        ctx.strokeStyle = `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, 1)`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = powerup.config.glowColor;
        ctx.stroke();
        
        ctx.restore();
        
        // 4. Iris cybernétique
        ctx.save();
        ctx.scale(powerup.irisScale, powerup.irisScale);
        ctx.rotate(powerup.irisRotation);
        
        // Iris externe
        const irisGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.5);
        irisGradient.addColorStop(0, `rgba(${powerup.config.irisColor.r}, ${powerup.config.irisColor.g}, ${powerup.config.irisColor.b}, 0.2)`);
        irisGradient.addColorStop(0.5, `rgba(${powerup.config.irisColor.r}, ${powerup.config.irisColor.g}, ${powerup.config.irisColor.b}, 0.8)`);
        irisGradient.addColorStop(1, `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, 1)`);
        
        ctx.fillStyle = irisGradient;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Segments de l'iris
        ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * size * 0.5, Math.sin(angle) * size * 0.5);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // 5. Pupille centrale
        const pupilGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
        pupilGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        pupilGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.8)');
        pupilGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        
        ctx.fillStyle = pupilGradient;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // 6. Faisceau de scan
        ctx.save();
        ctx.rotate(powerup.scanAngle);
        
        const scanGradient = ctx.createLinearGradient(0, 0, size * 1.5, 0);
        scanGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
        scanGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
        scanGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = scanGradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 1.5, -5);
        ctx.lineTo(size * 1.5, 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    } else {
        // Œil fermé (ligne horizontale)
        ctx.strokeStyle = `rgba(${powerup.config.primaryColor.r}, ${powerup.config.primaryColor.g}, ${powerup.config.primaryColor.b}, 1)`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = powerup.config.glowColor;
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.stroke();
    }
    
    // 7. Code binaire flottant
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
    powerup.binaryCode.forEach(code => {
        ctx.globalAlpha = code.opacity * 0.5;
        ctx.fillText(code.value, code.x, code.y);
    });
    
    ctx.globalAlpha = 1;
}

