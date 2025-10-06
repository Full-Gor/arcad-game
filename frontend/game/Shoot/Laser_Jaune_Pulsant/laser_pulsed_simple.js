// laser_pulsed_simple.js - Laser pulsé amélioré (barre verticale pulsante)
import { canvas } from '../../globals_simple.js';

export function createPulsingLaserSimple(enemy, color = '#FFD700', minWidth = 2, height = 120, speed = 3, pulseDuration = 2500, speedMult = 1) {
    return {
        x: enemy.x + enemy.width / 2 - minWidth / 2,
        centerX: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        minWidth,
        maxWidth: minWidth * 3,
        currentWidth: minWidth,
        height,
        vy: speed * speedMult,
        color,
        startTime: Date.now(),
        pulseDuration,
        glowIntensity: 15,
        // Nouveaux effets
        energyParticles: [],
        pulsePhase: 0,
        coreIntensity: 1,
        outerGlow: 0,
        lightningArcs: [],
        energyWaves: []
    };
}

export function updatePulsingLaserSimple(laser) {
    laser.y += laser.vy;
    
    const elapsed = Date.now() - laser.startTime;
    const progress = (elapsed % laser.pulseDuration) / laser.pulseDuration;
    
    // Pulsation de la largeur
    laser.currentWidth = laser.minWidth + (laser.maxWidth - laser.minWidth) * Math.abs(Math.sin(progress * Math.PI));
    laser.x = laser.centerX - laser.currentWidth / 2;
    
    // S'assurer que les valeurs sont valides
    if (!isFinite(laser.currentWidth)) {
        laser.currentWidth = laser.minWidth;
    }
    if (!isFinite(laser.x)) {
        laser.x = laser.centerX - laser.currentWidth / 2;
    }
    
    // Animation du glow et du noyau
    laser.pulsePhase += 0.1;
    laser.outerGlow = 15 + Math.sin(laser.pulsePhase * 2) * 8;
    laser.coreIntensity = 0.7 + Math.sin(laser.pulsePhase * 3) * 0.3;
    
    // Particules d'énergie le long du laser
    if (Math.random() < 0.4) {
        laser.energyParticles.push({
            x: laser.centerX + (Math.random() - 0.5) * laser.currentWidth * 2,
            y: laser.y + Math.random() * laser.height,
            vx: (Math.random() - 0.5) * 2,
            vy: laser.vy + (Math.random() - 0.5) * 2,
            size: 2 + Math.random() * 3,
            lifetime: 15 + Math.floor(Math.random() * 10),
            maxLifetime: 15 + Math.floor(Math.random() * 10),
            opacity: 0.8
        });
    }
    
    // Mise à jour des particules
    laser.energyParticles = laser.energyParticles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.lifetime--;
        p.opacity = p.lifetime / p.maxLifetime;
        p.size *= 0.97;
        return p.lifetime > 0;
    });
    
    // Arcs électriques sur les bords
    if (Math.random() < 0.3) {
        laser.lightningArcs.push({
            side: Math.random() > 0.5 ? 'left' : 'right',
            yOffset: Math.random() * laser.height,
            length: 10 + Math.random() * 15,
            lifetime: 5 + Math.floor(Math.random() * 3),
            segments: 3 + Math.floor(Math.random() * 3)
        });
    }
    
    laser.lightningArcs = laser.lightningArcs.filter(arc => {
        arc.lifetime--;
        return arc.lifetime > 0;
    });
    
    // Ondes d'énergie qui montent le long du laser
    if (Math.random() < 0.2) {
        laser.energyWaves.push({
            yOffset: laser.height,
            speed: 3 + Math.random() * 2,
            width: 3 + Math.random() * 3,
            opacity: 0.6 + Math.random() * 0.3
        });
    }
    
    laser.energyWaves = laser.energyWaves.filter(wave => {
        wave.yOffset -= wave.speed;
        return wave.yOffset > 0;
    });
    
    return laser.y > canvas.height;
}

export function drawPulsingLaserSimple(ctx, laser) {
    ctx.save();
    
    // Vérifier que les valeurs sont valides
    if (!isFinite(laser.centerX) || !isFinite(laser.y) || !isFinite(laser.currentWidth) || !isFinite(laser.height)) {
        console.warn('Valeurs invalides dans le laser:', laser);
        ctx.restore();
        return;
    }
    
    // Aura externe pulsante
    const outerGlowGradient = ctx.createRadialGradient(
        laser.centerX, laser.y + laser.height / 2,
        0,
        laser.centerX, laser.y + laser.height / 2,
        Math.max(1, laser.currentWidth * 3)
    );
    outerGlowGradient.addColorStop(0, laser.color + '40');
    outerGlowGradient.addColorStop(0.5, laser.color + '20');
    outerGlowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlowGradient;
    ctx.fillRect(
        laser.centerX - laser.currentWidth * 3,
        laser.y,
        laser.currentWidth * 6,
        laser.height
    );
    
    // Corps principal avec dégradé horizontal
    const bodyGradient = ctx.createLinearGradient(
        laser.x, laser.y,
        laser.x + laser.currentWidth, laser.y
    );
    bodyGradient.addColorStop(0, 'transparent');
    bodyGradient.addColorStop(0.5, laser.color);
    bodyGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = bodyGradient;
    ctx.shadowColor = laser.color;
    ctx.shadowBlur = laser.outerGlow;
    ctx.fillRect(laser.x, laser.y, laser.currentWidth, laser.height);
    
    // Noyau central ultra brillant
    const coreWidth = laser.currentWidth * 0.4;
    const coreGradient = ctx.createLinearGradient(
        laser.centerX - coreWidth / 2, laser.y,
        laser.centerX + coreWidth / 2, laser.y
    );
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    coreGradient.addColorStop(0.5, `rgba(255, 255, 255, ${laser.coreIntensity})`);
    coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = coreGradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFFFFF';
    ctx.fillRect(laser.centerX - coreWidth / 2, laser.y, coreWidth, laser.height);
    
    // Ondes d'énergie qui remontent
    laser.energyWaves.forEach(wave => {
        ctx.globalAlpha = wave.opacity;
        const waveGradient = ctx.createLinearGradient(
            laser.x, laser.y + wave.yOffset,
            laser.x + laser.currentWidth, laser.y + wave.yOffset
        );
        waveGradient.addColorStop(0, 'transparent');
        waveGradient.addColorStop(0.5, '#FFFFFF');
        waveGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = waveGradient;
        ctx.fillRect(
            laser.x,
            laser.y + wave.yOffset - wave.width / 2,
            laser.currentWidth,
            wave.width
        );
    });
    
    ctx.globalAlpha = 1;
    
    // Arcs électriques sur les bords
    laser.lightningArcs.forEach(arc => {
        ctx.globalAlpha = arc.lifetime / 8;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 10;
        
        const startX = arc.side === 'left' ? laser.x : laser.x + laser.currentWidth;
        const startY = laser.y + arc.yOffset;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let currentX = startX;
        let currentY = startY;
        const direction = arc.side === 'left' ? -1 : 1;
        
        for (let i = 0; i < arc.segments; i++) {
            currentX += direction * (arc.length / arc.segments);
            currentY += (Math.random() - 0.5) * 10;
            ctx.lineTo(currentX, currentY);
        }
        
        ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
    
    // Particules d'énergie
    laser.energyParticles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        
        // Glow de la particule
        const particleGlow = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.size * 2
        );
        particleGlow.addColorStop(0, '#FFFFFF');
        particleGlow.addColorStop(0.5, laser.color);
        particleGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Noyau de la particule
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
    
    // Bordures brillantes
    ctx.strokeStyle = laser.color;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    ctx.strokeRect(laser.x, laser.y, laser.currentWidth, laser.height);
    
    ctx.restore();
}