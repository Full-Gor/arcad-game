// electric_laser_serpentine.js - Laser électrique amélioré (sans attribution)

// Variables pour les power-ups Néon
let neonPowerUps = {
    speed: 1,
    multishot: 1,
    damage: 1
};

// Fonction pour activer un power-up Néon
export function activateNeonPowerUp(type, value) {
    switch(type) {
        case 'speed':
            neonPowerUps.speed = value;
            break;
        case 'multishot':
            neonPowerUps.multishot = value;
            break;
        case 'damage':
            neonPowerUps.damage = value;
            break;
    }
}

// Fonction pour obtenir les valeurs des power-ups
export function getNeonPowerUps() {
    return { ...neonPowerUps };
}

export function createElectricLaser(entity, options = {}) {
    const {
        length = 120,
        width = 10,
        vy = 6,
        color = '#00FFFF',
        coreColor = '#FFFFFF',
        glowColor = '#0088FF'
    } = options;
    
    const laser = {
        type: 'electric_laser_gen',
        x: entity.x + entity.width / 2,
        y: entity.y + entity.height,
        length: length * neonPowerUps.damage,
        width: width * neonPowerUps.damage,
        vx: 0,
        vy: vy * neonPowerUps.speed,
        electricArcs: [],
        color,
        coreColor,
        glowColor,
        pulsePhase: 0,
        lifetime: 80,
        maxLifetime: 80,
        sparkParticles: [],
        energyWaves: [],
        plasmaBalls: [],
        rotationAngle: 0,
        outerGlow: 0,
        coreIntensity: 1
    };
    
    // Arcs électriques améliorés avec plus de détails
    for (let i = 0; i < 8; i++) {
        laser.electricArcs.push({
            offset: Math.random() * laser.length,
            amplitude: 15 + Math.random() * 20,
            frequency: 0.15 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2,
            thickness: 1 + Math.random() * 2,
            color: i % 2 === 0 ? '#00FFFF' : '#FFFFFF',
            segments: 6 + Math.floor(Math.random() * 4),
            lifetime: 10 + Math.floor(Math.random() * 5)
        });
    }
    
    // Ondes d'énergie qui parcourent le laser
    for (let i = 0; i < 3; i++) {
        laser.energyWaves.push({
            position: i * (laser.length / 3),
            speed: 3 + Math.random() * 2,
            width: 8 + Math.random() * 4,
            opacity: 0.6 + Math.random() * 0.3,
            color: '#66FFFF'
        });
    }
    
    // Boules de plasma le long du laser
    for (let i = 0; i < 5; i++) {
        laser.plasmaBalls.push({
            offset: (i / 4) * laser.length,
            size: 4 + Math.random() * 6,
            pulseSpeed: 0.1 + Math.random() * 0.1,
            pulsePhase: Math.random() * Math.PI * 2,
            orbitRadius: 5 + Math.random() * 8,
            orbitSpeed: 0.05 + Math.random() * 0.05,
            orbitAngle: Math.random() * Math.PI * 2
        });
    }
    
    return laser;
}

export function updateElectricLaser(laser) {
    // Mouvement ralenti
    laser.y += laser.vy * 0.50;
    
    // Pulsation plus fluide
    laser.pulsePhase += 0.08;
    laser.rotationAngle += 0.03;
    
    // Animation du glow externe
    laser.outerGlow = 10 + Math.sin(laser.pulsePhase * 2) * 5;
    laser.coreIntensity = 0.8 + Math.sin(laser.pulsePhase * 3) * 0.2;
    
    // Gestion du lifetime
    if (!laser._tick) laser._tick = 0;
    laser._tick++;
    if (laser._tick % 2 === 0) {
        laser.lifetime--;
    }
    
    // Mise à jour des arcs électriques
    laser.electricArcs = laser.electricArcs.filter(arc => {
        arc.phase += arc.frequency * 2;
        arc.amplitude = (15 + Math.random() * 20) * (laser.lifetime / laser.maxLifetime);
        arc.offset += 0.5;
        
        // Régénérer l'offset si sort du laser
        if (arc.offset > laser.length) {
            arc.offset = 0;
        }
        
        arc.lifetime--;
        return arc.lifetime > 0;
    });
    
    // Ajouter de nouveaux arcs pour maintenir la densité
    if (laser.electricArcs.length < 8 && Math.random() < 0.3) {
        laser.electricArcs.push({
            offset: 0,
            amplitude: 15 + Math.random() * 20,
            frequency: 0.15 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2,
            thickness: 1 + Math.random() * 2,
            color: Math.random() > 0.5 ? '#00FFFF' : '#FFFFFF',
            segments: 6 + Math.floor(Math.random() * 4),
            lifetime: 10 + Math.floor(Math.random() * 5)
        });
    }
    
    // Mise à jour des ondes d'énergie
    laser.energyWaves.forEach(wave => {
        wave.position += wave.speed;
        if (wave.position > laser.length) {
            wave.position = 0;
        }
    });
    
    // Mise à jour des boules de plasma
    laser.plasmaBalls.forEach(ball => {
        ball.pulsePhase += ball.pulseSpeed;
        ball.orbitAngle += ball.orbitSpeed;
        ball.size = (4 + Math.random() * 6) * (1 + Math.sin(ball.pulsePhase) * 0.3);
    });
    
    // Particules d'étincelles améliorées
    if (Math.random() < 0.6) {
        const sparkX = laser.x + (Math.random() - 0.5) * laser.width * 5;
        const sparkY = laser.y + Math.random() * laser.length;
        
        laser.sparkParticles.push({
            x: sparkX,
            y: sparkY,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 3,
            lifetime: 12 + Math.floor(Math.random() * 8),
            maxLifetime: 12 + Math.floor(Math.random() * 8),
            size: 2 + Math.random() * 3,
            color: Math.random() > 0.7 ? '#FFFFFF' : '#00FFFF',
            trail: []
        });
    }
    
    laser.sparkParticles = laser.sparkParticles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        
        // Traînée des étincelles
        p.trail.push({ x: p.x, y: p.y, opacity: p.lifetime / p.maxLifetime });
        if (p.trail.length > 5) p.trail.shift();
        
        if (laser._tick % 2 === 0) p.lifetime--;
        p.size *= 0.97;
        return p.lifetime > 0;
    });
    
    return laser.lifetime <= 0;
}

export function drawElectricLaser(ctx, laser) {
    ctx.save();
    
    // Glow externe pulsant
    const outerGlowGradient = ctx.createRadialGradient(
        laser.x, laser.y + laser.length / 2, 
        0, 
        laser.x, laser.y + laser.length / 2, 
        laser.width * 3
    );
    outerGlowGradient.addColorStop(0, 'rgba(0, 255, 255, 0.15)');
    outerGlowGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.08)');
    outerGlowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlowGradient;
    ctx.fillRect(
        laser.x - laser.width * 3, 
        laser.y, 
        laser.width * 6, 
        laser.length
    );
    
    // Corps principal du laser avec dégradé amélioré
    const bodyGradient = ctx.createLinearGradient(
        laser.x - laser.width / 2, laser.y, 
        laser.x + laser.width / 2, laser.y
    );
    bodyGradient.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
    bodyGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)');
    bodyGradient.addColorStop(1, 'rgba(0, 255, 255, 0.4)');
    ctx.fillStyle = bodyGradient;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = laser.outerGlow;
    ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.length);
    
    // Noyau central ultra brillant
    const coreGradient = ctx.createLinearGradient(
        laser.x - laser.width / 3, laser.y, 
        laser.x + laser.width / 3, laser.y
    );
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    coreGradient.addColorStop(0.5, `rgba(255, 255, 255, ${laser.coreIntensity})`);
    coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = coreGradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFFFFF';
    ctx.fillRect(laser.x - laser.width / 3, laser.y, laser.width * 2 / 3, laser.length);
    
    // Ondes d'énergie
    laser.energyWaves.forEach(wave => {
        ctx.globalAlpha = wave.opacity;
        const waveGradient = ctx.createLinearGradient(
            laser.x - laser.width / 2, laser.y + wave.position, 
            laser.x + laser.width / 2, laser.y + wave.position
        );
        waveGradient.addColorStop(0, 'transparent');
        waveGradient.addColorStop(0.5, wave.color);
        waveGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = waveGradient;
        ctx.fillRect(
            laser.x - laser.width / 2, 
            laser.y + wave.position - wave.width / 2, 
            laser.width, 
            wave.width
        );
    });
    
    ctx.globalAlpha = 1;
    
    // Arcs électriques en zigzag améliorés
    laser.electricArcs.forEach(arc => {
        ctx.globalAlpha = 0.7 * (arc.lifetime / 10);
        ctx.strokeStyle = arc.color;
        ctx.lineWidth = arc.thickness;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        const y = laser.y + arc.offset;
        ctx.moveTo(laser.x - laser.width / 2, y);
        
        // Zigzag plus détaillé
        for (let i = 1; i <= arc.segments; i++) {
            const t = i / arc.segments;
            const x = laser.x - laser.width / 2 + laser.width * t;
            const offsetY = Math.sin(arc.phase + t * Math.PI * 4) * arc.amplitude;
            const jitter = (Math.random() - 0.5) * 5;
            ctx.lineTo(x + jitter, y + offsetY);
        }
        ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
    
    // Boules de plasma orbitantes
    laser.plasmaBalls.forEach(ball => {
        const ballY = laser.y + ball.offset;
        const ballX = laser.x + Math.cos(ball.orbitAngle) * ball.orbitRadius;
        
        // Glow de la boule
        const ballGlow = ctx.createRadialGradient(
            ballX, ballY, 0, 
            ballX, ballY, ball.size * 2
        );
        ballGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        ballGlow.addColorStop(0.4, 'rgba(0, 255, 255, 0.6)');
        ballGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = ballGlow;
        ctx.beginPath();
        ctx.arc(ballX, ballY, ball.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Noyau de la boule
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ballX, ballY, ball.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Étincelles avec traînées
    laser.sparkParticles.forEach(p => {
        // Traînée
        for (let i = 0; i < p.trail.length - 1; i++) {
            const t1 = p.trail[i];
            const t2 = p.trail[i + 1];
            ctx.globalAlpha = t1.opacity * 0.5;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(t1.x, t1.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.stroke();
        }
        
        // Particule principale
        ctx.globalAlpha = p.lifetime / p.maxLifetime;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.restore();
}