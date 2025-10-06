    // genkidama.js - Boule d'énergie Genkidama qui grossit
import { canvas } from '../../globals_simple.js';

export function createPulsingLaserSimple(enemy, color = '#FFD700', minWidth = 2, height = 120, speed = 1.5, pulseDuration = 2500, speedMult = 1) {
    return {
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        vy: speed * speedMult,
        color,
        startTime: Date.now(),
        // Boule d'énergie Genkidama
        coreSize: 1, // Taille initiale
        targetSize: 200, // Taille finale
        growthRate: 2, // Vitesse de croissance
        isGrowing: true, // En phase de croissance
        pulsePhase: 0,
        // Anneaux énergétiques (murs du son)
        energyRings: [],
        // Traînée de particules
        trail: [],
        // Éclairs internes
        innerLightning: [],
        // Système de tunnel (7 tirs d'affilée)
        tunnelIndex: 0, // Index du tir dans la séquence (0-6)
        tunnelDelay: 100, // Délai entre chaque tir du tunnel (ms)
        lastTunnelTime: 0
    };
}

export function updatePulsingLaserSimple(laser) {
    laser.y += laser.vy;
    laser.pulsePhase += 0.15;
    
    // Phase de croissance de la Genkidama
    if (laser.isGrowing) {
        laser.coreSize += laser.growthRate;
        
        // Si la boule a atteint sa taille cible
        if (laser.coreSize >= laser.targetSize) {
            laser.coreSize = laser.targetSize;
            laser.isGrowing = false;
        }
    } else {
        // Phase de mouvement (après croissance)
        laser.y += laser.vy;
    }
    
    // Créer des anneaux PLUS FRÉQUEMMENT (tous les 3 frames)
    if (!laser.frameCount) laser.frameCount = 0;
    laser.frameCount++;
    
    if (laser.frameCount % 3 === 0) {
        laser.energyRings.push({
            x: laser.x,
            y: laser.y,
            radius: 5,
            maxRadius: laser.coreSize * 2,
            thickness: 3,
            opacity: 1,
            lifetime: 20
        });
    }
    
    // Mettre à jour les anneaux (expansion + disparition)
    laser.energyRings = laser.energyRings.filter(ring => {
        ring.radius += 3;
        ring.lifetime--;
        ring.opacity = Math.min(1 - (ring.radius / ring.maxRadius), ring.lifetime / 30);
        ring.thickness *= 0.98;
        return ring.radius < ring.maxRadius && ring.lifetime > 0;
    });
    
    // Traînée de particules
    laser.trail.push({
        x: laser.x,
        y: laser.y,
        size: laser.coreSize * 0.6,
        opacity: 0.8
    });
    if (laser.trail.length > 8) laser.trail.shift();
    
    // Éclairs internes
    if (Math.random() < 0.3) {
        laser.innerLightning.push({
            angle: Math.random() * Math.PI * 2,
            length: laser.coreSize * 0.8,
            lifetime: 4
        });
    }
    laser.innerLightning = laser.innerLightning.filter(bolt => --bolt.lifetime > 0);
    
    return laser.y > canvas.height;
}

export function drawPulsingLaserSimple(ctx, laser) {
    ctx.save();
    
    // Traînée
    laser.trail.forEach((t, i) => {
        const alpha = (i / laser.trail.length) * t.opacity;
        const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.size);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.5, laser.color + Math.floor(alpha * 200).toString(16).padStart(2, '0'));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Anneaux énergétiques (murs du son) - restent à leur position fixe
    laser.energyRings.forEach(ring => {
        ctx.globalAlpha = ring.opacity;
        
        // Anneau externe glow
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = ring.thickness * 2;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Anneau interne brillant
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = ring.thickness;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
    
    // Halo externe de la Genkidama (couleurs originales)
    const outerGrad = ctx.createRadialGradient(
        laser.x, laser.y, 0,
        laser.x, laser.y, laser.coreSize * 3
    );
    outerGrad.addColorStop(0, "rgba(0, 255, 255, 0.5)");
    outerGrad.addColorStop(0.3, "rgba(0, 255, 255, 0.25)");
    outerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(laser.x, laser.y, laser.coreSize * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Boule d'énergie Genkidama principale (couleurs originales)
    const coreGrad = ctx.createRadialGradient(
        laser.x, laser.y, 0,
        laser.x, laser.y, laser.coreSize
    );
    coreGrad.addColorStop(0, "white");
    coreGrad.addColorStop(0.3, "cyan");
    coreGrad.addColorStop(1, "magenta");
    ctx.fillStyle = coreGrad;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(laser.x, laser.y, laser.coreSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Éclairs internes
    laser.innerLightning.forEach(bolt => {
        ctx.globalAlpha = bolt.lifetime / 4;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 10;
        
        const endX = laser.x + Math.cos(bolt.angle) * bolt.length;
        const endY = laser.y + Math.sin(bolt.angle) * bolt.length;
        
        ctx.beginPath();
        ctx.moveTo(laser.x, laser.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
    
    // Noyau ultra brillant
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(laser.x, laser.y, laser.coreSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}
